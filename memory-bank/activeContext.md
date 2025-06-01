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

## Theme-Modul-Update (Mai 2024)

### Status
Das Theme-Modul wurde erfolgreich überarbeitet und ist jetzt vollständig implementiert. Die lokale State-Management-Lösung ersetzt die vorherige Redux-Implementierung, was zu einer verbesserten Performance und besserer Wartbarkeit führt.

### Kernkomponenten
- **ThemeProvider**: Zentrale Komponente mit lokalem State-Management
- **Layout**: Vereinfachte Layout-Komponente mit Theme-Integration
- **AI**: KI-Assistent für natürlichsprachliche Theme-Befehle
- **ThemeSettings**: Benutzeroberfläche für manuelle Theme-Anpassungen
- **ThemeDemo**: Demonstrationsanwendung mit Tabs für verschiedene Ansichten

### Verfügbare Theme-Optionen
- **Modi**: Hell (Standard), Dunkel, Hoher Kontrast
- **Varianten**: Default, Modern, Classic, Odoo
- **Anpassungen**: Farben, Schriftarten, Abstände, Radien, Animationen

### Erreichte Vorteile
1. **Verbesserte Performance** durch Entfernung der Redux-Abhängigkeit
2. **Reduzierte Bundle-Größe** durch Eliminierung nicht benötigter Abhängigkeiten
3. **Vereinfachte Wartung** durch lokalisierten State in einer Komponente
4. **Verbesserte Barrierefreiheit** durch Implementierung des Hochkontrast-Modus
5. **Intuitive Benutzerführung** durch natürlichsprachliche KI-Befehle

### Dokumentation und Hilfsmittel
- Ausführliche README_THEME.md-Dokumentation im Frontend-Verzeichnis
- PowerShell-Skript (start_theme_demo.ps1) für einfachen Start der Demo
- npm-Skript "theme-demo" in package.json für konsistenten Zugriff

### Nächste Schritte
1. Integration des Theme-Moduls mit anderen Frontendkomponenten
2. Erweiterung der KI-Funktionalität für komplexere Theme-Anpassungen
3. Entwicklung zusätzlicher Theme-Varianten für spezifische Anwendungsbereiche
4. Implementierung von Theme-Voreinstellungen für Benutzerprofile

Das Theme-Modul bildet nun eine solide Grundlage für ein konsistentes und anpassbares Benutzererlebnis im gesamten ERP-System.

## Standardisierte Frontend-Entwicklung

## Aktuelle Module und Status

### Theme-Modul
Status: **Abgeschlossen**

Das Theme-Modul wurde vollständig implementiert und integriert. Es bietet folgende Funktionen:
- Flexible Theme-Modi (Hell, Dunkel, Hoher Kontrast)
- Verschiedene Theme-Varianten (Default, Odoo, Modern, Classic)
- Anpassbare Parameter für detaillierte Stilanpassungen
- Barrierefreiheitsfunktionen
- Natürlichsprachliche Steuerung der Theme-Einstellungen

Eine detaillierte Dokumentation findet sich in `memory-bank/archive/theme-modul-implementation.md`.

## Theme-Modul-Problembehebung (Juni 2024)

### Identifizierte Probleme
1. **PowerShell-Skript-Fehler**: Das start_theme_demo.ps1-Skript enthielt Syntax-Fehler (fehlende schließende Klammern), die dazu führten, dass das Skript nicht ausgeführt werden konnte.
2. **Strukturelle Redundanz**: Das Skript enthielt doppelte Funktionsaufrufe, die zu widersprüchlichem Verhalten führten.
3. **Abhängigkeitskonflikte**: Es gab Inkompatibilitäten zwischen der installierten React-Version (18.3.1) und einigen Paketen (insbesondere react-qr-reader), die nur mit älteren React-Versionen kompatibel sind.
4. **JSX-Konfigurationsprobleme**: Beim Start des Frontends traten JSX-Fehler auf, obwohl die Konfiguration in vite.config.js korrekt schien.

### Implementierte Lösungen
1. **Skript-Reparatur**: Die Syntax-Fehler wurden behoben und die Skriptstruktur vereinfacht.
2. **Entfernung von Redundanz**: Doppelte Funktionsaufrufe wurden entfernt, um ein klares Ausführungsmuster zu gewährleisten.
3. **Dokumentation von Inkompatibilitäten**: Die Konflikte zwischen Paketversionen wurden dokumentiert.
4. **Validierung der JSX-Konfiguration**: Die JSX-Konfiguration in vite.config.js wurde bestätigt und als korrekt verifiziert.

