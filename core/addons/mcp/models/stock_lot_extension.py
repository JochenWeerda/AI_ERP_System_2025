# -*- coding: utf-8 -*-
# Part of VALEO NeuroERP. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, tools, _
from odoo.exceptions import UserError, ValidationError

class StockLot(models.Model):
    _inherit = 'stock.lot'
    
    # Verbindung zum Artikelkonto
    account_id = fields.Many2one('account.account', 'Artikelkonto', 
        domain=[('deprecated', '=', False), ('internal_type', '=', 'other')],
        help="Konto für die Bewertung dieser Charge")
    cost_price = fields.Float('Einstandspreis', digits='Product Price', 
        help="Spezifischer Einstandspreis dieser Charge")
    valuation_value = fields.Float('Bestandswert', compute='_compute_valuation',
        help="Aktueller Wert des Lagerbestands dieser Charge")
    supplier_lot_number = fields.Char('Lieferanten-Chargennummer',
        help="Chargennummer des Lieferanten, falls abweichend")
    production_date = fields.Date('Produktionsdatum')
    best_before_date = fields.Date('Mindesthaltbarkeitsdatum')
    quality_state = fields.Selection([
        ('draft', 'Neu'),
        ('pending', 'Prüfung ausstehend'),
        ('approved', 'Freigegeben'),
        ('rejected', 'Gesperrt')
    ], string='Qualitätsstatus', default='draft')
    quality_notes = fields.Html('Qualitätshinweise')
    
    # Berechnete Felder
    @api.depends('cost_price', 'product_qty')
    def _compute_valuation(self):
        """Berechnet den aktuellen Bestandswert basierend auf Menge und Einstandspreis"""
        for lot in self:
            lot.valuation_value = lot.product_qty * lot.cost_price
    
    # Überschreiben der create-Methode, um Standardwerte zu setzen
    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if 'product_id' in vals and 'account_id' not in vals:
                product = self.env['product.product'].browse(vals['product_id'])
                if product.product_tmpl_id.default_lot_account_id:
                    vals['account_id'] = product.product_tmpl_id.default_lot_account_id.id
                if product.standard_price and 'cost_price' not in vals:
                    vals['cost_price'] = product.standard_price
        return super(StockLot, self).create(vals_list)
    
    # Geschäftslogik
    def action_approve_quality(self):
        """Setzt den Qualitätsstatus auf 'Freigegeben'"""
        self.write({'quality_state': 'approved'})
    
    def action_reject_quality(self):
        """Setzt den Qualitätsstatus auf 'Gesperrt'"""
        self.write({'quality_state': 'rejected'})
    
    def action_set_pending_quality(self):
        """Setzt den Qualitätsstatus auf 'Prüfung ausstehend'"""
        self.write({'quality_state': 'pending'})
    
    # Bericht für Chargenbewegungen
    def action_view_movements(self):
        self.ensure_one()
        action = self.env["ir.actions.actions"]._for_xml_id("stock.stock_move_line_action")
        action['domain'] = [('lot_id', '=', self.id)]
        action['context'] = {
            'search_default_done': 1,
            'default_lot_id': self.id,
        }
        return action
    
    # Bericht für Chargen-Bestandswert
    def action_view_valuation(self):
        self.ensure_one()
        action = self.env["ir.actions.actions"]._for_xml_id("stock_account.action_stock_account_valuation_report")
        action['domain'] = [('product_id', '=', self.product_id.id), ('lot_id', '=', self.id)]
        action['context'] = {'search_default_group_by_product': 0, 'search_default_group_by_lot': 1}
        return action 