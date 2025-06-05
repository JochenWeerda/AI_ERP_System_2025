# VALEO ERP - Microservice Design Standards

## Einführung

Dieses Dokument definiert die verbindlichen Standards für die Entwicklung, Bereitstellung und Betrieb von Microservices im VALEO ERP-System. Diese Standards sollen eine konsistente, wartbare und skalierbare Architektur gewährleisten.

## Docker-Container Standards

### Base Images

- **Frontend Services**
  - Base Image: `node:18-alpine` für React-basierte Services
  - Zweistufige Builds verwenden: Build-Stage und Runtime-Stage
  - Minimale Runtime-Dependencies installieren

- **Backend Services**
  - Python-Services: `python:3.11-slim`
  - Node.js-Services: `node:18-alpine`
  - Java-Services: `eclipse-temurin:17-jre-alpine`
  - Go-Services: `golang:1.21-alpine` (nur Build-Stage)

### Container-Struktur

- **Arbeitsverzeichnis**: Jeder Container MUSS `/app` als Arbeitsverzeichnis verwenden
- **Benutzer**: Container SOLLEN als nicht-privilegierter Benutzer ausgeführt werden
- **Ports**: Standardmäßig verwenden:
  - Frontend-Services: Port 80
  - Backend-Services: Port 8080
  - Management/Metrics: Port 8081
- **Health-Checks**: Jeder Container MUSS Endpoints für Liveness und Readiness Probes bereitstellen
- **Entrypoints**: Verwendung von Shell-Scripts für Entrypoints vermeiden, direkte Ausführung bevorzugen
- **Multi-Stage Builds**: Für alle Produktions-Images verwenden

### Security

- **Vulnerability Scanning**: Alle Images MÜSSEN mit Trivy/Clair gescannt werden
- **Minimale Abhängigkeiten**: Nur notwendige Pakete installieren
- **Read-Only Filesystem**: Container-Dateisysteme SOLLTEN als read-only gemountet werden
- **No Root**: Container DÜRFEN NICHT als root ausgeführt werden
- **Secrets**: Keine Secrets in Docker-Images speichern, stattdessen Kubernetes Secrets verwenden

## Kubernetes Deployment Standards

### Ressourcen-Benennungen

- **Format**: `[anwendung]-[komponente]-[typ]`
- **Beispiel**: `erp-artikel-service`, `erp-frontend-deployment`
- **Namespace**: Alle Ressourcen in `erp-system` Namespace

### Ressourcen-Limits und Requests

- Jeder Pod MUSS CPU und Memory Requests definieren
- Jeder Pod MUSS CPU und Memory Limits definieren
- Empfohlene Startwerte:
  - Frontend-Services: 0.1 CPU / 128Mi Requests, 0.5 CPU / 256Mi Limits
  - Backend-Services: 0.2 CPU / 256Mi Requests, 1.0 CPU / 512Mi Limits
  - Datenbank-Services: 0.5 CPU / 512Mi Requests, 2.0 CPU / 1Gi Limits

### Pod-Spezifikationen

- **Liveness Probe**: HTTP-Check auf `/health/live` Endpunkt
- **Readiness Probe**: HTTP-Check auf `/health/ready` Endpunkt
- **Startup Probe**: Für Services mit längerer Startzeit
- **Pod Disruption Budget**: Für kritische Services definieren
- **Anti-Affinity Rules**: Für hohe Verfügbarkeit konfigurieren
- **Node Affinity**: Für spezielle Hardware-Anforderungen

### Konfiguration

- **ConfigMaps**: Für nicht-sensitive Konfiguration
- **Secrets**: Für sensitive Daten wie Passwörter, API-Keys
- **Umgebungsvariablen**: Für Service-spezifische Konfiguration
- **Externe Konfiguration**: Zentrale ConfigMaps für gemeinsame Einstellungen

## API Design Standards

### URL-Struktur

- **Base Path**: `/api/v{version-number}/{resource}`
- **Ressourcen**: Im Plural und Kleinbuchstaben (z.B. `/api/v1/articles`)
- **Unterressourcen**: Durch Pfadsegmente darstellen (z.B. `/api/v1/articles/{id}/variants`)
- **Filter**: Als Query-Parameter (z.B. `?category=electronics&active=true`)
- **Paginierung**: Via `?page=1&limit=20` Query-Parameter
- **Sortierung**: Via `?sort=name:asc,created:desc` Query-Parameter

### HTTP-Methoden

- **GET**: Zum Abrufen von Ressourcen (idempotent)
- **POST**: Zum Erstellen von Ressourcen
- **PUT**: Zum vollständigen Ersetzen von Ressourcen (idempotent)
- **PATCH**: Für partielle Updates (JSON Patch oder Merge Patch)
- **DELETE**: Zum Löschen von Ressourcen

