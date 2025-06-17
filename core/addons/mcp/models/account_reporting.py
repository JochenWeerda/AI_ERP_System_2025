# -*- coding: utf-8 -*-
# Part of VALEO NeuroERP. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, tools, _
from odoo.exceptions import UserError, ValidationError
import logging
from datetime import datetime, timedelta

_logger = logging.getLogger(__name__)

class CPDAccountAnalysis(models.Model):
    _name = 'cpd.account.analysis'
    _description = 'CPD-Kontenanalyse'
    _auto = False
    _order = 'date desc, partner_id, account_id'
    
    # Dimensionen für die Analyse
    partner_id = fields.Many2one('res.partner', string='Partner', readonly=True)
    partner_category = fields.Selection([
        ('regular', 'Standard'),
        ('key_account', 'Key Account'),
        ('strategic', 'Strategisch'),
        ('one_time', 'Einmalkunde'),
        ('internal', 'Intern'),
        ('intercompany', 'Verbundunternehmen')
    ], string='Partnerkategorie', readonly=True)
    account_id = fields.Many2one('account.account', string='Konto', readonly=True)
    account_group_code = fields.Char('Kontengruppe', readonly=True)
    date = fields.Date('Datum', readonly=True)
    company_id = fields.Many2one('res.company', string='Unternehmen', readonly=True)
    journal_id = fields.Many2one('account.journal', string='Journal', readonly=True)
    move_id = fields.Many2one('account.move', string='Buchung', readonly=True)
    move_line_id = fields.Many2one('account.move.line', string='Buchungszeile', readonly=True)
    move_type = fields.Selection([
        ('entry', 'Journal-Buchung'),
        ('out_invoice', 'Ausgangsrechnung'),
        ('out_refund', 'Kundengutschrift'),
        ('in_invoice', 'Eingangsrechnung'),
        ('in_refund', 'Lieferantengutschrift'),
        ('out_receipt', 'Quittung (Ausgang)'),
        ('in_receipt', 'Quittung (Eingang)'),
    ], string='Buchungstyp', readonly=True)
    state = fields.Selection([
        ('draft', 'Entwurf'),
        ('posted', 'Gebucht'),
        ('cancel', 'Storniert')
    ], string='Status', readonly=True)
    reconciled = fields.Boolean('Ausgeglichen', readonly=True)
    is_alternative_cpd = fields.Boolean('Alternatives CPD', readonly=True)
    
    # Kennzahlen
    debit = fields.Monetary('Soll', readonly=True)
    credit = fields.Monetary('Haben', readonly=True)
    balance = fields.Monetary('Saldo', readonly=True)
    amount_currency = fields.Monetary('Währungsbetrag', readonly=True)
    currency_id = fields.Many2one('res.currency', string='Währung', readonly=True)
    
    # Zeitliche Dimensionen
    fiscal_year = fields.Char('Geschäftsjahr', readonly=True)
    fiscal_quarter = fields.Char('Quartal', readonly=True)
    fiscal_month = fields.Char('Monat', readonly=True)
    days_outstanding = fields.Integer('Offene Tage', readonly=True, 
                                     help="Anzahl der Tage seit Buchung (wenn offen) oder bis zum Ausgleich")
    
    def init(self):
        """Initialisiert die Datenbankansicht für die CPD-Kontenanalyse"""
        tools.drop_view_if_exists(self.env.cr, self._table)
        
        # Erstellung der SQL-View
        self.env.cr.execute("""
            CREATE OR REPLACE VIEW %s AS (
                SELECT
                    aml.id as id,
                    aml.partner_id,
                    rp.partner_category,
                    aml.account_id,
                    aa.account_group_code,
                    aml.date,
                    aml.company_id,
                    aml.journal_id,
                    aml.move_id,
                    aml.id as move_line_id,
                    am.move_type,
                    am.state,
                    aml.reconciled,
                    (CASE WHEN aml.account_id = am.alternative_cpd_account_id AND am.use_alternative_cpd = TRUE 
                          THEN TRUE ELSE FALSE END) as is_alternative_cpd,
                    aml.debit,
                    aml.credit,
                    aml.balance,
                    aml.amount_currency,
                    aml.currency_id,
                    EXTRACT(YEAR FROM aml.date)::varchar as fiscal_year,
                    CONCAT('Q', EXTRACT(QUARTER FROM aml.date)::varchar) as fiscal_quarter,
                    TO_CHAR(aml.date, 'MM-YYYY') as fiscal_month,
                    CASE
                        WHEN aml.reconciled = FALSE THEN 
                            EXTRACT(DAY FROM (NOW() - aml.date))::integer
                        ELSE
                            EXTRACT(DAY FROM (aml.date_reconciled - aml.date))::integer
                    END as days_outstanding
                FROM account_move_line aml
                JOIN account_move am ON aml.move_id = am.id
                JOIN account_account aa ON aml.account_id = aa.id
                LEFT JOIN res_partner rp ON aml.partner_id = rp.id
                WHERE aa.is_cpd_account = TRUE
            )
        """ % self._table)

