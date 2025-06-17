# Integration von Browser-Use und MCP für Odoo Studio

Diese Dokumentation beschreibt die Integration von Browser-Use und dem Model Context Protocol (MCP) für die automatisierte Erstellung von Prototypen mit Odoo Studio.

## Überblick

Die Integration von Browser-Use und MCP mit Odoo Studio ermöglicht es, den Prototyping-Prozess zu automatisieren und zu beschleunigen. Durch die Verwendung von Browser-Automatisierung können Prototypen in Odoo Studio erstellt, XML-Definitionen extrahiert und in die VALEO Enterprise Suite integriert werden.

## Komponenten

### 1. Browser-Use

[Browser-Use](https://github.com/browser-use/web-ui) ist ein Tool zur Automatisierung von Webbrowsern, das es KI-Agenten ermöglicht, mit Webseiten zu interagieren. Es bietet eine benutzerfreundliche Oberfläche und unterstützt verschiedene LLM-Provider.

### 2. MCP (Model Context Protocol)

Das [Model Context Protocol](https://github.com/Saik0s/mcp-browser-use) ist ein Protokoll, das die Kommunikation zwischen KI-Modellen und externen Tools standardisiert. Es ermöglicht KI-Agenten, Aktionen in externen Systemen auszuführen.

### 3. Odoo Studio

Odoo Studio ist ein visuelles Entwicklungswerkzeug für Odoo, das es ermöglicht, Anwendungen ohne Programmierung zu erstellen. Es bietet eine Drag-and-Drop-Oberfläche für die Erstellung von Ansichten, Modellen und Feldern.

## Vorteile der Integration

- **Automatisierung des Prototyping-Prozesses**: Reduziert die Zeit für die Erstellung von Prototypen.
- **Konsistente Qualität**: Gewährleistet konsistente Prototypen durch automatisierte Prozesse.
- **Einfache Extraktion von XML-Definitionen**: Automatisiert die Extraktion von XML-Definitionen aus Odoo Studio.
- **Nahtlose Integration**: Integriert extrahierte XML-Definitionen direkt in die VALEO Enterprise Suite.

## Einrichtung

### 1. Installation der erforderlichen Pakete

```bash
# Installiere die benötigten Pakete
npm install
```

### 2. Konfiguration der Browser-Tools

```bash
# Starte den Browser-Tools-Server
npm run start-browser-tools

# Starte den MCP-Server
npm run start-mcp
```

### 3. Konfiguration von Odoo

Stelle sicher, dass Odoo mit aktiviertem Studio läuft und über die API zugänglich ist.

## Verwendung

### 1. Erstellen eines Prototyps mit Odoo Studio

```bash
# Erstelle einen Dashboard-Prototyp
npm run create-prototype -- --type dashboard --model valeo.analytics --name "Analytics Dashboard"
```

### 2. Extraktion von XML-Definitionen

```bash
# Extrahiere XML-Definitionen aus Odoo Studio
npm run extract-xml -- --type dashboard
```

### 3. Integration der XML-Definitionen

```bash
# Integriere extrahierte XML-Definitionen
npm run integrate-xml -- --source views/extracted --destination views
```

## Beispiel: Automatisierte Erstellung eines KPI-Widgets

```javascript
// Beispiel für die Verwendung des Browser-Use-Skripts zur Erstellung eines KPI-Widgets
const task = "Erstelle ein KPI-Widget für Umsatz in Odoo Studio";
const result = await runBrowserAgent(task);
console.log(result);
```

## Vergleich: Browser-Use vs. MCP-Browser-Use

| Feature | Browser-Use | MCP-Browser-Use |
|---------|------------|----------------|
| Benutzeroberfläche | Webbasiert | CLI und API |
| LLM-Integration | Mehrere Provider | Mehrere Provider |
| Persistente Sitzungen | Ja | Ja |
| Eigener Browser | Ja | Ja |
| Protokoll | Proprietär | MCP |
| Verwendung mit Odoo Studio | Gut | Sehr gut |

## Fazit

Die Integration von Browser-Use und MCP mit Odoo Studio bietet eine leistungsstarke Lösung für die automatisierte Erstellung von Prototypen. Durch die Verwendung dieser Tools können Entwickler Zeit sparen und konsistente Prototypen erstellen.

## Weiterführende Links

- [Browser-Use GitHub Repository](https://github.com/browser-use/web-ui)
- [MCP-Browser-Use GitHub Repository](https://github.com/Saik0s/mcp-browser-use)
- [Odoo Studio Dokumentation](https://www.odoo.com/documentation/14.0/applications/general/studio.html)
- [VALEO Enterprise Suite Dokumentation](custom_addons/valeo_enterprise_suite/docs/implementation_summary.md) 