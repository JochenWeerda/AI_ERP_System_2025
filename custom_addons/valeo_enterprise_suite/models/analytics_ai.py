from odoo import models, fields, api
import json
import logging
import requests
from datetime import datetime

_logger = logging.getLogger(__name__)

class AnalyticsAI(models.Model):
    _name = 'valeo.analytics.ai'
    _description = 'VALEO Analytics KI-Integration'

    name = fields.Char(string='Name', required=True)
    description = fields.Text(string='Beschreibung')
    model_id = fields.Many2one('ir.model', string='Datenmodell', required=True)
    model_name = fields.Char(related='model_id.model', string='Modellname', readonly=True)
    field_ids = fields.Many2many('ir.model.fields', string='Zu analysierende Felder',
                               domain="[('model_id', '=', model_id)]")
    
    ai_provider = fields.Selection([
        ('openai', 'OpenAI'),
        ('azure', 'Azure AI'),
        ('local', 'Lokales Modell'),
        ('custom', 'Benutzerdefiniert')
    ], string='KI-Anbieter', default='openai', required=True)
    
    api_key = fields.Char(string='API-Schlüssel')
    api_endpoint = fields.Char(string='API-Endpunkt')
    api_model = fields.Char(string='Modellname', default='gpt-4')
    
    is_active = fields.Boolean(string='Aktiv', default=True)
    last_run = fields.Datetime(string='Letzte Ausführung')
    
    result_ids = fields.One2many('valeo.analytics.ai.result', 'analytics_id', string='Analyseergebnisse')
    
    @api.model
    def _prepare_data_for_analysis(self, record_ids=None, limit=100):
        """Bereitet Daten für die KI-Analyse vor"""
        self.ensure_one()
        
        if not self.model_name:
            return []
        
        model = self.env[self.model_name]
        domain = []
        
        if record_ids:
            domain.append(('id', 'in', record_ids))
        
        records = model.search(domain, limit=limit)
        
        if not records:
            return []
        
        field_names = [field.name for field in self.field_ids]
        
        # Wenn keine Felder ausgewählt wurden, verwende alle Felder
        if not field_names:
            field_names = list(records._fields.keys())
        
        data = []
        for record in records:
            record_data = {}
            for field_name in field_names:
                try:
                    field_value = record[field_name]
                    if hasattr(field_value, 'name_get'):
                        field_value = field_value.name_get()[0][1] if field_value else False
                    record_data[field_name] = field_value
                except Exception as e:
                    _logger.error(f"Fehler beim Lesen des Feldes {field_name}: {e}")
                    record_data[field_name] = False
            
            data.append(record_data)
        
        return data
    
    def action_analyze_data(self):
        """Führt eine KI-Analyse der Daten durch"""
        self.ensure_one()
        
        if not self.is_active:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'Fehler',
                    'message': 'Diese KI-Integration ist nicht aktiv.',
                    'type': 'danger',
                }
            }
        
        data = self._prepare_data_for_analysis()
        
        if not data:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'Warnung',
                    'message': 'Keine Daten für die Analyse gefunden.',
                    'type': 'warning',
                }
            }
        
        try:
            result = self._call_ai_service(data)
            
            # Speichere das Ergebnis
            self.env['valeo.analytics.ai.result'].create({
                'analytics_id': self.id,
                'name': f'Analyse {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}',
                'result_data': json.dumps(result),
                'result_summary': result.get('summary', 'Keine Zusammenfassung verfügbar'),
                'record_count': len(data)
            })
            
            self.last_run = fields.Datetime.now()
            
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'Erfolg',
                    'message': 'KI-Analyse erfolgreich durchgeführt.',
                    'type': 'success',
                }
            }
        except Exception as e:
            _logger.error(f"Fehler bei der KI-Analyse: {e}")
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'Fehler',
                    'message': f'Fehler bei der KI-Analyse: {e}',
                    'type': 'danger',
                }
            }
    
    def _call_ai_service(self, data):
        """Ruft den KI-Service auf und gibt das Ergebnis zurück"""
        if self.ai_provider == 'openai':
            return self._call_openai(data)
        elif self.ai_provider == 'azure':
            return self._call_azure_ai(data)
        elif self.ai_provider == 'local':
            return self._call_local_model(data)
        else:
            return self._call_custom_service(data)
    
    def _call_openai(self, data):
        """Ruft die OpenAI API auf"""
        if not self.api_key:
            raise ValueError("API-Schlüssel für OpenAI ist nicht konfiguriert")
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        endpoint = self.api_endpoint or 'https://api.openai.com/v1/chat/completions'
        
        # Bereite die Anfrage vor
        prompt = f"""
        Analysiere die folgenden Daten und gib Einblicke und Trends zurück:
        
        {json.dumps(data, indent=2, ensure_ascii=False)}
        
        Bitte gib deine Analyse im folgenden JSON-Format zurück:
        {{
            "summary": "Eine kurze Zusammenfassung der Ergebnisse",
            "insights": ["Einblick 1", "Einblick 2", ...],
            "trends": ["Trend 1", "Trend 2", ...],
            "recommendations": ["Empfehlung 1", "Empfehlung 2", ...]
        }}
        """
        
        payload = {
            'model': self.api_model or 'gpt-4',
            'messages': [
                {'role': 'system', 'content': 'Du bist ein Datenanalyst, der Geschäftsdaten analysiert und wertvolle Einblicke liefert.'},
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.3
        }
        
        try:
            response = requests.post(endpoint, headers=headers, json=payload, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Extrahiere das JSON aus der Antwort
            try:
                start_idx = content.find('{')
                end_idx = content.rfind('}') + 1
                json_str = content[start_idx:end_idx]
                return json.loads(json_str)
            except Exception as e:
                _logger.error(f"Fehler beim Parsen der JSON-Antwort: {e}")
                return {
                    'summary': 'Fehler beim Parsen der Antwort',
                    'raw_response': content
                }
            
        except Exception as e:
            _logger.error(f"Fehler bei der Anfrage an OpenAI: {e}")
            raise
    
    def _call_azure_ai(self, data):
        """Ruft die Azure AI API auf"""
        # Implementierung für Azure AI
        return {
            'summary': 'Azure AI-Integration noch nicht implementiert',
            'insights': ['Noch keine Einblicke verfügbar'],
            'trends': [],
            'recommendations': ['Implementieren Sie die Azure AI-Integration']
        }
    
    def _call_local_model(self, data):
        """Ruft ein lokales Modell auf"""
        # Implementierung für lokales Modell
        return {
            'summary': 'Lokale Modell-Integration noch nicht implementiert',
            'insights': ['Noch keine Einblicke verfügbar'],
            'trends': [],
            'recommendations': ['Implementieren Sie die lokale Modell-Integration']
        }
    
    def _call_custom_service(self, data):
        """Ruft einen benutzerdefinierten Service auf"""
        # Implementierung für benutzerdefinierten Service
        return {
            'summary': 'Benutzerdefinierte Integration noch nicht implementiert',
            'insights': ['Noch keine Einblicke verfügbar'],
            'trends': [],
            'recommendations': ['Implementieren Sie die benutzerdefinierte Integration']
        }


class AnalyticsAIResult(models.Model):
    _name = 'valeo.analytics.ai.result'
    _description = 'VALEO Analytics KI-Ergebnis'
    _order = 'create_date desc'
    
    name = fields.Char(string='Name', required=True)
    analytics_id = fields.Many2one('valeo.analytics.ai', string='KI-Analyse', required=True, ondelete='cascade')
    create_date = fields.Datetime(string='Erstelldatum', readonly=True)
    result_data = fields.Text(string='Ergebnisdaten (JSON)')
    result_summary = fields.Text(string='Zusammenfassung')
    record_count = fields.Integer(string='Anzahl Datensätze')
    
    insight_ids = fields.One2many('valeo.analytics.ai.insight', 'result_id', string='Einblicke')
    
    def action_view_details(self):
        """Zeigt die Details des Analyseergebnisses an"""
        self.ensure_one()
        
        try:
            result_data = json.loads(self.result_data)
            
            # Erstelle Einblicke, falls noch nicht vorhanden
            if result_data.get('insights') and not self.insight_ids:
                for insight in result_data.get('insights', []):
                    self.env['valeo.analytics.ai.insight'].create({
                        'result_id': self.id,
                        'name': insight[:100],
                        'description': insight
                    })
            
            return {
                'name': f'Analyseergebnis: {self.name}',
                'type': 'ir.actions.act_window',
                'res_model': 'valeo.analytics.ai.result',
                'res_id': self.id,
                'view_mode': 'form',
                'target': 'current',
            }
        except Exception as e:
            _logger.error(f"Fehler beim Anzeigen der Analyseergebnisse: {e}")
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'Fehler',
                    'message': f'Fehler beim Anzeigen der Analyseergebnisse: {e}',
                    'type': 'danger',
                }
            }


