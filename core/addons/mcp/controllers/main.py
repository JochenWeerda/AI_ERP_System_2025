# -*- coding: utf-8 -*-

import json
import logging
import time
from odoo import http, fields, _
from odoo.http import request
from odoo.exceptions import AccessError, UserError

_logger = logging.getLogger(__name__)


class MCPController(http.Controller):
    """
    Hauptcontroller für MCP-Funktionen.
    Stellt Web-Endpunkte für die Interaktion mit dem MCP-Modul bereit.
    """
    
    @http.route('/mcp/dashboard', type='http', auth='user', website=True)
    def mcp_dashboard(self, **kw):
        """
        Rendert das MCP-Dashboard mit Nutzungsstatistiken und Informationen.
        """
        # Nutzungsstatistiken laden
        today = fields.Date.today()
        last_30_days = fields.Date.add(today, days=-30)
        
        # Anzahl der Interaktionen in den letzten 30 Tagen
        domain = [('create_date', '>=', last_30_days)]
        interaction_count = request.env['mcp.interaction.log'].search_count(domain)
        
        # Gesamttokens in den letzten 30 Tagen
        total_tokens = request.env['mcp.interaction.log'].search_read(
            domain, ['token_count_total'], order='id DESC')
        token_sum = sum(r['token_count_total'] for r in total_tokens)
        
        # Erfolgsrate berechnen
        success_count = request.env['mcp.interaction.log'].search_count(
            domain + [('status', '=', 'success')])
        success_rate = (success_count / interaction_count * 100) if interaction_count else 0
        
        # Verwendete Provider
        providers = request.env['mcp.provider'].search([('is_active', '=', True)])
        
        # Kürzliche Interaktionen
        recent_interactions = request.env['mcp.interaction.log'].search_read(
            domain, 
            ['name', 'request_type', 'provider_id', 'model_id', 'create_date', 'status', 'token_count_total'],
            limit=10, order='create_date DESC')
        
        # Daten für Modellnutzungsdiagramm
        model_usage = request.env['mcp.interaction.summary'].search_read(
            [('date', '>=', last_30_days)], 
            ['model_id', 'interaction_count'],
            order='interaction_count DESC', limit=5)
        
        model_data = []
        for item in model_usage:
            model = request.env['mcp.provider.model'].browse(item['model_id'][0])
            model_data.append({
                'name': model.name,
                'count': item['interaction_count'],
            })
        
        # Render Dashboard
        return request.render('mcp.dashboard_template', {
            'interaction_count': interaction_count,
            'token_sum': token_sum,
            'success_rate': round(success_rate, 1),
            'providers': providers,
            'recent_interactions': recent_interactions,
            'model_data': json.dumps(model_data),
            'page_title': _('MCP Dashboard'),
        })
    
    @http.route('/mcp/prompt_designer', type='http', auth='user', website=True)
    def prompt_designer(self, **kw):
        """
        Rendert den Prompt-Designer zur Erstellung und Bearbeitung von Prompt-Vorlagen.
        """
        # Vorhandene Prompt-Vorlagen laden
        templates = request.env['mcp.prompt.template'].search([])
        
        # Kategorien laden
        categories = request.env['mcp.prompt.category'].search([])
        
        # Render Designer
        return request.render('mcp.prompt_designer_template', {
            'templates': templates,
            'categories': categories,
            'page_title': _('Prompt-Designer'),
        })
    
    @http.route('/mcp/provider/test_connection', type='json', auth='user')
    def test_provider_connection(self, provider_id, **kw):
        """
        Testet die Verbindung zu einem KI-Provider.
        
        :param provider_id: ID des zu testenden Providers
        :return: Dict mit Ergebnis
        """
        try:
            provider = request.env['mcp.provider'].browse(int(provider_id))
            if not provider.exists():
                return {'success': False, 'error': _('Provider nicht gefunden.')}
            
            # Verbindungstest durchführen
            start_time = time.time()
            result = provider.test_connection()
            duration = (time.time() - start_time) * 1000  # in ms
            
            if result.get('success'):
                return {
                    'success': True,
                    'message': _('Verbindung erfolgreich hergestellt.'),
                    'duration': round(duration, 2)
                }
            else:
                return {
                    'success': False,
                    'error': result.get('error', _('Unbekannter Fehler')),
                    'duration': round(duration, 2)
                }
        
        except Exception as e:
            _logger.exception("Fehler beim Testen der Providerverbindung")
            return {'success': False, 'error': str(e)}
    
    @http.route('/mcp/interaction/feedback', type='json', auth='user')
    def submit_interaction_feedback(self, interaction_id, rating, notes=None, **kw):
        """
        Speichert Feedback zu einer KI-Interaktion.
        
        :param interaction_id: ID des Interaktionslogs
        :param rating: Bewertung (1-5)
        :param notes: Optionale Feedback-Notizen
        :return: Dict mit Ergebnis
        """
        try:
            interaction = request.env['mcp.interaction.log'].browse(int(interaction_id))
            if not interaction.exists():
                return {'success': False, 'error': _('Interaktion nicht gefunden.')}
            
            # Feedback speichern
            interaction.set_feedback(rating, notes)
            
            return {
                'success': True,
                'message': _('Feedback erfolgreich gespeichert.')
            }
        
        except Exception as e:
            _logger.exception("Fehler beim Speichern des Feedbacks")
            return {'success': False, 'error': str(e)}
    
    @http.route('/mcp/context/preview', type='json', auth='user')
    def preview_context(self, context_id, record_id=None, **kw):
        """
        Generiert eine Vorschau des Kontexts für einen Datensatz.
        
        :param context_id: ID des Kontextgenerators
        :param record_id: ID des Datensatzes (optional)
        :return: Dict mit generiertem Kontext
        """
        try:
            context_generator = request.env['mcp.context'].browse(int(context_id))
            if not context_generator.exists():
                return {'success': False, 'error': _('Kontextgenerator nicht gefunden.')}
            
            # Kontext generieren
            if record_id:
                result = context_generator.generate_context(record_id=int(record_id))
            else:
                # Listenmodus ohne spezifischen Datensatz
                Model = request.env[context_generator.model_id.model]
                result = context_generator.generate_context(limit=5)
            
            return {
                'success': True,
                'context': result
            }
        
        except Exception as e:
            _logger.exception("Fehler bei der Kontextgenerierung")
            return {'success': False, 'error': str(e)}
    
    @http.route('/mcp/prompt/preview', type='json', auth='user')
    def preview_prompt(self, template_id, params=None, **kw):
        """
        Generiert eine Vorschau eines Prompts aus einer Vorlage.
        
        :param template_id: ID der Prompt-Vorlage
        :param params: Dict mit Parameterwerten
        :return: Dict mit generiertem Prompt
        """
        try:
            template = request.env['mcp.prompt.template'].browse(int(template_id))
            if not template.exists():
                return {'success': False, 'error': _('Prompt-Vorlage nicht gefunden.')}
            
            # Parameter validieren und konvertieren
            if params is None:
                params = {}
            
            # Prompt generieren
            prompt = template.generate_prompt(params)
            
            # Tokenschätzung
            token_estimate = request.env['mcp.interaction.log'].get_prompt_tokens(prompt)
            
            return {
                'success': True,
                'prompt': prompt,
                'token_estimate': token_estimate
            }
        
        except UserError as e:
            return {'success': False, 'error': str(e), 'missing_params': True}
        except Exception as e:
            _logger.exception("Fehler bei der Promptgenerierung")
            return {'success': False, 'error': str(e)} 