### Antwortformate

- **Content-Type**: Immer `application/json`
- **Status-Codes**:
  - 200: Erfolgreiche Operation mit Rückgabedaten
  - 201: Erfolgreiche Erstellung einer Ressource
  - 204: Erfolgreiche Operation ohne Rückgabedaten
  - 400: Ungültige Anfrage (Validierungsfehler)
  - 401: Nicht authentifiziert
  - 403: Nicht autorisiert
  - 404: Ressource nicht gefunden
  - 409: Konflikt (z.B. Versions-Konflikt)
  - 422: Verarbeitungsfehler
  - 500: Serverfehler
- **Fehlerantworten**: Einheitliches Format für alle Services:
  ```json
  {
    "error": {
      "code": "RESOURCE_NOT_FOUND",
      "message": "Article with ID 12345 not found",
      "details": [
        { "field": "articleId", "message": "Unknown article ID" }
      ]
    }
  }
  ```

### Dokumentation

- **OpenAPI/Swagger**: Jeder Service MUSS eine OpenAPI 3.0 Spezifikation bereitstellen
- **Endpoint**: Swagger UI unter `/api/docs` verfügbar machen
- **Beschreibungen**: Alle Endpunkte, Parameter und Schemas dokumentieren
- **Beispiele**: Request- und Response-Beispiele bereitstellen

## Datenbankstandards

### Schema-Design

- **Datenbank pro Service**: Jeder Microservice SOLLTE eine eigene Datenbank haben
- **Präfix**: Alle Tabellen mit Service-Präfix versehen (z.B. `artikel_products`)
- **ID-Felder**: UUID für Service-übergreifende IDs, Auto-Increment für interne IDs
- **Zeitstempel**: Jede Tabelle MUSS `created_at` und `updated_at` haben
- **Soft Deletes**: Verwenden von `deleted_at` anstelle von harten Löschungen

### Migrations

- **Versionierte Migrationen**: Für alle Datenbankänderungen
- **Rollback-Skripte**: Für jede Migration
- **Schema-Version**: In Datenbank speichern
- **Migrationsausführung**: Bei Service-Start oder durch externes Tool

### Datenbankzugriff

- **ORM**: Einheitliche ORM/Datenzugriffsbibliothek pro Programmiersprache
- **Connection Pooling**: Für alle Datenbankverbindungen
- **Query-Optimierung**: N+1 Problem vermeiden, Indizes korrekt setzen
- **Lesereplikate**: Für rechenintensive Abfragen

## Logging und Monitoring

### Logging

- **Format**: Strukturierte JSON-Logs
- **Log-Level**: DEBUG, INFO, WARN, ERROR
- **Standardfelder**:
  - `timestamp`: ISO-8601 Format
  - `service`: Service-Name
  - `instance`: Pod/Container-ID
  - `level`: Log-Level
  - `message`: Menschenlesbare Nachricht
  - `trace_id`: Für Request-Tracking
  - `context`: Zusätzliche strukturierte Daten
- **Sensitive Daten**: NIEMALS Passwörter, Tokens oder PII loggen

### Metriken

- **Standardmetriken**:
  - Request-Zähler pro Endpunkt
  - Latenz pro Endpunkt (p50, p90, p99)
  - Fehlerrate pro Endpunkt
  - CPU und Memory Nutzung
  - Datenbankabfrage-Latenz
- **Custom-Metriken**:
  - Geschäftsprozess-spezifische Metriken
  - Cache-Hit/Miss-Rate
  - Queue-Länge für asynchrone Verarbeitung
- **Prometheus Endpoint**: Unter `/metrics` mit Standardformat

### Tracing

- **OpenTelemetry**: Für alle Services implementieren
- **Span-Attribute**:
  - HTTP-Methode und URL
  - Service-Name
  - Benutzer-ID (anonymisiert)
  - Ressourcen-ID
- **Propagation**: W3C Trace Context Header verwenden
- **Sampling**: Adaptives Sampling basierend auf Last

## Authentifizierung und Autorisierung

### Token-basierte Authentifizierung

- **JWT**: Als primärer Token-Typ
- **Scope-basierte Autorisierung**: Feinkörnige Berechtigungen in JWT
- **Token-Validierung**: In jedem Service
- **Token-Erneuerung**: Refresh-Token-Mechanismus
- **Kurzlebige Tokens**: Access Tokens mit 15-60 Minuten Gültigkeit

### API-Sicherheit

- **Rate-Limiting**: Für alle öffentlichen APIs
- **CORS**: Restriktive CORS-Politik für Browser-Zugriff
- **Content-Security-Policy**: Für Frontend-Services
- **API-Keys**: Für Service-zu-Service-Kommunikation

