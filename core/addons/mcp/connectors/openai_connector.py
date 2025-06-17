# -*- coding: utf-8 -*-

import json
import logging
from .base_connector import BaseConnector

_logger = logging.getLogger(__name__)

try:
    import openai
    OPENAI_IMPORTED = True
except ImportError:
    OPENAI_IMPORTED = False
    _logger.warning("OpenAI Python SDK nicht gefunden. Installieren Sie es mit 'pip install openai'.")


class OpenAIConnector(BaseConnector):
    """
    Konnektor für die OpenAI API.
    Implementiert die spezifische Logik für die Kommunikation mit OpenAI-Modellen.
    """
    
    def __init__(self, provider):
        """
        Initialisiert den OpenAI-Konnektor.
        
        :param provider: mcp.provider Recordset
        """
        super().__init__(provider)
        
        if not OPENAI_IMPORTED:
            _logger.error("OpenAI Python SDK nicht installiert. Der Konnektor wird nicht funktionieren.")
            return
        
        self.client = openai.OpenAI(api_key=self.api_key)
    
    def test_connection(self):
        """
        Testet die Verbindung zur OpenAI API durch Abfrage der verfügbaren Modelle.
        
        :return: dict mit 'success' (bool) und optional 'error' (str)
        """
        if not OPENAI_IMPORTED:
            return {'success': False, 'error': "OpenAI Python SDK nicht installiert."}
        
        try:
            # Modelle abfragen, um die Verbindung zu testen
            models = self.client.models.list()
            
            return {'success': True}
        
        except Exception as e:
            _logger.error(f"Fehler beim Testen der OpenAI-Verbindung: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def generate_completion(self, prompt, model=None, **kwargs):
        """
        Erzeugt eine Vervollständigung für den gegebenen Prompt.
        OpenAI hat die Completion API zugunsten der Chat API abgekündigt, daher leiten wir um.
        
        :param prompt: Der Eingabetext
        :param model: Das zu verwendende Modell
        :param kwargs: Weitere Parameter für die API
        :return: dict mit der Antwort
        """
        # Bei neueren OpenAI-Modellen die Chat-API verwenden
        return self.generate_chat_completion(
            messages=[{"role": "user", "content": prompt}],
            model=model,
            **kwargs
        )
    
    def generate_chat_completion(self, messages, model=None, **kwargs):
        """
        Erzeugt eine Chat-Vervollständigung mit OpenAI.
        
        :param messages: Liste von Nachrichten im Format [{"role": "...", "content": "..."}]
        :param model: Das zu verwendende Modell
        :param kwargs: Weitere Parameter für die API
        :return: dict mit der Antwort
        """
        if not OPENAI_IMPORTED:
            raise ImportError("OpenAI Python SDK nicht installiert.")
        
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
            response = self.client.chat.completions.create(**params)
            
            content = ""
            if response.choices and len(response.choices) > 0:
                content = response.choices[0].message.content or ""
            
            return {
                'id': response.id,
                'model': response.model,
                'content': content,
                'usage': {
                    'prompt_tokens': response.usage.prompt_tokens,
                    'completion_tokens': response.usage.completion_tokens,
                    'total_tokens': response.usage.total_tokens
                },
                'raw_response': response
            }
        
        except Exception as e:
            _logger.error(f"Fehler bei der OpenAI API-Anfrage: {str(e)}")
            raise
    
    def generate_embeddings(self, texts, model=None):
        """
        Erzeugt Einbettungen für die gegebenen Texte.
        
        :param texts: Eine Liste von Texten oder ein einzelner Text
        :param model: Das zu verwendende Einbettungsmodell
        :return: dict mit Einbettungsvektoren
        """
        if not OPENAI_IMPORTED:
            raise ImportError("OpenAI Python SDK nicht installiert.")
        
        # Standardmodell verwenden, wenn keines angegeben ist
        if not model:
            model = self._get_default_model('embeddings')
        
        # Eingabe normalisieren
        if isinstance(texts, str):
            input_texts = [texts]
        else:
            input_texts = texts
        
        try:
            response = self.client.embeddings.create(
                input=input_texts,
                model=model
            )
            
            # Einbettungen extrahieren
            embeddings = [item.embedding for item in response.data]
            
            return {
                'embeddings': embeddings,
                'model': response.model,
                'usage': {
                    'prompt_tokens': response.usage.prompt_tokens,
                    'total_tokens': response.usage.total_tokens
                }
            }
        
        except Exception as e:
            _logger.error(f"Fehler bei der OpenAI Embeddings-Anfrage: {str(e)}")
            raise
    
    def _add_auth_headers(self, headers):
        """
        Fügt OpenAI-spezifische Authentifizierungsheader hinzu.
        
        :param headers: Dict mit HTTP-Headern
        """
        # Standard-Bearer-Authentifizierung, wie in der Basisklasse definiert
        super()._add_auth_headers(headers)
    
    def _get_fallback_model(self, capability):
        """
        Gibt ein Fallback-Modell für die angegebene Fähigkeit zurück.
        
        :param capability: Die erforderliche Fähigkeit
        :return: Model-ID als String
        """
        if capability == 'chat' or capability == 'completion':
            return 'gpt-3.5-turbo'
        elif capability == 'embeddings':
            return 'text-embedding-ada-002'
        else:
            raise ValueError(f"Unbekannte Fähigkeit: '{capability}'") 