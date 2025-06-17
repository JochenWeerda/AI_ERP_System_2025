# VALEO Enterprise Suite

## Beschreibung

Die VALEO Enterprise Suite ist eine Erweiterung für Odoo Community Edition, die Enterprise-Features durch KI-gestützte Module bereitstellt. Die Suite besteht aus mehreren Modulen, die zusammenarbeiten, um eine umfassende Lösung für Unternehmen zu bieten.

## Module

- **Dashboard-Modul**: Benutzerdefinierte Dashboards mit verschiedenen Widget-Typen
- **Dokumentenmanagement-Modul**: Verwaltung von Dokumenten mit Kategorien, Tags und Versionierung
- **E-Signatur-Modul**: Elektronische Unterzeichnung von Dokumenten
- **Analytik-Modul**: KI-gestützte Analyse von Unternehmensdaten mit OpenAI-Integration
- **Browser-Automatisierung**: MCP-Integration mit OpenAI für die KI-gesteuerte Prototypenerstellung

## Installation

1. Klonen Sie das Repository in das Odoo-Addons-Verzeichnis:
   ```
   git clone https://github.com/yourusername/valeo-enterprise-suite.git
   ```

2. Installieren Sie die Abhängigkeiten:
   ```
   cd valeo-enterprise-suite
   npm install
   ```

3. Installieren Sie das Modul in Odoo:
   - Gehen Sie zu Apps > Aktualisieren Sie die Modulliste
   - Suchen Sie nach "VALEO Enterprise Suite"
   - Klicken Sie auf "Installieren"

## Entwicklungswerkzeuge

Die Suite enthält verschiedene Werkzeuge zur Unterstützung der Entwicklung:

### Valeo Tools CLI

Ein zentrales Kommandozeilen-Tool für verschiedene Entwicklungsaufgaben:

```
node tools/valeo_tools.js [Befehl] [Optionen]
```

Verfügbare Befehle:

- `setup`: Richtet die Entwicklungsumgebung ein
- `extract-xml`: Extrahiert XML-Definitionen aus Odoo Studio
- `integrate-xml`: Integriert extrahierte XML-Definitionen in die Module
- `run-tests`: Führt automatisierte Tests aus
- `start-browser-tools`: Startet den Browser-Tools-Server
- `start-mcp`: Startet den MCP-Server für die Browser-Automatisierung mit OpenAI-Integration
- `start-browser-use`: Startet die Browser-Automatisierung für Odoo Studio
- `create-prototype`: Erstellt einen Prototyp mit Odoo Studio

Oder verwenden Sie die NPM-Skripte:

```
npm run [Skript]
```

Verfügbare Skripte:

- `npm run setup`: Richtet die Entwicklungsumgebung ein
- `npm run extract-xml`: Extrahiert XML-Definitionen aus Odoo Studio
- `npm run integrate-xml`: Integriert extrahierte XML-Definitionen
- `npm run test`: Führt Tests aus
- `npm run start-browser-tools`: Startet den Browser-Tools-Server
- `npm run start-mcp`: Startet den MCP-Server mit OpenAI-Integration
- `npm run start-browser-use`: Startet die Browser-Automatisierung für Odoo Studio
- `npm run create-prototype`: Erstellt einen Prototyp mit Odoo Studio
- `npm run mcp-integration`: Führt die MCP-Integration für Odoo Studio aus
- `npm run create-module-prototypes`: Erstellt Prototypen für alle Module mit Odoo Studio
- `npm run learn-odoo-studio`: Startet den Lernmodus für Odoo Studio

### Odoo Studio Automatisierung

Die Suite enthält Werkzeuge zur Automatisierung der Arbeit mit Odoo Studio:

#### Prototyp erstellen

```
node tools/valeo_tools.js create-prototype --type [type] --model [model] --name [name]
```

Optionen:
- `--type`: Prototyp-Typ (form, list, kanban, dashboard)
- `--model`: Odoo-Modell für den Prototyp
- `--name`: Name des Prototyps
- `--url`: URL der Odoo-Instanz (Standard: http://localhost:8069)
- `--database`: Odoo-Datenbank (Standard: odoo)
- `--login`: Odoo-Benutzername (Standard: admin)
- `--password`: Odoo-Passwort (Standard: admin)

Beispiel:
```
node tools/valeo_tools.js create-prototype --type dashboard --model valeo.analytics --name "Analytics Dashboard"
```

#### Browser-Automatisierung starten

```
node tools/valeo_tools.js start-browser-use --url [url] --login [login] --password [password]
```

Optionen:
- `--url`: URL der Odoo-Instanz (Standard: http://localhost:8069)
- `--database`: Odoo-Datenbank (Standard: odoo)
- `--login`: Odoo-Benutzername (Standard: admin)
- `--password`: Odoo-Passwort (Standard: admin)

### MCP-Integration für Odoo Studio

Die Suite enthält eine Integration mit dem Model Context Protocol (MCP) für die KI-gesteuerte Automatisierung von Odoo Studio:

#### MCP-Integration verwenden

```
node tools/mcp_integration.js --task [task] --model [model] --name [name]
```

Optionen:
- `--task`: Die Aufgabe, die der MCP-Agent ausführen soll
- `--model`: Das Odoo-Modell für den Prototyp
- `--name`: Der Name des Prototyps
- `--url`: Die URL der Odoo-Instanz (Standard: http://localhost:8069)
- `--database`: Die Odoo-Datenbank (Standard: odoo)
- `--login`: Der Odoo-Benutzername (Standard: admin)
- `--password`: Das Odoo-Passwort (Standard: admin)
- `--mcp-url`: Die URL des MCP-Servers (Standard: http://localhost:9222)

Beispiel:
```
node tools/mcp_integration.js --task "Erstelle ein KPI-Widget für Umsatz" --model res.partner --name "Umsatz KPI"
```

Oder verwenden Sie das NPM-Skript:
```
npm run mcp-integration -- --task "Erstelle ein KPI-Widget für Umsatz" --model res.partner --name "Umsatz KPI"
```

### OpenAI-Integration

Die Suite verwendet OpenAI für die KI-gestützte Automatisierung und Prototypenerstellung. Die Integration ist in den folgenden Dateien konfiguriert:

- `tools/valeo_tools.js`: Zentraler Einstiegspunkt mit OpenAI-Konfiguration
- `tools/mcp_integration.js`: MCP-Integration mit OpenAI-API-Key

Die Integration verwendet das Modell `gpt-3.5-turbo-0125` für eine optimale Balance zwischen Leistung und Tokenverbrauch.

Um den MCP-Server mit OpenAI-Integration zu starten:

```
npm run start-mcp
```

Weitere Details zur OpenAI-Integration finden Sie in der Dokumentation unter `docs/openai_integration.md`.

## Tests

Die Suite enthält automatisierte Tests für alle Module:

```
npm test
```

Oder für spezifische Tests:

```
node tools/valeo_tools.js run-tests --type [test-type]
```

## Dokumentation

Weitere Dokumentation finden Sie im `docs`-Verzeichnis:

- `implementation_summary.md`: Zusammenfassung der Implementierung
- `browser_tools_integration.md`: Integration von Browser-Tools und MCP
- `openai_integration.md`: Details zur OpenAI-Integration
- `module_prototypes.md`: Erstellung von Modul-Prototypen mit Odoo Studio
- `manual_prototype_creation.md`: Detaillierte Anleitung zur manuellen Erstellung von Prototypen
- Weitere Dokumentation wird folgen

## Lizenz

LGPL-3.0 