class AnalyticsAIInsight(models.Model):
    _name = 'valeo.analytics.ai.insight'
    _description = 'VALEO Analytics KI-Einblick'
    
    name = fields.Char(string='Name', required=True)
    description = fields.Text(string='Beschreibung')
    result_id = fields.Many2one('valeo.analytics.ai.result', string='Analyseergebnis', required=True, ondelete='cascade')
    is_favorite = fields.Boolean(string='Favorit', default=False)
    is_implemented = fields.Boolean(string='Umgesetzt', default=False)
    
    user_id = fields.Many2one('res.users', string='Verantwortlicher')
    priority = fields.Selection([
        ('0', 'Niedrig'),
        ('1', 'Mittel'),
        ('2', 'Hoch'),
        ('3', 'Sehr hoch')
    ], string='Priorität', default='1')
    
    notes = fields.Text(string='Notizen')
    
    def action_mark_implemented(self):
        """Markiert den Einblick als umgesetzt"""
        self.ensure_one()
        self.is_implemented = True
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Erfolg',
                'message': f'Einblick "{self.name}" wurde als umgesetzt markiert.',
                'type': 'success',
            }
        }
    
    def action_toggle_favorite(self):
        """Schaltet den Favoriten-Status um"""
        self.ensure_one()
        self.is_favorite = not self.is_favorite
        
        return {} 