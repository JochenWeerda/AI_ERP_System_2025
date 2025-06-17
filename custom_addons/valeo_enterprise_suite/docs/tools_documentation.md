# VALEO NeuroERP Tools Dokumentation

Diese Dokumentation beschreibt die Verwendung der VALEO Tools für die Entwicklung und das Testen der VALEO Enterprise Suite.

## Inhaltsverzeichnis

1. [Entwicklungsumgebung](#entwicklungsumgebung)
2. [Browser MCP und Browser Tools](#browser-mcp-und-browser-tools)
3. [XML-Extraktion und -Integration](#xml-extraktion-und--integration)
4. [Test-Framework](#test-framework)
5. [CLI-Tool](#cli-tool)

## Entwicklungsumgebung

### Einrichtung

Die Entwicklungsumgebung kann mit dem `start_dev_env.bat`-Skript im Hauptverzeichnis gestartet werden:

```bash
./start_dev_env.bat
```

Dieses Skript startet:
- Odoo und PostgreSQL mit Docker Compose
- Browser MCP Server auf Port 9010
- Browser Tools Server auf Port 3025

### Voraussetzungen

- Docker Desktop
- Node.js (Version 14 oder höher)
- NPM
- Chrome oder Chromium-basierter Browser mit der Browser Tools MCP Extension

### Manuelle Einrichtung

Alternativ können Sie die Umgebung auch manuell einrichten:

```bash
# Starte Odoo und PostgreSQL
docker-compose up -d

# Installiere Abhängigkeiten
npm install -g @browsermcp/mcp @agentdeskai/browser-tools-server @agentdeskai/browser-tools-mcp commander @xmldom/xmldom

# Starte Browser MCP
npx @browsermcp/mcp --port 9010

# Starte Browser Tools Server
npx @agentdeskai/browser-tools-server
```

## Browser MCP und Browser Tools

### Browser MCP

Browser MCP ermöglicht es, den Browser zu automatisieren und mit Webseiten zu interagieren. Es wird für die XML-Extraktion aus Odoo Studio und für automatisierte Tests verwendet.

#### Verwendung

```javascript
// Beispiel für die Verwendung von Browser MCP
const command = {
  name: "navigate",
  args: { url: "http://localhost:8069" }
};

const result = executeBrowserMcpCommand(command);
```

### Browser Tools

Browser Tools ist eine Alternative zu Browser MCP und bietet ähnliche Funktionen. Es wird hauptsächlich für die Interaktion mit Odoo Studio verwendet.

#### Verwendung

```javascript
// Beispiel für die Verwendung von Browser Tools
npx @agentdeskai/browser-tools-mcp
```

## XML-Extraktion und -Integration

### XML-Extraktion

Das XML-Extraktionsskript ermöglicht es, XML-Definitionen aus Odoo Studio zu extrahieren und in Dateien zu speichern.

#### Verwendung

```bash
# Mit dem CLI-Tool
node custom_addons/valeo_enterprise_suite/tools/valeo_tools.js extract-xml

# Direkt
node custom_addons/valeo_enterprise_suite/tools/studio_xml_extractor.js
```

#### Parameter

- `--type`: Widget-Typ (kpi, chart, list, filter)

### XML-Integration

Das XML-Integrationsskript integriert extrahierte XML-Definitionen in die VALEO Enterprise Suite.

#### Verwendung

```bash
# Mit dem CLI-Tool
node custom_addons/valeo_enterprise_suite/tools/valeo_tools.js integrate-xml

# Direkt
node custom_addons/valeo_enterprise_suite/tools/integrate_xml.js
```

#### Parameter

- `--file`: Spezifische XML-Datei integrieren

## Test-Framework

Das Test-Framework ermöglicht es, automatisierte Tests für die VALEO Enterprise Suite zu erstellen und auszuführen.

### Verwendung

```bash
# Mit dem CLI-Tool
node custom_addons/valeo_enterprise_suite/tools/valeo_tools.js run-tests

# Direkt
node custom_addons/valeo_enterprise_suite/tests/run_tests.js
```

### Parameter

- `--suite`: Spezifische Test-Suite ausführen (dashboard, documents, esign, analytics)

### Test-Suiten

- **Dashboard-Tests**: Tests für das Dashboard-Modul
- **Dokumentenmanagement-Tests**: Tests für das Dokumentenmanagement-Modul
- **E-Signatur-Tests**: Tests für das E-Signatur-Modul
- **Analytik-Tests**: Tests für das Analytik-Modul

### Eigene Tests erstellen

Um eigene Tests zu erstellen, können Sie die vorhandenen Tests als Vorlage verwenden. Erstellen Sie eine neue Datei im `tests`-Verzeichnis und importieren Sie das Test-Framework:

```javascript
const { 
  TestSuite, 
  loginToOdoo, 
  navigateToModule, 
  assertElementExists 
} = require('../tools/browser_test_framework');

// Erstelle Test-Suite
const myTests = new TestSuite(
  'Meine Tests',
  'Beschreibung meiner Tests'
);

// Füge Tests hinzu
myTests.addTest('Mein erster Test', async () => {
  await loginToOdoo();
  await navigateToModule('valeo_enterprise_suite.my_module');
  await assertElementExists('.my_element');
});

// Exportiere die Test-Suite
module.exports = {
  myTests,
  runTests: async () => {
    await myTests.run();
  }
};
```

## CLI-Tool

Das CLI-Tool `valeo_tools.js` dient als zentraler Einstiegspunkt für alle VALEO Tools.

### Verwendung

```bash
node custom_addons/valeo_enterprise_suite/tools/valeo_tools.js [Befehl] [Optionen]
```

### Befehle

- `extract-xml`: Extrahiert XML-Definitionen aus Odoo Studio
- `integrate-xml`: Integriert extrahierte XML-Definitionen in die VALEO Enterprise Suite
- `run-tests`: Führt automatisierte Tests aus
- `dashboard-prototype`: Erstellt einen Dashboard-Prototyp mit Odoo Studio
- `start-mcp`: Startet den Browser MCP Server
- `start-browser-tools`: Startet den Browser Tools Server
- `setup`: Richtet die Entwicklungsumgebung ein
- `help`: Zeigt Hilfe an

### Beispiele

```bash
# XML-Extraktion für KPI-Widgets
node custom_addons/valeo_enterprise_suite/tools/valeo_tools.js extract-xml --type kpi

# XML-Integration für eine spezifische Datei
node custom_addons/valeo_enterprise_suite/tools/valeo_tools.js integrate-xml --file my_file.xml

# Dashboard-Tests ausführen
node custom_addons/valeo_enterprise_suite/tools/valeo_tools.js run-tests --suite dashboard

# Entwicklungsumgebung einrichten
node custom_addons/valeo_enterprise_suite/tools/valeo_tools.js setup
``` 