## Asynchrone Kommunikation

### Event-basierte Kommunikation

- **Event-Format**:
  ```json
  {
    "id": "unique-event-id",
    "type": "resource.action",
    "source": "service-name",
    "time": "ISO-8601-timestamp",
    "data": {},
    "metadata": {
      "trace_id": "correlation-id",
      "version": "1.0"
    }
  }
  ```
- **Event-Typen**: Folgen dem Muster `{resource}.{action}`
- **Idempotenz**: Alle Event-Handler MÜSSEN idempotent sein
- **Versioning**: Events MÜSSEN versioniert werden

### Message Broker

- **Kafka/RabbitMQ**: Als primärer Message Broker
- **Topic-Struktur**: `{service}.{resource}.{action}`
- **Partitionierung**: Nach Ressourcen-ID oder Tenant-ID
- **Dead-Letter-Queue**: Für fehlgeschlagene Verarbeitungen
- **Retry-Mechanismus**: Exponentielles Backoff

## Deployment-Prozess

### CI/CD Pipeline

- **Build-Prozess**:
  1. Code-Checkout
  2. Abhängigkeiten installieren
  3. Statische Codeanalyse
  4. Tests ausführen
  5. Docker-Image bauen
  6. Image scannen
  7. Image in Registry pushen
- **Deployment-Prozess**:
  1. Kubernetes-Manifeste vorbereiten
  2. Deployment in Dev/Staging-Umgebung
  3. Smoke-Tests ausführen
  4. Bei Erfolg: Deployment in Produktion
  5. Post-Deployment-Tests

### Versioning

- **Semantic Versioning**: Für alle Services (MAJOR.MINOR.PATCH)
- **Image-Tags**: `{version}-{build-number}`
- **Git-Flow**: Feature-Branches, Develop, Main/Master

## Service-Verantwortlichkeiten

Jeder Service sollte eine klar definierte, abgegrenzte Verantwortlichkeit haben und dem Single Responsibility Principle folgen.

### Stammdatenbereich

- **Artikel-Service**: Artikelstammdaten, Varianten, Preise
- **Partner-Service**: Kunden- und Lieferantendaten, Adressen, Kontakte
- **Lager-Service**: Lagerorte, Lagerplätze, Bestandsführung

### Prozessbereich

- **Angebot-Service**: Angebotserstellung und -verwaltung
- **Auftrag-Service**: Auftragserfassung und -verarbeitung
- **Rechnung-Service**: Rechnungserstellung, Zahlungsverfolgung
- **Lieferschein-Service**: Lieferscheinerstellung, Versandprozesse

### Spezialbereich

- **QS-Service**: Qualitätssicherung, Prüfvorgänge
- **Chargen-Service**: Chargenverwaltung, Rückverfolgbarkeit
- **Waagen-Service**: Anbindung und Messdatenerfassung von Waagen
- **TSE-Service**: Technische Sicherheitseinrichtung für Kassensysteme

### Unterstützende Services

- **Auth-Service**: Authentifizierung, Autorisierung, Benutzerverwaltung
- **Notification-Service**: E-Mail, Push-Benachrichtigungen, In-App-Nachrichten
- **Report-Service**: Berichtserstellung, Datenexport
- **File-Service**: Dokumentenverwaltung, Speicherung

## Fehlerbehebung und Betrieb

### Diagnostik

- **Health-Endpoints**: `/health/live`, `/health/ready`
- **Debug-Endpunkte**: In nicht-produktiven Umgebungen
- **Thread-Dumps**: Für JVM-basierte Services
- **Profiling**: In Staging-Umgebung ermöglichen

### Betriebshandbuch

Für jeden Service ist ein Betriebshandbuch zu erstellen, das folgende Punkte abdeckt:

1. Service-Übersicht und Verantwortlichkeiten
2. Abhängigkeiten zu anderen Services
3. Konfigurationsparameter
4. Häufige Fehler und deren Behebung
5. Monitoring-Dashboards und Alarme
6. Skalierungs-Richtlinien
7. Backup- und Wiederherstellungsverfahren
8. Notfallkontakte und Eskalationswege

## Zusammenfassung

Diese Standards bilden die Grundlage für die Entwicklung und den Betrieb der VALEO ERP-Microservices. Sie sollen sicherstellen, dass die Architektur konsistent, wartbar und skalierbar bleibt. Bei Fragen oder Unklarheiten ist das Architektur-Team zu kontaktieren.

Die Standards werden regelmäßig überprüft und bei Bedarf aktualisiert. Alle Entwicklungsteams sind verpflichtet, diese Standards einzuhalten und bei neuen Microservices zu implementieren. 