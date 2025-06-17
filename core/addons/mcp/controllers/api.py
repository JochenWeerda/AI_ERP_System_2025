# -*- coding: utf-8 -*-

import json
import logging
import time
from odoo import http, fields, _
from odoo.http import request
from odoo.exceptions import AccessError, UserError, ValidationError

_logger = logging.getLogger(__name__)


class MCPAPIController(http.Controller):
    """
    Controller für die MCP REST-API.
    Stellt Endpunkte für die Integration mit KI-Modellen bereit.
    """
    
    @http.route('/api/mcp/v1/completions', type='json', auth='user')
    def generate_completion(self, **kwargs):
        """
        Generiert eine Text-Completion basierend auf dem Eingabeprompt.
        
        Erforderliche Parameter:
        - prompt: Der Eingabetext
        
        Optionale Parameter:
        - provider_id: ID des zu verwendenden KI-Providers
        - model_id: ID des zu verwendenden KI-Modells
        - model: Modell-Identifier (Alternative zu model_id)
        - max_tokens: Maximale Anzahl von Tokens in der Antwort
        - temperature: Kreativität der Antwort (0.0-1.0)
        - context_id: ID des Kontextgenerators
        - record_id: ID des Datensatzes für den Kontext
        - prompt_template_id: ID der Prompt-Vorlage
        - template_params: Parameter für die Prompt-Vorlage
        
        Beispiel:
        {
            "prompt": "Was ist das Wetter heute?",
            "provider_id": 1,
            "model_id": 2,
            "max_tokens": 100,
            "temperature": 0.7
        }
        
        Rückgabe:
        {
            "success": true,
            "completion": "Das Wetter heute ist...",
            "usage": {
                "prompt_tokens": 5,
                "completion_tokens": 10,
                "total_tokens": 15
            }
        }
        """
        try:
            start_time = time.time()
            
            # Erforderliche Parameter validieren
            prompt = kwargs.get('prompt')
            if not prompt and not kwargs.get('prompt_template_id'):
                return {'success': False, 'error': _('Prompt oder Prompt-Vorlage ist erforderlich.')}
            
            # Provider und Modell bestimmen
            provider_id = kwargs.get('provider_id')
            model_id = kwargs.get('model_id')
            
            # Wenn keine Provider-ID angegeben ist, Standard-Provider verwenden
            if not provider_id:
                default_provider_id = request.env['ir.config_parameter'].sudo().get_param('mcp.default_provider_id')
                if default_provider_id:
                    provider_id = int(default_provider_id)
                else:
                    # Ersten aktiven Provider suchen
                    provider = request.env['mcp.provider'].search([('is_active', '=', True)], limit=1)
                    if provider:
                        provider_id = provider.id
                    else:
                        return {'success': False, 'error': _('Kein aktiver KI-Provider gefunden.')}
            
            provider = request.env['mcp.provider'].browse(provider_id)
            if not provider.exists():
                return {'success': False, 'error': _('KI-Provider nicht gefunden.')}
            
            # Modell bestimmen
            model = None
            model_identifier = kwargs.get('model')
            
            if model_id:
                model = request.env['mcp.provider.model'].browse(model_id)
                if not model.exists() or model.provider_id.id != provider.id:
                    return {'success': False, 'error': _('KI-Modell nicht gefunden oder nicht mit dem Provider kompatibel.')}
            elif model_identifier:
                model = request.env['mcp.provider.model'].search([
                    ('provider_id', '=', provider.id),
                    ('model_identifier', '=', model_identifier),
                    ('is_active', '=', True)
                ], limit=1)
                if not model:
                    return {'success': False, 'error': _('KI-Modell mit Identifier "%s" nicht gefunden.') % model_identifier}
            else:
                # Standard-Modell des Providers verwenden
                model = provider.default_model_id
                if not model:
                    return {'success': False, 'error': _('Kein Standard-KI-Modell für den Provider definiert.')}
            
            # Prompt aus Vorlage generieren, falls erforderlich
            if kwargs.get('prompt_template_id'):
                template_id = kwargs.get('prompt_template_id')
                template = request.env['mcp.prompt.template'].browse(int(template_id))
                if not template.exists():
                    return {'success': False, 'error': _('Prompt-Vorlage nicht gefunden.')}
                
                template_params = kwargs.get('template_params', {})
                try:
                    prompt = template.generate_prompt(template_params)
                except Exception as e:
                    return {'success': False, 'error': str(e)}
            
            # Kontext hinzufügen, falls erforderlich
            if kwargs.get('context_id'):
                context_id = kwargs.get('context_id')
                context_generator = request.env['mcp.context'].browse(int(context_id))
                if not context_generator.exists():
                    return {'success': False, 'error': _('Kontextgenerator nicht gefunden.')}
                
                record_id = kwargs.get('record_id')
                try:
                    context_data = context_generator.generate_context(record_id=record_id)
                    
                    # Kontext dem Prompt hinzufügen
                    context_json = json.dumps(context_data, indent=2)
                    prompt = f"Kontext:\n{context_json}\n\nPrompt: {prompt}"
                except Exception as e:
                    return {'success': False, 'error': f"Fehler bei der Kontextgenerierung: {str(e)}"}
            
            # Weitere Parameter extrahieren
            max_tokens = kwargs.get('max_tokens', 1000)
            temperature = kwargs.get('temperature', 0.7)
            
            # Connector für den Provider abrufen
            connector = provider._get_connector()
            
            # Completion generieren
            response = connector.generate_completion(
                prompt=prompt,
                model=model.model_identifier,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            # Dauer berechnen
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Verwendung protokollieren
            log_entry = request.env['mcp.interaction.log'].log_interaction(
                request_type='completion',
                provider=provider,
                model=model,
                prompt=prompt,
                response=response.get('content', ''),
                token_count_prompt=response.get('usage', {}).get('prompt_tokens', 0),
                token_count_response=response.get('usage', {}).get('completion_tokens', 0),
                duration_ms=duration_ms,
                status='success',
                prompt_template_id=kwargs.get('prompt_template_id'),
                context_id=kwargs.get('context_id'),
                source_record_id=kwargs.get('record_id'),
                request_params=kwargs
            )
            
            # Erfolgreiche Antwort zurückgeben
            return {
                'success': True,
                'completion': response.get('content', ''),
                'usage': response.get('usage', {}),
                'log_id': log_entry.id
            }
        
        except Exception as e:
            _logger.exception("Fehler bei der Completion-Generierung")
            
            # Fehler protokollieren
            try:
                request.env['mcp.interaction.log'].log_interaction(
                    request_type='completion',
                    provider=provider if 'provider' in locals() else None,
                    model=model if 'model' in locals() else None,
                    prompt=kwargs.get('prompt', ''),
                    response='',
                    duration_ms=int((time.time() - start_time) * 1000) if 'start_time' in locals() else 0,
                    status='error',
                    error_message=str(e),
                    request_params=kwargs
                )
            except Exception:
                pass
            
            return {'success': False, 'error': str(e)}
    
    @http.route('/api/mcp/v1/chat', type='json', auth='user')
    def generate_chat_completion(self, **kwargs):
        """
        Generiert eine Chat-Completion basierend auf den gegebenen Nachrichten.
        
        Erforderliche Parameter:
        - messages: Liste von Nachrichten im Format [{"role": "user", "content": "Hallo"}]
        
        Optionale Parameter:
        - provider_id: ID des zu verwendenden KI-Providers
        - model_id: ID des zu verwendenden KI-Modells
        - model: Modell-Identifier (Alternative zu model_id)
        - max_tokens: Maximale Anzahl von Tokens in der Antwort
        - temperature: Kreativität der Antwort (0.0-1.0)
        - context_id: ID des Kontextgenerators
        - record_id: ID des Datensatzes für den Kontext
        
        Beispiel:
        {
            "messages": [
                {"role": "system", "content": "Du bist ein hilfreicher Assistent."},
                {"role": "user", "content": "Was ist das Wetter heute?"}
            ],
            "provider_id": 1,
            "model_id": 2,
            "max_tokens": 100,
            "temperature": 0.7
        }
        
        Rückgabe:
        {
            "success": true,
            "message": {"role": "assistant", "content": "Das Wetter heute ist..."},
            "usage": {
                "prompt_tokens": 20,
                "completion_tokens": 10,
                "total_tokens": 30
            }
        }
        """
        try:
            start_time = time.time()
            
            # Erforderliche Parameter validieren
            messages = kwargs.get('messages')
            if not messages or not isinstance(messages, list):
                return {'success': False, 'error': _('Eine gültige Liste von Nachrichten ist erforderlich.')}
            
            # Provider und Modell bestimmen (wie in generate_completion)
            provider_id = kwargs.get('provider_id')
            model_id = kwargs.get('model_id')
            
            # Wenn keine Provider-ID angegeben ist, Standard-Provider verwenden
            if not provider_id:
                default_provider_id = request.env['ir.config_parameter'].sudo().get_param('mcp.default_provider_id')
                if default_provider_id:
                    provider_id = int(default_provider_id)
                else:
                    # Ersten aktiven Provider suchen
                    provider = request.env['mcp.provider'].search([('is_active', '=', True)], limit=1)
                    if provider:
                        provider_id = provider.id
                    else:
                        return {'success': False, 'error': _('Kein aktiver KI-Provider gefunden.')}
            
            provider = request.env['mcp.provider'].browse(provider_id)
            if not provider.exists():
                return {'success': False, 'error': _('KI-Provider nicht gefunden.')}
            
            # Modell bestimmen
            model = None
            model_identifier = kwargs.get('model')
            
            if model_id:
                model = request.env['mcp.provider.model'].browse(model_id)
                if not model.exists() or model.provider_id.id != provider.id:
                    return {'success': False, 'error': _('KI-Modell nicht gefunden oder nicht mit dem Provider kompatibel.')}
            elif model_identifier:
                model = request.env['mcp.provider.model'].search([
                    ('provider_id', '=', provider.id),
                    ('model_identifier', '=', model_identifier),
                    ('is_active', '=', True)
                ], limit=1)
                if not model:
                    return {'success': False, 'error': _('KI-Modell mit Identifier "%s" nicht gefunden.') % model_identifier}
            else:
                # Standard-Modell des Providers verwenden
                model = provider.default_model_id
                if not model:
                    return {'success': False, 'error': _('Kein Standard-KI-Modell für den Provider definiert.')}
            
            # Kontext hinzufügen, falls erforderlich
            if kwargs.get('context_id'):
                context_id = kwargs.get('context_id')
                context_generator = request.env['mcp.context'].browse(int(context_id))
                if not context_generator.exists():
                    return {'success': False, 'error': _('Kontextgenerator nicht gefunden.')}
                
                record_id = kwargs.get('record_id')
                try:
                    context_data = context_generator.generate_context(record_id=record_id)
                    
                    # Kontext als System-Nachricht hinzufügen
                    context_json = json.dumps(context_data, indent=2)
                    context_message = {
                        "role": "system",
                        "content": f"Hier ist der Kontext für deine Antwort:\n{context_json}"
                    }
                    
                    # Am Anfang der Nachrichtenliste einfügen
                    has_system = any(m.get('role') == 'system' for m in messages)
                    if not has_system:
                        messages.insert(0, context_message)
                    else:
                        # System-Nachricht aktualisieren
                        for i, msg in enumerate(messages):
                            if msg.get('role') == 'system':
                                messages[i]['content'] = msg['content'] + "\n\n" + context_message['content']
                                break
                
                except Exception as e:
                    return {'success': False, 'error': f"Fehler bei der Kontextgenerierung: {str(e)}"}
            
            # Weitere Parameter extrahieren
            max_tokens = kwargs.get('max_tokens', 1000)
            temperature = kwargs.get('temperature', 0.7)
            
            # Connector für den Provider abrufen
            connector = provider._get_connector()
            
            # Chat-Completion generieren
            response = connector.generate_chat_completion(
                messages=messages,
                model=model.model_identifier,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            # Dauer berechnen
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Verwendung protokollieren
            prompt_text = "\n".join([f"{m.get('role', 'unknown')}: {m.get('content', '')}" for m in messages])
            log_entry = request.env['mcp.interaction.log'].log_interaction(
                request_type='chat',
                provider=provider,
                model=model,
                prompt=prompt_text,
                response=response.get('content', ''),
                token_count_prompt=response.get('usage', {}).get('prompt_tokens', 0),
                token_count_response=response.get('usage', {}).get('completion_tokens', 0),
                duration_ms=duration_ms,
                status='success',
                context_id=kwargs.get('context_id'),
                source_record_id=kwargs.get('record_id'),
                request_params=kwargs
            )
            
            # Erfolgreiche Antwort zurückgeben
            return {
                'success': True,
                'message': {
                    'role': 'assistant',
                    'content': response.get('content', '')
                },
                'usage': response.get('usage', {}),
                'log_id': log_entry.id
            }
        
        except Exception as e:
            _logger.exception("Fehler bei der Chat-Completion-Generierung")
            
            # Fehler protokollieren
            try:
                request.env['mcp.interaction.log'].log_interaction(
                    request_type='chat',
                    provider=provider if 'provider' in locals() else None,
                    model=model if 'model' in locals() else None,
                    prompt=str(kwargs.get('messages', [])),
                    response='',
                    duration_ms=int((time.time() - start_time) * 1000) if 'start_time' in locals() else 0,
                    status='error',
                    error_message=str(e),
                    request_params=kwargs
                )
            except Exception:
                pass
            
            return {'success': False, 'error': str(e)}
    
    @http.route('/api/mcp/v1/embeddings', type='json', auth='user')
    def generate_embeddings(self, **kwargs):
        """
        Erzeugt Einbettungsvektoren für die gegebenen Texte.
        
        Erforderliche Parameter:
        - texts: Ein einzelner Text oder eine Liste von Texten
        
        Optionale Parameter:
        - provider_id: ID des zu verwendenden KI-Providers
        - model_id: ID des zu verwendenden KI-Modells
        - model: Modell-Identifier (Alternative zu model_id)
        
        Beispiel:
        {
            "texts": ["Hallo Welt", "Wie geht es dir?"],
            "provider_id": 1,
            "model_id": 3
        }
        
        Rückgabe:
        {
            "success": true,
            "embeddings": [
                [0.1, 0.2, ...],
                [0.3, 0.4, ...]
            ],
            "dimensions": 1536
        }
        """
        try:
            start_time = time.time()
            
            # Erforderliche Parameter validieren
            texts = kwargs.get('texts')
            if not texts:
                return {'success': False, 'error': _('Texte sind erforderlich.')}
            
            # Einzelnen Text in Liste umwandeln
            if isinstance(texts, str):
                texts = [texts]
            
            # Provider und Modell bestimmen (wie in generate_completion)
            provider_id = kwargs.get('provider_id')
            model_id = kwargs.get('model_id')
            
            # Wenn keine Provider-ID angegeben ist, Standard-Provider verwenden
            if not provider_id:
                # Einen Provider suchen, der Einbettungen unterstützt
                providers = request.env['mcp.provider'].search([('is_active', '=', True)])
                for p in providers:
                    # Prüfen, ob der Provider Einbettungsmodelle hat
                    embedding_models = request.env['mcp.provider.model'].search([
                        ('provider_id', '=', p.id),
                        ('capabilities', '=', 'embeddings'),
                        ('is_active', '=', True)
                    ], limit=1)
                    
                    if embedding_models:
                        provider_id = p.id
                        if not model_id:
                            model_id = embedding_models[0].id
                        break
                
                if not provider_id:
                    return {'success': False, 'error': _('Kein KI-Provider mit Einbettungsfähigkeiten gefunden.')}
            
            provider = request.env['mcp.provider'].browse(provider_id)
            if not provider.exists():
                return {'success': False, 'error': _('KI-Provider nicht gefunden.')}
            
            # Modell bestimmen
            model = None
            model_identifier = kwargs.get('model')
            
            if model_id:
                model = request.env['mcp.provider.model'].browse(model_id)
                if not model.exists() or model.provider_id.id != provider.id:
                    return {'success': False, 'error': _('KI-Modell nicht gefunden oder nicht mit dem Provider kompatibel.')}
            elif model_identifier:
                model = request.env['mcp.provider.model'].search([
                    ('provider_id', '=', provider.id),
                    ('model_identifier', '=', model_identifier),
                    ('is_active', '=', True),
                    ('capabilities', '=', 'embeddings')
                ], limit=1)
                if not model:
                    return {'success': False, 'error': _('KI-Modell mit Identifier "%s" nicht gefunden.') % model_identifier}
            else:
                # Ein Einbettungsmodell des Providers suchen
                model = request.env['mcp.provider.model'].search([
                    ('provider_id', '=', provider.id),
                    ('capabilities', '=', 'embeddings'),
                    ('is_active', '=', True)
                ], limit=1)
                if not model:
                    return {'success': False, 'error': _('Kein Einbettungsmodell für den Provider gefunden.')}
            
            # Connector für den Provider abrufen
            connector = provider._get_connector()
            
            # Einbettungen generieren
            try:
                response = connector.generate_embeddings(texts=texts, model=model.model_identifier)
                embeddings = response.get('embeddings', [])
                
                # Dimensionen der Einbettungen ermitteln
                dimensions = len(embeddings[0]) if embeddings else 0
                
                # Dauer berechnen
                duration_ms = int((time.time() - start_time) * 1000)
                
                # Verwendung protokollieren
                prompt_text = "\n".join(texts[:5]) + ("..." if len(texts) > 5 else "")
                log_entry = request.env['mcp.interaction.log'].log_interaction(
                    request_type='embedding',
                    provider=provider,
                    model=model,
                    prompt=prompt_text,
                    response=f"Generated {len(embeddings)} embeddings with {dimensions} dimensions",
                    token_count_prompt=sum(len(t.split()) for t in texts) // 3,  # Grobe Schätzung
                    token_count_response=0,
                    duration_ms=duration_ms,
                    status='success',
                    request_params={'text_count': len(texts)}
                )
                
                # Erfolgreiche Antwort zurückgeben
                return {
                    'success': True,
                    'embeddings': embeddings,
                    'dimensions': dimensions,
                    'log_id': log_entry.id
                }
            
            except NotImplementedError:
                return {'success': False, 'error': _('Der ausgewählte Provider unterstützt keine Einbettungen.')}
        
        except Exception as e:
            _logger.exception("Fehler bei der Einbettungsgenerierung")
            
            # Fehler protokollieren
            try:
                request.env['mcp.interaction.log'].log_interaction(
                    request_type='embedding',
                    provider=provider if 'provider' in locals() else None,
                    model=model if 'model' in locals() else None,
                    prompt=str(kwargs.get('texts', [])),
                    response='',
                    duration_ms=int((time.time() - start_time) * 1000) if 'start_time' in locals() else 0,
                    status='error',
                    error_message=str(e),
                    request_params=kwargs
                )
            except Exception:
                pass
            
            return {'success': False, 'error': str(e)} 