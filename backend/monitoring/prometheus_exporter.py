"""
Prometheus-Exporter für Datenbankperformance-Metriken.

Dieses Modul stellt Funktionen zur Integration mit Prometheus bereit,
um Datenbankperformance-Metriken zu exportieren und zu überwachen.
"""

import time
import logging
from fastapi import Request, Response
from typing import Callable, Awaitable
from prometheus_client import Counter, Histogram, Gauge, Summary
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

# Logger konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Prometheus-Metriken definieren
QUERY_COUNT = Counter(
    'erp_db_query_count',
    'Anzahl der Datenbankabfragen',
    ['query_name', 'endpoint']
)

QUERY_DURATION = Histogram(
    'erp_db_query_duration_seconds',
    'Dauer der Datenbankabfragen',
    ['query_name', 'endpoint'],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0)
)

SLOW_QUERIES = Counter(
    'erp_db_slow_query_count',
    'Anzahl der langsamen Datenbankabfragen (>0.5s)',
    ['query_name', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'erp_db_active_connections',
    'Anzahl aktiver Datenbankverbindungen'
)

REQUEST_LATENCY = Summary(
    'erp_request_latency_seconds',
    'Latenz der HTTP-Anfragen',
    ['method', 'endpoint']
)

REQUEST_COUNT = Counter(
    'erp_request_count',
    'Anzahl der HTTP-Anfragen',
    ['method', 'endpoint', 'status']
)

# Setze initiale Werte
ACTIVE_CONNECTIONS.set(0)

class PrometheusMiddleware:
    """Middleware zum Erfassen von Performance-Metriken für Prometheus."""
    
    def __init__(
        self,
        app,
        skip_paths: list = None
    ):
        """
        Initialisiert die Prometheus-Middleware.
        
        Args:
            app: FastAPI-App
            skip_paths: Liste von Pfaden, die übersprungen werden sollen (z.B. /metrics)
        """
        self.app = app
        self.skip_paths = skip_paths or ["/metrics", "/health", "/favicon.ico"]
    
    async def __call__(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]):
        """
        Verarbeitet eine HTTP-Anfrage und erfasst Performance-Metriken.
        
        Args:
            request: FastAPI-Request
            call_next: Callback für die nächste Middleware
            
        Returns:
            Response: Die Antwort der Anwendung
        """
        path = request.url.path
        method = request.method
        
        # Überspringe bestimmte Pfade
        if path in self.skip_paths:
            return await call_next(request)
        
        # Endpoint für Metriken-Labels extrahieren
        endpoint = path.strip("/").replace("/", "_") or "root"
        if len(endpoint) > 50:  # Begrenze die Länge, um zu viele Metriken zu vermeiden
            endpoint = endpoint[:50] + "..."
        
        # Anfragedauer messen
        start_time = time.time()
        
        # Anfrage verarbeiten
        response = await call_next(request)
        
        # Dauer berechnen
        duration = time.time() - start_time
        
        # Metriken erfassen
        status = response.status_code
        REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(duration)
        REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status).inc()
        
        return response

def record_query_metrics(query_name: str, duration: float, endpoint: str = "unknown"):
    """
    Zeichnet Metriken für eine Datenbankabfrage auf.
    
    Args:
        query_name: Name der Abfrage
        duration: Dauer der Abfrage in Sekunden
        endpoint: API-Endpunkt, der die Abfrage ausgelöst hat
    """
    QUERY_COUNT.labels(query_name=query_name, endpoint=endpoint).inc()
    QUERY_DURATION.labels(query_name=query_name, endpoint=endpoint).observe(duration)
    
    # Slow Query-Metrik erfassen
    if duration > 0.5:  # Schwellwert für langsame Abfragen: 500ms
        SLOW_QUERIES.labels(query_name=query_name, endpoint=endpoint).inc()

def update_connection_count(count: int):
    """
    Aktualisiert die Anzahl der aktiven Datenbankverbindungen.
    
    Args:
        count: Anzahl der aktiven Verbindungen
    """
    ACTIVE_CONNECTIONS.set(count)

def init_app(app):
    """
    Initialisiert die Prometheus-Integration für eine FastAPI-App.
    
    Args:
        app: FastAPI-App
    """
    # Middleware hinzufügen
    app.add_middleware(PrometheusMiddleware)
    
    # Metrics-Endpunkt hinzufügen
    @app.get("/metrics")
    async def metrics():
        """Prometheus-Metriken-Endpunkt."""
        return Response(
            content=generate_latest(),
            media_type=CONTENT_TYPE_LATEST
        )
    
    logger.info("Prometheus-Integration erfolgreich initialisiert")

def create_db_metrics_decorator(endpoint: str = "unknown"):
    """
    Erstellt einen Decorator zum Erfassen von Datenbankabfrage-Metriken.
    
    Args:
        endpoint: API-Endpunkt, der die Abfrage ausgelöst hat
        
    Returns:
        Decorator-Funktion
    """
    def decorator(func):
        """Decorator zum Erfassen von Abfrage-Metriken."""
        def wrapper(*args, **kwargs):
            query_name = func.__name__
            start_time = time.time()
            
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start_time
                record_query_metrics(query_name, duration, endpoint)
        
        return wrapper
    
    return decorator 