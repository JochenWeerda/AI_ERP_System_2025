"""
Observability-Modul für den Finance-Service.
Implementiert Metriken, Tracing und strukturiertes Logging.
"""

import os
import time
import uuid
import json
import logging
from functools import wraps
from typing import Dict, List, Optional, Any, Callable

# Prometheus-Metriken
try:
    import prometheus_client
    from prometheus_client import Counter, Histogram, Gauge, Summary
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False
    print("Prometheus-Client nicht verfügbar. Metriken werden deaktiviert.")

# OpenTracing für Jaeger
try:
    import opentracing
    from jaeger_client import Config as JaegerConfig
    TRACING_AVAILABLE = True
except ImportError:
    TRACING_AVAILABLE = False
    print("Jaeger-Client nicht verfügbar. Tracing wird deaktiviert.")

# Structured Logging
try:
    import structlog
    STRUCTLOG_AVAILABLE = True
except ImportError:
    STRUCTLOG_AVAILABLE = False
    print("Structlog nicht verfügbar. Standardmäßiges Logging wird verwendet.")

class FinanceObservability:
    """Observability-Handler für den Finance-Service."""
    
    def __init__(self, app=None):
        # Konfiguration aus Umgebungsvariablen
        self.metrics_enabled = os.environ.get('ENABLE_METRICS', 'false').lower() == 'true'
        self.metrics_port = int(os.environ.get('METRICS_PORT', '8007'))
        self.metrics_path = os.environ.get('METRICS_PATH', '/metrics')
        
        self.tracing_enabled = os.environ.get('ENABLE_TRACING', 'false').lower() == 'true'
        self.service_name = os.environ.get('JAEGER_SERVICE_NAME', 'finance-service')
        self.jaeger_host = os.environ.get('JAEGER_AGENT_HOST', 'localhost')
        self.jaeger_port = int(os.environ.get('JAEGER_AGENT_PORT', '6831'))
        
        self.log_level = os.environ.get('LOG_LEVEL', 'INFO')
        self.log_format = os.environ.get('LOG_FORMAT', 'json')
        
        # Komponenten initialisieren
        self.tracer = None
        self.logger = None
        self.metrics = {}
        
        # Komponenten initialisieren
        self._setup_metrics()
        self._setup_tracing()
        self.logger = self._setup_logging()
        
        # FastAPI App initialisieren (falls übergeben)
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialisiert die FastAPI-App mit Observability-Middleware."""
        # Metrics-Endpunkt hinzufügen
        if self.metrics_enabled and PROMETHEUS_AVAILABLE:
            @app.get(self.metrics_path)
            async def metrics():
                return prometheus_client.generate_latest()
        
        # Tracing-Middleware hinzufügen
        if self.tracing_enabled and TRACING_AVAILABLE:
            @app.middleware("http")
            async def tracing_middleware(request, call_next):
                request_id = request.headers.get('x-request-id', str(uuid.uuid4()))
                
                span_ctx = None
                if self.tracer:
                    span_ctx = self.tracer.extract(
                        format=opentracing.Format.HTTP_HEADERS,
                        carrier=dict(request.headers)
                    )
                
                with self.tracer.start_active_span(
                    f"{request.method} {request.url.path}",
                    child_of=span_ctx
                ) as scope:
                    span = scope.span
                    span.set_tag('http.method', request.method)
                    span.set_tag('http.url', str(request.url))
                    span.set_tag('request_id', request_id)
                    
                    try:
                        response = await call_next(request)
                        span.set_tag('http.status_code', response.status_code)
                        return response
                    except Exception as e:
                        span.set_tag('error', True)
                        span.set_tag('error.message', str(e))
                        span.log_kv({'event': 'error', 'error.object': str(e)})
                        raise
        
        # Request-Logging-Middleware
        @app.middleware("http")
        async def logging_middleware(request, call_next):
            start_time = time.time()
            request_id = request.headers.get('x-request-id', str(uuid.uuid4()))
            
            # Request loggen
            self.logger.info(
                "Eingehende Anfrage",
                request_id=request_id,
                method=request.method,
                url=str(request.url),
                client_ip=request.client.host
            )
            
            try:
                # Request verarbeiten
                response = await call_next(request)
                
                # Dauer berechnen
                duration = time.time() - start_time
                
                # Metriken aktualisieren
                if self.metrics_enabled and PROMETHEUS_AVAILABLE:
                    if 'http_request_duration_seconds' in self.metrics:
                        self.metrics['http_request_duration_seconds'].labels(
                            method=request.method,
                            endpoint=request.url.path
                        ).observe(duration)
                    
                    if 'http_requests_total' in self.metrics:
                        self.metrics['http_requests_total'].labels(
                            method=request.method,
                            endpoint=request.url.path,
                            status=response.status_code
                        ).inc()
                
                # Response loggen
                self.logger.info(
                    "Ausgehende Antwort",
                    request_id=request_id,
                    status_code=response.status_code,
                    duration=duration
                )
                
                return response
            except Exception as e:
                # Fehler loggen
                self.logger.error(
                    "Fehler bei Anfrageverarbeitung",
                    request_id=request_id,
                    error=str(e),
                    error_type=type(e).__name__,
                    duration=time.time() - start_time
                )
                
                # Fehler-Metrik erhöhen
                if self.metrics_enabled and PROMETHEUS_AVAILABLE:
                    if 'http_request_errors_total' in self.metrics:
                        self.metrics['http_request_errors_total'].inc()
                
                raise
    
    def _setup_metrics(self):
        """Initialisiert Prometheus-Metriken."""
        if not self.metrics_enabled or not PROMETHEUS_AVAILABLE:
            return
        
        # Standard-HTTP-Metriken
        self.metrics['http_requests_total'] = Counter(
            'http_requests_total',
            'Gesamtzahl der HTTP-Anfragen',
            ['method', 'endpoint', 'status']
        )
        
        self.metrics['http_request_duration_seconds'] = Histogram(
            'http_request_duration_seconds',
            'Dauer der HTTP-Anfragen in Sekunden',
            ['method', 'endpoint'],
            buckets=(0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0)
        )
        
        self.metrics['http_request_errors_total'] = Counter(
            'http_request_errors_total',
            'Gesamtzahl der HTTP-Anfragefehler'
        )
        
        # Finanztransaktions-Metriken
        self.metrics['finance_transactions_total'] = Counter(
            'finance_transactions_total',
            'Gesamtzahl der finanziellen Transaktionen',
            ['transaction_type', 'status', 'account_type']
        )
        
        self.metrics['transaction_processing_duration_seconds'] = Histogram(
            'transaction_processing_duration_seconds',
            'Dauer der Transaktionsverarbeitung in Sekunden',
            ['transaction_type'],
            buckets=(0.01, 0.05, 0.1, 0.5, 1, 2.5, 5, 10, 30)
        )
        
        self.metrics['active_accounts'] = Gauge(
            'active_accounts',
            'Anzahl der aktiven Konten',
            ['account_type']
        )
        
        self.metrics['datev_export_total'] = Counter(
            'datev_export_total',
            'Anzahl der DATEV-Exporte',
            ['export_type', 'status']
        )
        
        self.metrics['transaction_queue_size'] = Gauge(
            'transaction_queue_size',
            'Anzahl der Transaktionen in der Warteschlange',
            ['priority']
        )
    
    def _setup_tracing(self):
        """Initialisiert Jaeger-Tracing."""
        if not self.tracing_enabled or not TRACING_AVAILABLE:
            return
        
        config = JaegerConfig(
            config={
                'sampler': {
                    'type': os.environ.get('JAEGER_SAMPLER_TYPE', 'const'),
                    'param': float(os.environ.get('JAEGER_SAMPLER_PARAM', '1')),
                },
                'local_agent': {
                    'reporting_host': self.jaeger_host,
                    'reporting_port': self.jaeger_port,
                },
                'logging': True,
            },
            service_name=self.service_name,
            validate=True,
        )
        
        self.tracer = config.initialize_tracer()
    
    def _setup_logging(self):
        """Richtet strukturiertes Logging ein."""
        log_level = getattr(logging, self.log_level.upper(), logging.INFO)
        
        # Standard-Logger
        logging.basicConfig(level=log_level)
        
        if STRUCTLOG_AVAILABLE:
            # Strukturiertes Logging mit structlog
            structlog.configure(
                processors=[
                    structlog.contextvars.merge_contextvars,
                    structlog.processors.add_log_level,
                    structlog.processors.TimeStamper(fmt="iso"),
                    structlog.processors.format_exc_info,
                    structlog.processors.UnicodeDecoder(),
                    structlog.processors.JSONRenderer() if self.log_format == 'json' else structlog.processors.KeyValueRenderer()
                ],
                logger_factory=structlog.stdlib.LoggerFactory(),
                wrapper_class=structlog.stdlib.BoundLogger,
                context_class=dict,
                cache_logger_on_first_use=True,
            )
            
            logger = structlog.get_logger(self.service_name)
        else:
            logger = logging.getLogger(self.service_name)
        
        return logger
    
    def trace(self, name=None):
        """Dekorator für das Tracing von Funktionen."""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                if not self.tracing_enabled or not self.tracer:
                    return func(*args, **kwargs)
                
                operation_name = name or func.__name__
                with self.tracer.start_active_span(operation_name) as scope:
                    scope.span.set_tag('function', func.__name__)
                    try:
                        return func(*args, **kwargs)
                    except Exception as e:
                        scope.span.set_tag('error', True)
                        scope.span.log_kv({'event': 'error', 'error.object': str(e)})
                        raise
            return wrapper
        return decorator
    
    def time(self, metric_name=None, labels=None):
        """Dekorator zum Messen der Ausführungszeit einer Funktion."""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                if not self.metrics_enabled or not PROMETHEUS_AVAILABLE:
                    return func(*args, **kwargs)
                
                _metric_name = metric_name or f"{func.__name__}_duration_seconds"
                _labels = labels or {}
                
                if _metric_name not in self.metrics:
                    self.metrics[_metric_name] = Histogram(
                        _metric_name,
                        f"Dauer von {func.__name__} in Sekunden",
                        list(_labels.keys())
                    )
                
                start_time = time.time()
                try:
                    return func(*args, **kwargs)
                finally:
                    duration = time.time() - start_time
                    self.metrics[_metric_name].labels(**_labels).observe(duration)
            return wrapper
        return decorator
    
    def record_transaction(self, transaction_type, status, account_type):
        """Zeichnet eine Finanztransaktion in den Metriken auf."""
        if self.metrics_enabled and PROMETHEUS_AVAILABLE:
            if 'finance_transactions_total' in self.metrics:
                self.metrics['finance_transactions_total'].labels(
                    transaction_type=transaction_type,
                    status=status,
                    account_type=account_type
                ).inc()
    
    def time_transaction(self, transaction_type):
        """Misst die Dauer einer Transaktion."""
        if not self.metrics_enabled or not PROMETHEUS_AVAILABLE:
            return None
        
        if 'transaction_processing_duration_seconds' in self.metrics:
            return self.metrics['transaction_processing_duration_seconds'].labels(
                transaction_type=transaction_type
            ).time()
        
        return None
    
    def set_active_accounts(self, account_type, count):
        """Setzt die Anzahl der aktiven Konten eines bestimmten Typs."""
        if self.metrics_enabled and PROMETHEUS_AVAILABLE:
            if 'active_accounts' in self.metrics:
                self.metrics['active_accounts'].labels(
                    account_type=account_type
                ).set(count)
    
    def record_datev_export(self, export_type, status):
        """Zeichnet einen DATEV-Export in den Metriken auf."""
        if self.metrics_enabled and PROMETHEUS_AVAILABLE:
            if 'datev_export_total' in self.metrics:
                self.metrics['datev_export_total'].labels(
                    export_type=export_type,
                    status=status
                ).inc()
    
    def set_transaction_queue_size(self, priority, size):
        """Setzt die Größe der Transaktions-Warteschlange."""
        if self.metrics_enabled and PROMETHEUS_AVAILABLE:
            if 'transaction_queue_size' in self.metrics:
                self.metrics['transaction_queue_size'].labels(
                    priority=priority
                ).set(size)

# Globale Instanz für einfachen Import
finance_observability = FinanceObservability()

# Hilfsfunktionen
def get_tracer():
    """Gibt den konfigurierten Tracer zurück."""
    return finance_observability.tracer

def get_logger():
    """Gibt den konfigurierten Logger zurück."""
    return finance_observability.logger

def get_metrics():
    """Gibt die konfigurierten Metriken zurück."""
    return finance_observability.metrics 