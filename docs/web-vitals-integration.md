# Web Vitals Service - Integration in das ERP-System

Diese Dokumentation beschreibt die Integration des Web-Vitals-Service in das AI-driven ERP-System und erklärt, wie andere Module mit dem Service interagieren können.

## Überblick

Der Web-Vitals-Service ist ein spezialisierter Microservice zur Erfassung, Analyse und Visualisierung von Web-Performance-Metriken wie Core Web Vitals (CLS, FID, LCP) und weiteren Metriken (FCP, TTFB). Diese Metriken geben Aufschluss über die Benutzerfreundlichkeit und Performance der Frontend-Anwendung.

Der Service verfügt über:
- REST-API-Endpunkte zur Datenerfassung und -abfrage
- Ein interaktives Dashboard zur Visualisierung
- Integration mit anderen ERP-Modulen wie Analytics und Reporting
- Konfigurierbare Schwellenwerte und Benachrichtigungen

## Architektur

```
+-------------------------+          +----------------------------+
|                         |          |                            |
|   Frontend-Anwendung    |<-------->|      API Gateway          |
|   (React)               |          |                            |
|                         |          +-------------^--------------+
+-------------------------+                        |
                                                   |
+-------------------------+          +-------------v--------------+
|                         |          |                            |
|   Analytics-Modul       |<-------->|    Web-Vitals-Service     |
|                         |          |                            |
+-------------------------+          +----------------------------+
                                                   |
+-------------------------+                        |
|                         |                        |
|   Reporting-Modul       |<-----------------------+
|                         |
+-------------------------+

+-------------------------+
|                         |
| Benachrichtigungsmodul  |<-----------------------+
|                         |
+-------------------------+
```

## Integration mit dem API-Gateway

Der Web-Vitals-Service ist über das API-Gateway erreichbar, das als zentraler Einstiegspunkt für alle Microservices dient. Die Konfiguration erfolgt über die Datei `modules/api-gateway/web-vitals-integration.js`.

### Routen

| Route | Beschreibung |
|-------|--------------|
| `/api/collect/web-vitals` | Sammelt Web-Vitals-Metriken vom Frontend |
| `/api/analytics/web-vitals/*` | API-Endpunkte für Metriken und Analysen |
| `/analytics/web-vitals` | Dashboard zur Visualisierung der Metriken |
| `/internal/services/web-vitals/health` | Health-Check-Endpunkt |

### Konfiguration

```javascript
// Konfiguration im API-Gateway
const WEB_VITALS_SERVICE_CONFIG = {
  serviceUrl: process.env.WEB_VITALS_SERVICE_URL || 'http://web-vitals-service:3000',
  basePath: '/api/analytics/web-vitals',
  dashboardPath: '/analytics/web-vitals',
  // Weitere Konfigurationen...
};
```

## Integration mit anderen Modulen

Der Web-Vitals-Service kann mit verschiedenen anderen Modulen des ERP-Systems interagieren.

### Analytics-Modul

Die Integration mit dem Analytics-Modul ermöglicht die Zusammenführung von Web-Vitals-Daten mit anderen Analysedaten des ERP-Systems für ganzheitliche Berichte.

```javascript
// Beispiel für die Daten, die an das Analytics-Modul gesendet werden
{
  "source": "web-vitals-service",
  "timestamp": "2023-07-15T12:34:56.789Z",
  "metrics": [
    {
      "metric": "CLS",
      "value": 0.08,
      "rating": "good",
      "timestamp": "2023-07-15T12:30:45.123Z"
    },
    // Weitere Metriken...
  ]
}
```

### Reporting-Modul

Das Reporting-Modul ermöglicht die Erstellung umfassender Berichte, die Web-Vitals-Daten enthalten.

```javascript
// Beispiel für einen Berichtsauftrag
{
  "format": "pdf",
  "title": "Web Vitals Performance-Bericht",
  "description": "Performance-Metriken der letzten 30 Tage",
  "timestamp": "2023-07-15T12:34:56.789Z",
  "data": {
    // Metrikdaten...
  }
}
```

### Benachrichtigungsmodul

Das Benachrichtigungsmodul wird verwendet, um Warnungen bei Überschreitung von Performance-Schwellenwerten zu senden.

