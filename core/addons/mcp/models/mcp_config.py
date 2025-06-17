# -*- coding: utf-8 -*-

import json
import logging
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)


class MCPConfiguration(models.Model):
    """
    Globale Konfigurationseinstellungen für das MCP-Modul.
    Speichert Systemweite Einstellungen für die KI-Integration.
    """
    _name = 'mcp.config'
    _description = 'MCP Konfiguration'
    _rec_name = 'key'

    key = fields.Char(string='Schlüssel', required=True, index=True)
    value = fields.Text(string='Wert')
    value_type = fields.Selection([
        ('str', 'Text'),
        ('int', 'Ganzzahl'),
        ('float', 'Dezimalzahl'),
        ('bool', 'Ja/Nein'),
        ('json', 'JSON')
    ], string='Werttyp', required=True, default='str')
    description = fields.Text(string='Beschreibung')
    
    _sql_constraints = [
        ('key_uniq', 'unique(key)', 'Der Konfigurationsschlüssel muss eindeutig sein!')
    ]
    
    @api.model
    def get_param(self, key, default=None):
        """
        Liest einen Konfigurationsparameter.
        Konvertiert den Wert automatisch basierend auf dem Werttyp.
        
        :param key: Der Konfigurationsschlüssel
        :param default: Standardwert, falls der Schlüssel nicht gefunden wird
        :return: Der konvertierte Wert oder der Standardwert
        """
        param = self.search([('key', '=', key)], limit=1)
        if not param:
            return default
        
        return self._convert_value(param.value, param.value_type)
    
    @api.model
    def set_param(self, key, value, description=None):
        """
        Setzt einen Konfigurationsparameter.
        Erstellt einen neuen Parameter, falls er nicht existiert.
        
        :param key: Der Konfigurationsschlüssel
        :param value: Der zu speichernde Wert
        :param description: Optionale Beschreibung
        :return: True bei Erfolg
        """
        param = self.search([('key', '=', key)], limit=1)
        
        # Werttyp bestimmen
        value_type = self._determine_value_type(value)
        
        # Wert in String konvertieren
        str_value = self._value_to_string(value)
        
        if param:
            # Vorhandenen Parameter aktualisieren
            vals = {'value': str_value, 'value_type': value_type}
            if description is not None:
                vals['description'] = description
            param.write(vals)
        else:
            # Neuen Parameter erstellen
            self.create({
                'key': key,
                'value': str_value,
                'value_type': value_type,
                'description': description or '',
            })
        
        return True
    
    def _convert_value(self, value, value_type):
        """
        Konvertiert einen String-Wert in den entsprechenden Python-Typ.
        
        :param value: Der zu konvertierende String-Wert
        :param value_type: Der Zieltyp ('str', 'int', 'float', 'bool', 'json')
        :return: Der konvertierte Wert
        """
        if not value:
            return False if value_type == 'bool' else None
        
        try:
            if value_type == 'str':
                return value
            elif value_type == 'int':
                return int(value)
            elif value_type == 'float':
                return float(value)
            elif value_type == 'bool':
                return value.lower() in ('true', 't', 'yes', 'y', '1')
            elif value_type == 'json':
                return json.loads(value)
            else:
                return value
        except Exception as e:
            _logger.error(f"Fehler bei der Konvertierung des Konfigurationswerts: {str(e)}")
            return None
    
    def _determine_value_type(self, value):
        """
        Bestimmt den Werttyp für einen gegebenen Python-Wert.
        
        :param value: Der zu analysierende Wert
        :return: Der Werttyp als String ('str', 'int', 'float', 'bool', 'json')
        """
        if isinstance(value, bool):
            return 'bool'
        elif isinstance(value, int):
            return 'int'
        elif isinstance(value, float):
            return 'float'
        elif isinstance(value, (dict, list)):
            return 'json'
        else:
            return 'str'
    
    def _value_to_string(self, value):
        """
        Konvertiert einen Python-Wert in einen String zur Speicherung.
        
        :param value: Der zu konvertierende Wert
        :return: Die String-Repräsentation des Werts
        """
        if value is None:
            return ''
        elif isinstance(value, bool):
            return str(value).lower()
        elif isinstance(value, (dict, list)):
            return json.dumps(value)
        else:
            return str(value)


