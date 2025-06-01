"""
Prometheus-Metriken-Exporter für das ERP-System.

Dieses Modul stellt Prometheus-Metriken für das ERP-System bereit, um die
Leistung und den Zustand der Anwendung zu überwachen.
"""

import time
import logging
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from prometheus_client import Counter, Histogram, Gauge, Info, make_asgi_app

# Konfiguriere Logger
logger = logging.getLogger(__name__)

# Definiere Metriken
http_requests_total = Counter(
    "http_requests_total",
    "Gesamtzahl der HTTP-Anfragen",
    ["method", "path", "status_code"]
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "Dauer der HTTP-Anfragen in Sekunden",
    ["method", "path"],
    buckets=[0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0]
)

active_requests = Gauge(
    "active_requests",
    "Anzahl der aktiven Anfragen"
)

system_info = Info(
    "erp_system", 
    "Informationen über das ERP-System"
)

# Task-Metriken
task_duration_seconds = Histogram(
    "task_duration_seconds",
    "Dauer der Ausführung von Tasks in Sekunden",
    ["task_type", "queue"],
    buckets=[0.1, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0, 120.0, 300.0, 600.0]
)

tasks_total = Counter(
    "tasks_total",
    "Gesamtzahl der Tasks",
    ["task_type", "status"]
)

# Metriken für Redis-Verbindungen
redis_connection_errors = Counter(
    "redis_connection_errors",
    "Anzahl der Redis-Verbindungsfehler"
)

class PrometheusMiddleware(BaseHTTPMiddleware):
    """Middleware zur Erfassung von Prometheus-Metriken für HTTP-Anfragen."""
    
    async def dispatch(self, request: Request, call_next):
        """Erfasse Metriken für eine HTTP-Anfrage."""
        start_time = time.time()
        
        # Erhöhe Zähler für aktive Anfragen
        active_requests.inc()
        
        # Standardwerte für den Fall eines Fehlers
        status_code = 500
        
        try:
            # Verarbeite die Anfrage
            response = await call_next(request)
            status_code = response.status_code
            return response
        except Exception as exc:
            # Protokolliere den Fehler und leite ihn weiter
            logger.exception("Fehler bei der Verarbeitung der Anfrage: %s", exc)
            raise
        finally:
            # Erfasse Metriken
            end_time = time.time()
            duration = end_time - start_time
            
            # Erfasse Anfragedauer und Gesamtzahl
            http_request_duration_seconds.labels(
                method=request.method,
                path=request.url.path
            ).observe(duration)
            
            http_requests_total.labels(
                method=request.method,
                path=request.url.path,
                status_code=str(status_code)
            ).inc()
            
            # Verringere Zähler für aktive Anfragen
            active_requests.dec()

def init_prometheus_metrics(app: FastAPI, system_version: str = "1.0.0", system_name: str = "ERP-System"):
    """Initialisiere Prometheus-Metriken für die FastAPI-Anwendung."""
    # Setze System-Informationen
    system_info.info({
        "version": system_version,
        "name": system_name
    })
    
    # Füge Prometheus-Middleware hinzu
    app.add_middleware(PrometheusMiddleware)
    
    # Füge Prometheus-Metrik-Endpunkt hinzu
    metrics_app = make_asgi_app()
    app.mount("/metrics", metrics_app)
    
    logger.info("Prometheus-Integration erfolgreich initialisiert")
    
    return app

# Hilfsfunktionen für Tasks
def track_task_start(task_type: str, queue: str = "default"):
    """Erfasse den Start eines Tasks."""
    tasks_total.labels(task_type=task_type, status="started").inc()

def track_task_completion(task_type: str, duration: float, queue: str = "default"):
    """Erfasse den Abschluss eines Tasks."""
    task_duration_seconds.labels(task_type=task_type, queue=queue).observe(duration)
    tasks_total.labels(task_type=task_type, status="completed").inc()

def track_task_failure(task_type: str, queue: str = "default"):
    """Erfasse einen fehlgeschlagenen Task."""
    tasks_total.labels(task_type=task_type, status="failed").inc()

def track_redis_error():
    """Erfasse einen Redis-Verbindungsfehler."""
    redis_connection_errors.inc() 