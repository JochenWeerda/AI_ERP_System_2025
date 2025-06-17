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


class AzureOpenAIConnector(BaseConnector):
    """
    Konnektor für Azure OpenAI Services.
    Implementiert die spezifische Logik für die Kommunikation mit Azure-gehosteten OpenAI-Modellen.
    """
    
    def __init__(self, provider):
        """
        Initialisiert den Azure OpenAI-Konnektor.
        
        :param provider: mcp.provider Recordset
        """
        super().__init__(provider)
        
        if not OPENAI_IMPORTED:
            _logger.error("OpenAI Python SDK nicht installiert. Der Konnektor wird nicht funktionieren.")
            return
        
        # Zusätzliche Konfiguration aus der Provider-Konfiguration extrahieren
        self.azure_deployment = self._extract_azure_config().get('deployment_id', '')
        self.azure_resource = self._extract_azure_config().get('resource_name', '')
        self.api_version = self._extract_azure_config().get('api_version', '2023-05-15')
        
        # Azure OpenAI Client konfigurieren
        self.client = openai.AzureOpenAI(
            azure_endpoint=self._get_azure_endpoint(),
            api_key=self.api_key,
            api_version=self.api_version
        )
    
    def _extract_azure_config(self):
        """
        Extrahiert Azure-spezifische Konfiguration aus dem API-Endpunkt.
        
        Erwartet eine URL im Format:
        https://{resource_name}.openai.azure.com/openai/deployments/{deployment_id}
        
        :return: Dict mit Azure-Konfiguration
        """
        config = {
            'resource_name': '',
            'deployment_id': '',
            'api_version': '2023-05-15'
        }
        
        # Prüfen, ob der API-Endpunkt dem erwarteten Format entspricht
        if not self.api_endpoint or '{resource_name}' in self.api_endpoint:
            return config
        
        try:
            # Resourcename extrahieren
            if 'https://' in self.api_endpoint and '.openai.azure.com' in self.api_endpoint:
                # Format: https://{resource_name}.openai.azure.com/...
                resource_part = self.api_endpoint.split('https://')[1].split('.openai.azure.com')[0]
                config['resource_name'] = resource_part
            
            # Deployment-ID extrahieren
            if '/deployments/' in self.api_endpoint:
                # Format: .../deployments/{deployment_id}
                deployment_part = self.api_endpoint.split('/deployments/')[1].split('/')[0]
                config['deployment_id'] = deployment_part
        
        except Exception as e:
            _logger.error(f"Fehler beim Extrahieren der Azure-Konfiguration: {str(e)}")
        
        return config
    
    def _get_azure_endpoint(self):
        """
        Generiert den Azure-Endpunkt basierend auf dem Resourcenamen.
        
        :return: Azure-Endpunkt-URL
        """
        if self.azure_resource:
            return f"https://{self.azure_resource}.openai.azure.com"
        return self.api_endpoint
    
    def test_connection(self):
        """
        Testet die Verbindung zu Azure OpenAI durch Abfrage der verfügbaren Deployments.
        
        :return: dict mit 'success' (bool) und optional 'error' (str)
        """
        if not OPENAI_IMPORTED:
            return {'success': False, 'error': "OpenAI Python SDK nicht installiert."}
        
        if not self.azure_deployment:
            return {'success': False, 'error': "Azure Deployment-ID fehlt. Bitte konfigurieren Sie den API-Endpunkt korrekt."}
        
        try:
            # Eine einfache Testanfrage durchführen
            response = self.generate_chat_completion(
                messages=[{"role": "user", "content": "Hallo"}],
                max_tokens=10
            )
            
            return {'success': True}
        
        except Exception as e:
            _logger.error(f"Fehler beim Testen der Azure OpenAI-Verbindung: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def generate_completion(self, prompt, model=None, **kwargs):
        """
        Erzeugt eine Vervollständigung für den gegebenen Prompt.
        Azure OpenAI verwendet standardmäßig die Chat API, daher leiten wir um.
        
        :param prompt: Der Eingabetext
        :param model: Das zu verwendende Modell (wird in Azure als Deployment behandelt)
        :param kwargs: Weitere Parameter für die API
        :return: dict mit der Antwort
        """
        # Bei Azure OpenAI die Chat-API verwenden
        return self.generate_chat_completion(
            messages=[{"role": "user", "content": prompt}],
            model=model,
            **kwargs
        )
    
    def generate_chat_completion(self, messages, model=None, **kwargs):
        """
        Erzeugt eine Chat-Vervollständigung mit Azure OpenAI.
        
        :param messages: Liste von Nachrichten im Format [{"role": "...", "content": "..."}]
        :param model: Das zu verwendende Modell (wird in Azure als Deployment behandelt)
        :param kwargs: Weitere Parameter für die API
        :return: dict mit der Antwort
        """
        if not OPENAI_IMPORTED:
            raise ImportError("OpenAI Python SDK nicht installiert.")
        
        # Deployment-ID aus model oder aus Konfiguration verwenden
        deployment_id = model or self.azure_deployment or self._get_default_model('chat')
        
        # Parameter vorbereiten
        params = {
            "messages": messages,
            **kwargs
        }
        
        # Max Tokens standardmäßig setzen, wenn nicht angegeben
        if "max_tokens" not in params:
            params["max_tokens"] = 1024
        
        try:
            response = self.client.chat.completions.create(
                deployment_id=deployment_id,
                **params
            )
            
            content = ""
            if response.choices and len(response.choices) > 0:
                content = response.choices[0].message.content or ""
            
            return {
                'id': response.id,
                'model': deployment_id,  # Azure gibt nicht das tatsächliche Modell zurück
                'content': content,
                'usage': {
                    'prompt_tokens': response.usage.prompt_tokens,
                    'completion_tokens': response.usage.completion_tokens,
                    'total_tokens': response.usage.total_tokens
                },
                'raw_response': response
            }
        
        except Exception as e:
            _logger.error(f"Fehler bei der Azure OpenAI API-Anfrage: {str(e)}")
            raise
    
    def generate_embeddings(self, texts, model=None):
        """
        Erzeugt Einbettungen für die gegebenen Texte mit Azure OpenAI.
        
        :param texts: Eine Liste von Texten oder ein einzelner Text
        :param model: Das zu verwendende Modell (wird in Azure als Deployment behandelt)
        :return: dict mit Einbettungsvektoren
        """
        if not OPENAI_IMPORTED:
            raise ImportError("OpenAI Python SDK nicht installiert.")
        
        # Deployment-ID aus model oder aus Konfiguration verwenden
        deployment_id = model or self.azure_deployment or self._get_default_model('embeddings')
        
        # Eingabe normalisieren
        if isinstance(texts, str):
            input_texts = [texts]
        else:
            input_texts = texts
        
        try:
            response = self.client.embeddings.create(
                input=input_texts,
                deployment_id=deployment_id
            )
            
            # Einbettungen extrahieren
            embeddings = [item.embedding for item in response.data]
            
            return {
                'embeddings': embeddings,
                'model': deployment_id,
                'usage': {
                    'prompt_tokens': response.usage.prompt_tokens,
                    'total_tokens': response.usage.total_tokens
                }
            }
        
        except Exception as e:
            _logger.error(f"Fehler bei der Azure OpenAI Embeddings-Anfrage: {str(e)}")
            raise
    
    def _add_auth_headers(self, headers):
        """
        Fügt Azure OpenAI-spezifische Authentifizierungsheader hinzu.
        
        :param headers: Dict mit HTTP-Headern
        """
        # Azure verwendet einen API-Schlüssel statt Bearer-Token
        headers['api-key'] = self.api_key
    
    def _get_fallback_model(self, capability):
        """
        Gibt ein Fallback-Modell für die angegebene Fähigkeit zurück.
        Bei Azure OpenAI ist dies in der Regel die Deployment-ID.
        
        :param capability: Die erforderliche Fähigkeit
        :return: Deployment-ID als String
        """
        # In Azure OpenAI sollte immer eine spezifische Deployment-ID verwendet werden
        if self.azure_deployment:
            return self.azure_deployment
        
        # Fallback für verschiedene Fähigkeiten
        if capability in ('chat', 'completion'):
            return 'gpt-35-turbo'  # Typische Deployment-ID für GPT-3.5 in Azure
        elif capability == 'embeddings':
            return 'text-embedding-ada-002'  # Typische Deployment-ID für Einbettungen
        else:
            raise ValueError(f"Azure OpenAI unterstützt die Fähigkeit '{capability}' nicht oder es wurde keine Deployment-ID konfiguriert") 