# -*- coding: utf-8 -*-
# Part of VALEO NeuroERP. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, _
from odoo.exceptions import UserError

import base64
import json
import logging

_logger = logging.getLogger(__name__)

class StammdatenImportWizard(models.TransientModel):
    _name = "mcp.stammdaten.import.wizard"
    _description = "Stammdaten-Import-Assistent"

    import_type = fields.Selection([
        ('artikel', 'Artikel-Stammdaten'),
        ('einheiten', 'Einheiten'),
        ('artikelgruppen', 'Artikelgruppen'),
        ('lieferanten', 'Lieferanten'),
        ('preislisten', 'Preislisten')
    ], string='Importtyp', required=True, default='artikel')
    
    processor_id = fields.Many2one('mcp.migration.processor', string='Prozessor', 
        required=True, domain=[('active', '=', True)])
    
    import_file = fields.Binary('Importdatei', required=True, 
        help="CSV- oder Excel-Datei mit den zu importierenden Stammdaten")
    import_filename = fields.Char('Dateiname')
    
    import_result = fields.Text('Importergebnis', readonly=True)
    records_created = fields.Integer('Datensätze erstellt', readonly=True)
    records_updated = fields.Integer('Datensätze aktualisiert', readonly=True)
    records_skipped = fields.Integer('Datensätze übersprungen', readonly=True)
    records_failed = fields.Integer('Datensätze fehlgeschlagen', readonly=True)
    
    @api.onchange('import_type')
    def _onchange_import_type(self):
        """Passenden Prozessor basierend auf dem Importtyp vorauswählen"""
        if self.import_type:
            # Prozessor suchen, der für diesen Importtyp geeignet ist
            processor = self.env['mcp.migration.processor'].search([
                ('code', '=', 'l3_stammdaten_import'),
                ('active', '=', True)
            ], limit=1)
            
            if processor:
                self.processor_id = processor.id
    
    def action_import(self):
        """Führt den Import mit dem ausgewählten Prozessor durch"""
        self.ensure_one()
        
        if not self.import_file:
            raise UserError(_("Bitte wählen Sie eine Importdatei aus."))
        
        if not self.processor_id:
            raise UserError(_("Bitte wählen Sie einen Prozessor aus."))
        
        # Zusätzliche Parameter für den Import
        params = {
            'user_id': self.env.user.id,
            'company_id': self.env.company.id,
        }
        
        # Import durchführen
        try:
            result = self.processor_id.process_import_file(
                import_file=self.import_file,
                file_type=self.import_type,
                params=params
            )
            
            # Ergebnis verarbeiten
            if isinstance(result, dict):
                if 'error' in result:
                    raise UserError(result['error'])
                
                # Ergebnis in JSON formatieren für die Anzeige
                self.import_result = json.dumps(result, indent=2)
                
                # Statistiken extrahieren
                self.records_created = result.get('created', 0)
                self.records_updated = result.get('updated', 0)
                self.records_skipped = result.get('skipped', 0)
                self.records_failed = result.get('errors', 0)
                
                return {
                    'type': 'ir.actions.act_window',
                    'res_model': self._name,
                    'view_mode': 'form',
                    'res_id': self.id,
                    'views': [(False, 'form')],
                    'target': 'new',
                }
            else:
                raise UserError(_("Der Prozessor hat ein ungültiges Ergebnis zurückgegeben."))
        except Exception as e:
            _logger.exception("Fehler beim Import")
            raise UserError(_("Fehler beim Import: %s") % str(e)) 