```javascript
// Beispiel für eine Benachrichtigung
{
  "source": "web-vitals-service",
  "timestamp": "2023-07-15T12:34:56.789Z",
  "alerts": [
    {
      "metric": "LCP",
      "level": "warning",
      "value": 3500,
      "threshold": 3000,
      "message": "Warnschwellenwert für LCP überschritten: 3500 (Schwellenwert: 3000)"
    }
  ],
  "recipients": ["dashboard", "admin"]
}
```

## API-Endpunkte des Web-Vitals-Service

### Datenerfassung

**Endpunkt:** `POST /api/collect/web-vitals`

**Anfrage:**
```json
{
  "name": "CLS",
  "delta": 0.05,
  "id": "v3-1625156751987-1234567890",
  "value": 0.08,
  "rating": "good"
}
```

**Antwort:**
```json
{
  "status": "success",
  "message": "Web Vital erfolgreich erfasst"
}
```

### Datenabfrage

**Endpunkt:** `GET /api/analytics/web-vitals/summary?days=7`

**Antwort:**
```json
{
  "status": "success",
  "data": {
    "metrics": {
      "CLS": { "min": 0.02, "max": 0.15, "avg": 0.08, "count": 157 },
      "FID": { "min": 12, "max": 150, "avg": 45, "count": 134 },
      "LCP": { "min": 1250, "max": 3500, "avg": 2100, "count": 157 },
      "FCP": { "min": 850, "max": 2300, "avg": 1400, "count": 157 },
      "TTFB": { "min": 120, "max": 950, "avg": 350, "count": 157 }
    },
    "config": {
      "timeRange": 7,
      "thresholds": {
        "CLS": { "good": 0.1, "needs_improvement": 0.25 },
        "FID": { "good": 100, "needs_improvement": 300 },
        "LCP": { "good": 2500, "needs_improvement": 4000 },
        "FCP": { "good": 1800, "needs_improvement": 3000 },
        "TTFB": { "good": 800, "needs_improvement": 1800 }
      }
    }
  }
}
```

### Datenexport

**Endpunkt:** `GET /api/analytics/web-vitals/dashboard/export?format=csv&days=30`

**Antwort:** Eine CSV-Datei mit allen Metriken der letzten 30 Tage.

## ERP-Integration-Endpunkte

Diese Endpunkte sind für die Integration mit anderen ERP-Modulen gedacht.

### Metriken an Analytics senden

**Endpunkt:** `POST /api/integration/analytics/sync`

**Antwort:**
```json
{
  "status": "success",
  "message": "Metriken erfolgreich an das Analytics-Modul gesendet"
}
```

### Performance-Alarme prüfen

**Endpunkt:** `POST /api/integration/alerts/check`

**Antwort:**
```json
{
  "status": "success",
  "message": "Performance-Alarme erfolgreich geprüft"
}
```

### Bericht generieren

**Endpunkt:** `POST /api/integration/reports/generate`

**Anfrage:**
```json
{
  "format": "pdf",
  "days": 30,
  "metrics": ["CLS", "FID", "LCP"]
}
```

**Antwort:**
```json
{
  "status": "success",
  "data": {
    // Bericht-Daten...
  }
}
```

## Frontend-Integration

### React-Komponenten

Der Web-Vitals-Service stellt React-Komponenten für die Integration in das Frontend bereit:

1. **WebVitalsCard** - Eine Dashboard-Kachel für die Anzeige der wichtigsten Metriken
2. **WebVitalsOverview** - Eine Detailansicht mit umfassenden Diagrammen und Analysen

```jsx
// Beispiel für die Verwendung der WebVitalsCard-Komponente
import WebVitalsCard from 'components/WebVitalsCard';

function Dashboard() {
  return (
    <div className="dashboard">
      <WebVitalsCard />
      {/* Weitere Dashboard-Komponenten */}
    </div>
  );
}
```

### Web-Vitals-Hook

Der `useWebVitals`-Hook ermöglicht den einfachen Zugriff auf Web-Vitals-Daten in React-Komponenten.

