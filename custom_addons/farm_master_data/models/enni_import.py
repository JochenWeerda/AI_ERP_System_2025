# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError
import xml.etree.ElementTree as ET
from datetime import datetime
import base64
import logging

_logger = logging.getLogger(__name__)

class EnniImport(models.TransientModel):
    _name = 'farm.enni.import'
    _description = 'ENNI Datenimport'
    
    farm_id = fields.Many2one('farm.farm', string='Ziel-Betrieb', required=True)
    import_file = fields.Binary(string='XML-Importdatei', required=True)
    file_name = fields.Char(string='Dateiname')
    year = fields.Integer(string='Düngejahr', required=True, default=lambda self: datetime.now().year)
    import_log = fields.Text(string='Import-Log', readonly=True)
    state = fields.Selection([
        ('draft', 'Entwurf'),
        ('done', 'Abgeschlossen')
    ], default='draft')
    
    @api.model
    def default_get(self, fields_list):
        res = super(EnniImport, self).default_get(fields_list)
        active_id = self.env.context.get('active_id')
        if active_id:
            res['farm_id'] = active_id
        return res
    
    def import_xml(self):
        """Importiert Daten aus einer ENNI-XML-Datei"""
        self.ensure_one()
        
        if not self.import_file:
            raise UserError(_('Bitte wählen Sie eine XML-Datei zum Import aus.'))
        
        log_messages = []
        try:
            xml_content = base64.b64decode(self.import_file).decode('utf-8')
            root = ET.fromstring(xml_content)
            
            # Betriebsdaten importieren
            self._import_farm_data(root, log_messages)
            
            # Schlagdaten (Felder) importieren
            fields_imported = self._import_field_data(root, log_messages)
            
            # Anbaudaten importieren
            crops_imported = self._import_crop_data(root, log_messages)
            
            log_messages.append(f"Import abgeschlossen: {fields_imported} Felder und {crops_imported} Kulturen importiert.")
            
        except Exception as e:
            log_messages.append(f"Fehler beim Import: {str(e)}")
            _logger.error("ENNI Import error", exc_info=True)
        
        self.import_log = "\n".join(log_messages)
        self.state = 'done'
        
        return {
            'name': _('ENNI Import'),
            'type': 'ir.actions.act_window',
            'res_model': 'farm.enni.import',
            'view_mode': 'form',
            'res_id': self.id,
            'target': 'new',
        }
    
    def _import_farm_data(self, root, log_messages):
        """Importiert Betriebsdaten aus der XML"""
        betrieb_elem = root.find('./betrieb')
        if betrieb_elem is None:
            log_messages.append("Keine Betriebsdaten in der XML gefunden.")
            return
        
        # Betriebsnummer
        betriebsnummer = betrieb_elem.findtext('./betriebsnummer')
        if betriebsnummer:
            self.farm_id.farm_code = betriebsnummer
            log_messages.append(f"Betriebsnummer aktualisiert: {betriebsnummer}")
        
        # Betriebsname
        betriebsstaette = betrieb_elem.find('./betriebsstaette')
        if betriebsstaette:
            name = betriebsstaette.findtext('./name')
            if name and not self.farm_id.name:
                self.farm_id.name = name
                log_messages.append(f"Betriebsname aktualisiert: {name}")
    
    def _import_field_data(self, root, log_messages):
        """Importiert Felddaten aus der XML"""
        duengebedarf = root.find('./duengebedarf')
        if duengebedarf is None:
            log_messages.append("Keine Düngebedarfsdaten in der XML gefunden.")
            return 0
        
        fields_imported = 0
        for schlag in duengebedarf.findall('./schlag'):
            name = schlag.findtext('./name')
            if not name:
                continue
                
            # Suche nach existierendem Feld oder erstelle ein neues
            field = self.env['farm.field'].search([
                ('name', '=', name),
                ('farm_id', '=', self.farm_id.id)
            ], limit=1)
            
            if not field:
                field_values = {
                    'name': name,
                    'farm_id': self.farm_id.id,
                }
                field = self.env['farm.field'].create(field_values)
                log_messages.append(f"Neues Feld erstellt: {name}")
            else:
                log_messages.append(f"Bestehendes Feld aktualisiert: {name}")
            
            # Fläche
            flaeche = schlag.findtext('./flaeche')
            if flaeche:
                try:
                    field.area = float(flaeche)
                except ValueError:
                    log_messages.append(f"Ungültiger Flächenwert für Feld {name}: {flaeche}")
            
            # FLIK
            flik = schlag.findtext('./flik')
            if flik:
                field.field_code = flik
            
            # Bodenart
            bodenart = schlag.find('./bodenart')
            if bodenart:
                bodenartgruppe = bodenart.findtext('./bodenartgruppe')
                if bodenartgruppe:
                    field.soil_type = self._map_soil_type_reverse(bodenartgruppe)
            
            fields_imported += 1
        
        return fields_imported
    
    def _import_crop_data(self, root, log_messages):
        """Importiert Kulturdaten aus der XML"""
        duengebedarf = root.find('./duengebedarf')
        if duengebedarf is None:
            return 0
        
        crops_imported = 0
        for schlag in duengebedarf.findall('./schlag'):
            field_name = schlag.findtext('./name')
            if not field_name:
                continue
                
            field = self.env['farm.field'].search([
                ('name', '=', field_name),
                ('farm_id', '=', self.farm_id.id)
            ], limit=1)
            
            if not field:
                continue
                
            # Kultur (Anbau)
            anbau = schlag.find('./anbau')
            if anbau:
                kulturart = anbau.findtext('./kulturart')
                kulturcode = anbau.findtext('./kulturcode')
                
                if kulturart:
                    # Suche nach existierender Kultur oder erstelle eine neue
                    crop = self.env['farm.crop'].search([
                        '|',
                        ('name', '=', kulturart),
                        ('code', '=', kulturcode)
                    ], limit=1) if kulturcode else self.env['farm.crop'].search([
                        ('name', '=', kulturart)
                    ], limit=1)
                    
                    if not crop:
                        crop_values = {
                            'name': kulturart,
                            'code': kulturcode or '',
                            'crop_type': 'cereal',  # Standardwert
                        }
                        
                        # Ertragserwartung
                        ertragserwartung = anbau.findtext('./ertragserwartung')
                        if ertragserwartung:
                            try:
                                crop_values['expected_yield_max'] = float(ertragserwartung)
                                crop_values['expected_yield_min'] = float(ertragserwartung) * 0.8  # 80% des Maximalwerts
                            except ValueError:
                                pass
                        
                        # Nährstoffbedarf
                        naehrstoffbedarf = anbau.find('./naehrstoffbedarf')
                        if naehrstoffbedarf:
                            stickstoff = naehrstoffbedarf.findtext('./stickstoff')
                            if stickstoff:
                                try:
                                    crop_values['nitrogen_need'] = float(stickstoff)
                                except ValueError:
                                    pass
                                    
                            phosphat = naehrstoffbedarf.findtext('./phosphat')
                            if phosphat:
                                try:
                                    crop_values['phosphorus_need'] = float(phosphat)
                                except ValueError:
                                    pass
                                    
                            kalium = naehrstoffbedarf.findtext('./kalium')
                            if kalium:
                                try:
                                    crop_values['potassium_need'] = float(kalium)
                                except ValueError:
                                    pass
                        
                        crop = self.env['farm.crop'].create(crop_values)
                        log_messages.append(f"Neue Kultur erstellt: {kulturart}")
                    
                    # Aktualisiere die Kultur des Feldes
                    field.current_crop_id = crop.id
                    crops_imported += 1
        
        return crops_imported
    
    def _map_soil_type_reverse(self, enni_soil_type):
        """Konvertiert den Bodentyp aus dem ENNI-Format zurück"""
        mapping = {
            'S': 'sand',
            'Sl': 'loamy_sand',
            'lS': 'sandy_loam',
            'L': 'loam',
            'LT': 'clay_loam',
            'U': 'silt',
            'T': 'clay',
            'Mo': 'organic',
        }
        return mapping.get(enni_soil_type, 'loam') 