class CPDAccountSummary(models.Model):
    _name = 'cpd.account.summary'
    _description = 'CPD-Kontenzusammenfassung'
    _auto = False
    _order = 'partner_id, account_id'
    
    partner_id = fields.Many2one('res.partner', string='Partner', readonly=True)
    account_id = fields.Many2one('account.account', string='Konto', readonly=True)
    company_id = fields.Many2one('res.company', string='Unternehmen', readonly=True)
    
    # Aggregierte Werte
    total_debit = fields.Monetary('Gesamt Soll', readonly=True)
    total_credit = fields.Monetary('Gesamt Haben', readonly=True)
    balance = fields.Monetary('Saldo', readonly=True)
    currency_id = fields.Many2one('res.currency', string='Währung', readonly=True)
    
    # Statistiken
    transaction_count = fields.Integer('Anzahl Transaktionen', readonly=True)
    avg_transaction_amount = fields.Monetary('Durchschnittsbetrag', readonly=True)
    last_transaction_date = fields.Date('Letztes Transaktionsdatum', readonly=True)
    open_items_count = fields.Integer('Offene Posten', readonly=True)
    open_items_balance = fields.Monetary('Saldo offene Posten', readonly=True)
    avg_days_to_settle = fields.Float('Durchschn. Ausgleichsdauer (Tage)', readonly=True,
                                     help="Durchschnittliche Anzahl Tage bis zum Ausgleich")
    
    def init(self):
        """Initialisiert die Datenbankansicht für die CPD-Kontenzusammenfassung"""
        tools.drop_view_if_exists(self.env.cr, self._table)
        
        # Erstellung der SQL-View
        self.env.cr.execute("""
            CREATE OR REPLACE VIEW %s AS (
                WITH settled_days AS (
                    SELECT 
                        aml.partner_id,
                        aml.account_id,
                        aml.company_id,
                        AVG(EXTRACT(DAY FROM (aml.date_reconciled - aml.date))) as avg_days
                    FROM account_move_line aml
                    JOIN account_account aa ON aml.account_id = aa.id
                    WHERE aa.is_cpd_account = TRUE AND aml.reconciled = TRUE
                    GROUP BY aml.partner_id, aml.account_id, aml.company_id
                )
                SELECT
                    ROW_NUMBER() OVER() as id,
                    aml.partner_id,
                    aml.account_id,
                    aml.company_id,
                    SUM(aml.debit) as total_debit,
                    SUM(aml.credit) as total_credit,
                    SUM(aml.balance) as balance,
                    rc.currency_id,
                    COUNT(aml.id) as transaction_count,
                    CASE 
                        WHEN COUNT(aml.id) > 0 THEN (SUM(ABS(aml.balance)) / COUNT(aml.id))
                        ELSE 0
                    END as avg_transaction_amount,
                    MAX(aml.date) as last_transaction_date,
                    SUM(CASE WHEN aml.reconciled = FALSE THEN 1 ELSE 0 END) as open_items_count,
                    SUM(CASE WHEN aml.reconciled = FALSE THEN aml.balance ELSE 0 END) as open_items_balance,
                    COALESCE(sd.avg_days, 0) as avg_days_to_settle
                FROM account_move_line aml
                JOIN account_account aa ON aml.account_id = aa.id
                JOIN res_company rc ON aml.company_id = rc.id
                LEFT JOIN settled_days sd ON 
                    aml.partner_id = sd.partner_id AND 
                    aml.account_id = sd.account_id AND 
                    aml.company_id = sd.company_id
                WHERE aa.is_cpd_account = TRUE
                GROUP BY aml.partner_id, aml.account_id, aml.company_id, rc.currency_id, sd.avg_days
            )
        """ % self._table)

