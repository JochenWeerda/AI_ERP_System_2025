# VALEO NeuroERP - Core

## Übersicht

Der Core-Bereich von VALEO NeuroERP enthält die Kernfunktionalität des ERP-Systems, die auf einem Fork eines Open-Source-ERP-Systems basiert und unter der LGPL v3 lizenziert ist. Er bildet die Grundlage für alle Geschäftsprozesse und kann durch proprietäre Module erweitert werden.

## Funktionsumfang

- **Stammdatenverwaltung**: Kunden, Lieferanten, Artikel, Preise
- **Bestellwesen**: Einkauf, Verkauf, Lieferungen
- **Lagerverwaltung**: Bestände, Zu- und Abgänge, Inventur
- **Finanzbuchhaltung**: Buchungen, Kontenrahmen, Kostenstellen
- **Berichtswesen**: Standard-Berichte und Auswertungen
- **Benutzerverwaltung**: Benutzer, Rollen, Berechtigungen
- **Dokumentenmanagement**: Verwaltung von Belegen und Dokumenten

## Technische Basis

- **Backend**: Python mit Flask/Django
- **Frontend**: React mit Material UI
- **Datenbank**: PostgreSQL
- **API**: RESTful mit OpenAPI/Swagger-Dokumentation
- **Authentifizierung**: OAuth2 / JWT
- **Containerisierung**: Docker / Kubernetes

## Architektur

Die Core-Architektur folgt einem modularen Aufbau mit klar definierten Schnittstellen:

```
core/
├── api/              # API-Definitionen und Endpunkte
├── config/           # Konfigurationsdateien
├── docs/             # Entwicklerdokumentation
├── models/           # Datenmodelle und Geschäftslogik
├── services/         # Geschäftslogik-Dienste
├── tests/            # Automatisierte Tests
├── utils/            # Hilfsfunktionen und -klassen
└── web/              # Web-Frontend
```

## Erweiterbarkeit

Der Core ist so konzipiert, dass er durch Module erweitert werden kann:

- **Plugin-System**: Registrierung von Erweiterungen zur Laufzeit
- **Event-System**: Publish/Subscribe-Mechanismus für Modulkommunikation
- **API-Erweiterung**: Erweiterbare API-Endpunkte
- **UI-Erweiterung**: Integration von Modulen in die Benutzeroberfläche

## Entwicklung

### Einrichtung der Entwicklungsumgebung

1. Repository klonen:
   ```bash
   git clone https://github.com/valeo-gmbh/valeo-neuroerp.git
   cd valeo-neuroerp/core
   ```

2. Abhängigkeiten installieren:
   ```bash
   pip install -r requirements.txt
   ```

3. Datenbank initialisieren:
   ```bash
   python manage.py initialize_db
   ```

4. Entwicklungsserver starten:
   ```bash
   python manage.py runserver
   ```

### Tests ausführen

```bash
pytest
```

### Code-Richtlinien

- PEP 8 für Python-Code
- ESLint für JavaScript
- Pytest für Tests
- Docstrings für alle Funktionen und Klassen

## Lizenzinformationen

Der Core-Bereich ist unter der GNU Lesser General Public License v3.0 (LGPL-3.0) lizenziert. Die vollständigen Lizenzinformationen finden Sie in der Datei [LICENSE-LGPL.txt](../docs/legal/LICENSE-LGPL.txt).

## Integration mit kommerziellen Modulen

Der Core bietet standardisierte Schnittstellen für die Integration mit den kommerziellen Modulen:

- **QS-Modul**: Integration über die Qualitätssicherungs-API
- **Chargenmanagement**: Anbindung über die Chargen-API
- **Waagen-Integration**: Verbindung über die Messwert-API
- **TSE-Modul**: Integration über die Fiskalisierungs-API
- **MCP-Modul**: Anbindung über die Protokoll-API für KI-Modelle
- **KI-Modul**: Integration über die Analyse-API 