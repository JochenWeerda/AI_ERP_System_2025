# -*- coding: utf-8 -*-

import json
import logging
import requests
from abc import ABC, abstractmethod

_logger = logging.getLogger(__name__)


class BaseConnector(ABC):
    """
    Abstrakte Basisklasse für alle KI-Provider-Konnektoren.
    Definiert die gemeinsame Schnittstelle und grundlegende Funktionalität.
    """
    
    def __init__(self, provider):
        """
        Initialisiert den Konnektor mit dem Provider-Datensatz.
        
        :param provider: mcp.provider Recordset
        """
        self.provider = provider
        self.api_endpoint = provider.api_endpoint
        self.api_key = provider.api_key
        self.timeout = provider.timeout
        self.retry_count = provider.retry_count
    
    @abstractmethod
    def test_connection(self):
        """
        Testet die Verbindung zum KI-Provider.
        
        :return: dict mit 'success' (bool) und optional 'error' (str)
        """
        pass
    
    @abstractmethod
    def generate_completion(self, prompt, model=None, **kwargs):
        """
        Erzeugt eine Vervollständigung für den gegebenen Prompt.
        
        :param prompt: Der Eingabetext
        :param model: Das zu verwendende Modell (falls nicht angegeben, wird das Standard-Modell verwendet)
        :param kwargs: Weitere modellspezifische Parameter
        :return: dict mit der Antwort
        """
        pass
    
    @abstractmethod
    def generate_chat_completion(self, messages, model=None, **kwargs):
        """
        Erzeugt eine Chat-Vervollständigung für die gegebenen Nachrichten.
        
        :param messages: Liste von Nachrichten im Format [{"role": "...", "content": "..."}]
        :param model: Das zu verwendende Modell
        :param kwargs: Weitere modellspezifische Parameter
        :return: dict mit der Antwort
        """
        pass
    
    @abstractmethod
    def generate_embeddings(self, texts, model=None):
        """
        Erzeugt Einbettungen für die gegebenen Texte.
        
        :param texts: Eine Liste von Texten oder ein einzelner Text
        :param model: Das zu verwendende Einbettungsmodell
        :return: Liste von Einbettungsvektoren
        """
        pass
    
    def _make_request(self, method, endpoint, data=None, headers=None, params=None):
        """
        Führt eine HTTP-Anfrage mit Wiederholungslogik aus.
        
        :param method: HTTP-Methode ('GET', 'POST', etc.)
        :param endpoint: API-Endpunkt (wird an die Basis-URL angehängt)
        :param data: Zu sendende Daten (für POST, PUT)
        :param headers: HTTP-Header
        :param params: URL-Parameter
        :return: Response-Objekt
        """
        url = f"{self.api_endpoint.rstrip('/')}/{endpoint.lstrip('/')}"
        
        if headers is None:
            headers = {}
        
        # Standardmäßig JSON für POST-Anfragen
        if method.upper() in ('POST', 'PUT') and isinstance(data, (dict, list)):
            headers.setdefault('Content-Type', 'application/json')
            data = json.dumps(data)
        
        # Authentifizierung hinzufügen
        self._add_auth_headers(headers)
        
        # Anfrage mit Wiederholungslogik durchführen
        for attempt in range(self.retry_count + 1):
            try:
                response = requests.request(
                    method=method,
                    url=url,
                    headers=headers,
                    data=data,
                    params=params,
                    timeout=self.timeout
                )
                
                # Fehler bei HTTP-Statuscodes >= 400 auslösen
                response.raise_for_status()
                
                return response
            
            except requests.RequestException as e:
                _logger.warning(f"API-Anfrage fehlgeschlagen (Versuch {attempt+1}/{self.retry_count+1}): {str(e)}")
                
                # Wenn dies der letzte Versuch war, den Fehler weitergeben
                if attempt == self.retry_count:
                    raise
                
                # Exponentielles Backoff könnte hier implementiert werden
    
    def _add_auth_headers(self, headers):
        """
        Fügt Authentifizierungsheader hinzu. Wird von abgeleiteten Klassen überschrieben.
        
        :param headers: Dict mit HTTP-Headern
        """
        # Standardimplementierung verwendet Bearer-Token-Authentifizierung
        headers['Authorization'] = f"Bearer {self.api_key}"
    
    def _get_default_model(self, capability='chat'):
        """
        Gibt die ID des Standardmodells für die angegebene Fähigkeit zurück.
        
        :param capability: Die erforderliche Fähigkeit ('chat', 'completion', 'embeddings', etc.)
        :return: Model-ID als String
        """
        if self.provider.default_model_id:
            return self.provider.default_model_id.model_identifier
        
        # Suche nach einem aktiven Modell mit der angegebenen Fähigkeit
        model = self.provider.model_ids.filtered(
            lambda m: m.is_active and m.capabilities == capability
        )
        
        if model:
            return model[0].model_identifier
        
        # Fallback: Provider-spezifisches Standardmodell (wird in abgeleiteten Klassen definiert)
        return self._get_fallback_model(capability)
    
    @abstractmethod
    def _get_fallback_model(self, capability):
        """
        Gibt ein Fallback-Modell für die angegebene Fähigkeit zurück.
        Wird von abgeleiteten Klassen implementiert.
        
        :param capability: Die erforderliche Fähigkeit
        :return: Model-ID als String
        """
        pass 