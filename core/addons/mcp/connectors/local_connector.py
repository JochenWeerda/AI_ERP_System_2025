# -*- coding: utf-8 -*-

import json
import logging
import requests
from .base_connector import BaseConnector

_logger = logging.getLogger(__name__)

try:
    import onnxruntime as ort
    ONNX_IMPORTED = True
except ImportError:
    ONNX_IMPORTED = False
    _logger.warning("ONNX Runtime nicht gefunden. Installieren Sie es mit 'pip install onnxruntime'.")


class LocalConnector(BaseConnector):
    """
    Konnektor für lokal gehostete KI-Modelle.
    Unterstützt Anbindung an lokale Modellserver wie Ollama oder lokale ONNX-Modelle.
    """
    
    def __init__(self, provider):
        """
        Initialisiert den Konnektor für lokale Modelle.
        
        :param provider: mcp.provider Recordset
        """
        super().__init__(provider)
        
        # Lokale Server-Typ aus dem API-Endpunkt bestimmen
        self.server_type = self._detect_server_type()
        _logger.info(f"Lokaler KI-Server erkannt: {self.server_type}")
    
    def _detect_server_type(self):
        """
        Erkennt den Typ des lokalen Servers anhand des API-Endpunkts.
        
        :return: Server-Typ als String ('ollama', 'onnx', 'llama-cpp', 'unknown')
        """
        endpoint = self.api_endpoint.lower()
        
        if 'ollama' in endpoint:
            return 'ollama'
        elif 'onnx' in endpoint:
            return 'onnx'
        elif 'llama' in endpoint:
            return 'llama-cpp'
        else:
            return 'unknown'
    
    def test_connection(self):
        """
        Testet die Verbindung zum lokalen KI-Server.
        
        :return: dict mit 'success' (bool) und optional 'error' (str)
        """
        if self.server_type == 'onnx' and not ONNX_IMPORTED:
            return {'success': False, 'error': "ONNX Runtime nicht installiert."}
        
        try:
            if self.server_type == 'ollama':
                # Bei Ollama die API testen
                response = requests.get(f"{self.api_endpoint}/api/tags", timeout=self.timeout)
                response.raise_for_status()
                return {'success': True}
            elif self.server_type == 'onnx':
                # ONNX Runtime-Session erstellen (temporär)
                if ONNX_IMPORTED:
                    # Pfad aus dem API-Endpunkt extrahieren
                    model_path = self.api_endpoint.replace('onnx://', '')
                    try:
                        sess = ort.InferenceSession(model_path)
                        return {'success': True}
                    except Exception as e:
                        return {'success': False, 'error': f"ONNX-Modellfehler: {str(e)}"}
                else:
                    return {'success': False, 'error': "ONNX Runtime nicht installiert."}
            else:
                # Generischer Verbindungstest mit einfacher Anfrage
                try:
                    self.generate_completion("Test", max_tokens=5)
                    return {'success': True}
                except Exception as e:
                    return {'success': False, 'error': str(e)}
        
        except Exception as e:
            _logger.error(f"Fehler beim Testen der lokalen Verbindung: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def generate_completion(self, prompt, model=None, **kwargs):
        """
        Erzeugt eine Vervollständigung mit dem lokalen Modell.
        
        :param prompt: Der Eingabetext
        :param model: Das zu verwendende Modell
        :param kwargs: Weitere Parameter für die API
        :return: dict mit der Antwort
        """
        if self.server_type == 'ollama':
            return self._ollama_completion(prompt, model, **kwargs)
        else:
            # Für unbekannte Server als Chat-Completion umleiten
            return self.generate_chat_completion(
                messages=[{"role": "user", "content": prompt}],
                model=model,
                **kwargs
            )
    
    def generate_chat_completion(self, messages, model=None, **kwargs):
        """
        Erzeugt eine Chat-Vervollständigung mit dem lokalen Modell.
        
        :param messages: Liste von Nachrichten im Format [{"role": "...", "content": "..."}]
        :param model: Das zu verwendende Modell
        :param kwargs: Weitere Parameter für die API
        :return: dict mit der Antwort
        """
        if self.server_type == 'ollama':
            return self._ollama_chat_completion(messages, model, **kwargs)
        else:
            # Generische Implementierung für andere Server-Typen
            try:
                # Standardmodell verwenden, wenn keines angegeben ist
                if not model:
                    model = self._get_default_model('chat')
                
                # Parameter vorbereiten
                max_tokens = kwargs.get('max_tokens', 1024)
                temperature = kwargs.get('temperature', 0.7)
                
                # Nachrichten in einen Text umwandeln (für einfachere Modelle)
                prompt = "\n".join([f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in messages])
                
                # POST-Anfrage an den generischen API-Endpunkt senden
                payload = {
                    "prompt": prompt,
                    "model": model,
                    "max_tokens": max_tokens,
                    "temperature": temperature
                }
                
                response = requests.post(
                    f"{self.api_endpoint}/v1/completions",
                    json=payload,
                    timeout=self.timeout
                )
                response.raise_for_status()
                result = response.json()
                
                # Standardformat zurückgeben
                return {
                    'id': result.get('id', 'local-completion'),
                    'model': model,
                    'content': result.get('choices', [{}])[0].get('text', ''),
                    'usage': result.get('usage', {
                        'prompt_tokens': len(prompt.split()),
                        'completion_tokens': len(result.get('choices', [{}])[0].get('text', '').split()),
                        'total_tokens': len(prompt.split()) + len(result.get('choices', [{}])[0].get('text', '').split())
                    }),
                    'raw_response': result
                }
            
            except Exception as e:
                _logger.error(f"Fehler bei der lokalen Chat-Completion: {str(e)}")
                raise
    
    def _ollama_completion(self, prompt, model=None, **kwargs):
        """
        Erzeugt eine Vervollständigung mit Ollama.
        
        :param prompt: Der Eingabetext
        :param model: Das zu verwendende Modell
        :param kwargs: Weitere Parameter für die API
        :return: dict mit der Antwort
        """
        # Standardmodell verwenden, wenn keines angegeben ist
        if not model:
            model = self._get_default_model('completion')
        
        # Parameter vorbereiten
        max_tokens = kwargs.get('max_tokens', 1024)
        temperature = kwargs.get('temperature', 0.7)
        
        try:
            # Ollama API-Anfrage
            payload = {
                "model": model,
                "prompt": prompt,
                "options": {
                    "num_predict": max_tokens,
                    "temperature": temperature
                }
            }
            
            response = requests.post(
                f"{self.api_endpoint}/api/generate",
                json=payload,
                timeout=self.timeout
            )
            response.raise_for_status()
            result = response.json()
            
            # Antwort formatieren
            return {
                'id': 'ollama-completion',
                'model': model,
                'content': result.get('response', ''),
                'usage': {
                    'prompt_tokens': result.get('prompt_eval_count', 0),
                    'completion_tokens': result.get('eval_count', 0),
                    'total_tokens': result.get('prompt_eval_count', 0) + result.get('eval_count', 0)
                },
                'raw_response': result
            }
        
        except Exception as e:
            _logger.error(f"Fehler bei der Ollama-Completion: {str(e)}")
            raise
    
    def _ollama_chat_completion(self, messages, model=None, **kwargs):
        """
        Erzeugt eine Chat-Vervollständigung mit Ollama.
        
        :param messages: Liste von Nachrichten
        :param model: Das zu verwendende Modell
        :param kwargs: Weitere Parameter für die API
        :return: dict mit der Antwort
        """
        # Standardmodell verwenden, wenn keines angegeben ist
        if not model:
            model = self._get_default_model('chat')
        
        # Parameter vorbereiten
        temperature = kwargs.get('temperature', 0.7)
        
        try:
            # Ollama API-Anfrage
            payload = {
                "model": model,
                "messages": messages,
                "options": {
                    "temperature": temperature
                }
            }
            
            response = requests.post(
                f"{self.api_endpoint}/api/chat",
                json=payload,
                timeout=self.timeout
            )
            response.raise_for_status()
            result = response.json()
            
            # Antwort formatieren
            content = ""
            if 'message' in result:
                content = result['message'].get('content', '')
            
            return {
                'id': 'ollama-chat',
                'model': model,
                'content': content,
                'usage': {
                    'prompt_tokens': result.get('prompt_eval_count', 0),
                    'completion_tokens': result.get('eval_count', 0),
                    'total_tokens': result.get('prompt_eval_count', 0) + result.get('eval_count', 0)
                },
                'raw_response': result
            }
        
        except Exception as e:
            _logger.error(f"Fehler bei der Ollama-Chat-Completion: {str(e)}")
            raise
    
    def generate_embeddings(self, texts, model=None):
        """
        Erzeugt Einbettungen für die gegebenen Texte mit dem lokalen Modell.
        
        :param texts: Eine Liste von Texten oder ein einzelner Text
        :param model: Das zu verwendende Einbettungsmodell
        :return: dict mit Einbettungsvektoren
        """
        # Standardmodell verwenden, wenn keines angegeben ist
        if not model:
            model = self._get_default_model('embeddings')
        
        # Eingabe normalisieren
        if isinstance(texts, str):
            input_texts = [texts]
        else:
            input_texts = texts
        
        if self.server_type == 'ollama':
            try:
                # Einbettungen für jeden Text abrufen
                embeddings = []
                total_tokens = 0
                
                for text in input_texts:
                    payload = {
                        "model": model,
                        "prompt": text
                    }
                    
                    response = requests.post(
                        f"{self.api_endpoint}/api/embeddings",
                        json=payload,
                        timeout=self.timeout
                    )
                    response.raise_for_status()
                    result = response.json()
                    
                    embeddings.append(result.get('embedding', []))
                    total_tokens += len(text.split())
                
                return {
                    'embeddings': embeddings,
                    'model': model,
                    'usage': {
                        'prompt_tokens': total_tokens,
                        'total_tokens': total_tokens
                    }
                }
            
            except Exception as e:
                _logger.error(f"Fehler bei der Ollama-Einbettungsgenerierung: {str(e)}")
                raise
        else:
            # Für andere lokale Server
            raise NotImplementedError(
                f"Einbettungen werden derzeit für den Server-Typ '{self.server_type}' nicht unterstützt. "
                "Bitte verwenden Sie Ollama oder einen anderen Provider für Einbettungen."
            )
    
    def _add_auth_headers(self, headers):
        """
        Fügt Authentifizierungsheader für lokale Server hinzu.
        
        :param headers: Dict mit HTTP-Headern
        """
        # Die meisten lokalen Server benötigen keine Authentifizierung
        # Bei Bedarf API-Schlüssel hinzufügen
        if self.api_key:
            headers['Authorization'] = f"Bearer {self.api_key}"
    
    def _get_fallback_model(self, capability):
        """
        Gibt ein Fallback-Modell für die angegebene Fähigkeit zurück.
        
        :param capability: Die erforderliche Fähigkeit
        :return: Model-ID als String
        """
        if self.server_type == 'ollama':
            if capability in ('chat', 'completion'):
                return 'llama2'
            elif capability == 'embeddings':
                return 'nomic-embed-text'
            else:
                raise ValueError(f"Unbekannte Fähigkeit für Ollama: '{capability}'")
        else:
            # Generische Fallback-Modelle für andere Server
            if capability in ('chat', 'completion'):
                return 'local-model'
            elif capability == 'embeddings':
                return 'local-embedding-model'
            else:
                raise ValueError(f"Unbekannte Fähigkeit für lokalen Server: '{capability}'") 