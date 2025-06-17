# -*- coding: utf-8 -*-

import json
import logging
from .base_connector import BaseConnector

_logger = logging.getLogger(__name__)

try:
    import anthropic
    ANTHROPIC_IMPORTED = True
except ImportError:
    ANTHROPIC_IMPORTED = False
    _logger.warning("Anthropic Python SDK nicht gefunden. Installieren Sie es mit 'pip install anthropic'.")


class AnthropicConnector(BaseConnector):
    """
    Konnektor für die Anthropic Claude API.
    Implementiert die spezifische Logik für die Kommunikation mit Anthropic's Modellen.
    """
    
    def __init__(self, provider):
        """
        Initialisiert den Anthropic-Konnektor.
        
        :param provider: mcp.provider Recordset
        """
        super().__init__(provider)
        
        if not ANTHROPIC_IMPORTED:
            _logger.error("Anthropic Python SDK nicht installiert. Der Konnektor wird nicht funktionieren.")
            return
        
        self.client = anthropic.Anthropic(api_key=self.api_key)
    
    def test_connection(self):
        """
        Testet die Verbindung zur Anthropic API durch Abfrage der verfügbaren Modelle.
        
        :return: dict mit 'success' (bool) und optional 'error' (str)
        """
        if not ANTHROPIC_IMPORTED:
            return {'success': False, 'error': "Anthropic Python SDK nicht installiert."}
        
        try:
            # Einfache Anfrage, um die Verbindung zu testen
            response = self.generate_chat_completion(
                messages=[{"role": "user", "content": "Hallo"}],
                max_tokens=10
            )
            
            return {'success': True}
        
        except Exception as e:
            _logger.error(f"Fehler beim Testen der Anthropic-Verbindung: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def generate_completion(self, prompt, model=None, **kwargs):
        """
        Erzeugt eine Vervollständigung für den gegebenen Prompt.
        Bei Anthropic wird die Chat-API verwendet, da die reine Completion-API veraltet ist.
        
        :param prompt: Der Eingabetext
        :param model: Das zu verwendende Modell
        :param kwargs: Weitere Parameter für die API
        :return: dict mit der Antwort
        """
        # Bei Anthropic umleiten auf die Chat-API
        return self.generate_chat_completion(
            messages=[{"role": "user", "content": prompt}],
            model=model,
            **kwargs
        )
    
    def generate_chat_completion(self, messages, model=None, **kwargs):
        """
        Erzeugt eine Chat-Vervollständigung mit Claude.
        
        :param messages: Liste von Nachrichten im Format [{"role": "...", "content": "..."}]
        :param model: Das zu verwendende Modell
        :param kwargs: Weitere Parameter für die API
        :return: dict mit der Antwort
        """
        if not ANTHROPIC_IMPORTED:
            raise ImportError("Anthropic Python SDK nicht installiert.")
        
        # Standardmodell verwenden, wenn keines angegeben ist
        if not model:
            model = self._get_default_model('chat')
        
        # Parameter vorbereiten
        params = {
            "model": model,
            "messages": messages,
            **kwargs
        }
        
        # Max Tokens standardmäßig setzen, wenn nicht angegeben
        if "max_tokens" not in params:
            params["max_tokens"] = 1024
        
        try:
            response = self.client.messages.create(**params)
            
            return {
                'id': response.id,
                'model': response.model,
                'content': response.content[0].text if response.content else "",
                'usage': {
                    'prompt_tokens': response.usage.input_tokens,
                    'completion_tokens': response.usage.output_tokens,
                    'total_tokens': response.usage.input_tokens + response.usage.output_tokens
                },
                'raw_response': response
            }
        
        except Exception as e:
            _logger.error(f"Fehler bei der Anthropic API-Anfrage: {str(e)}")
            raise
    
    def generate_embeddings(self, texts, model=None):
        """
        Erzeugt Einbettungen für die gegebenen Texte.
        Hinweis: Anthropic bietet derzeit keine offizielle Embeddings-API an,
        daher wird eine Fehlermeldung zurückgegeben.
        
        :param texts: Eine Liste von Texten oder ein einzelner Text
        :param model: Das zu verwendende Einbettungsmodell
        :return: Liste von Einbettungsvektoren
        """
        raise NotImplementedError(
            "Anthropic bietet derzeit keine offizielle Embeddings-API an. "
            "Bitte verwenden Sie einen anderen Provider für Einbettungen."
        )
    
    def _add_auth_headers(self, headers):
        """
        Fügt Anthropic-spezifische Authentifizierungsheader hinzu.
        
        :param headers: Dict mit HTTP-Headern
        """
        headers['X-Api-Key'] = self.api_key
        headers['anthropic-version'] = '2023-06-01'  # Aktuelle API-Version
    
    def _get_fallback_model(self, capability):
        """
        Gibt ein Fallback-Modell für die angegebene Fähigkeit zurück.
        
        :param capability: Die erforderliche Fähigkeit
        :return: Model-ID als String
        """
        if capability in ('chat', 'completion'):
            return 'claude-3-sonnet-20240229'
        else:
            raise ValueError(f"Anthropic unterstützt die Fähigkeit '{capability}' nicht") 