```jsx
// Beispiel für die Verwendung des useWebVitals-Hooks
import { useWebVitals } from 'hooks/useWebVitals';

function PerformanceWidget() {
  const { data, loading, error } = useWebVitals({ days: 7 });
  
  if (loading) return <p>Lade Daten...</p>;
  if (error) return <p>Fehler beim Laden der Daten</p>;
  
  return (
    <div>
      <h3>Core Web Vitals</h3>
      <p>CLS: {data.metrics.CLS.avg.toFixed(2)}</p>
      <p>FID: {data.metrics.FID.avg.toFixed(0)} ms</p>
      <p>LCP: {data.metrics.LCP.avg.toFixed(0)} ms</p>
    </div>
  );
}
```

### Automatische Datenerfassung

Die automatische Erfassung von Web-Vitals-Metriken erfolgt über die Datei `frontend/src/utils/web-vitals-reporter.js`, die in die Anwendung integriert ist.

```javascript
// Konfiguration der Web-Vitals-Erfassung
import { sendToAnalytics } from './web-vitals-reporter';

reportWebVitals(sendToAnalytics);
```

## Konfiguration und Deployment

### Umgebungsvariablen

Die Konfiguration des Web-Vitals-Service erfolgt über Umgebungsvariablen:

| Variable | Beschreibung | Standardwert |
|----------|--------------|--------------|
| `PORT` | Port, auf dem der Service läuft | `3000` |
| `SERVICE_VERSION` | Version des Service | `1.0.0` |
| `ANALYTICS_MODULE_URL` | URL des Analytics-Moduls | `http://analytics-service:3001/api` |
| `REPORTING_MODULE_URL` | URL des Reporting-Moduls | `http://reporting-service:3002/api` |
| `NOTIFICATIONS_MODULE_URL` | URL des Benachrichtigungsmoduls | `http://notifications-service:3003/api` |
| `CONFIG_SERVICE_URL` | URL des Konfigurations-Service | `http://config-service:3004/api` |
| `ANALYTICS_SYNC_INTERVAL` | Intervall für die Synchronisierung mit dem Analytics-Modul (ms) | `3600000` |
| `ALERT_CHECK_INTERVAL` | Intervall für die Prüfung auf Performance-Alarme (ms) | `300000` |
| `CONFIG_REFRESH_INTERVAL` | Intervall für die Aktualisierung der Konfiguration (ms) | `86400000` |

### Docker

Der Web-Vitals-Service ist als Docker-Container verfügbar:

```bash
# Container bauen
docker build -t web-vitals-service .

# Container starten
docker run -p 3000:3000 web-vitals-service
```

### Kubernetes

Für die Deployment in Kubernetes stehen YAML-Konfigurationsdateien zur Verfügung:

```bash
# Deployment starten
kubectl apply -f modules/web-vitals-service/kubernetes/deployment.yaml

# Service einrichten
kubectl apply -f modules/web-vitals-service/kubernetes/service.yaml

# Konfiguration laden
kubectl apply -f modules/web-vitals-service/kubernetes/configmap.yaml
```

## Fehlerbehebung

### Häufige Probleme

1. **Keine Daten im Dashboard**
   - Prüfen Sie, ob das Frontend Web-Vitals-Daten sendet
   - Überprüfen Sie die API-Gateway-Konfiguration
   - Prüfen Sie die Netzwerkverbindung zwischen Frontend und Service

2. **Fehler bei der Integration mit anderen Modulen**
   - Überprüfen Sie die URLs der Module in der Konfiguration
   - Prüfen Sie, ob die Module erreichbar sind
   - Überprüfen Sie die Authentifizierung zwischen den Modulen

3. **Performance-Alarme werden nicht gesendet**
   - Prüfen Sie die Konfiguration der Schwellenwerte
   - Überprüfen Sie die Verbindung zum Benachrichtigungsmodul
   - Prüfen Sie, ob Empfänger korrekt konfiguriert sind

### Logs

Die Logs des Web-Vitals-Service enthalten wichtige Informationen zur Fehlerbehebung:

```bash
# Docker-Logs anzeigen
docker logs web-vitals-service

# Kubernetes-Logs anzeigen
kubectl logs -l app=web-vitals-service
```

## Support und Weiterentwicklung

Bei Fragen oder Problemen wenden Sie sich an das Entwicklungsteam. Vorschläge für neue Funktionen oder Verbesserungen sind willkommen.

Weitere Informationen finden Sie in der [README des Web-Vitals-Service](../modules/web-vitals-service/README.md). 