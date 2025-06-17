# -*- coding: utf-8 -*-

import json
import logging
import requests
import importlib
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError, UserError

_logger = logging.getLogger(__name__)


class MCPProvider(models.Model):
    """
    Verwaltet die Konfiguration und Verbindung zu KI-Providern.
    """
    _name = 'mcp.provider'
    _description = 'MCP KI-Provider'
    _order = 'sequence, name'
    
    name = fields.Char(string='Name', required=True)
    code = fields.Char(string='Code', required=True)
    provider_type = fields.Selection([
        ('anthropic', 'Anthropic'),
        ('openai', 'OpenAI'),
        ('mistral', 'Mistral AI'),
        ('huggingface', 'Hugging Face'),
        ('azure_openai', 'Azure OpenAI'),
        ('custom', 'Benutzerdefiniert')
    ], string='Provider-Typ', required=True, default='anthropic')
    
    api_endpoint = fields.Char(string='API-Endpunkt', 
                            default='https://api.anthropic.com/v1')
    api_key = fields.Char(string='API-Schlüssel')
    
    is_active = fields.Boolean(string='Aktiv', default=True)
    sequence = fields.Integer(string='Sequenz', default=10)
    
    # Standardwerte für Wiederholungen und Zeitüberschreitungen
    timeout = fields.Integer(string='Timeout (s)', default=30,
                           help="Zeitüberschreitung für API-Anfragen in Sekunden")
    retry_count = fields.Integer(string='Wiederholungen', default=3,
                              help="Anzahl der Wiederholungsversuche bei Fehlern")
    
    # Beziehungen
    model_ids = fields.One2many('mcp.provider.model', 'provider_id', string='Verfügbare Modelle')
    default_model_id = fields.Many2one('mcp.provider.model', string='Standardmodell',
                                    domain="[('provider_id', '=', id), ('is_active', '=', True)]")
    
    # Für Multi-Company-Unterstützung
    company_id = fields.Many2one('res.company', string='Unternehmen',
                               default=lambda self: self.env.company.id)
    
    _sql_constraints = [
        ('code_uniq', 'unique(code)', 'Der Provider-Code muss eindeutig sein!')
    ]
    
    @api.onchange('provider_type')
    def _onchange_provider_type(self):
        """Aktualisiert den API-Endpunkt basierend auf dem Provider-Typ."""
        if self.provider_type == 'anthropic':
            self.api_endpoint = 'https://api.anthropic.com/v1'
        elif self.provider_type == 'openai':
            self.api_endpoint = 'https://api.openai.com/v1'
        elif self.provider_type == 'mistral':
            self.api_endpoint = 'https://api.mistral.ai/v1'
        elif self.provider_type == 'huggingface':
            self.api_endpoint = 'https://api-inference.huggingface.co'
        elif self.provider_type == 'azure_openai':
            self.api_endpoint = 'https://{resource_name}.openai.azure.com/openai/deployments/{deployment_id}'
    
    def test_connection(self):
        """
        Testet die Verbindung zum KI-Provider.
        
        :return: Dict mit Erfolgs-/Fehlerstatus
        """
        self.ensure_one()
        
        if not self.api_key:
            return {'success': False, 'error': _('Kein API-Schlüssel konfiguriert.')}
        
        try:
            # Connector abrufen und Verbindung testen
            connector = self._get_connector()
            result = connector.test_connection()
            
            if result.get('success'):
                return {'success': True}
            else:
                return {'success': False, 'error': result.get('error', _('Unbekannter Fehler'))}
        
        except Exception as e:
            _logger.error(f"Fehler beim Testen der Provider-Verbindung: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _get_connector(self):
        """
        Erstellt eine Connector-Instanz für den Provider.
        
        :return: Connector-Instanz
        """
        self.ensure_one()
        
        # Provider-spezifischen Connector laden
        if self.provider_type == 'anthropic':
            from ..connectors.anthropic_connector import AnthropicConnector
            return AnthropicConnector(self)
        elif self.provider_type == 'openai':
            from ..connectors.openai_connector import OpenAIConnector
            return OpenAIConnector(self)
        elif self.provider_type == 'azure_openai':
            from ..connectors.azure_openai_connector import AzureOpenAIConnector
            return AzureOpenAIConnector(self)
        elif self.provider_type == 'custom':
            # Benutzerdefinierten Connector laden
            try:
                # Modul dynamisch importieren
                module_name = f"odoo.addons.mcp.connectors.{self.code.lower()}_connector"
                module = importlib.import_module(module_name)
                
                # Connector-Klasse extrahieren (Namenskonvention: KlassenameConnector)
                class_name = ''.join(word.capitalize() for word in self.code.split('_')) + 'Connector'
                connector_class = getattr(module, class_name)
                
                return connector_class(self)
            except (ImportError, AttributeError) as e:
                raise UserError(_('Benutzerdefinierter Connector konnte nicht geladen werden: %s') % str(e))
        else:
            # Basis-Connector verwenden
            from ..connectors.base_connector import BaseConnector
            return BaseConnector(self)


class MCPProviderModel(models.Model):
    """
    Verwaltet die verfügbaren KI-Modelle und deren Fähigkeiten für jeden Provider.
    """
    _name = 'mcp.provider.model'
    _description = 'MCP Provider-Modell'
    _order = 'provider_id, sequence, name'
    
    name = fields.Char(string='Name', required=True)
    model_identifier = fields.Char(string='Modell-ID', required=True,
                                help="Tatsächliche Modell-ID für API-Aufrufe (z.B. 'claude-3-opus-20240229')")
    
    provider_id = fields.Many2one('mcp.provider', string='Provider', required=True, ondelete='cascade')
    is_active = fields.Boolean(string='Aktiv', default=True)
    sequence = fields.Integer(string='Sequenz', default=10)
    
    capabilities = fields.Selection([
        ('completion', 'Text-Completion'),
        ('chat', 'Chat-Completion'),
        ('embeddings', 'Einbettungen'),
        ('image', 'Bildgenerierung'),
        ('multimodal', 'Multimodal')
    ], string='Fähigkeiten', required=True, default='chat')
    
    description = fields.Text(string='Beschreibung')
    
    # Modellparameter
    context_tokens = fields.Integer(string='Kontext-Tokens', default=100000,
                                 help="Maximale Anzahl von Tokens im Kontext")
    response_tokens = fields.Integer(string='Antwort-Tokens', default=4096,
                                  help="Maximale Anzahl von Tokens in der Antwort")
    
    # Preisgestaltung
    cost_per_input_token = fields.Float(string='Kosten pro Input-Token', digits=(10, 6),
                                      help="Kosten pro 1000 Input-Tokens in Euro")
    cost_per_output_token = fields.Float(string='Kosten pro Output-Token', digits=(10, 6),
                                       help="Kosten pro 1000 Output-Tokens in Euro")
    
    # Standardparameter für API-Aufrufe
    default_parameters = fields.Text(string='Standardparameter', 
                                   help="JSON-String mit Standardparametern für API-Aufrufe")
    
    _sql_constraints = [
        ('provider_model_uniq', 'unique(provider_id, model_identifier)', 
         'Die Kombination aus Provider und Modell-ID muss eindeutig sein!')
    ]
    
    @api.constrains('default_parameters')
    def _check_default_parameters(self):
        """Prüft, ob die Standardparameter gültiges JSON sind."""
        for model in self.filtered('default_parameters'):
            try:
                params = json.loads(model.default_parameters)
                if not isinstance(params, dict):
                    raise ValidationError(_('Standardparameter müssen ein JSON-Objekt sein'))
            except json.JSONDecodeError:
                raise ValidationError(_('Standardparameter müssen gültiges JSON sein'))
    
    def get_default_parameters(self):
        """
        Gibt die Standardparameter als Dict zurück.
        
        :return: Dict mit Standardparametern oder leeres Dict
        """
        self.ensure_one()
        
        if not self.default_parameters:
            return {}
        
        try:
            return json.loads(self.default_parameters)
        except json.JSONDecodeError:
            _logger.error(f"Ungültige Standardparameter für Modell {self.name}")
            return {}
    
    def get_estimated_cost(self, input_tokens, output_tokens):
        """
        Berechnet die geschätzten Kosten für eine Anfrage.
        
        :param input_tokens: Anzahl der Input-Tokens
        :param output_tokens: Anzahl der Output-Tokens
        :return: Geschätzte Kosten in Euro
        """
        self.ensure_one()
        
        input_cost = (input_tokens / 1000) * (self.cost_per_input_token or 0)
        output_cost = (output_tokens / 1000) * (self.cost_per_output_token or 0)
        
        return input_cost + output_cost 