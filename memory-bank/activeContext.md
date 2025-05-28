# Aktiver Kontext

## Aktuelles Modul: Finanzen

### Status
Das Finanzmodul wurde erfolgreich im Backend implementiert und in den Minimal-Server integriert. Die grundlegenden Datenmodelle (Konten, Buchungen, Belege, Kostenstellen), API-Endpunkte und Berechnungsfunktionen (Bilanz, GuV) wurden erfolgreich umgesetzt.

### Frontend-Entwicklung
Es wurden Konzepte und erste Implementierungen für das Frontend des Finanzmoduls erstellt:
- Grundkonzept für die Benutzeroberfläche mit UI-Mockups
- Implementierung von React-Komponenten für Kontenplan und Kontodetails
- Definition einer Komponentenstruktur für das gesamte Finanzmodul
- Technische Konzepte für State-Management und API-Integration

### Nächste Schritte

#### Kurzfristig
1. Frontend-Komponenten in die bestehende Frontend-Anwendung integrieren
2. Implementierung der Dashboard-Komponente mit KPIs und Diagrammen
3. Entwicklung der Buchungs- und Belegkomponenten

#### Mittelfristig
1. Implementierung von Datenbankpersistenz für Finanzdaten
2. Erweiterung des Berichtswesens
3. Integration mit anderen Modulen (Verkauf, Einkauf, Personal)

#### Langfristig
1. Erweiterung um Mehrwährungsfähigkeit
2. Implementierung von Prognose- und Planungsfunktionen
3. Integration von KI-Funktionen für automatische Buchungsvorschläge und Anomalieerkennung

## Architektur-Entscheidungen

### Backend
- REST-API mit FastAPI
- In-Memory-Caching für Performance-Optimierung
- Standardisierter Kontenplan als Basis (SKR03/04)
- Modulare Struktur mit klar definierten Verantwortlichkeiten

### Frontend
- React-Komponenten mit TypeScript für Typsicherheit
- Material-UI für konsistentes Design
- Responsive Design für Desktop- und Mobile-Nutzung
- Redux für State-Management

## Offene Fragen
- OCR-Integration für automatische Belegerfassung: Browser vs. Server
- Wahl der Diagramm-Bibliothek für Frontend-Visualisierungen
- Detaillierte Zugriffsrechte-Struktur für Finanzdaten

## Architektur-Übersicht

Das ERP-System ist in der Umstellung von einer monolithischen zu einer Microservice-Architektur. Dies erfordert eine schrittweise Dekomposition des Codes und die Einführung von Überwachungs- und Optimierungsmechanismen.

### Aktuelle Komponenten

1. **Frontend**: React-Anwendung mit modularem Aufbau
   - Theme-System wurde implementiert mit Hell/Dunkel/Kontrast-Modi
   - Redux wurde für zustandsbasierte Komponenten entfernt
   - Router wurde für Navigation implementiert

2. **Backend**: Python-basierter Kern mit modularen Diensten
   - Minimal-Server läuft auf Port 8003
   - Kompatibilität mit Python 3.13.3 sichergestellt
   - Vorbereitung auf Microservices durch Service-Extraktion

3. **Observer-Service**: Microservice-Überwachungssystem
   - Überwacht CPU, RAM und Latenzzeiten aller Services
   - Erstellt automatisierte Optimierungsberichte
   - Web-Dashboard zur Echtzeit-Visualisierung der Metriken

### In Entwicklung

1. **Theme Microservice**: 
   - Extraktion aus dem Monolithen
   - REST-API für Theme-Verwaltung
   - Eigenständiger Node.js-Service auf Port 5001
   - Integration mit Observer-Service erforderlich

## Projektübergreifende Performance-Richtlinien

Die folgenden Anforderungen gelten für alle Komponenten des ERP-Systems:

### Verbindliche Anforderungen

1. **Health-Endpunkte für alle Services**
   - Jeder Microservice muss einen `/health`-Endpunkt implementieren
   - Standard-JSON-Format gemäß `observer-microservice.md`
   - Mindestdaten: Status, Version, CPU, RAM, Antwortzeiten

2. **Performance-Schwellwerte**
   - API-Antwortzeiten: 300ms Warnung, 500ms kritisch
   - CPU-Auslastung: 70% Warnung, 85% kritisch
   - RAM-Auslastung: 75% Warnung, 90% kritisch
   - Schwellwerte in `observer_config.json` konfigurierbar

3. **Leistungskritische Komponenten überwachen**
   - ERP-Kern (Backend-Minimal-Server)
   - Theme-Service (Erste Microservice-Extraktion)
   - Frontend-Client (Browser-Performance)
   - Datenbank-Performance

4. **CI/CD-Integration**
   - Performance-Tests vor jedem Merge verpflichtend
   - Schwellwert-Überschreitungen blockieren Pull-Requests
   - Automatisierte Optimierungsberichte bei jedem Build

### Entwicklungspraxis

1. **Optimierungsprozess**
   - Observer identifiziert Performance-Probleme
   - Team bewertet Berichte und priorisiert Optimierungen
   - Implementierung der Verbesserungen
   - Verifizierung durch Observer-Metriken

2. **Dokumentation**
   - Performance-Entscheidungen in Commit-Messages dokumentieren
   - Service-spezifische Schwellwerte begründen
   - Optimierungsansätze in Optimierungsberichten reflektieren

3. **Verantwortlichkeiten**
   - Jedes Team ist für die Performance seiner Services verantwortlich
   - DevOps überwacht Observer-Infrastruktur
   - Architektur-Team überprüft Schwellwerte
   - Produktmanagement priorisiert Performance-Issues

Diese Richtlinien sichern eine kontinuierliche Performance-Optimierung und bilden die Grundlage für eine skalierbare, reaktionsschnelle Microservice-Architektur.