### Präventive Maßnahmen
Um ähnliche Probleme in Zukunft zu vermeiden, wurden folgende Prozesse etabliert:
1. **Syntax-Prüfung**: PowerShell-Skripte werden vor Commit mit einem Syntax-Checker geprüft.
2. **Kompatibilitätsprüfung**: Neue Abhängigkeiten werden auf Kompatibilität mit bestehenden Paketen überprüft.
3. **Klare Skriptstruktur**: Bei der Skripterstellung wird eine einheitliche Struktur mit eindeutigen Funktionsaufrufen eingehalten.
4. **Verbesserte Dokumentation**: Bekannte Inkompatibilitäten werden in der README.md dokumentiert.

Diese Maßnahmen sollen sicherstellen, dass die Entwicklungsumgebung stabil bleibt und neue Features ohne Komplikationen hinzugefügt werden können.

## Artikel-Stammdaten-Modul (Juni 2024)

### Implementierte Funktionalität
- Erweitertes Artikel-Stammdatenmodell (backend/models/artikel_stammdaten.py)
- Anbindung an bestehendes Artikel-Modell über Beziehungen
- KI-Erweiterungen für Artikeldaten (Klassifikation, Preisempfehlungen, automatische Texte)
- Frontend-Seite mit Tab-basiertem Editor für alle Stammdaten-Bereiche
- Integration in die Routing-Struktur des Frontends

### Aktuelle Entwicklungsstufe
- Backend-Modelle vollständig implementiert
- Frontend-UI vollständig implementiert
- API-Endpunkte und API-Integration noch ausstehend
- Tests noch ausstehend

### Besonderheiten
- Verwendung von SQLAlchemy JSON-Typen für komplexe Datenstrukturen
- Trennung von Basis-Artikeldaten und erweiterten Stammdaten
- Integration von KI-Funktionen in die Stammdatenpflege

## VAN-Analyse: Systemstatus (Juni 2024)

## Überblick

Diese VAN-Analyse (Validation and Navigation) bewertet den aktuellen Status des VALEO NeuroERP-Systems mit besonderem Fokus auf die kürzlich implementierte Redis- und Celery-Integration für asynchrone Aufgabenverarbeitung.

## 1. Validierung der Systemkomponenten

### 1.1 Backend-Komponenten

#### Hauptserver
- **Modular Server (Port 8000)**: Implementiert als primärer Server mit modularer Struktur, zeigt jedoch Import-Fehler bei einigen Modulen:
  - Fehler beim Import von `backend.api.batch_processing`
  - Fehler beim Import von `backend.api.performance`
  - Fehler bei der Datenbankperformance-Middleware: `DBPerformanceMiddleware`
- **Minimal Server (Port 8001)**: Funktioniert als vereinfachte Version mit weniger Abhängigkeiten
- **Demo Server (Port 8002)**: Einfacher Server für Demo-Zwecke, funktioniert zuverlässig
- **Demo Server mit Celery (Port 8003)**: Neue Implementierung zur Integration mit Celery und Redis

#### Asynchrone Verarbeitung
- **Redis (Port 6379)**: Erfolgreich als Message Broker und Result Backend eingerichtet
- **Celery Worker**: Konfiguriert mit mehreren Queues (default, reports, imports, exports, optimization)
- **Celery Flower (Port 5555)**: Implementiert für Monitoring und Verwaltung von Celery-Tasks

#### API-Endpunkte
- **Task-Endpunkte**: Implementiert für die Interaktion mit Celery-Tasks
- **Report-Endpunkte**: Implementiert für die Generierung von Berichten

### 1.2 Frontend-Komponenten
- **React-Anwendung**: Modulare Struktur mit TypeScript
- **Material-UI**: Verwendet für konsistentes Design
- **Komponenten**: Implementiert für verschiedene Module (Finanzen, Chargenverwaltung, QS, Notfallmanagement)

### 1.3 Microservices
- **Finance-Service**: Eigenständiger Microservice
- **Beleg-Service**: Eigenständiger Dokumenten-Service
- **Observer-Service**: Performance-Überwachung mit Echtzeit-Metriken

## 2. Identifizierte Probleme

### 2.1 Systemstart-Probleme
- **PowerShell-Parameter-Fehler**: Das Startskript `scripts/start_system.ps1` verwendet den `-NoExit`-Parameter, der nicht mit `Start-Process` kompatibel ist
  ```
  Start-Process : Es wurde kein Parameter gefunden, der dem Parameternamen "NoExit" entspricht.
  ```
- **Verbesserte Version**: `scripts/start_system_improved.ps1` wurde erstellt, um diese Probleme zu beheben

