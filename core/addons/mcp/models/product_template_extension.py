# -*- coding: utf-8 -*-
# Part of VALEO NeuroERP. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, _

class ProductTemplate(models.Model):
    _inherit = 'product.template'
    
    # Chargenspezifische Felder
    lot_ids = fields.One2many('stock.lot', 'product_tmpl_id', string='Chargen',
        compute='_compute_lot_ids', store=False)
    default_lot_account_id = fields.Many2one('account.account', 'Standard-Artikelkonto für Chargen',
        domain=[('deprecated', '=', False), ('internal_type', '=', 'other')],
        help="Standard-Finanzkonto für die Bewertung neuer Chargen dieses Produkts")
    charge_validation_required = fields.Boolean('Chargenvalidierung erforderlich',
        help="Wenn aktiv, müssen Chargen vor der Verwendung validiert werden")
    auto_generate_lots = fields.Boolean('Automatische Chargennummern',
        help="Bei Wareneingang automatisch Chargennummern generieren")
    lot_number_prefix = fields.Char('Chargennummern-Präfix',
        help="Präfix für automatisch generierte Chargennummern")
    lot_count = fields.Integer('Anzahl Chargen', compute='_compute_lot_count')
    
    # Berechnete Felder
    @api.depends('product_variant_ids', 'product_variant_ids.stock_quant_ids', 
                'product_variant_ids.stock_move_ids')
    def _compute_lot_ids(self):
        """Berechnet alle Chargen, die mit diesem Produkt verknüpft sind"""
        for template in self:
            if len(template.product_variant_ids) == 1:
                lot_domain = [('product_id', '=', template.product_variant_ids.id)]
            else:
                lot_domain = [('product_id', 'in', template.product_variant_ids.ids)]
            template.lot_ids = self.env['stock.lot'].search(lot_domain)
    
    @api.depends('product_variant_ids', 'product_variant_ids.stock_quant_ids')
    def _compute_lot_count(self):
        """Berechnet die Anzahl der Chargen für dieses Produkt"""
        for template in self:
            if len(template.product_variant_ids) == 1:
                lot_domain = [('product_id', '=', template.product_variant_ids.id)]
            else:
                lot_domain = [('product_id', 'in', template.product_variant_ids.ids)]
            template.lot_count = self.env['stock.lot'].search_count(lot_domain)
    
    # Aktionen
    def action_view_lots(self):
        """Öffnet die Chargenliste für dieses Produkt"""
        self.ensure_one()
        if len(self.product_variant_ids) == 1:
            lot_domain = [('product_id', '=', self.product_variant_ids.id)]
        else:
            lot_domain = [('product_id', 'in', self.product_variant_ids.ids)]
        
        action = self.env["ir.actions.actions"]._for_xml_id("stock.action_production_lot_form")
        action['domain'] = lot_domain
        action['context'] = {
            'default_product_tmpl_id': self.id,
            'default_product_id': self.product_variant_ids[:1].id,
            'default_company_id': self.company_id.id,
        }
        return action
    
    def _track_template(self, changes):
        res = super(ProductTemplate, self)._track_template(changes)
        product_template = self[0]
        if 'tracking' in changes and product_template.tracking == 'lot':
            res['tracking'] = (self.env.ref('stock.mail_template_data_notification_email_stock_lot'), {
                'auto_delete_message': True,
                'subtype_id': self.env['ir.model.data']._xmlid_to_res_id('mail.mt_note'),
                'email_layout_xmlid': 'mail.mail_notification_light'
            })
        return res

class ProductProduct(models.Model):
    _inherit = 'product.product'
    
    lot_ids = fields.One2many('stock.lot', 'product_id', string='Chargen')
    lot_count = fields.Integer('Anzahl Chargen', compute='_compute_lot_count')
    
    @api.depends('stock_quant_ids', 'stock_move_ids')
    def _compute_lot_count(self):
        """Berechnet die Anzahl der Chargen für diese Produktvariante"""
        for product in self:
            product.lot_count = self.env['stock.lot'].search_count([('product_id', '=', product.id)])
    
    def action_view_lots(self):
        """Öffnet die Chargenliste für diese Produktvariante"""
        self.ensure_one()
        action = self.env["ir.actions.actions"]._for_xml_id("stock.action_production_lot_form")
        action['domain'] = [('product_id', '=', self.id)]
        action['context'] = {
            'default_product_id': self.id,
            'default_company_id': self.company_id.id,
        }
        return action 