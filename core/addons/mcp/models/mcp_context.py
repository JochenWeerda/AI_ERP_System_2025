# -*- coding: utf-8 -*-

import json
import logging
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError, UserError

_logger = logging.getLogger(__name__)


class MCPContext(models.Model):
    """
    Verwaltet die Extraktion und Aufbereitung von Kontextdaten für KI-Anfragen.
    Speichert Definitionen für Kontextgeneratoren und deren Zuordnung zu ERP-Modulen.
    """
    _name = 'mcp.context'
    _description = 'MCP Kontext-Generator'
    
    name = fields.Char(string='Name', required=True)
    code = fields.Char(string='Code', required=True)
    description = fields.Text(string='Beschreibung')
    
    module_id = fields.Many2one('ir.module.module', string='ERP-Modul')
    model_id = fields.Many2one('ir.model', string='Datenmodell', required=True)
    
    context_type = fields.Selection([
        ('record', 'Einzeldatensatz'),
        ('list', 'Datensatzliste'),
        ('aggregate', 'Aggregierte Daten'),
        ('custom', 'Benutzerdefiniert')
    ], string='Kontexttyp', required=True, default='record')
    
    field_ids = fields.Many2many('ir.model.fields', string='Felder', 
                               domain="[('model_id', '=', model_id)]")
    
    filter_domain = fields.Char(string='Filterdomäne', 
                              help="Optionale Domäne zum Filtern der Datensätze")
    
    max_records = fields.Integer(string='Max. Datensätze', default=10,
                               help="Maximale Anzahl von Datensätzen für Listenkontext")
    
    order_by = fields.Char(string='Sortierung', 
                         help="Feld und Richtung für die Sortierung, z.B. 'create_date desc'")
    
    summary_fields = fields.Many2many('ir.model.fields', 'mcp_context_summary_field_rel',
                                    string='Zusammenfassungsfelder',
                                    domain="[('model_id', '=', model_id)]")
    
    include_metadata = fields.Boolean(string='Metadaten einschließen', default=False,
                                    help="Modell- und Feldmetadaten in den Kontext einschließen")
    
    custom_context_generator = fields.Text(string='Benutzerdefinierter Generator',
                                         help="Python-Code für benutzerdefinierte Kontextgenerierung")
    
    is_active = fields.Boolean(string='Aktiv', default=True)
    usage_count = fields.Integer(string='Verwendungen', default=0, readonly=True)
    
    _sql_constraints = [
        ('code_uniq', 'unique(code)', 'Der Kontext-Code muss eindeutig sein!')
    ]
    
    @api.constrains('custom_context_generator')
    def _check_custom_generator(self):
        """Überprüft, ob der benutzerdefinierte Code gültig ist."""
        for context in self.filtered(lambda c: c.context_type == 'custom' and c.custom_context_generator):
            try:
                # Sehr einfache Syntax-Prüfung
                compile(context.custom_context_generator, '<string>', 'exec')
            except SyntaxError as e:
                raise ValidationError(_('Syntaxfehler im benutzerdefinierten Generator: %s') % str(e))
    
    def generate_context(self, record_id=None, domain=None, limit=None, **kwargs):
        """
        Generiert Kontextdaten basierend auf den Einstellungen.
        
        :param record_id: ID des Datensatzes für Einzeldatensatzkontext
        :param domain: Zusätzliche Domäne zum Filtern der Datensätze
        :param limit: Maximale Anzahl von Datensätzen (überschreibt max_records)
        :param kwargs: Weitere Parameter für benutzerdefinierte Generatoren
        :return: Dict mit dem generierten Kontext
        """
        self.ensure_one()
        
        # Verwendungszähler erhöhen
        self.usage_count += 1
        
        # Modell laden
        Model = self.env[self.model_id.model]
        
        # Kontext basierend auf dem Typ generieren
        if self.context_type == 'record':
            if not record_id:
                raise UserError(_('Für Einzeldatensatzkontext ist eine Record-ID erforderlich'))
            
            record = Model.browse(record_id)
            if not record.exists():
                raise UserError(_('Datensatz nicht gefunden'))
            
            return self._generate_record_context(record)
        
        elif self.context_type == 'list':
            return self._generate_list_context(Model, domain, limit)
        
        elif self.context_type == 'aggregate':
            return self._generate_aggregate_context(Model, domain)
        
        elif self.context_type == 'custom':
            return self._execute_custom_generator(Model, record_id, domain, limit, **kwargs)
        
        else:
            raise UserError(_('Unbekannter Kontexttyp'))
    
    def _generate_record_context(self, record):
        """
        Generiert Kontext für einen einzelnen Datensatz.
        
        :param record: Der Datensatz
        :return: Dict mit dem Kontext
        """
        context = {'record_type': self.model_id.model}
        
        # Alle ausgewählten Felder extrahieren
        if self.field_ids:
            fields_to_include = [field.name for field in self.field_ids]
            record_data = {}
            
            for field_name in fields_to_include:
                field_value = record[field_name]
                
                # Relationsfelder behandeln
                field_info = record._fields[field_name]
                if field_info.type == 'many2one':
                    if field_value:
                        record_data[field_name] = {
                            'id': field_value.id,
                            'name': field_value.display_name,
                        }
                    else:
                        record_data[field_name] = False
                elif field_info.type in ('one2many', 'many2many'):
                    record_data[field_name] = [{
                        'id': r.id,
                        'name': r.display_name,
                    } for r in field_value]
                else:
                    record_data[field_name] = field_value
            
            context['data'] = record_data
        else:
            # Standardfelder, wenn keine ausgewählt sind
            context['data'] = {
                'id': record.id,
                'name': record.display_name,
            }
        
        # Metadaten hinzufügen, wenn gewünscht
        if self.include_metadata:
            context['metadata'] = self._get_model_metadata(self.model_id.model)
        
        return context
    
    def _generate_list_context(self, Model, domain=None, limit=None):
        """
        Generiert Kontext für eine Liste von Datensätzen.
        
        :param Model: Das Odoo-Modell
        :param domain: Zusätzliche Domäne
        :param limit: Maximale Anzahl von Datensätzen
        :return: Dict mit dem Kontext
        """
        context = {'record_type': self.model_id.model, 'data_type': 'list'}
        
        # Domäne zusammenbauen
        full_domain = []
        if self.filter_domain:
            try:
                filter_domain = eval(self.filter_domain)
                full_domain.extend(filter_domain)
            except Exception as e:
                _logger.error(f"Fehler beim Auswerten der Filterdomäne: {str(e)}")
        
        if domain:
            full_domain.extend(domain)
        
        # Limit festlegen
        max_records = limit or self.max_records or 10
        
        # Datensätze laden
        records = Model.search(full_domain, limit=max_records, order=self.order_by or 'id')
        
        # Felder für die Ausgabe bestimmen
        if self.field_ids:
            fields_to_include = [field.name for field in self.field_ids]
        else:
            # Standardfelder, wenn keine ausgewählt sind
            fields_to_include = ['id', 'name', 'display_name']
        
        # Datensätze verarbeiten
        record_list = []
        for record in records:
            record_data = {}
            for field_name in fields_to_include:
                if field_name in record._fields:
                    field_value = record[field_name]
                    
                    # Relationsfelder behandeln
                    field_info = record._fields[field_name]
                    if field_info.type == 'many2one':
                        if field_value:
                            record_data[field_name] = {
                                'id': field_value.id,
                                'name': field_value.display_name,
                            }
                        else:
                            record_data[field_name] = False
                    elif field_info.type in ('one2many', 'many2many'):
                        # Bei Listen nur Anzahl und IDs einschließen
                        record_data[field_name] = {
                            'count': len(field_value),
                            'ids': field_value.ids[:5],  # Nur die ersten 5 IDs
                        }
                    else:
                        record_data[field_name] = field_value
            
            record_list.append(record_data)
        
        context['data'] = record_list
        context['count'] = len(record_list)
        context['total_count'] = Model.search_count(full_domain)
        
        # Metadaten hinzufügen, wenn gewünscht
        if self.include_metadata:
            context['metadata'] = self._get_model_metadata(self.model_id.model)
        
        return context
    
    def _generate_aggregate_context(self, Model, domain=None):
        """
        Generiert aggregierten Kontext für Datensätze.
        
        :param Model: Das Odoo-Modell
        :param domain: Zusätzliche Domäne
        :return: Dict mit dem Kontext
        """
        context = {'record_type': self.model_id.model, 'data_type': 'aggregate'}
        
        # Domäne zusammenbauen
        full_domain = []
        if self.filter_domain:
            try:
                filter_domain = eval(self.filter_domain)
                full_domain.extend(filter_domain)
            except Exception as e:
                _logger.error(f"Fehler beim Auswerten der Filterdomäne: {str(e)}")
        
        if domain:
            full_domain.extend(domain)
        
        # Gesamtzahl der Datensätze
        total_count = Model.search_count(full_domain)
        context['total_count'] = total_count
        
        # Zusammenfassungsfelder verarbeiten
        if self.summary_fields:
            summary_data = {}
            
            for field in self.summary_fields:
                field_name = field.name
                field_info = Model._fields.get(field_name)
                
                if not field_info:
                    continue
                
                # Je nach Feldtyp unterschiedliche Aggregationen durchführen
                if field_info.type in ('integer', 'float', 'monetary'):
                    # Für numerische Felder Summe, Durchschnitt, Min, Max berechnen
                    try:
                        records = Model.search(full_domain)
                        values = [r[field_name] for r in records if r[field_name] is not False]
                        
                        if values:
                            summary_data[field_name] = {
                                'sum': sum(values),
                                'avg': sum(values) / len(values),
                                'min': min(values),
                                'max': max(values),
                                'count': len(values)
                            }
                        else:
                            summary_data[field_name] = {
                                'sum': 0,
                                'avg': 0,
                                'min': 0,
                                'max': 0,
                                'count': 0
                            }
                    except Exception as e:
                        _logger.error(f"Fehler bei der Berechnung der Aggregationen für Feld {field_name}: {str(e)}")
                
                elif field_info.type in ('selection', 'many2one'):
                    # Für kategorische Felder Häufigkeiten berechnen
                    try:
                        records = Model.search(full_domain)
                        values = [r[field_name] for r in records]
                        
                        # Häufigkeiten zählen
                        frequencies = {}
                        for value in values:
                            if field_info.type == 'many2one':
                                if value:
                                    key = value.id
                                    name = value.display_name
                                else:
                                    key = False
                                    name = 'Leer'
                            else:
                                key = value
                                name = dict(field_info.selection).get(value, 'Leer')
                            
                            if key not in frequencies:
                                frequencies[key] = {
                                    'count': 1,
                                    'name': name,
                                    'percentage': 0  # Wird später berechnet
                                }
                            else:
                                frequencies[key]['count'] += 1
                        
                        # Prozentsätze berechnen
                        total = len(values)
                        if total > 0:
                            for key in frequencies:
                                frequencies[key]['percentage'] = (frequencies[key]['count'] / total) * 100
                        
                        summary_data[field_name] = {
                            'frequencies': frequencies,
                            'total': total
                        }
                    except Exception as e:
                        _logger.error(f"Fehler bei der Berechnung der Häufigkeiten für Feld {field_name}: {str(e)}")
                
                elif field_info.type == 'date' or field_info.type == 'datetime':
                    # Für Datumsfelder Min, Max, Verteilung berechnen
                    try:
                        # Hier könnten Datum/Zeit-spezifische Aggregationen implementiert werden
                        records = Model.search(full_domain)
                        date_values = [r[field_name] for r in records if r[field_name]]
                        
                        if date_values:
                            summary_data[field_name] = {
                                'min': min(date_values),
                                'max': max(date_values),
                                'count': len(date_values)
                            }
                        else:
                            summary_data[field_name] = {
                                'min': False,
                                'max': False,
                                'count': 0
                            }
                    except Exception as e:
                        _logger.error(f"Fehler bei der Berechnung der Datums-Aggregationen für Feld {field_name}: {str(e)}")
            
            context['summary'] = summary_data
        
        return context
    
    def _execute_custom_generator(self, Model, record_id=None, domain=None, limit=None, **kwargs):
        """
        Führt einen benutzerdefinierten Kontextgenerator aus.
        
        :param Model: Das Odoo-Modell
        :param record_id: ID des Datensatzes für Einzeldatensatzkontext
        :param domain: Zusätzliche Domäne zum Filtern der Datensätze
        :param limit: Maximale Anzahl von Datensätzen
        :param kwargs: Weitere Parameter für den Generator
        :return: Dict mit dem Kontext
        """
        if not self.custom_context_generator:
            raise UserError(_('Kein benutzerdefinierter Generator definiert'))
        
        # Sandbox-Umgebung vorbereiten
        local_vars = {
            'env': self.env,
            'Model': Model,
            'self': self,
            'record_id': record_id,
            'domain': domain,
            'limit': limit,
            'kwargs': kwargs,
            'result': {'record_type': self.model_id.model, 'data_type': 'custom'}
        }
        
        try:
            # Code ausführen
            exec(self.custom_context_generator, {}, local_vars)
            
            # Ergebnis zurückgeben
            return local_vars.get('result', {})
        except Exception as e:
            _logger.error(f"Fehler bei der Ausführung des benutzerdefinierten Generators: {str(e)}")
            raise UserError(_('Fehler bei der Ausführung des benutzerdefinierten Generators: %s') % str(e))
    
    def _get_model_metadata(self, model_name):
        """
        Sammelt Metadaten für ein Modell.
        
        :param model_name: Name des Modells
        :return: Dict mit Modellmetadaten
        """
        Model = self.env[model_name]
        model_info = self.env['ir.model'].search([('model', '=', model_name)], limit=1)
        
        metadata = {
            'name': model_info.name,
            'model': model_name,
            'description': model_info.description or '',
            'fields': {}
        }
        
        # Felder und ihre Eigenschaften sammeln
        for field_name, field_info in Model._fields.items():
            field_metadata = {
                'type': field_info.type,
                'string': field_info.string,
                'required': field_info.required,
                'readonly': field_info.readonly,
                'help': field_info.help or '',
            }
            
            # Zusätzliche Eigenschaften je nach Feldtyp
            if field_info.type == 'selection':
                field_metadata['selection'] = dict(field_info.selection)
            elif field_info.type in ('many2one', 'one2many', 'many2many'):
                field_metadata['relation'] = field_info.comodel_name
            
            metadata['fields'][field_name] = field_metadata
        
        return metadata