### 2.2 Backend-Probleme
- **Import-Fehler**: Mehrere Module können nicht importiert werden:
  ```
  Fehler beim Import von QS-Futtermittel-Modellen: cannot import name 'JSONB' from 'sqlalchemy'
  Fehler beim Import von Lager-Modellen: cannot import name 'LagerOrt' from 'backend.models.lager'
  Fehler beim Import von Partner-Modellen: cannot import name 'KundenGruppe' from 'backend.models.partner'
  ```
- **Fehlende Module**: Einige Module fehlen oder sind falsch konfiguriert:
  ```
  No module named 'backend.api.batch_processing'
  No module named 'backend.api.performance'
  ```

### 2.3 Celery-Integration-Probleme
- **Start-Fehler**: PowerShell-Probleme beim Starten von Celery und Redis
- **Abhängigkeiten**: Nicht alle benötigten Python-Pakete sind installiert oder in der richtigen Version

## 3. Navigation und Empfehlungen

### 3.1 Kurzfristige Maßnahmen

1. **PowerShell-Skripte korrigieren**: 
   - Die verbesserte Version des Startskripts (`scripts/start_system_improved.ps1`) verwenden
   - Alle Startskripte auf Kompatibilität mit Windows-Umgebungen überprüfen

2. **Abhängigkeiten installieren**:
   - Das erstellte Installationsskript `scripts/python_deps_install.py` ausführen
   - Fehlende Abhängigkeiten identifizieren und hinzufügen

3. **Demo-Server mit Celery verwenden**:
   - Den neueren `demo_server_celery.py` als primären Entwicklungsserver verwenden
   - Minimale Abhängigkeiten für maximale Stabilität beibehalten

4. **Redis-Konfiguration optimieren**:
   - Persistenz konfigurieren
   - Korrekte Verbindungsparameter sicherstellen

### 3.2 Mittelfristige Maßnahmen

1. **API-Standardisierung**:
   - Einheitliche Struktur für alle Endpunkte etablieren
   - OpenAPI-Dokumentation vervollständigen

2. **Celery-Tasks erweitern**:
   - Implementierung von Export/Import-Tasks
   - Implementierung von Optimierungs-Tasks

3. **Frontend-Integration**:
   - UI-Komponenten für Task-Verwaltung erstellen
   - Fortschrittsanzeige für laufende Tasks implementieren

4. **Monitoring verbessern**:
   - Prometheus-Integration für Celery-Metriken
   - Grafana-Dashboard für Performance-Visualisierung

### 3.3 Langfristige Maßnahmen

1. **Mikroservice-Architektur konsolidieren**:
   - Klare Abgrenzung zwischen Diensten definieren
   - Einheitliche Kommunikationsprotokolle etablieren

2. **Skalierbarkeit verbessern**:
   - Horizontale Skalierung für Celery-Worker ermöglichen
   - Redis-Cluster für höhere Verfügbarkeit einrichten

3. **CI/CD-Pipeline erweitern**:
   - Automatische Tests für Celery-Tasks hinzufügen
   - Deployment-Prozess für alle Komponenten vereinheitlichen

## 4. Technische Schulden

1. **Fehlende Tests**: Viele Module haben keine automatisierten Tests
2. **Inkonsistente Fehlerbehandlung**: Verschiedene Ansätze in verschiedenen Modulen
3. **Dokumentationslücken**: Einige Module sind nicht ausreichend dokumentiert
4. **Duplizierter Code**: Ähnliche Funktionalität in verschiedenen Modulen
5. **Abhängigkeitsprobleme**: Kreisreferenzen und unklare Abhängigkeiten zwischen Modulen

## 5. Zusammenfassung und nächste Schritte

Die Integration von Redis und Celery für asynchrone Aufgabenverarbeitung ist ein wichtiger Schritt zur Verbesserung der Systemarchitektur. Die identifizierten Probleme sollten jedoch systematisch angegangen werden, um die Stabilität und Wartbarkeit des Systems zu gewährleisten.

### Nächste Schritte (priorisiert)

1. **Startprobleme beheben**: Das verbesserte Startskript finalisieren und testen
2. **Abhängigkeiten stabilisieren**: Fehlende Module und Abhängigkeiten installieren
3. **API-Tests erstellen**: Automatische Tests für die neuen API-Endpunkte entwickeln
4. **Fehlerbehandlung standardisieren**: Konsistente Fehlerbehandlung in allen Modulen einführen
5. **Dokumentation vervollständigen**: Detaillierte Dokumentation für die Redis/Celery-Integration erstellen
