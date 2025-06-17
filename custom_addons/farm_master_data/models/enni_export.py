# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError
import xml.etree.ElementTree as ET
from datetime import datetime
import base64

class EnniExport(models.TransientModel):
    _name = 'farm.enni.export'
    _description = 'ENNI Datenexport'
    
    farm_id = fields.Many2one('farm.farm', string='Betrieb', required=True)
    year = fields.Integer(string='Düngejahr', required=True, default=lambda self: datetime.now().year)
    dbe_included = fields.Boolean(string='Düngebedarfsermittlung', default=True, 
                               help='Daten zur Düngebedarfsermittlung einbeziehen')
    ddd_included = fields.Boolean(string='Dokumentation der Düngung', default=True,
                              help='Daten zur Düngungsdokumentation einbeziehen')
    n170_included = fields.Boolean(string='N-Obergrenzenberechnung', default=True,
                              help='Daten zur N-Obergrenzenberechnung einbeziehen')
    result_file = fields.Binary(string='Export-Datei', readonly=True)
    file_name = fields.Char(string='Dateiname', readonly=True)
    state = fields.Selection([
        ('draft', 'Entwurf'),
        ('done', 'Abgeschlossen')
    ], default='draft')
    
    @api.model
    def default_get(self, fields_list):
        res = super(EnniExport, self).default_get(fields_list)
        active_id = self.env.context.get('active_id')
        if active_id:
            res['farm_id'] = active_id
        return res
    
    def generate_xml(self):
        """Generiert eine XML-Datei im ENNI-Format"""
        self.ensure_one()
        
        if not self.farm_id.farm_code:
            raise UserError(_('Für den Export wird eine gültige Betriebsnummer benötigt.'))
        
        # Root-Element erstellen
        root = ET.Element('enni')
        
        # Betriebsdetails
        betrieb = ET.SubElement(root, 'betrieb')
        
        # Betriebsnummer
        ET.SubElement(betrieb, 'betriebsnummer').text = self.farm_id.farm_code
        
        # Betriebsstätte
        betriebsstaette = ET.SubElement(betrieb, 'betriebsstaette')
        ET.SubElement(betriebsstaette, 'name').text = self.farm_id.name
        
        # Adresse aus Partner
        if self.farm_id.partner_id:
            adresse = ET.SubElement(betriebsstaette, 'adresse')
            ET.SubElement(adresse, 'firma').text = self.farm_id.partner_id.name
            ET.SubElement(adresse, 'strasse').text = self.farm_id.partner_id.street or ''
            ET.SubElement(adresse, 'plz').text = self.farm_id.partner_id.zip or ''
            ET.SubElement(adresse, 'ort').text = self.farm_id.partner_id.city or ''
        
        # Düngebedarfsermittlung
        if self.dbe_included:
            duengebedarf = ET.SubElement(root, 'duengebedarf')
            ET.SubElement(duengebedarf, 'bezugsjahr').text = str(self.year)
            ET.SubElement(duengebedarf, 'duengejahrbeginn').text = 'JANUAR'  # Standardwert
            
            # Felder exportieren
            for field in self.farm_id.field_ids:
                schlag = ET.SubElement(duengebedarf, 'schlag')
                ET.SubElement(schlag, 'name').text = field.name
                ET.SubElement(schlag, 'flaeche').text = str(field.area)
                ET.SubElement(schlag, 'flik').text = field.field_code or ''
                
                # Bodentyp
                if field.soil_type:
                    bodenart = ET.SubElement(schlag, 'bodenart')
                    ET.SubElement(bodenart, 'bodenartgruppe').text = self._map_soil_type(field.soil_type)
                
                # Wenn ein aktueller Anbau existiert
                if field.current_crop_id:
                    anbau = ET.SubElement(schlag, 'anbau')
                    
                    # Verwende die erweiterte Funktionalität des Crop-Modells für ENNI-konforme Codes
                    ET.SubElement(anbau, 'kulturart').text = field.current_crop_id.name
                    ET.SubElement(anbau, 'kulturcode').text = field.current_crop_id.get_enni_code()
                    
                    ET.SubElement(anbau, 'ertragserwartung').text = str(field.current_crop_id.expected_yield_max)
                    
                    # Nährstoffbedarf
                    if field.current_crop_id.nitrogen_need > 0:
                        naehrstoffbedarf = ET.SubElement(anbau, 'naehrstoffbedarf')
                        ET.SubElement(naehrstoffbedarf, 'stickstoff').text = str(field.current_crop_id.nitrogen_need)
                        ET.SubElement(naehrstoffbedarf, 'phosphat').text = str(field.current_crop_id.phosphorus_need)
                        ET.SubElement(naehrstoffbedarf, 'kalium').text = str(field.current_crop_id.potassium_need)
        
        # Düngedokumentation
        if self.ddd_included:
            duengedokumentation = ET.SubElement(root, 'duengedokumentation')
            ET.SubElement(duengedokumentation, 'bezugsjahr').text = str(self.year)
            
            # Platzhalter für Düngedokumentation
            # In einer echten Implementierung würden hier die tatsächlichen Düngemaßnahmen exportiert
            hinweis = ET.SubElement(duengedokumentation, 'hinweis')
            ET.SubElement(hinweis, 'text').text = "Düngemaßnahmen müssen manuell in ENNI ergänzt werden."
        
        # N-Obergrenzenberechnung
        if self.n170_included:
            n_obergrenze = ET.SubElement(root, 'n_obergrenze')
            ET.SubElement(n_obergrenze, 'bezugsjahr').text = str(self.year)
            
            # Platzhalter für N-Obergrenze
            hinweis = ET.SubElement(n_obergrenze, 'hinweis')
            ET.SubElement(hinweis, 'text').text = "N-Obergrenzen müssen manuell in ENNI ergänzt werden."
        
        # XML-Datei generieren
        xml_string = ET.tostring(root, encoding='utf-8', method='xml')
        xml_declaration = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        complete_xml = xml_declaration + xml_string.decode('utf-8')
        
        # Datei speichern
        self.result_file = base64.b64encode(complete_xml.encode('utf-8'))
        self.file_name = f'ENNI_Export_{self.farm_id.name}_{self.year}.xml'
        self.state = 'done'
        
        return {
            'name': _('ENNI Export'),
            'type': 'ir.actions.act_window',
            'res_model': 'farm.enni.export',
            'view_mode': 'form',
            'res_id': self.id,
            'target': 'new',
        }
    
    def _map_soil_type(self, soil_type):
        """Konvertiert den Bodentyp ins ENNI-Format"""
        mapping = {
            'sand': 'S',
            'loamy_sand': 'Sl',
            'sandy_loam': 'lS',
            'loam': 'L',
            'silt_loam': 'LT',
            'silt': 'U',
            'clay_loam': 'LT',
            'clay': 'T',
            'organic': 'Mo',
        }
        return mapping.get(soil_type, 'L') 