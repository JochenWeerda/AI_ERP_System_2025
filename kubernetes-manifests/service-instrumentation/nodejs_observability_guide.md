# Anleitung zur Observability-Instrumentierung für Node.js-Services

Diese Anleitung beschreibt, wie Node.js-Services im ERP-System mit Observability-Funktionen instrumentiert werden können.

## Überblick

Die Observability-Instrumentierung umfasst drei Hauptbereiche:

1. **Metriken**: Prometheus-basierte Metriken für Performance und Geschäftslogik
2. **Tracing**: Jaeger-basiertes verteiltes Tracing für Service-übergreifende Anfragen
3. **Logging**: Strukturiertes JSON-Logging mit ELK-Stack-Integration

## Voraussetzungen

Folgende NPM-Pakete werden benötigt:

```bash
npm install prom-client jaeger-client opentracing winston winston-elasticsearch express-pino-logger
```

Diese Abhängigkeiten sollten zur `package.json` des Services hinzugefügt werden.

## Integration in Express-Services

### 1. Einbinden der Observability-Bibliothek

Kopieren Sie die Datei `node-service-observability.js` in Ihr Projekt und importieren Sie die Bibliothek:

```javascript
const { 
  observability, 
  setupApp, 
  logger, 
  createSpan, 
  startTimer, 
  incrementCounter, 
  setGauge 
} = require('./node-service-observability');
```

### 2. Express-App initialisieren

```javascript
const express = require('express');
const app = express();

// Observability für die App einrichten
setupApp(app);

// Ab hier werden alle Anfragen automatisch mit Metriken, Tracing und Logging instrumentiert
```

### 3. Metriken definieren und verwenden

```javascript
const prometheus = require('prom-client');
const metrics = observability.metrics;

// Benutzerdefinierte Metriken erstellen
const documentCounter = new prometheus.Counter({
  name: 'document_operations_total',
  help: 'Anzahl der Dokumentoperationen',
  labelNames: ['operation', 'document_type', 'status'],
  registers: [observability.registry]
});

const processingTime = new prometheus.Histogram({
  name: 'document_processing_seconds',
  help: 'Dokumentverarbeitungsdauer in Sekunden',
  labelNames: ['document_type'],
  buckets: [0.1, 0.5, 1, 2.5, 5, 10, 30, 60],
  registers: [observability.registry]
});

// Metriken verwenden
app.post('/documents/:type', async (req, res) => {
  // Metrik inkrementieren
  documentCounter.inc({
    operation: 'upload',
    document_type: req.params.type,
    status: 'started'
  });
  
  try {
    // Operationen mit Zeitmessung
    const timer = processingTime.startTimer({ document_type: req.params.type });
    
    // Geschäftslogik ausführen...
    const result = await processDocument(req.body);
    
    // Zeitmessung beenden
    timer();
    
    // Erfolgsmetrik
    documentCounter.inc({
      operation: 'upload',
      document_type: req.params.type,
      status: 'success'
    });
    
    res.json(result);
  } catch (err) {
    // Fehlermetrik
    documentCounter.inc({
      operation: 'upload',
      document_type: req.params.type,
      status: 'error'
    });
    
    res.status(500).json({ error: err.message });
  }
});

// Alternativ: Helper-Funktionen verwenden
app.get('/status', (req, res) => {
  // Counter inkrementieren
  incrementCounter('status_checks_total', { endpoint: '/status' });
  
  // Gauge setzen
  setGauge('system_status', {}, process.uptime());
  
  res.json({ status: 'ok' });
});
```

### 4. Tracing verwenden

Manuelles Tracing für komplexe Operationen:

```javascript
const { tracer } = require('./node-service-observability');
const opentracing = require('opentracing');

app.post('/batch-process', async (req, res) => {
  // Span vom aktuellen Request extrahieren (durch Middleware erstellt)
  const parentSpan = req.span;
  
  // Neuen Span für die Batch-Verarbeitung erstellen
  const span = tracer().startSpan('batch_processing', {
    childOf: parentSpan
  });
  
  // Tags zum Span hinzufügen
  span.setTag('batch_id', req.body.batchId);
  span.setTag('document_count', req.body.documents.length);
  
  try {
    // Für jedes Dokument im Batch einen Child-Span erstellen
    const results = await Promise.all(req.body.documents.map(async (doc) => {
      const docSpan = tracer().startSpan('process_document', {
        childOf: span
      });
      
      docSpan.setTag('document_id', doc.id);
      docSpan.setTag('document_type', doc.type);
      
      try {
        const result = await processDocument(doc);
        docSpan.setTag('status', 'success');
        docSpan.finish();
        return result;
      } catch (err) {
        docSpan.setTag('error', true);
        docSpan.setTag('error.message', err.message);
        docSpan.log({
          event: 'error',
          'error.object': err.message,
          stack: err.stack
        });
        docSpan.finish();
        throw err;
      }
    }));
    
    // Erfolgsfall
    span.setTag('status', 'success');
    span.log({ event: 'batch_completed', count: results.length });
    span.finish();
    
    res.json({ results });
  } catch (err) {
    // Fehlerfall
    span.setTag('error', true);
    span.setTag('error.message', err.message);
    span.log({
      event: 'error',
      'error.object': err.message,
      stack: err.stack
    });
    span.finish();
    
    res.status(500).json({ error: err.message });
  }
});

// Alternativ: Helper-Funktion verwenden
app.get('/documents/:id', async (req, res) => {
  const span = createSpan('get_document', { 
    tags: { document_id: req.params.id }
  });
  
  try {
    const document = await getDocument(req.params.id);
    span.setTag('document_type', document.type);
    span.finish();
    res.json(document);
  } catch (err) {
    span.setTag('error', true);
    span.log({ event: 'error', message: err.message });
    span.finish();
    res.status(500).json({ error: err.message });
  }
});
```

