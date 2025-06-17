# -*- coding: utf-8 -*-

import logging
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)


class MCPUserPreferences(models.Model):
    """
    Verwaltet benutzerspezifische Einstellungen für die KI-Integration.
    """
    _name = 'mcp.user.preferences'
    _description = 'MCP Benutzereinstellungen'
    _rec_name = 'user_id'
    
    user_id = fields.Many2one('res.users', string='Benutzer', required=True, default=lambda self: self.env.user.id)
    provider_id = fields.Many2one('mcp.provider', string='Bevorzugter KI-Provider')
    model_id = fields.Many2one('mcp.provider.model', string='Bevorzugtes KI-Modell',
                              domain="[('provider_id', '=', provider_id)]")
    
    # Allgemeine Einstellungen
    enable_ai_suggestions = fields.Boolean(string='KI-Vorschläge aktivieren', default=True,
                                         help="Aktiviert KI-generierte Vorschläge im System")
    max_tokens_per_request = fields.Integer(string='Max. Tokens pro Anfrage', default=1000,
                                         help="Maximale Anzahl von Tokens, die pro Anfrage gesendet werden können")
    
    # Datenschutzeinstellungen
    anonymize_sensitive_data = fields.Boolean(string='Sensible Daten anonymisieren', default=True,
                                           help="Anonymisiert sensible Daten in KI-Anfragen")
    log_ai_interactions = fields.Boolean(string='KI-Interaktionen protokollieren', default=True,
                                       help="Protokolliert alle KI-Interaktionen zur späteren Analyse")
    
    # Benutzeroberfläche
    ui_auto_expand_suggestions = fields.Boolean(string='Vorschläge automatisch erweitern', default=False,
                                             help="Erweitert KI-Vorschläge automatisch in der Benutzeroberfläche")
    ui_show_confidence = fields.Boolean(string='Zuverlässigkeit anzeigen', default=True,
                                     help="Zeigt die Zuverlässigkeitswerte der KI-Vorschläge an")
    
    # Formatierungseinstellungen
    preferred_language = fields.Selection([
        ('system', 'Systemsprache'),
        ('de_DE', 'Deutsch'),
        ('en_US', 'Englisch (USA)'),
        ('en_GB', 'Englisch (UK)'),
        ('fr_FR', 'Französisch'),
        ('es_ES', 'Spanisch'),
        ('it_IT', 'Italienisch')
    ], string='Bevorzugte Sprache', default='system',
        help="Bevorzugte Sprache für KI-generierte Inhalte")
    
    preferred_tone = fields.Selection([
        ('neutral', 'Neutral'),
        ('formal', 'Formell'),
        ('informal', 'Informell'),
        ('technical', 'Technisch'),
        ('simple', 'Einfach')
    ], string='Bevorzugter Tonfall', default='neutral',
        help="Bevorzugter Tonfall für KI-generierte Inhalte")
    
    _sql_constraints = [
        ('user_uniq', 'unique(user_id)', 'Für jeden Benutzer kann nur ein Präferenzdatensatz existieren!')
    ]
    
    @api.onchange('provider_id')
    def _onchange_provider_id(self):
        """Setzt das Modell zurück, wenn sich der Provider ändert."""
        self.model_id = False
        
        # Standard-Modell des Providers vorschlagen
        if self.provider_id and self.provider_id.default_model_id:
            self.model_id = self.provider_id.default_model_id
    
    @api.model
    def get_user_preferences(self, user_id=None):
        """
        Holt die Präferenzen für einen bestimmten Benutzer oder den aktuellen Benutzer.
        Erstellt einen Standarddatensatz, falls noch keiner existiert.
        
        :param user_id: Optionale Benutzer-ID
        :return: Recordset mit Benutzerpräferenzen
        """
        if not user_id:
            user_id = self.env.user.id
        
        preferences = self.search([('user_id', '=', user_id)], limit=1)
        
        if not preferences:
            # Standard-Provider
            default_provider = self.env['mcp.provider'].search([('is_active', '=', True)], limit=1)
            default_model = default_provider.default_model_id if default_provider else False
            
            # Standardpräferenzen erstellen
            preferences = self.create({
                'user_id': user_id,
                'provider_id': default_provider.id if default_provider else False,
                'model_id': default_model.id if default_model else False,
            })
        
        return preferences
    
    def apply_to_session(self):
        """
        Wendet die Präferenzen auf die aktuelle Benutzersitzung an.
        
        :return: True bei Erfolg
        """
        self.ensure_one()
        
        # Präferenzen in die Benutzersitzung schreiben
        self.env.user.mcp_provider_id = self.provider_id.id if self.provider_id else False
        self.env.user.mcp_model_id = self.model_id.id if self.model_id else False
        self.env.user.mcp_enable_ai_suggestions = self.enable_ai_suggestions
        
        return True


class ResUsers(models.Model):
    """
    Erweitert das Benutzermodell um MCP-spezifische Felder.
    """
    _inherit = 'res.users'
    
    # Felder für die Sitzung
    mcp_provider_id = fields.Many2one('mcp.provider', string='Aktiver KI-Provider')
    mcp_model_id = fields.Many2one('mcp.provider.model', string='Aktives KI-Modell')
    mcp_enable_ai_suggestions = fields.Boolean(string='KI-Vorschläge aktiviert')
    
    @api.model
    def get_mcp_preferences(self):
        """
        Holt die MCP-Benutzereinstellungen für den aktuellen Benutzer.
        
        :return: Dict mit Benutzereinstellungen
        """
        preferences = self.env['mcp.user.preferences'].get_user_preferences()
        
        return {
            'provider_id': preferences.provider_id.id if preferences.provider_id else False,
            'provider_name': preferences.provider_id.name if preferences.provider_id else "",
            'model_id': preferences.model_id.id if preferences.model_id else False,
            'model_name': preferences.model_id.name if preferences.model_id else "",
            'enable_ai_suggestions': preferences.enable_ai_suggestions,
            'max_tokens': preferences.max_tokens_per_request,
            'preferred_language': preferences.preferred_language,
            'preferred_tone': preferences.preferred_tone,
        } 