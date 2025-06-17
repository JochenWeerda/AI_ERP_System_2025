# -*- coding: utf-8 -*-
# Part of VALEO NeuroERP. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError
import logging

_logger = logging.getLogger(__name__)

class AccountAccount(models.Model):
    _inherit = 'account.account'
    
    # L3-Stammdaten Felder
    l3_account_id = fields.Char('L3 Konto-ID', 
        help="Referenz-ID des Kontos im L3-System")
    l3_account_type = fields.Char('L3 Kontotyp',
        help="Kontotyp im L3-System")
    l3_last_sync = fields.Datetime('Letzte L3-Synchronisation',
        help="Zeitpunkt der letzten Synchronisation mit L3")
    
    # Erweiterte Kontenfelder
    is_cpd_account = fields.Boolean('Ist CPD-Konto', 
        compute='_compute_is_cpd_account', store=True,
        help="Gibt an, ob es sich um ein CPD-Konto (Conto pro diverse) handelt")
    alternative_for_partner_ids = fields.One2many('partner.alternative.account', 'account_id',
        string='Alternative für Partner',
        help="Partner, für die dieses Konto als alternatives CPD-Konto (Conto pro diverse) dient")
    account_group_code = fields.Char('Kontengruppenkürzel', 
        help="Kürzel der Kontengruppe für Berichtszwecke")
    cost_center_required = fields.Boolean('Kostenstelle erforderlich',
        help="Gibt an, ob für Buchungen auf dieses Konto eine Kostenstelle angegeben werden muss")
    is_tax_relevant = fields.Boolean('Steuerrelevant',
        help="Gibt an, ob dieses Konto für Steuerabrechnungen relevant ist")
    
    # CPD-spezifische Felder
    auto_reconcile = fields.Boolean('Automatischer Ausgleich',
        help="Bei Aktivierung werden Posten auf diesem Konto automatisch ausgeglichen, wenn möglich")
    dunning_level = fields.Selection([
        ('none', 'Keine Mahnung'),
        ('low', 'Niedrige Priorität'),
        ('medium', 'Mittlere Priorität'),
        ('high', 'Hohe Priorität')
    ], string='Mahnstufe', default='medium',
       help="Bestimmt die Priorität dieses Kontos im Mahnwesen")
    interest_calculation = fields.Boolean('Zinsberechnung',
        help="Bei Aktivierung werden Verzugszinsen für überfällige Posten berechnet")
    interest_rate = fields.Float('Verzugszins (%)', default=5.0,
        help="Prozentsatz für die Berechnung von Verzugszinsen")
    
    # Berechnete Felder
    @api.depends('internal_type')
    def _compute_is_cpd_account(self):
        """Bestimmt, ob es sich um ein CPD-Konto handelt"""
        for account in self:
            account.is_cpd_account = account.internal_type in ['receivable', 'payable']
    
    # Überschreiben von Standardmethoden
    @api.onchange('internal_type')
    def _onchange_internal_type(self):
        """Setzt Standardwerte für CPD-Konten"""
        if self.internal_type in ['receivable', 'payable']:
            self.reconcile = True
            if self.internal_type == 'receivable':
                self.dunning_level = 'medium'
            else:
                self.dunning_level = 'none'
    
    # Zusätzliche Validierung
    @api.constrains('internal_type', 'reconcile')
    def _check_reconcile(self):
        for account in self:
            if account.internal_type in ['receivable', 'payable'] and not account.reconcile:
                raise ValidationError(_('CPD-Konten (Forderungen/Verbindlichkeiten) müssen immer ausgleichbar sein!'))
    
    def auto_reconcile_account_entries(self):
        """Führt einen automatischen Ausgleich von passenden offenen Posten durch"""
        self.ensure_one()
        if not self.auto_reconcile or not self.is_cpd_account:
            return False
            
        # Offene Posten auf diesem Konto finden
        AccountMoveLine = self.env['account.move.line']
        domain = [
            ('account_id', '=', self.id),
            ('reconciled', '=', False),
            ('move_id.state', '=', 'posted'),
            ('balance', '!=', 0.0)
        ]
        lines = AccountMoveLine.search(domain)
        
        # Nach Partner gruppieren für korrekten Ausgleich
        partners = lines.mapped('partner_id')
        count = 0
        
        for partner in partners:
            partner_lines = lines.filtered(lambda l: l.partner_id == partner)
            
            # Nur fortfahren, wenn es mehr als eine Zeile gibt
            if len(partner_lines) <= 1:
                continue
                
            # Forderungen und Verbindlichkeiten trennen
            debit_lines = partner_lines.filtered(lambda l: l.debit > 0)
            credit_lines = partner_lines.filtered(lambda l: l.credit > 0)
            
            # Automatischen Ausgleich versuchen, wenn möglich
            try:
                # Prüfen, ob sich Posten genau ausgleichen
                debit_sum = sum(debit_lines.mapped('balance'))
                credit_sum = sum(credit_lines.mapped('balance'))
                
                # Exakter Ausgleich
                if abs(debit_sum + credit_sum) < 0.01:
                    to_reconcile = debit_lines + credit_lines
                    to_reconcile.reconcile()
                    count += len(to_reconcile)
                    continue
                    
                # Teilweiser Ausgleich
                debit_sorted = debit_lines.sorted(key=lambda l: l.date)
                credit_sorted = credit_lines.sorted(key=lambda l: l.date)
                
                # Versuche, älteste Posten zuerst auszugleichen
                while debit_sorted and credit_sorted:
                    if abs(debit_sorted[0].balance + credit_sorted[0].balance) < 0.01:
                        # Exakter Ausgleich zweier Posten
                        to_reconcile = debit_sorted[0] + credit_sorted[0]
                        to_reconcile.reconcile()
                        count += 2
                        debit_sorted = debit_sorted[1:]
                        credit_sorted = credit_sorted[1:]
                    else:
                        # Kein exakter Ausgleich möglich
                        break
                        
            except Exception as e:
                _logger.error("Fehler beim automatischen Ausgleich: %s", str(e))
                
        return count
    
    @api.model
    def _auto_reconcile_cpd_accounts(self):
        """Scheduler-Methode zum automatischen Ausgleich aller CPD-Konten"""
        accounts = self.search([
            ('auto_reconcile', '=', True),
            ('is_cpd_account', '=', True)
        ])
        
        total_count = 0
        for account in accounts:
            count = account.auto_reconcile_account_entries()
            if count:
                total_count += count
                
        _logger.info("Automatischer Ausgleich: %d Posten ausgeglichen", total_count)
        return True