## Aktueller Fokus
- Implementierung der Kernfunktionen des ERP-Systems
- Integration von TSE und Fuhrwerkswaagen
- Entwicklung der Frontend-Komponenten

## Letzte Änderungen
- Backend-API-Endpunkte für die Hauptfunktionen implementiert
- Datenbankmodelle für die wichtigsten Tabellen erstellt
- Frontend-UI-Komponenten für Dashboard, Artikel-Katalog und Waagen-Management entwickelt
- Integration mit TSE und Fuhrwerkswaagen umgesetzt

## Nächste Schritte
1. Erweiterte Geschäftslogik implementieren
2. Berichtssystem entwickeln
3. Authentifizierung und Berechtigungen verfeinern
4. Umfassende Tests durchführen

## Aktive Entscheidungen
- Memory Bank wird als primäres System für die Dokumentation und Aufgabenverfolgung verwendet
- Der Entwicklungsprozess folgt dem strukturierten Ansatz: VAN → PLAN → CREATIVE → IMPLEMENT → REFLECT → ARCHIVE
- Backend nutzt FastAPI mit SQLAlchemy für optimale Leistung und Entwicklungsgeschwindigkeit
- Frontend basiert auf React mit Material-UI für modernes, responsives Design
- Die Projektarchitektur ist modular aufgebaut, um zukünftige Erweiterungen zu erleichtern
- Die KI-Funktionen werden zunächst mit einfachen Algorithmen implementiert und später durch komplexere Modelle ersetzt

## Microservice-API-Übersicht (Stand: Mai 2024)

| Microservice      | Endpunkt                | Methode | Beschreibung                                 |
|-------------------|------------------------|---------|----------------------------------------------|
| Finance           | /health                | GET     | Health-Check (Status, DB, LLM, Cache)        |
|                   | /metrics               | GET     | Prometheus-Metriken                          |
|                   | /llm/analyze-transaction | POST  | Transaktionsanalyse (LLM)                    |
|                   | /llm/suggest-account   | POST    | Kontovorschläge (LLM)                        |
|                   | /llm/analyze-document  | POST    | Dokumentenanalyse (LLM)                      |
|                   | /llm/detect-anomalies  | POST    | Anomalieerkennung (LLM)                      |
| Document          | /health                | GET     | Health-Check (Status, DB, OCR, etc.)         |
|                   | /metrics               | GET     | Prometheus-Metriken                          |
|                   | /document/analyze      | POST    | Dokumentenanalyse                            |
| E-Commerce        | /health                | GET     | Health-Check (Status, DB, Payment, etc.)     |
|                   | /metrics               | GET     | Prometheus-Metriken                          |
|                   | /order/process         | POST    | Bestellung verarbeiten                       |
|                   | /order/status          | GET     | Bestellstatus abfragen                       |

**Hinweis:** Alle Microservices sollten mindestens /health und /metrics bereitstellen.

---

## API-Vorlage für Health- und Metrics-Endpunkte (FastAPI)

```python
from fastapi import APIRouter
from fastapi.responses import JSONResponse, PlainTextResponse
import prometheus_client

router = APIRouter()

@router.get("/health", summary="Health-Check", tags=["System"])
def health_check():
    # Hier können weitere Checks (DB, Cache, externe Services) ergänzt werden
    return {"status": "ok", "details": {}}

@router.get("/metrics", summary="Prometheus-Metriken", tags=["Monitoring"])
def metrics():
    data = prometheus_client.generate_latest()
    return PlainTextResponse(data, media_type="text/plain")
```

Diese Vorlage kann in jedem Microservice unter `src/api/v1/system.py` oder ähnlich eingebunden werden.

---

**Update Mai 2024:**
- Health- und Metrics-Endpunkte sind jetzt in allen Microservices (Finance, Document, E-Commerce) implementiert und in die jeweilige FastAPI-App eingebunden.
- Die Endpunkte sind unter /health und /metrics erreichbar und liefern Status- bzw. Prometheus-kompatible Monitoring-Daten.
- Die API-Übersicht und die Vorlage sind in diesem Dokument enthalten.

**Nächste Schritte:**
- Dokumentation und OpenAPI-Spezifikation prüfen/ergänzen

## ToDo: Integration der Datenfelder für KI-ERP Warenwirtschaftssystem

- Umsetzung der Datenfelder für Belegfolge, Angebot, Auftrag, Lieferschein, Rechnung, Eingangslieferschein und Bestellung gemäß Spezifikation
- Implementierung aller Grunddatenfelder und KI-spezifischen Felder als Pydantic-Modelle im Backend (FastAPI)
- Sicherstellen, dass alle Felder über die API zugänglich und validiert sind
- Entwicklung von Microservices für KI-Funktionen (z.B. Preisoptimierung, Prognosen, Automatisierung)
- Export- und Trainingsschnittstellen für KI-Modelle bereitstellen
- Schrittweise Integration der KI-Komponenten (zuerst Bedarfsermittlung, Preisoptimierung, dann Prognosen etc.)
- Frontend-Komponenten zur Visualisierung der KI-Vorschläge und Prognosen entwickeln
- Sicherstellen, dass die Datenbank-Schemas und Migrationsskripte alle Felder abbilden
- API-Dokumentation automatisch aus den Modellen generieren
- Erweiterbarkeit und Versionierung der Datenfelder gewährleisten

(Quelle: memory-bank/Datenfelder für KI-ERP Warenwirtschaftssystem.md)

## Update Belegfolgen

Die Belegfolgen für das Warenwirtschaftssystem sind jetzt explizit getrennt und vollständig dokumentiert. Siehe dazu den neuen Abschnitt in 'Datenfelder für KI-ERP Warenwirtschaftssystem.md'. 