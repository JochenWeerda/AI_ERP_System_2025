# -*- coding: utf-8 -*-

import json
import logging
import uuid
from datetime import datetime, timedelta
from odoo import api, fields, models, tools, _
from odoo.exceptions import ValidationError, UserError

_logger = logging.getLogger(__name__)


class MCPInteractionLog(models.Model):
    """
    Protokolliert KI-Interaktionen für Audit, Debugging und Optimierung.
    """
    _name = 'mcp.interaction.log'
    _description = 'MCP Interaktionsprotokoll'
    _order = 'create_date DESC'
    
    name = fields.Char(string='ID', required=True, default=lambda self: str(uuid.uuid4()),
                      readonly=True, copy=False)
    
    user_id = fields.Many2one('res.users', string='Benutzer',
                             default=lambda self: self.env.user.id, readonly=True)
    
    company_id = fields.Many2one('res.company', string='Unternehmen',
                                default=lambda self: self.env.company.id, readonly=True)
    
    # Anfrage-Details
    request_type = fields.Selection([
        ('completion', 'Text-Completion'),
        ('chat', 'Chat-Completion'),
        ('embedding', 'Einbettung'),
        ('context', 'Kontextgenerierung'),
        ('custom', 'Benutzerdefiniert')
    ], string='Anfrage-Typ', required=True, readonly=True)
    
    provider_id = fields.Many2one('mcp.provider', string='KI-Provider', readonly=True)
    model_id = fields.Many2one('mcp.provider.model', string='Verwendetes Modell', readonly=True)
    model_identifier = fields.Char(string='Modell-ID', readonly=True)
    
    # Quellen und Verweise
    source_model = fields.Char(string='Quellmodell', readonly=True,
                              help="Das ERP-Modell, aus dem der Kontext stammt")
    
    source_record_id = fields.Integer(string='Quell-Record-ID', readonly=True,
                                     help="Die ID des ERP-Datensatzes")
    
    prompt_template_id = fields.Many2one('mcp.prompt.template', string='Prompt-Vorlage',
                                        readonly=True)
    
    context_id = fields.Many2one('mcp.context', string='Kontext-Generator',
                               readonly=True)
    
    # Inhaltliche Details
    prompt = fields.Text(string='Prompt', readonly=True)
    response = fields.Text(string='Antwort', readonly=True)
    
    # Metadaten
    token_count_prompt = fields.Integer(string='Prompt-Tokens', readonly=True)
    token_count_response = fields.Integer(string='Antwort-Tokens', readonly=True)
    token_count_total = fields.Integer(string='Gesamt-Tokens', readonly=True)
    
    duration_ms = fields.Integer(string='Dauer (ms)', readonly=True,
                               help="Dauer der Anfrage in Millisekunden")
    
    # Zusätzliche Daten
    request_params = fields.Text(string='Anfrage-Parameter', readonly=True)
    response_meta = fields.Text(string='Antwort-Metadaten', readonly=True)
    
    # Status und Fehler
    status = fields.Selection([
        ('success', 'Erfolgreich'),
        ('error', 'Fehler'),
        ('cancelled', 'Abgebrochen')
    ], string='Status', required=True, readonly=True)
    
    error_message = fields.Text(string='Fehlermeldung', readonly=True)
    
    # Kosten
    estimated_cost = fields.Float(string='Geschätzte Kosten', digits=(10, 6), readonly=True,
                                help="Geschätzte Kosten in Euro")
    
    # Zeitstempel
    create_date = fields.Datetime(string='Erstellt am', readonly=True)
    
    # Tags für bessere Kategorisierung
    tag_ids = fields.Many2many('mcp.interaction.tag', string='Tags')
    
    feedback_rating = fields.Selection([
        ('1', 'Sehr schlecht'),
        ('2', 'Schlecht'),
        ('3', 'Neutral'),
        ('4', 'Gut'),
        ('5', 'Sehr gut')
    ], string='Bewertung')
    
    feedback_notes = fields.Text(string='Feedback-Notizen')
    
    def set_feedback(self, rating, notes=None):
        """
        Setzt Feedback für eine KI-Interaktion.
        
        :param rating: Bewertung (1-5)
        :param notes: Optionale Feedback-Notizen
        :return: True bei Erfolg
        """
        self.ensure_one()
        
        if rating not in ('1', '2', '3', '4', '5'):
            raise ValidationError(_('Bewertung muss zwischen 1 und 5 liegen'))
        
        self.write({
            'feedback_rating': rating,
            'feedback_notes': notes,
        })
        
        return True
    
    @api.model
    def log_interaction(self, request_type, provider=None, model=None, prompt=None, response=None,
                       token_count_prompt=0, token_count_response=0, duration_ms=0,
                       status='success', error_message=None, **kwargs):
        """
        Protokolliert eine KI-Interaktion.
        
        :param request_type: Typ der Anfrage ('completion', 'chat', etc.)
        :param provider: mcp.provider Recordset oder ID
        :param model: mcp.provider.model Recordset oder ID
        :param prompt: Der gesendete Prompt
        :param response: Die erhaltene Antwort
        :param token_count_prompt: Anzahl der Prompt-Tokens
        :param token_count_response: Anzahl der Antwort-Tokens
        :param duration_ms: Dauer der Anfrage in Millisekunden
        :param status: Status der Anfrage ('success', 'error', 'cancelled')
        :param error_message: Fehlermeldung bei Fehler
        :param kwargs: Weitere Parameter
        :return: Das erstellte Log-Objekt
        """
        # Provider- und Modell-IDs extrahieren
        provider_id = provider.id if hasattr(provider, 'id') else provider
        model_id = model.id if hasattr(model, 'id') else model
        model_identifier = model.model_identifier if hasattr(model, 'model_identifier') else kwargs.get('model_identifier')
        
        # Kosten berechnen, wenn Provider und Modell bekannt sind
        estimated_cost = 0.0
        if provider_id and model_id:
            model_obj = self.env['mcp.provider.model'].browse(model_id)
            if model_obj.exists():
                cost_per_input = model_obj.cost_per_input_token or 0.0
                cost_per_output = model_obj.cost_per_output_token or 0.0
                
                estimated_cost = (token_count_prompt * cost_per_input / 1000) + (token_count_response * cost_per_output / 1000)
        
        # Zusätzliche Parameter JSON-kodieren
        request_params = kwargs.get('request_params')
        if request_params and isinstance(request_params, dict):
            request_params = json.dumps(request_params)
        
        response_meta = kwargs.get('response_meta')
        if response_meta and isinstance(response_meta, dict):
            response_meta = json.dumps(response_meta)
        
        # Log-Eintrag erstellen
        log_vals = {
            'name': str(uuid.uuid4()),
            'request_type': request_type,
            'provider_id': provider_id,
            'model_id': model_id,
            'model_identifier': model_identifier,
            'prompt': prompt,
            'response': response,
            'token_count_prompt': token_count_prompt,
            'token_count_response': token_count_response,
            'token_count_total': token_count_prompt + token_count_response,
            'duration_ms': duration_ms,
            'status': status,
            'error_message': error_message,
            'estimated_cost': estimated_cost,
            'source_model': kwargs.get('source_model'),
            'source_record_id': kwargs.get('source_record_id'),
            'prompt_template_id': kwargs.get('prompt_template_id'),
            'context_id': kwargs.get('context_id'),
            'request_params': request_params,
            'response_meta': response_meta,
        }
        
        # Tags hinzufügen, falls vorhanden
        tag_ids = kwargs.get('tag_ids')
        if tag_ids:
            log_vals['tag_ids'] = [(6, 0, tag_ids)]
        
        # Log-Objekt erstellen
        return self.create(log_vals)
    
    @api.model
    def cleanup_old_logs(self, days=None):
        """
        Bereinigt alte Protokolleinträge basierend auf der Aufbewahrungsdauer.
        
        :param days: Anzahl der Tage, die Protokolle aufbewahrt werden sollen (überschreibt die Konfiguration)
        :return: Anzahl der gelöschten Einträge
        """
        if days is None:
            # Konfigurationswert verwenden
            days = int(self.env['ir.config_parameter'].sudo().get_param('mcp.data_retention_days', '30'))
        
        if days <= 0:
            return 0
        
        cutoff_date = fields.Datetime.now() - timedelta(days=days)
        old_logs = self.search([('create_date', '<', cutoff_date)])
        
        count = len(old_logs)
        if count > 0:
            old_logs.unlink()
            _logger.info(f"MCP-Protokollbereinigung: {count} alte Einträge gelöscht")
        
        return count
    
    def get_prompt_tokens(self, prompt):
        """
        Schätzt die Anzahl der Tokens in einem Prompt.
        Dies ist eine einfache Schätzung, keine exakte Tokenzählung.
        
        :param prompt: Der zu analysierende Prompt-Text
        :return: Geschätzte Anzahl der Tokens
        """
        if not prompt:
            return 0
        
        # Einfache Schätzung: Etwa 4 Zeichen pro Token
        return len(prompt) // 4 + 1