### 5. Strukturiertes Logging verwenden

```javascript
// Logger direkt verwenden
const log = logger();

app.post('/documents', (req, res) => {
  // Einfaches Logging
  log.info('Dokument hochgeladen', {
    document_id: req.body.id,
    document_type: req.body.type,
    size_bytes: req.body.content.length
  });
  
  // Strukturiertes Logging mit Trace-Kontext
  if (req.span) {
    const traceId = req.span.context().toTraceId();
    const spanId = req.span.context().toSpanId();
    
    log.info('Verarbeite Dokument', {
      document_id: req.body.id,
      operation: 'process',
      trace_id: traceId,
      span_id: spanId
    });
  }
  
  // Mit verschiedenen Log-Levels
  log.debug('Debug-Informationen', { details: 'Details...' });
  log.warn('Warnung bei der Verarbeitung', { reason: 'Grund...' });
  log.error('Fehler aufgetreten', { 
    error: 'Fehlermeldung', 
    code: 'ERROR_CODE' 
  });
  
  res.json({ status: 'success' });
});
```

### 6. Zeitmessung mit Helper-Funktionen

```javascript
app.get('/complex-operation', async (req, res) => {
  // Timer starten
  const endTimer = startTimer('complex_operation_seconds', { 
    operation_type: 'query'
  });
  
  try {
    // Operationen durchführen...
    const result = await performComplexOperation();
    
    // Timer beenden
    const duration = endTimer();
    
    res.json({ 
      result, 
      metrics: { 
        duration_seconds: duration 
      }
    });
  } catch (err) {
    // Timer trotzdem beenden
    endTimer();
    res.status(500).json({ error: err.message });
  }
});
```

## Kubernetes-Integration

Die Instrumentierung kann mit der entsprechenden Kubernetes-Konfiguration ergänzt werden:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: document-service
  namespace: erp-system
spec:
  template:
    metadata:
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
        jaeger.erp-system.svc.cluster.local/inject: "true"
        jaeger.erp-system.svc.cluster.local/service-name: "document-service"
    spec:
      containers:
      - name: document-service
        env:
        - name: ENABLE_METRICS
          value: "true"
        - name: METRICS_PATH
          value: "/metrics"
        - name: METRICS_PORT
          value: "3000"
        - name: ENABLE_TRACING
          value: "true"
        - name: JAEGER_AGENT_HOST
          value: "erp-jaeger-agent.erp-system.svc.cluster.local"
        - name: JAEGER_AGENT_PORT
          value: "6831"
        - name: JAEGER_SAMPLER_TYPE
          value: "const"
        - name: JAEGER_SAMPLER_PARAM
          value: "1"
        - name: LOG_LEVEL
          value: "info"
        - name: LOG_FORMAT
          value: "json"
        - name: ELASTICSEARCH_HOST
          value: "elasticsearch.erp-system.svc.cluster.local:9200"
        - name: USE_ELASTICSEARCH
          value: "true"
```

## Beispiel: Vollständige Integration

```javascript
const express = require('express');
const { 
  setupApp, 
  logger, 
  createSpan, 
  incrementCounter, 
  startTimer, 
  setGauge 
} = require('./node-service-observability');
const prometheus = require('prom-client');

// Express-App erstellen
const app = express();
app.use(express.json());

// Observability einrichten
setupApp(app);

// Logger initialisieren
const log = logger();

// Benutzerdefinierte Metriken
const documentCounter = new prometheus.Counter({
  name: 'document_operations_total',
  help: 'Anzahl der Dokumentoperationen',
  labelNames: ['operation', 'document_type', 'status'],
  registers: [observability.registry]
});

