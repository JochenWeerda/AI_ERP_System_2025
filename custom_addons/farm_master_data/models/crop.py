# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class Crop(models.Model):
    _name = 'farm.crop'
    _description = 'Landwirtschaftliche Kultur'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    
    name = fields.Char(string='Kulturname', required=True, tracking=True)
    code = fields.Char(string='Kulturcode')
    active = fields.Boolean(default=True)
    
    # Botanische Informationen
    scientific_name = fields.Char(string='Wissenschaftlicher Name')
    family = fields.Char(string='Pflanzenfamilie')
    variety = fields.Char(string='Sorte')
    
    # Wachstumsparameter
    days_to_harvest = fields.Integer(string='Tage bis zur Ernte')
    growing_season = fields.Selection([
        ('spring', 'Frühling'),
        ('summer', 'Sommer'),
        ('autumn', 'Herbst'),
        ('winter', 'Winter'),
        ('perennial', 'Mehrjährig')
    ], string='Wachstumsperiode')
    
    # Kulturspezifische Informationen
    crop_type = fields.Selection([
        ('cereal', 'Getreide'),
        ('legume', 'Hülsenfrüchte'),
        ('oilseed', 'Ölsaaten'),
        ('tuber', 'Knollenfrüchte'),
        ('vegetable', 'Gemüse'),
        ('fruit', 'Obst'),
        ('forage', 'Futterpflanzen'),
        ('special', 'Sonderkulturen')
    ], string='Kulturtyp', required=True)
    
    # Weizen-spezifische Felder
    is_wheat = fields.Boolean(string='Ist Weizen', compute='_compute_is_wheat', store=True)
    wheat_class = fields.Selection([
        ('a', 'A-Weizen'),
        ('b', 'B-Weizen'),
        ('c', 'C-Weizen'),
        ('e', 'Eliteweizen'),
        ('durum', 'Durumweizen'),
        ('other', 'Sonstige Weizensorte')
    ], string='Weizenklasse', compute='_compute_wheat_class', store=True)
    
    # Anbau-Informationen
    seeding_rate = fields.Float(string='Aussaatstärke (kg/ha)')
    seeding_depth = fields.Float(string='Saattiefe (cm)')
    row_spacing = fields.Float(string='Reihenabstand (cm)')
    
    # Nährstoffbedarf
    nitrogen_need = fields.Float(string='Stickstoffbedarf (kg N/ha)')
    phosphorus_need = fields.Float(string='Phosphorbedarf (kg P2O5/ha)')
    potassium_need = fields.Float(string='Kaliumbedarf (kg K2O/ha)')
    
    # Bilder und Dokumente
    image = fields.Binary(string='Bild')
    notes = fields.Text(string='Anmerkungen')
    
    # Ertragserwartung
    expected_yield_min = fields.Float(string='Min. Ertragserwartung (dt/ha)')
    expected_yield_max = fields.Float(string='Max. Ertragserwartung (dt/ha)')
    
    company_id = fields.Many2one('res.company', string='Unternehmen', 
                               required=True, default=lambda self: self.env.company)
    
    @api.depends('name', 'scientific_name')
    def _compute_is_wheat(self):
        """Berechnet, ob es sich um eine Weizensorte handelt"""
        for record in self:
            is_wheat = False
            if record.name and 'weizen' in record.name.lower():
                is_wheat = True
            elif record.scientific_name and 'triticum' in record.scientific_name.lower():
                is_wheat = True
            record.is_wheat = is_wheat
    
    @api.depends('name', 'variety', 'is_wheat')
    def _compute_wheat_class(self):
        """Ermittelt die Weizenklasse aus Name und Sorte"""
        for record in self:
            wheat_class = 'other'
            if not record.is_wheat:
                record.wheat_class = False
                continue
                
            name_lower = (record.name or '').lower()
            variety_lower = (record.variety or '').lower()
            
            # Ermittle Weizenklasse aus Name oder Sorte
            if 'durum' in name_lower or 'durum' in variety_lower or 'hartweizen' in name_lower:
                wheat_class = 'durum'
            elif 'elite' in name_lower or 'elite' in variety_lower or 'e-weizen' in name_lower or 'e-weizen' in variety_lower:
                wheat_class = 'e'
            elif 'a-weizen' in name_lower or 'a-weizen' in variety_lower or any(x in name_lower for x in [' a ', 'klasse a']):
                wheat_class = 'a'
            elif 'b-weizen' in name_lower or 'b-weizen' in variety_lower or any(x in name_lower for x in [' b ', 'klasse b']):
                wheat_class = 'b'
            elif 'c-weizen' in name_lower or 'c-weizen' in variety_lower or any(x in name_lower for x in [' c ', 'klasse c']):
                wheat_class = 'c'
                
            record.wheat_class = wheat_class
    
    @api.constrains('expected_yield_min', 'expected_yield_max')
    def _check_expected_yield(self):
        for record in self:
            if record.expected_yield_min > record.expected_yield_max:
                raise ValidationError(_('Die minimale Ertragserwartung darf nicht größer sein als die maximale.'))
    
    def name_get(self):
        result = []
        for crop in self:
            name = crop.name
            if crop.variety:
                name = f"{name} ({crop.variety})"
            result.append((crop.id, name))
        return result
    
    def get_enni_code(self):
        """Gibt den ENNI-konformen Kulturcode zurück"""
        self.ensure_one()
        
        # Standard: eigener Kulturcode oder erste zwei Buchstaben des Namens
        if self.code:
            return self.code
            
        # Für Weizen spezielle Codes verwenden
        if self.is_wheat:
            if 'winter' in self.name.lower():
                if self.wheat_class == 'a':
                    return 'WWA'
                elif self.wheat_class == 'e':
                    return 'WWE'
                else:
                    return 'WW'
            elif 'sommer' in self.name.lower():
                return 'SW'
            elif self.wheat_class == 'durum':
                return 'DW'
                
        # Fallback: Erste zwei Buchstaben des Namens
        if self.name and len(self.name) >= 2:
            return self.name[:2].upper()
            
        return '' 