class MCPInteractionTag(models.Model):
    """
    Tags zur Kategorisierung von KI-Interaktionen.
    """
    _name = 'mcp.interaction.tag'
    _description = 'MCP Interaktionstag'
    
    name = fields.Char(string='Name', required=True)
    color = fields.Integer(string='Farbe')
    description = fields.Text(string='Beschreibung')
    
    _sql_constraints = [
        ('name_uniq', 'unique(name)', 'Der Tag-Name muss eindeutig sein!')
    ]


class MCPInteractionSummary(models.Model):
    """
    Zusammenfassungen und Analysen von KI-Interaktionen.
    """
    _name = 'mcp.interaction.summary'
    _description = 'MCP Interaktionsanalyse'
    _auto = False
    
    date = fields.Date(string='Datum', readonly=True)
    provider_id = fields.Many2one('mcp.provider', string='Provider', readonly=True)
    model_id = fields.Many2one('mcp.provider.model', string='Modell', readonly=True)
    request_type = fields.Selection([
        ('completion', 'Text-Completion'),
        ('chat', 'Chat-Completion'),
        ('embedding', 'Einbettung'),
        ('context', 'Kontextgenerierung'),
        ('custom', 'Benutzerdefiniert')
    ], string='Anfrage-Typ', readonly=True)
    
    user_id = fields.Many2one('res.users', string='Benutzer', readonly=True)
    company_id = fields.Many2one('res.company', string='Unternehmen', readonly=True)
    
    interaction_count = fields.Integer(string='Anzahl Interaktionen', readonly=True)
    token_count_total = fields.Integer(string='Gesamt-Tokens', readonly=True)
    estimated_cost_total = fields.Float(string='Gesamtkosten', digits=(10, 6), readonly=True)
    
    avg_duration_ms = fields.Float(string='Durchschn. Dauer (ms)', readonly=True)
    success_rate = fields.Float(string='Erfolgsrate (%)', readonly=True)
    
    def init(self):
        """Initialisiert die Datenbankansicht für die Zusammenfassung."""
        tools.drop_view_if_exists(self.env.cr, self._table)
        self.env.cr.execute("""
            CREATE OR REPLACE VIEW %s AS (
                SELECT
                    row_number() OVER () AS id,
                    date(create_date) AS date,
                    provider_id,
                    model_id,
                    request_type,
                    user_id,
                    company_id,
                    COUNT(*) AS interaction_count,
                    SUM(token_count_total) AS token_count_total,
                    SUM(estimated_cost) AS estimated_cost_total,
                    AVG(duration_ms) AS avg_duration_ms,
                    (COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*)) AS success_rate
                FROM
                    mcp_interaction_log
                GROUP BY
                    date(create_date),
                    provider_id,
                    model_id,
                    request_type,
                    user_id,
                    company_id
                ORDER BY
                    date DESC
            )
        """ % self._table)
    
    def action_view_details(self):
        """Zeigt die Details der Interaktionen für diese Zusammenfassung an."""
        self.ensure_one()
        
        domain = [
            ('create_date', '>=', self.date),
            ('create_date', '<', fields.Date.add(self.date, days=1)),
        ]
        
        if self.provider_id:
            domain.append(('provider_id', '=', self.provider_id.id))
        
        if self.model_id:
            domain.append(('model_id', '=', self.model_id.id))
            
        if self.request_type:
            domain.append(('request_type', '=', self.request_type))
            
        if self.user_id:
            domain.append(('user_id', '=', self.user_id.id))
            
        if self.company_id:
            domain.append(('company_id', '=', self.company_id.id))
        
        return {
            'name': _('Interaktionsdetails'),
            'type': 'ir.actions.act_window',
            'res_model': 'mcp.interaction.log',
            'view_mode': 'tree,form',
            'domain': domain,
        } 