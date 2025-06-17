# -*- coding: utf-8 -*-
# Part of VALEO NeuroERP. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError

class ResPartner(models.Model):
    _inherit = 'res.partner'
    
    # L3-Stammdaten Felder
    l3_partner_id = fields.Char('L3 Partner-ID', 
        help="Referenz-ID des Partners im L3-System")
    l3_customer_id = fields.Char('L3 Kunden-ID',
        help="Kunden-ID im L3-System")
    l3_vendor_id = fields.Char('L3 Lieferanten-ID',
        help="Lieferanten-ID im L3-System")
    l3_last_sync = fields.Datetime('Letzte L3-Synchronisation',
        help="Zeitpunkt der letzten Synchronisation mit L3")
    
    # Erweiterte Klassifizierungsfelder
    partner_category = fields.Selection([
        ('regular', 'Standard'),
        ('key_account', 'Key Account'),
        ('strategic', 'Strategisch'),
        ('one_time', 'Einmalkunde'),
        ('internal', 'Intern'),
        ('intercompany', 'Verbundunternehmen')
    ], string='Partnerkategorie', default='regular',
       help="Kategorisierung des Partners für Berichtszwecke")
    
    quality_rating = fields.Selection([
        ('a', 'A - Hervorragend'),
        ('b', 'B - Gut'),
        ('c', 'C - Befriedigend'),
        ('d', 'D - Ungenügend')
    ], string='Qualitätsbewertung',
       help="Qualitätsbewertung des Lieferanten")
    
    delivery_rating = fields.Selection([
        ('a', 'A - Hervorragend'),
        ('b', 'B - Gut'),
        ('c', 'C - Befriedigend'),
        ('d', 'D - Ungenügend')
    ], string='Lieferbewertung',
       help="Bewertung der Lieferzuverlässigkeit")
    
    # Zusätzliche Finanzinformationen
    payment_block = fields.Boolean('Zahlungssperre',
        help="Bei Aktivierung werden Zahlungen an diesen Partner blockiert")
    payment_block_reason = fields.Text('Grund für Zahlungssperre')
    credit_limit_override = fields.Float('Kreditlimit (Überschreibung)',
        help="Manuell festgelegtes Kreditlimit (überschreibt die automatische Berechnung)")
    
    # Zusätzliche Kontaktfelder
    quality_contact_id = fields.Many2one('res.partner', 'Qualitätskontakt',
        domain="[('parent_id', '=', id), ('type', '=', 'contact')]",
        help="Ansprechpartner für Qualitätsthemen")
    logistics_contact_id = fields.Many2one('res.partner', 'Logistikkontakt',
        domain="[('parent_id', '=', id), ('type', '=', 'contact')]",
        help="Ansprechpartner für Logistikthemen")
    
    # Lieferantenspezifische Felder
    min_order_value = fields.Float('Mindestbestellwert',
        help="Mindestbestellwert für diesen Lieferanten")
    min_order_qty = fields.Float('Mindestbestellmenge',
        help="Mindestbestellmenge bei diesem Lieferanten")
    lead_time_days = fields.Integer('Beschaffungszeit (Tage)',
        help="Typische Beschaffungszeit in Tagen")
    is_preferred_vendor = fields.Boolean('Bevorzugter Lieferant',
        help="Markiert diesen Lieferanten als bevorzugt für Beschaffungsentscheidungen")
    vendor_score = fields.Float('Lieferantenbewertung', compute='_compute_vendor_score', store=True,
        help="Gesamtbewertung des Lieferanten (0-100)")
    
    # CPD-Konten (Conto pro diverse)
    cpd_account_id = fields.Many2one('account.account', 'CPD-Konto',
        domain=[('deprecated', '=', False), ('internal_type', 'in', ['receivable', 'payable'])],
        help="Spezifisches CPD-Konto (Conto pro diverse) für diesen Partner")
    cpd_payment_term_id = fields.Many2one('account.payment.term', 'Spezielle Zahlungsbedingung',
        help="Spezielle Zahlungsbedingung für diesen Partner")
    alternative_cpd_account_ids = fields.One2many('partner.alternative.account', 'partner_id', 
        string='Alternative CPD-Konten',
        help="Alternative CPD-Konten (Conto pro diverse) für spezielle Fälle")
    
    # Berechnete Felder
    @api.depends('quality_rating', 'delivery_rating', 'invoice_ids', 'purchase_line_ids')
    def _compute_vendor_score(self):
        """Berechnet einen Gesamtscore für den Lieferanten basierend auf verschiedenen Faktoren"""
        for partner in self:
            score = 50.0  # Standardwert
            
            # Qualitätsbewertung einfließen lassen
            if partner.quality_rating:
                quality_scores = {'a': 25.0, 'b': 20.0, 'c': 10.0, 'd': 0.0}
                score += quality_scores.get(partner.quality_rating, 0.0)
            
            # Lieferbewertung einfließen lassen
            if partner.delivery_rating:
                delivery_scores = {'a': 25.0, 'b': 20.0, 'c': 10.0, 'd': 0.0}
                score += delivery_scores.get(partner.delivery_rating, 0.0)
            
            # Präferenzbonus
            if partner.is_preferred_vendor:
                score += 5.0
                
            # Begrenzung auf 0-100
            partner.vendor_score = max(0.0, min(100.0, score))
    
    # Überschreiben von Standardmethoden
    @api.onchange('supplier_rank')
    def _onchange_supplier_rank(self):
        """Setzt Standardwerte für Lieferanten"""
        if self.supplier_rank > 0 and not self.lead_time_days:
            self.lead_time_days = 1
    
    @api.onchange('customer_rank')
    def _onchange_customer_rank(self):
        """Setzt Standardwerte für Kunden"""
        if self.customer_rank > 0 and not self.partner_category:
            self.partner_category = 'regular'
    
    # Aktionen
    def action_block_payments(self):
        """Blockiert Zahlungen an diesen Partner"""
        self.ensure_one()
        self.payment_block = True
    
    def action_unblock_payments(self):
        """Hebt die Zahlungssperre auf"""
        self.ensure_one()
        self.payment_block = False
        self.payment_block_reason = False
    
    def action_view_quality_incidents(self):
        """Zeigt Qualitätsvorfälle mit diesem Partner an"""
        self.ensure_one()
        # Hier Integration mit Qualitätsmodul, falls vorhanden
        return {
            'name': _('Qualitätsvorfälle'),
            'view_mode': 'tree,form',
            'res_model': 'quality.check',  # Annahme: Es gibt ein Qualitätsmodul
            'domain': [('partner_id', '=', self.id)],
            'type': 'ir.actions.act_window',
            'context': {'default_partner_id': self.id}
        }
    
    def action_view_vendor_rating(self):
        """Zeigt detaillierte Lieferantenbewertung an"""
        self.ensure_one()
        return {
            'name': _('Lieferantenbewertung'),
            'view_mode': 'form',
            'res_model': 'res.partner',
            'res_id': self.id,
            'target': 'new',
            'type': 'ir.actions.act_window',
            'context': {'form_view_ref': 'mcp.view_partner_vendor_rating_form'}
        }