// API-Endpunkte
app.post('/documents/:type', async (req, res) => {
  const documentType = req.params.type;
  
  // Span erstellen
  const span = createSpan('upload_document', {
    tags: {
      document_type: documentType,
      content_length: req.body.length
    }
  });
  
  // Timer starten
  const endTimer = startTimer('document_upload_seconds', {
    document_type: documentType
  });
  
  try {
    // Metrik inkrementieren
    incrementCounter('document_operations_total', {
      operation: 'upload',
      document_type: documentType,
      status: 'started'
    });
    
    log.info('Dokument wird hochgeladen', {
      document_type: documentType,
      trace_id: span.context().toTraceId(),
      span_id: span.context().toSpanId()
    });
    
    // Geschäftslogik...
    const documentId = await saveDocument(req.body, documentType);
    
    // Metrik für Erfolg
    incrementCounter('document_operations_total', {
      operation: 'upload',
      document_type: documentType,
      status: 'success'
    });
    
    // Gauge aktualisieren
    const documentCount = await getDocumentCount(documentType);
    setGauge('document_count', { document_type: documentType }, documentCount);
    
    // Timer beenden
    const duration = endTimer();
    
    // Span abschließen
    span.setTag('document_id', documentId);
    span.setTag('status', 'success');
    span.log({ event: 'document_saved', document_id: documentId });
    span.finish();
    
    // Log mit Trace-Kontext
    log.info('Dokument erfolgreich hochgeladen', {
      document_id: documentId,
      document_type: documentType,
      duration_seconds: duration,
      trace_id: span.context().toTraceId(),
      span_id: span.context().toSpanId()
    });
    
    res.status(201).json({ id: documentId });
  } catch (err) {
    // Metrik für Fehler
    incrementCounter('document_operations_total', {
      operation: 'upload',
      document_type: documentType,
      status: 'error'
    });
    
    // Timer trotzdem beenden
    endTimer();
    
    // Span als Fehler markieren
    span.setTag('error', true);
    span.setTag('error.message', err.message);
    span.log({
      event: 'error',
      'error.object': err.message,
      stack: err.stack
    });
    span.finish();
    
    // Fehler loggen
    log.error('Fehler beim Hochladen des Dokuments', {
      document_type: documentType,
      error: err.message,
      stack: err.stack,
      trace_id: span.context().toTraceId(),
      span_id: span.context().toSpanId()
    });
    
    res.status(500).json({ error: err.message });
  }
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  log.info(`Server gestartet auf Port ${PORT}`, {
    metrics_path: '/metrics',
    health_path: '/health'
  });
});

// Bei Beenden aufräumen
process.on('SIGTERM', () => {
  log.info('Server wird heruntergefahren');
  observability.shutdown();
  process.exit(0);
});
```

## Best Practices

1. **Konsistente Benennung**: Verwenden Sie einheitliche Namenskonventionen für Metriken, Logs und Spans.
2. **Relevante Kardinalität**: Vermeiden Sie zu viele Label-Kombinationen bei Metriken.
3. **Korrelations-IDs**: Verwenden Sie Trace-IDs in Logs für die Verknüpfung von Traces und Logs.
4. **Geschäftsrelevante Metriken**: Erfassen Sie nicht nur technische, sondern auch geschäftsrelevante Metriken.
5. **Strukturierte Ausnahmebehandlung**: Stellen Sie sicher, dass Fehler korrekt protokolliert und in Metriken erfasst werden.
6. **Health Endpoints**: Verwenden Sie die automatisch bereitgestellten `/health` und `/ready` Endpunkte.
7. **Ressourcenbereinigung**: Rufen Sie `observability.shutdown()` beim Beenden auf, um Ressourcen freizugeben.

## Fehlerbehebung

### Metriken werden nicht angezeigt

1. Überprüfen Sie, ob der Prometheus-Endpunkt unter `/metrics` erreichbar ist
2. Stellen Sie sicher, dass die Prometheus-Annotationen in Kubernetes korrekt sind
3. Prüfen Sie, ob die Umgebungsvariable `ENABLE_METRICS` auf `"true"` gesetzt ist

### Traces erscheinen nicht in Jaeger

1. Überprüfen Sie, ob der Jaeger-Agent erreichbar ist
2. Stellen Sie sicher, dass die Tracing-Umgebungsvariablen korrekt gesetzt sind
3. Prüfen Sie, ob `JAEGER_SERVICE_NAME` korrekt gesetzt ist

### Logs erscheinen nicht im ELK-Stack

1. Überprüfen Sie, ob die Elasticsearch-Verbindung konfiguriert ist
2. Stellen Sie sicher, dass das Log-Format auf `"json"` gesetzt ist
3. Prüfen Sie, ob Filebeat oder Logstash korrekt konfiguriert sind 