class MCPUserPreferences(models.Model):
    """
    Benutzerspezifische Einstellungen für die KI-Integration.
    Speichert Präferenzen auf Benutzerebene.
    """
    _name = 'mcp.user.preferences'
    _description = 'MCP Benutzereinstellungen'
    
    user_id = fields.Many2one('res.users', string='Benutzer', required=True, ondelete='cascade')
    provider_id = fields.Many2one('mcp.provider', string='Bevorzugter KI-Provider')
    model_id = fields.Many2one('mcp.provider.model', string='Bevorzugtes KI-Modell',
                              domain="[('provider_id', '=', provider_id)]")
    
    # Allgemeine Einstellungen
    enable_ai_suggestions = fields.Boolean(string='KI-Vorschläge aktivieren', default=True)
    max_tokens_per_request = fields.Integer(string='Max. Tokens pro Anfrage', default=2000)
    
    # Datenschutzeinstellungen
    anonymize_sensitive_data = fields.Boolean(string='Sensible Daten anonymisieren', default=True)
    log_ai_interactions = fields.Boolean(string='KI-Interaktionen protokollieren', default=True)
    
    _sql_constraints = [
        ('user_uniq', 'unique(user_id)', 'Ein Benutzer kann nur eine Präferenz haben!')
    ]
    
    @api.model
    def get_current_user_preferences(self):
        """
        Gibt die Präferenzen des aktuellen Benutzers zurück.
        Erstellt einen Datensatz, falls keiner existiert.
        
        :return: mcp.user.preferences Recordset
        """
        prefs = self.search([('user_id', '=', self.env.user.id)], limit=1)
        if not prefs:
            # Standardwerte für neuen Benutzer erstellen
            default_provider = self.env['mcp.provider'].search([('is_active', '=', True)], limit=1)
            default_model = default_provider.default_model_id if default_provider else False
            
            prefs = self.create({
                'user_id': self.env.user.id,
                'provider_id': default_provider.id if default_provider else False,
                'model_id': default_model.id if default_model else False,
            })
        
        return prefs
    
    @api.onchange('provider_id')
    def _onchange_provider_id(self):
        """Setzt das bevorzugte Modell zurück, wenn sich der Provider ändert."""
        self.model_id = False


class MCPConfigSettings(models.TransientModel):
    """
    Einstellungen-Wizard für die Konfiguration des MCP-Moduls.
    Bietet eine benutzerfreundliche Oberfläche für die Systemkonfiguration.
    """
    _name = 'mcp.config.settings'
    _description = 'MCP Einstellungen'
    _inherit = 'res.config.settings'
    
    # Allgemeine Einstellungen
    default_provider_id = fields.Many2one('mcp.provider', string='Standard KI-Provider',
                                         config_parameter='mcp.default_provider_id')
    
    enable_ai_features = fields.Boolean(string='KI-Funktionen aktivieren', default=True,
                                       config_parameter='mcp.enable_ai_features')
    
    # API-Ratenbegrenzung
    api_rate_limit = fields.Integer(string='API-Anfragen pro Minute', default=60,
                                   config_parameter='mcp.api_rate_limit')
    
    # Sicherheitseinstellungen
    encrypt_api_keys = fields.Boolean(string='API-Schlüssel verschlüsseln', default=True,
                                     config_parameter='mcp.encrypt_api_keys')
    
    data_retention_days = fields.Integer(string='Datenspeicherung (Tage)', default=30,
                                        config_parameter='mcp.data_retention_days',
                                        help="Anzahl der Tage, für die KI-Interaktionen gespeichert werden")
    
    # Erweiterte Einstellungen
    debug_mode = fields.Boolean(string='Debug-Modus', default=False,
                               config_parameter='mcp.debug_mode')
    
    developer_mode = fields.Boolean(string='Entwicklermodus', default=False,
                                   config_parameter='mcp.developer_mode')
    
    @api.model
    def get_values(self):
        """Lädt die aktuellen Konfigurationswerte."""
        res = super(MCPConfigSettings, self).get_values()
        
        # Parameter aus mcp.config laden
        config_model = self.env['mcp.config']
        
        # Beispiel für komplexere Einstellungen, die nicht durch config_parameter abgedeckt sind
        debug_logging = config_model.get_param('debug_logging', False)
        res.update(debug_logging=debug_logging)
        
        return res
    
    def set_values(self):
        """Speichert die Konfigurationswerte."""
        super(MCPConfigSettings, self).set_values()
        
        # Parameter in mcp.config speichern
        config_model = self.env['mcp.config']
        
        # Beispiel für komplexere Einstellungen, die nicht durch config_parameter abgedeckt sind
        config_model.set_param('debug_logging', self.debug_mode)
        
        # Logmeldung für Administratoren
        if self.debug_mode:
            _logger.info("MCP-Debug-Modus wurde aktiviert") 