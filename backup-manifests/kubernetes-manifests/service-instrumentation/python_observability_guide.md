# Anleitung zur Observability-Instrumentierung für Python-Services

Diese Anleitung beschreibt, wie Python-Services im ERP-System mit Observability-Funktionen instrumentiert werden können.

## Überblick

Die Observability-Instrumentierung umfasst drei Hauptbereiche:

1. **Metriken**: Prometheus-basierte Metriken für Performance und Geschäftslogik
2. **Tracing**: Jaeger-basiertes verteiltes Tracing für Service-übergreifende Anfragen
3. **Logging**: Strukturiertes JSON-Logging mit ELK-Stack-Integration

## Voraussetzungen

Folgende Python-Pakete werden benötigt:

```bash
pip install prometheus-client opentracing-instrumentation jaeger-client structlog elasticsearch
```

Diese Abhängigkeiten sollten zur `requirements.txt` des Services hinzugefügt werden.

## Integration in FastAPI-Services

### 1. Einbinden der Observability-Bibliothek

Kopieren Sie die Datei `python-service-observability.py` in Ihr Projekt und importieren Sie die `Observability`-Klasse:

```python
from python_service_observability import Observability, ObservabilityConfig
```

### 2. Konfiguration erstellen

```python
config = ObservabilityConfig()
# Optional: Konfiguration anpassen
config.metrics_enabled = True
config.tracing_enabled = True
config.service_name = "mein-service-name"
```

### 3. Observability initialisieren

Bei FastAPI-Anwendungen:

```python
app = FastAPI(title="Mein Service")
obs = Observability(app, config)
```

### 4. Metriken definieren

Benutzerdefinierte Metriken können wie folgt definiert werden:

```python
# Counter für Geschäftsereignisse
document_counter = obs.metrics.get('document_operations_total', Counter(
    'document_operations_total',
    'Anzahl der Dokumentoperationen',
    ['operation', 'document_type', 'status']
))

# Histogram für Verarbeitungszeiten
processing_time = obs.metrics.get('document_processing_seconds', Histogram(
    'document_processing_seconds',
    'Dokumentverarbeitungsdauer in Sekunden',
    ['document_type'],
    buckets=[0.1, 0.5, 1, 2.5, 5, 10, 30, 60]
))

# Gauge für aktuelle Werte
queue_size = obs.metrics.get('document_queue_size', Gauge(
    'document_queue_size',
    'Anzahl der Dokumente in der Warteschlange',
    ['priority']
))
```

### 5. Tracing verwenden

Verwenden Sie den `trace`-Dekorator für Funktionen:

```python
@obs.trace(name="process_document")
async def process_document(document_id: str):
    # Funktion wird automatisch getract
    result = await do_processing(document_id)
    return result
```

Oder manuelles Tracing für komplexere Fälle:

```python
async def process_batch(batch_id: str, documents: List[str]):
    with obs.tracer.start_active_span("process_batch") as scope:
        # Tags und Logs zum Span hinzufügen
        scope.span.set_tag("batch_id", batch_id)
        scope.span.set_tag("document_count", len(documents))
        
        try:
            for doc_id in documents:
                # Child-Span erstellen
                with obs.tracer.start_active_span("process_single_document") as child_scope:
                    child_scope.span.set_tag("document_id", doc_id)
                    await process_document(doc_id)
                    
            scope.span.log_kv({"event": "batch_completed"})
        except Exception as e:
            scope.span.set_tag("error", True)
            scope.span.log_kv({"event": "error", "error.message": str(e)})
            raise
```

### 6. Strukturiertes Logging verwenden

```python
# Einfaches Logging
obs.logger.info("Dokument hochgeladen", 
                document_id="1234", 
                size_bytes=4321, 
                document_type="invoice")

# Strukturiertes Logging mit Trace-Kontext
def process_payment(payment_id, amount):
    # Aktiven Span abrufen
    span = obs.tracer.active_span
    
    # Trace-Kontext zum Log hinzufügen
    obs.logger.info("Verarbeite Zahlung",
                    payment_id=payment_id,
                    amount=amount,
                    currency="EUR",
                    trace_id=span.context.trace_id if span else None,
                    span_id=span.context.span_id if span else None)
```

### 7. Zeitmessung mit Metriken

Verwenden Sie den `time`-Dekorator für Funktionen:

```python
@obs.time(metric_name="document_processing_seconds", labels={"document_type": "invoice"})
async def process_invoice(invoice_data):
    # Verarbeitungszeit wird automatisch gemessen
    result = await do_processing(invoice_data)
    return result
```

Oder manuelles Timing für spezifische Abschnitte:

```python
async def complex_operation():
    # Zeitmessung starten
    timer = processing_time.start_timer()
    
    try:
        # Operationen durchführen
        await first_step()
        await second_step()
        await final_step()
    finally:
        # Zeitmessung beenden und Wert aufzeichnen
        timer.observe()
```

## Kubernetes-Integration

Die Instrumentierung kann mit der entsprechenden Kubernetes-Konfiguration ergänzt werden:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mein-service
spec:
  template:
    metadata:
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8000"
        prometheus.io/path: "/metrics"
        jaeger.erp-system.svc.cluster.local/inject: "true"
    spec:
      containers:
      - name: mein-service
        env:
        - name: ENABLE_METRICS
          value: "true"
        - name: METRICS_PORT
          value: "8000"
        - name: ENABLE_TRACING
          value: "true"
        - name: JAEGER_AGENT_HOST
          value: "erp-jaeger-agent.erp-system.svc.cluster.local"
        - name: LOG_FORMAT
          value: "json"
```

## Beispiel: Vollständige Integration

```python
from fastapi import FastAPI, Depends, HTTPException
from python_service_observability import Observability, ObservabilityConfig
from prometheus_client import Counter, Histogram, Gauge

# FastAPI-App erstellen
app = FastAPI(title="Dokument-Service")

# Observability konfigurieren
config = ObservabilityConfig()
config.service_name = "document-service"
obs = Observability(app, config)

# Metriken definieren
document_counter = Counter(
    'document_operations_total',
    'Anzahl der Dokumentoperationen',
    ['operation', 'document_type', 'status']
)

processing_time = Histogram(
    'document_processing_seconds',
    'Dokumentverarbeitungsdauer in Sekunden',
    ['document_type'],
    buckets=[0.1, 0.5, 1, 2.5, 5, 10, 30, 60]
)

# Endpunkte definieren
@app.post("/documents/{document_type}")
@obs.trace(name="upload_document")
@obs.time(metric_name="document_upload_seconds", labels={"endpoint": "/documents"})
async def upload_document(document_type: str, document_data: dict):
    try:
        # Geschäftslogik...
        
        # Metrik inkrementieren
        document_counter.labels(
            operation="upload",
            document_type=document_type,
            status="success"
        ).inc()
        
        # Logging mit Kontext
        obs.logger.info(
            "Dokument hochgeladen",
            document_type=document_type,
            document_id=document_data.get("id"),
            size_bytes=len(str(document_data))
        )
        
        return {"status": "success", "document_id": document_data.get("id")}
    except Exception as e:
        # Fehlermetriken
        document_counter.labels(
            operation="upload",
            document_type=document_type,
            status="error"
        ).inc()
        
        # Fehler loggen
        obs.logger.error(
            "Fehler beim Hochladen des Dokuments",
            document_type=document_type,
            error=str(e)
        )
        
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Best Practices

1. **Konsistente Benennung**: Verwenden Sie einheitliche Namenskonventionen für Metriken, Logs und Spans.
2. **Relevante Kardinalität**: Vermeiden Sie zu viele Label-Kombinationen bei Metriken.
3. **Korrelations-IDs**: Verwenden Sie Trace-IDs in Logs für die Verknüpfung von Traces und Logs.
4. **Geschäftsrelevante Metriken**: Erfassen Sie nicht nur technische, sondern auch geschäftsrelevante Metriken.
5. **Strukturierte Ausnahmebehandlung**: Stellen Sie sicher, dass Fehler korrekt protokolliert und in Metriken erfasst werden.
6. **Health Endpoints**: Implementieren Sie `/health` und `/ready` für Kubernetes-Probes.

## Fehlerbehebung

### Metriken werden nicht angezeigt

1. Überprüfen Sie, ob der Prometheus-Endpunkt unter `/metrics` erreichbar ist
2. Stellen Sie sicher, dass die Prometheus-Annotationen in Kubernetes korrekt sind
3. Prüfen Sie, ob die Umgebungsvariable `ENABLE_METRICS` auf `"true"` gesetzt ist

### Traces erscheinen nicht in Jaeger

1. Überprüfen Sie, ob der Jaeger-Agent erreichbar ist
2. Stellen Sie sicher, dass die Tracing-Umgebungsvariablen korrekt gesetzt sind
3. Prüfen Sie, ob Service-zu-Service-Kommunikation korrekt instrumentiert ist

### Logs erscheinen nicht im ELK-Stack

1. Überprüfen Sie, ob die Elasticsearch-Verbindung konfiguriert ist
2. Stellen Sie sicher, dass das Log-Format auf `"json"` gesetzt ist
3. Prüfen Sie, ob Filebeat oder Logstash korrekt konfiguriert sind