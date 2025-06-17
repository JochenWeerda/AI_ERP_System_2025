# OpenAI-Integration für VALEO Enterprise Suite

Diese Dokumentation beschreibt die Integration von OpenAI in die VALEO Enterprise Suite für die Browser-Automatisierung und KI-gestützte Prototypenerstellung.

## Überblick

Die VALEO Enterprise Suite verwendet das Model Context Protocol (MCP) für die Browser-Automatisierung und KI-gestützte Prototypenerstellung. Für diese Funktionen wird ein OpenAI-API-Key benötigt, der in der Implementierung integriert ist.

## Konfiguration

Die OpenAI-Integration ist in den folgenden Dateien konfiguriert:

1. `tools/valeo_tools.js` - Zentraler Einstiegspunkt für alle VALEO Tools
2. `tools/mcp_integration.js` - MCP-Integration für Odoo Studio

### API-Key und Modell

Die Implementierung verwendet folgende Konfiguration:

- **API-Key**: `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`
- **Modell**: `gpt-3.5-turbo-0125`

Das Modell wurde aufgrund seiner Effizienz und Kosteneffektivität für unseren Anwendungsfall ausgewählt. Es bietet eine gute Balance zwischen Leistung und Tokenverbrauch.

### MCP-Konfiguration

Die MCP-Konfiguration umfasst folgende Parameter:

```javascript
const MCP_CONFIG = {
  LLM_PROVIDER: 'openai',
  LLM_MODEL_NAME: 'gpt-3.5-turbo-0125',
  BROWSER_HEADLESS: false,
  BROWSER_USE_OWN_BROWSER: true,
  BROWSER_CDP_URL: 'http://localhost:9222'
};
```

## Verwendung

### MCP-Server starten

Um den MCP-Server mit der OpenAI-Integration zu starten, führen Sie folgenden Befehl aus:

```bash
npm run start-mcp
```

Dieser Befehl startet den MCP-Server mit der konfigurierten OpenAI-Integration.

### Browser-Tools-Server starten

Um den Browser-Tools-Server zu starten, führen Sie folgenden Befehl aus:

```bash
npm run start-browser-tools
```

### Prototyp erstellen

Um einen Prototyp mit Odoo Studio zu erstellen, führen Sie folgenden Befehl aus:

```bash
npm run create-prototype -- --type form --model res.partner --name "Kontaktformular"
```

## Testen der OpenAI-Integration

Die Suite enthält ein Test-Skript, um die OpenAI-Integration zu testen:

```bash
npm run test-openai
```

Dieses Skript führt folgende Tests durch:

1. **OpenAI-API-Verbindungstest**: Überprüft, ob die Verbindung zur OpenAI-API mit dem konfigurierten API-Key und Modell funktioniert.
2. **MCP-Integration-Test (optional)**: Überprüft, ob der MCP-Server läuft und mit der OpenAI-Integration konfiguriert ist.

### Testergebnisse

Die OpenAI-API-Verbindung wurde erfolgreich getestet und funktioniert wie erwartet. Der API-Key ist gültig und das ausgewählte Modell `gpt-3.5-turbo-0125` ist verfügbar.

## Fehlerbehebung

### API-Key-Probleme

Wenn Probleme mit dem API-Key auftreten, überprüfen Sie Folgendes:

1. Stellen Sie sicher, dass der API-Key gültig ist und nicht abgelaufen ist
2. Überprüfen Sie, ob der API-Key ausreichende Berechtigungen hat
3. Stellen Sie sicher, dass der API-Key korrekt in den Dateien konfiguriert ist

### MCP-Server-Probleme

Wenn der MCP-Server nicht startet oder nicht korrekt funktioniert, überprüfen Sie Folgendes:

1. Stellen Sie sicher, dass der Browser-Tools-Server läuft
2. Überprüfen Sie, ob der Port 9009 verfügbar ist
3. Stellen Sie sicher, dass die OpenAI-API erreichbar ist

### Typische Fehlermeldungen und Lösungen

- **"Error: connect ECONNREFUSED 127.0.0.1:9009"**: Der MCP-Server läuft nicht. Starten Sie ihn mit `npm run start-mcp`.
- **"Error: connect ECONNREFUSED 127.0.0.1:3027"**: Der Browser-Tools-Server läuft nicht. Starten Sie ihn mit `npm run start-browser-tools`.
- **"Error: Unauthorized"**: Der API-Key ist ungültig oder abgelaufen. Überprüfen Sie den API-Key.

## Sicherheitshinweise

Der API-Key ist direkt im Code gespeichert, was in einer Produktionsumgebung ein Sicherheitsrisiko darstellen kann. Für eine sicherere Implementierung sollten Sie den API-Key in einer Umgebungsvariable oder einer separaten Konfigurationsdatei speichern, die nicht in die Versionskontrolle aufgenommen wird.

## Ressourcenverbrauch

Das ausgewählte Modell `gpt-3.5-turbo-0125` ist ein guter Kompromiss zwischen Leistung und Kosten. Es verbraucht weniger Token als größere Modelle wie GPT-4, bietet aber dennoch ausreichende Leistung für die Browser-Automatisierung und Prototypenerstellung. 