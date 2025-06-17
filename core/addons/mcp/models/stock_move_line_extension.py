# -*- coding: utf-8 -*-
# Part of VALEO NeuroERP. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, _

class StockMoveLine(models.Model):
    _inherit = 'stock.move.line'
    
    # Hilfsmethode zur Anzeige des Chargenformulars
    def action_lot_open_form(self):
        """Öffnet das Formular für die zugehörige Charge"""
        self.ensure_one()
        if not self.lot_id:
            return False
            
        action = self.env["ir.actions.actions"]._for_xml_id("stock.action_production_lot_form")
        action['views'] = [(self.env.ref('stock.view_production_lot_form').id, 'form')]
        action['res_id'] = self.lot_id.id
        return action 