class CPDAgingReport(models.Model):
    _name = 'cpd.aging.report'
    _description = 'CPD-Fälligkeitsbericht'
    _auto = False
    _order = 'partner_id, account_id'
    
    partner_id = fields.Many2one('res.partner', string='Partner', readonly=True)
    account_id = fields.Many2one('account.account', string='Konto', readonly=True)
    company_id = fields.Many2one('res.company', string='Unternehmen', readonly=True)
    currency_id = fields.Many2one('res.currency', string='Währung', readonly=True)
    
    # Salden nach Fälligkeitskategorien
    not_due = fields.Monetary('Nicht fällig', readonly=True)
    days_1_30 = fields.Monetary('1-30 Tage', readonly=True)
    days_31_60 = fields.Monetary('31-60 Tage', readonly=True)
    days_61_90 = fields.Monetary('61-90 Tage', readonly=True)
    days_91_120 = fields.Monetary('91-120 Tage', readonly=True)
    days_120_plus = fields.Monetary('> 120 Tage', readonly=True)
    total = fields.Monetary('Gesamt', readonly=True)
    
    def init(self):
        """Initialisiert die Datenbankansicht für den CPD-Fälligkeitsbericht"""
        tools.drop_view_if_exists(self.env.cr, self._table)
        
        # Erstellung der SQL-View
        self.env.cr.execute("""
            CREATE OR REPLACE VIEW %s AS (
                WITH aging AS (
                    SELECT
                        aml.partner_id,
                        aml.account_id,
                        aml.company_id,
                        rc.currency_id,
                        SUM(CASE 
                            WHEN aml.date_maturity > CURRENT_DATE THEN aml.balance
                            ELSE 0
                        END) as not_due,
                        SUM(CASE 
                            WHEN aml.date_maturity <= CURRENT_DATE AND 
                                 aml.date_maturity > CURRENT_DATE - INTERVAL '30 days' THEN aml.balance
                            ELSE 0
                        END) as days_1_30,
                        SUM(CASE 
                            WHEN aml.date_maturity <= CURRENT_DATE - INTERVAL '30 days' AND 
                                 aml.date_maturity > CURRENT_DATE - INTERVAL '60 days' THEN aml.balance
                            ELSE 0
                        END) as days_31_60,
                        SUM(CASE 
                            WHEN aml.date_maturity <= CURRENT_DATE - INTERVAL '60 days' AND 
                                 aml.date_maturity > CURRENT_DATE - INTERVAL '90 days' THEN aml.balance
                            ELSE 0
                        END) as days_61_90,
                        SUM(CASE 
                            WHEN aml.date_maturity <= CURRENT_DATE - INTERVAL '90 days' AND 
                                 aml.date_maturity > CURRENT_DATE - INTERVAL '120 days' THEN aml.balance
                            ELSE 0
                        END) as days_91_120,
                        SUM(CASE 
                            WHEN aml.date_maturity <= CURRENT_DATE - INTERVAL '120 days' THEN aml.balance
                            ELSE 0
                        END) as days_120_plus,
                        SUM(aml.balance) as total
                    FROM account_move_line aml
                    JOIN account_account aa ON aml.account_id = aa.id
                    JOIN res_company rc ON aml.company_id = rc.id
                    WHERE aa.is_cpd_account = TRUE AND aml.reconciled = FALSE
                    GROUP BY aml.partner_id, aml.account_id, aml.company_id, rc.currency_id
                )
                SELECT
                    ROW_NUMBER() OVER() as id,
                    a.partner_id,
                    a.account_id,
                    a.company_id,
                    a.currency_id,
                    a.not_due,
                    a.days_1_30,
                    a.days_31_60,
                    a.days_61_90,
                    a.days_91_120,
                    a.days_120_plus,
                    a.total
                FROM aging a
            )
        """ % self._table) 