class AccountMove(models.Model):
    _inherit = 'account.move'
    
    # Erweiterte Felder für Buchungen
    l3_document_id = fields.Char('L3 Dokument-ID',
        help="Referenz-ID des Dokuments im L3-System")
    alternative_cpd_account_id = fields.Many2one('account.account', 'Alternatives CPD-Konto',
        domain=[('deprecated', '=', False), ('internal_type', 'in', ['receivable', 'payable'])],
        help="Alternatives CPD-Konto (Conto pro diverse) für diese Buchung")
    payment_block = fields.Boolean('Zahlungssperre', related='partner_id.payment_block', 
        store=True, readonly=True)
    use_alternative_cpd = fields.Boolean('Alternatives CPD-Konto verwenden',
        help="Bei Aktivierung wird das alternative CPD-Konto anstelle des Standardkontos verwendet")
    
    # Überschreiben von Standardmethoden
    @api.onchange('partner_id')
    def _onchange_partner_id(self):
        """Erweitert die Standardmethode, um alternative CPD-Konten zu berücksichtigen"""
        res = super(AccountMove, self)._onchange_partner_id()
        
        if self.partner_id and self.partner_id.cpd_account_id:
            move_type = self.move_type or self.env.context.get('move_type', 'entry')
            if move_type in ['out_invoice', 'out_refund', 'out_receipt'] and self.partner_id.cpd_account_id.internal_type == 'receivable':
                self.alternative_cpd_account_id = self.partner_id.cpd_account_id.id
                self.use_alternative_cpd = True
            elif move_type in ['in_invoice', 'in_refund', 'in_receipt'] and self.partner_id.cpd_account_id.internal_type == 'payable':
                self.alternative_cpd_account_id = self.partner_id.cpd_account_id.id
                self.use_alternative_cpd = True
        
        if self.partner_id and self.partner_id.cpd_payment_term_id:
            self.invoice_payment_term_id = self.partner_id.cpd_payment_term_id
            
        return res
    
    @api.onchange('use_alternative_cpd', 'alternative_cpd_account_id')
    def _onchange_use_alternative_cpd(self):
        """Aktualisiert das Buchungskonto, wenn ein alternatives CPD-Konto verwendet wird"""
        if self.use_alternative_cpd and self.alternative_cpd_account_id and self.line_ids:
            move_type = self.move_type or self.env.context.get('move_type', 'entry')
            if move_type in ['out_invoice', 'out_refund', 'out_receipt']:
                domain = [('account_id.internal_type', '=', 'receivable')]
            elif move_type in ['in_invoice', 'in_refund', 'in_receipt']:
                domain = [('account_id.internal_type', '=', 'payable')]
            else:
                domain = []
                
            if domain:
                for line in self.line_ids.filtered_domain(domain):
                    if not line.original_cpd_account_id:
                        line.original_cpd_account_id = line.account_id.id
                    line.account_id = self.alternative_cpd_account_id.id
    
    def _post(self, soft=True):
        """Validiert CPD-Konten vor dem Buchen"""
        for move in self:
            # Prüfe, ob alle erforderlichen Kostenstellenangaben vorhanden sind
            for line in move.line_ids:
                if line.account_id.cost_center_required and not line.analytic_account_id:
                    raise ValidationError(_('Für Konto %s ist eine Kostenstelle erforderlich!') % line.account_id.display_name)
                    
            # Blockierte Partner prüfen
            if move.payment_block and move.move_type in ['in_invoice', 'in_refund']:
                if not self.env.user.has_group('account.group_account_manager'):
                    raise ValidationError(_('Dieser Partner hat eine Zahlungssperre. Nur Buchhaltungsmanager können für diesen Partner buchen.'))
                
        return super(AccountMove, self)._post(soft=soft)
    
    def _find_best_cpd_account(self, partner_id, move_type):
        """Findet das beste CPD-Konto basierend auf den definierten Bedingungen"""
        partner = self.env['res.partner'].browse(partner_id)
        if not partner:
            return False
            
        # Kontext-Informationen für bedingte Auswahl
        context = {}
        if self.env.context.get('product_category_id'):
            context['product_category'] = self.env.context.get('product_category_id')
        if self.env.context.get('project_id'):
            context['project'] = self.env.context.get('project_id')
        if self.env.context.get('department_id'):
            context['department'] = self.env.context.get('department_id')
            
        # Alternative Konten nach Priorität sortieren
        alt_accounts = self.env['partner.alternative.account'].search([
            ('partner_id', '=', partner.id),
            ('active', '=', True)
        ], order='priority desc')
        
        # Prüfen, ob ein passendes Konto mit Bedingungen vorhanden ist
        for alt in alt_accounts:
            if alt.condition == 'manual':
                continue
            elif alt.condition == 'product_category' and context.get('product_category') == alt.condition_value:
                return alt.account_id.id
            elif alt.condition == 'project' and context.get('project') == alt.condition_value:
                return alt.account_id.id
            elif alt.condition == 'department' and context.get('department') == alt.condition_value:
                return alt.account_id.id
                
        # Fallback: Haupt-CPD-Konto des Partners
        if partner.cpd_account_id:
            return partner.cpd_account_id.id
            
        return False
        
    @api.model
    def create(self, vals):
        """Erweitert die Erstellungsmethode um automatische CPD-Kontenauswahl"""
        if vals.get('partner_id') and vals.get('move_type') in ['out_invoice', 'out_refund', 'in_invoice', 'in_refund']:
            # Bestes CPD-Konto finden
            cpd_account_id = self._find_best_cpd_account(vals.get('partner_id'), vals.get('move_type'))
            if cpd_account_id:
                vals['alternative_cpd_account_id'] = cpd_account_id
                vals['use_alternative_cpd'] = True
                
        return super(AccountMove, self).create(vals)

class AccountMoveLine(models.Model):
    _inherit = 'account.move.line'
    
    # Erweiterte Felder für Buchungszeilen
    original_cpd_account_id = fields.Many2one('account.account', 'Original-CPD-Konto',
        help="Ursprüngliches CPD-Konto (Conto pro diverse) vor Änderung")
    
    @api.onchange('account_id')
    def _onchange_account_id(self):
        """Prüft, ob eine Kostenstelle erforderlich ist"""
        res = super(AccountMoveLine, self)._onchange_account_id() if hasattr(self, '_onchange_account_id') else {}
        if self.account_id and self.account_id.cost_center_required and not self.analytic_account_id:
            message = _('Für Konto %s ist eine Kostenstelle erforderlich.') % self.account_id.name
            warning = {
                'title': _('Kostenstelle erforderlich'),
                'message': message,
            }
            res = {'warning': warning}
        return res 