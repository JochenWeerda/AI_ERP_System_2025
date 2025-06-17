# -*- coding: utf-8 -*-
# Part of VALEO NeuroERP. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, _
from odoo.exceptions import UserError
import datetime
import re

class StockPicking(models.Model):
    _inherit = 'stock.picking'
    
    # Zusätzliche Felder für die Chargenverarbeitung beim Wareneingang
    lot_auto_creation = fields.Boolean('Automatische Chargenerstellung', 
        help="Bei Bestätigung automatisch Chargen für chargenpflichtige Produkte erstellen")
    lot_validation_required = fields.Boolean('Chargenvalidierung erforderlich',
        compute='_compute_lot_validation', store=True,
        help="Gibt an, ob Chargen vor der Verwendung validiert werden müssen")
    quality_check_required = fields.Boolean('Qualitätsprüfung erforderlich',
        compute='_compute_quality_check', store=True,
        help="Gibt an, ob für diese Lieferung eine Qualitätsprüfung erforderlich ist")
    pending_lot_count = fields.Integer('Ausstehende Chargenprüfungen', 
        compute='_compute_pending_lot_count',
        help="Anzahl der Chargen mit ausstehendem Qualitätsstatus")
    
    # Berechnete Felder
    @api.depends('move_ids', 'move_ids.product_id', 'move_ids.product_id.tracking', 
                'move_ids.product_id.product_tmpl_id.charge_validation_required')
    def _compute_lot_validation(self):
        """Prüft, ob Chargenvalidierung für einen der Artikel in diesem Beleg erforderlich ist"""
        for picking in self:
            products_require_validation = any(
                move.product_id.tracking in ['lot', 'serial'] and 
                move.product_id.product_tmpl_id.charge_validation_required
                for move in picking.move_ids
            )
            picking.lot_validation_required = products_require_validation
    
    @api.depends('move_ids', 'move_ids.product_id', 'move_ids.product_id.tracking')
    def _compute_quality_check(self):
        """Prüft, ob Qualitätsprüfung für einen der Artikel in diesem Beleg erforderlich ist"""
        for picking in self:
            # Nur für Wareneingänge relevant
            if picking.picking_type_code != 'incoming':
                picking.quality_check_required = False
                continue
                
            products_require_check = any(
                move.product_id.tracking in ['lot', 'serial']
                for move in picking.move_ids
            )
            picking.quality_check_required = products_require_check
    
    @api.depends('move_line_ids', 'move_line_ids.lot_id', 'move_line_ids.lot_id.quality_state')
    def _compute_pending_lot_count(self):
        """Berechnet die Anzahl der Chargen mit ausstehendem Qualitätsstatus"""
        for picking in self:
            pending_lots = picking.move_line_ids.filtered(
                lambda l: l.lot_id and l.lot_id.quality_state in ['draft', 'pending']
            ).mapped('lot_id')
            picking.pending_lot_count = len(pending_lots)
    
    # Überschreiben der Standardmethoden
    def action_confirm(self):
        """Bestätigt den Beleg und prüft auf automatische Chargenerstellung"""
        res = super(StockPicking, self).action_confirm()
        
        # Automatische Chargenerstellung vorbereiten
        for picking in self:
            if picking.picking_type_code == 'incoming' and picking.lot_auto_creation:
                for move in picking.move_ids:
                    if move.product_id.tracking in ['lot', 'serial']:
                        product = move.product_id
                        if product.auto_generate_lots and product.lot_number_prefix:
                            # Automatische Chargennummern werden erst bei der Validierung erstellt
                            pass
        return res
    
    def button_validate(self):
        """Validiert den Beleg und erstellt automatisch Chargen, wenn konfiguriert"""
        # Automatische Chargenerstellung
        for picking in self:
            if picking.picking_type_code == 'incoming' and picking.lot_auto_creation:
                for move in picking.move_ids:
                    if move.product_id.tracking in ['lot', 'serial'] and not move.move_line_ids:
                        product = move.product_id
                        if product.auto_generate_lots and product.lot_number_prefix:
                            # Chargennummer erstellen
                            today = datetime.date.today()
                            lot_prefix = product.lot_number_prefix or ''
                            lot_suffix = today.strftime("%y%m%d")
                            lot_number = f"{lot_prefix}{lot_suffix}"
                            
                            # Prüfen, ob bereits eine Charge mit dieser Nummer existiert
                            existing_lot = self.env['stock.lot'].search([
                                ('name', '=', lot_number),
                                ('product_id', '=', product.id),
                                ('company_id', '=', picking.company_id.id)
                            ], limit=1)
                            
                            if existing_lot:
                                # Suffix hinzufügen, wenn die Charge bereits existiert
                                count = 1
                                while True:
                                    new_lot_number = f"{lot_number}-{count}"
                                    existing = self.env['stock.lot'].search([
                                        ('name', '=', new_lot_number),
                                        ('product_id', '=', product.id),
                                        ('company_id', '=', picking.company_id.id)
                                    ], limit=1)
                                    if not existing:
                                        lot_number = new_lot_number
                                        break
                                    count += 1
                            
                            # Charge erstellen
                            lot_vals = {
                                'name': lot_number,
                                'product_id': product.id,
                                'company_id': picking.company_id.id,
                                'quality_state': 'draft',
                            }
                            
                            # Standardwerte für Finanzkonto
                            if product.product_tmpl_id.default_lot_account_id:
                                lot_vals['account_id'] = product.product_tmpl_id.default_lot_account_id.id
                            if product.standard_price:
                                lot_vals['cost_price'] = product.standard_price
                                
                            lot = self.env['stock.lot'].create(lot_vals)
                            
                            # Bewegungszeile mit der neuen Charge erstellen
                            self.env['stock.move.line'].create({
                                'move_id': move.id,
                                'product_id': product.id,
                                'product_uom_id': move.product_uom.id,
                                'location_id': move.location_id.id,
                                'location_dest_id': move.location_dest_id.id,
                                'lot_id': lot.id,
                                'qty_done': move.product_uom_qty,
                                'picking_id': picking.id,
                            })
        
        return super(StockPicking, self).button_validate()
    
    # Aktionen
    def action_view_pending_lots(self):
        """Öffnet eine Liste der Chargen mit ausstehendem Qualitätsstatus"""
        self.ensure_one()
        pending_lots = self.move_line_ids.filtered(
            lambda l: l.lot_id and l.lot_id.quality_state in ['draft', 'pending']
        ).mapped('lot_id')
        
        action = self.env["ir.actions.actions"]._for_xml_id("stock.action_production_lot_form")
        action['domain'] = [('id', 'in', pending_lots.ids)]
        action['context'] = {'search_default_group_by_product': 1}
        return action
    
    def action_approve_all_lots(self):
        """Setzt den Qualitätsstatus aller Chargen in diesem Beleg auf 'Freigegeben'"""
        self.ensure_one()
        lots = self.move_line_ids.mapped('lot_id')
        lots.write({'quality_state': 'approved'})
        return {'type': 'ir.actions.client', 'tag': 'reload'}
    
    def action_set_all_lots_pending(self):
        """Setzt den Qualitätsstatus aller Chargen in diesem Beleg auf 'Prüfung ausstehend'"""
        self.ensure_one()
        lots = self.move_line_ids.mapped('lot_id')
        lots.write({'quality_state': 'pending'})
        return {'type': 'ir.actions.client', 'tag': 'reload'} 