class MCPContextField(models.Model):
    """
    Definiert spezifische Feldanpassungen für Kontextgeneratoren.
    """
    _name = 'mcp.context.field'
    _description = 'MCP Kontextfeld'
    
    context_id = fields.Many2one('mcp.context', string='Kontext', required=True, ondelete='cascade')
    field_id = fields.Many2one('ir.model.fields', string='Feld', required=True,
                             domain="[('model_id', '=', parent.model_id)]")
    
    include_in_context = fields.Boolean(string='In Kontext einschließen', default=True)
    max_depth = fields.Integer(string='Max. Tiefe', default=1,
                             help="Maximale Tiefe für Relationsfelder (0 = keine Relation)")
    
    transform_function = fields.Text(string='Transformationsfunktion',
                                   help="Python-Code für die Transformation des Feldwerts")
    
    anonymize = fields.Boolean(string='Anonymisieren', default=False,
                             help="Sensible Daten anonymisieren")
    
    @api.constrains('transform_function')
    def _check_transform_function(self):
        """Überprüft, ob die Transformationsfunktion gültig ist."""
        for field in self.filtered('transform_function'):
            try:
                # Sehr einfache Syntax-Prüfung
                compile(field.transform_function, '<string>', 'exec')
            except SyntaxError as e:
                raise ValidationError(_('Syntaxfehler in der Transformationsfunktion: %s') % str(e)) 