class PartnerAlternativeAccount(models.Model):
    _name = 'partner.alternative.account'
    _description = 'Alternative CPD-Konten (Conto pro diverse) für Partner'
    
    name = fields.Char('Bezeichnung', required=True)
    partner_id = fields.Many2one('res.partner', 'Partner', required=True, ondelete='cascade')
    account_id = fields.Many2one('account.account', 'Konto', required=True,
        domain=[('deprecated', '=', False), ('internal_type', 'in', ['receivable', 'payable'])],
        help="Alternatives CPD-Konto (Conto pro diverse)")
    company_id = fields.Many2one('res.company', 'Unternehmen', required=True, 
        default=lambda self: self.env.company)
    active = fields.Boolean('Aktiv', default=True)
    note = fields.Text('Hinweis')
    condition = fields.Selection([
        ('manual', 'Manuell auswählen'),
        ('product_category', 'Produktkategorie'),
        ('project', 'Projekt'),
        ('department', 'Abteilung')
    ], string='Verwendungsbedingung', default='manual', required=True,
       help="Definiert, wann dieses alternative Konto verwendet werden soll")
    condition_value = fields.Char('Bedingungswert',
        help="Wert für die Bedingung (z.B. ID der Produktkategorie)")
    priority = fields.Integer('Priorität', default=10,
        help="Höhere Zahlen bedeuten höhere Priorität") 