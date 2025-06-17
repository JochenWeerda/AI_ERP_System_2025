# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class Farm(models.Model):
    _name = 'farm.farm'
    _description = 'Landwirtschaftlicher Betrieb'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    
    name = fields.Char(string='Betriebsname', required=True, tracking=True)
    partner_id = fields.Many2one('res.partner', string='Partner', required=True,
                                 tracking=True, domain=[('is_company', '=', True)])
    address = fields.Char(string='Adresse', tracking=True)
    size = fields.Float(string='Gesamtgröße (ha)', tracking=True)
    manager_id = fields.Many2one('res.partner', string='Betriebsleiter', 
                                 domain=[('is_company', '=', False)])
    employee_ids = fields.Many2many('res.partner', string='Mitarbeiter',
                                   domain=[('is_company', '=', False)])
    field_ids = fields.One2many('farm.field', 'farm_id', string='Felder')
    active = fields.Boolean(default=True)
    company_id = fields.Many2one('res.company', string='Unternehmen', 
                                required=True, default=lambda self: self.env.company)
    
    # Berechnetes Feld für die Gesamtfläche aller Felder
    total_field_area = fields.Float(string='Gesamtfläche Felder (ha)', 
                                  compute='_compute_total_field_area', store=True)
    
    # Bild für den Betrieb
    image = fields.Binary(string='Bild')
    
    # Koordinaten für Standort
    latitude = fields.Float(string='Breitengrad', digits=(16, 8))
    longitude = fields.Float(string='Längengrad', digits=(16, 8))
    
    # Zusätzliche Informationen
    farm_type = fields.Selection([
        ('crop', 'Ackerbau'),
        ('livestock', 'Tierhaltung'),
        ('mixed', 'Gemischt'),
        ('special', 'Sonderkulturen')
    ], string='Betriebstyp', default='crop')
    
    tax_id = fields.Char(string='Steuer-ID')
    farm_code = fields.Char(string='Betriebsnummer')
    notes = fields.Text(string='Notizen')
    
    @api.constrains('size')
    def _check_size(self):
        for record in self:
            if record.size < 0:
                raise ValidationError(_('Die Betriebsgröße darf nicht negativ sein.'))
    
    @api.depends('field_ids.area')
    def _compute_total_field_area(self):
        for farm in self:
            farm.total_field_area = sum(farm.field_ids.mapped('area'))
    
    def action_view_fields(self):
        self.ensure_one()
        return {
            'name': _('Felder'),
            'type': 'ir.actions.act_window',
            'res_model': 'farm.field',
            'view_mode': 'tree,form',
            'domain': [('farm_id', '=', self.id)],
            'context': {'default_farm_id': self.id},
        } 