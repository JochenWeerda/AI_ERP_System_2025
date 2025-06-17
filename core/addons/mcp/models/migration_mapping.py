# -*- coding: utf-8 -*-
# Part of VALEO NeuroERP. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, tools, _
from odoo.exceptions import UserError, ValidationError

import json
import logging

_logger = logging.getLogger(__name__)

class MigrationMapping(models.Model):
    _name = "mcp.migration.mapping"
    _description = "Stammdaten-Migrations-Mapping"
    _order = "name"

    name = fields.Char('Name', required=True, index=True)
    source_type = fields.Char('Quelltyp', required=True, 
        help="Typ der Quelldaten, z.B. 'artikel-stammdaten', 'einheiten-service'")
    target_model = fields.Char('Zielmodell', required=True,
        help="Odoo-Modellname, in das die Daten importiert werden sollen")
    active = fields.Boolean('Aktiv', default=True)
    field_mappings = fields.Text('Feld-Mappings', required=True,
        help="JSON-Dictionary mit Quellfeld zu Zielfeld-Mappings. Für Konvertierungsfunktionen '_convert_xxx' verwenden.")
    conversion_functions = fields.Text('Konvertierungsfunktionen',
        help="Python-Code mit Funktionen zur Datenkonvertierung. Funktionen müssen mit '_convert_' beginnen.")
    
    @api.constrains('field_mappings')
    def _check_field_mappings_json(self):
        """Überprüft, ob field_mappings gültiges JSON ist"""
        for mapping in self:
            try:
                if mapping.field_mappings:
                    json.loads(mapping.field_mappings)
            except json.JSONDecodeError:
                raise ValidationError(_("Das Feld-Mapping muss ein gültiges JSON-Dictionary sein."))

    @api.constrains('target_model')
    def _check_target_model(self):
        """Überprüft, ob das Zielmodell existiert"""
        for mapping in self:
            if mapping.target_model and not self.env.get(mapping.target_model):
                raise ValidationError(_("Das Zielmodell %s existiert nicht.") % mapping.target_model)


class MigrationProcessor(models.Model):
    _name = "mcp.migration.processor"
    _description = "Stammdaten-Migrations-Prozessor"
    _order = "name"

    name = fields.Char('Name', required=True, index=True)
    code = fields.Char('Code', required=True, index=True)
    description = fields.Text('Beschreibung')
    processor_type = fields.Selection([
        ('python', 'Python-Code'),
        ('xml_rpc', 'XML-RPC'),
        ('rest', 'REST-API')
    ], string='Prozessor-Typ', default='python', required=True)
    active = fields.Boolean('Aktiv', default=True)
    python_code = fields.Text('Python-Code', 
        help="Python-Code zur Datenverarbeitung. Die Hauptfunktion muss 'process_import' heißen.")
    api_endpoint = fields.Char('API-Endpunkt', 
        help="Endpunkt für XML-RPC oder REST-API-Zugriff")
    
    def process_import_file(self, import_file, file_type, params=None):
        """
        Verarbeitet eine Importdatei mit dem konfigurierten Prozessor
        
        Args:
            import_file: Binäre Datei mit den zu importierenden Daten
            file_type: Typ der Importdatei (z.B. 'artikel', 'einheiten')
            params: Zusätzliche Parameter für den Import
            
        Returns:
            dict: Ergebnis des Imports
        """
        self.ensure_one()
        
        if not self.active:
            return {'error': 'Der Prozessor ist nicht aktiv.'}
        
        if self.processor_type == 'python':
            if not self.python_code:
                return {'error': 'Kein Python-Code für den Prozessor definiert.'}
            
            try:
                # Lokalen Namespace für die Ausführung erstellen
                locals_dict = {}
                
                # Code ausführen und process_import-Funktion extrahieren
                exec(self.python_code, globals(), locals_dict)
                
                if 'process_import' not in locals_dict:
                    return {'error': 'Die Funktion process_import wurde im Code nicht gefunden.'}
                
                # Funktion aufrufen
                return locals_dict['process_import'](self, import_file, file_type, params)
            except Exception as e:
                _logger.exception('Fehler bei der Ausführung des Python-Codes')
                return {'error': f'Fehler bei der Ausführung des Python-Codes: {str(e)}'}
        elif self.processor_type in ['xml_rpc', 'rest']:
            return {'error': f'Prozessor-Typ {self.processor_type} wird derzeit nicht unterstützt.'}
        else:
            return {'error': 'Ungültiger Prozessor-Typ.'} 