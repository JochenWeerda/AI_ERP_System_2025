# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class Field(models.Model):
    _name = 'farm.field'
    _description = 'Landwirtschaftliches Feld'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    
    name = fields.Char(string='Feldname/Nummer', required=True, tracking=True)
    farm_id = fields.Many2one('farm.farm', string='Betrieb', required=True, tracking=True, 
                             ondelete='cascade')
    area = fields.Float(string='Fläche (ha)', tracking=True)
    
    # Bodentyp als Auswahlliste
    soil_type = fields.Selection([
        ('sand', 'Sand'),
        ('loamy_sand', 'Lehmiger Sand'),
        ('sandy_loam', 'Sandiger Lehm'),
        ('loam', 'Lehm'),
        ('silt_loam', 'Schluffiger Lehm'),
        ('silt', 'Schluff'),
        ('clay_loam', 'Toniger Lehm'),
        ('clay', 'Ton'),
        ('organic', 'Organischer Boden')
    ], string='Bodentyp', tracking=True)
    
    # Standort und GIS-Informationen
    location = fields.Char(string='Lage/Ort', tracking=True)
    coordinates = fields.Text(string='Koordinaten (GeoJSON)')
    
    # Status und aktive Nutzung
    active = fields.Boolean(default=True)
    state = fields.Selection([
        ('fallow', 'Brache'),
        ('cultivated', 'Bewirtschaftet'),
        ('rented', 'Verpachtet'),
        ('conservation', 'Naturschutz')
    ], string='Status', default='cultivated', tracking=True)
    
    # Zusätzliche Informationen
    field_code = fields.Char(string='Feldcode/FLIK')
    slope = fields.Float(string='Hangneigung (%)')
    altitude = fields.Float(string='Höhe über NN (m)')
    notes = fields.Text(string='Notizen')
    
    # Verknüpfung zur aktuellen Kultur
    current_crop_id = fields.Many2one('farm.crop', string='Aktuelle Kultur')
    
    # Bewässerungsstatus
    irrigation = fields.Boolean(string='Bewässerung vorhanden', default=False)
    irrigation_type = fields.Selection([
        ('sprinkler', 'Beregnung'),
        ('drip', 'Tropfbewässerung'),
        ('pivot', 'Kreisberegnung'),
        ('flood', 'Flutbewässerung')
    ], string='Bewässerungstyp')
    
    # Gesellschaft, der das Feld zugeordnet ist
    company_id = fields.Many2one('res.company', string='Unternehmen', 
                                related='farm_id.company_id', store=True, readonly=True)
    
    @api.constrains('area')
    def _check_area(self):
        for record in self:
            if record.area <= 0:
                raise ValidationError(_('Die Feldfläche muss größer als 0 sein.'))
    
    @api.onchange('irrigation')
    def _onchange_irrigation(self):
        if not self.irrigation:
            self.irrigation_type = False 