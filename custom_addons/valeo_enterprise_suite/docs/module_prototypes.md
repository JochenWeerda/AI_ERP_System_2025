# Modul-Prototypen mit Odoo Studio

Diese Dokumentation beschreibt den Prozess zur Erstellung von Modul-Prototypen für die VALEO Enterprise Suite mit Odoo Studio.

## Überblick

Die VALEO Enterprise Suite besteht aus mehreren Modulen, die als Apps auf der Odoo-Startseite verfügbar sein sollen. Mit Hilfe von Odoo Studio können wir Prototypen für diese Module erstellen und sie als Apps auf der Startseite verfügbar machen.

## Module der VALEO Enterprise Suite

Die VALEO Enterprise Suite umfasst folgende Module:

1. **Dashboard-Modul**: Benutzerdefinierte Dashboards mit verschiedenen Widget-Typen
2. **Dokumentenmanagement-Modul**: Verwaltung von Dokumenten mit Kategorien, Tags und Versionierung
3. **E-Signatur-Modul**: Elektronische Unterzeichnung von Dokumenten
4. **Analytik-Modul**: KI-gestützte Analyse von Unternehmensdaten

## Automatisierte Prototypenerstellung

Das Tool `create_module_prototypes.js` automatisiert den Prozess der Prototypenerstellung für alle Module der VALEO Enterprise Suite. Es verwendet die MCP-Integration mit OpenAI, um die Prototypen in Odoo Studio zu erstellen.

### Voraussetzungen

- Odoo-Installation mit aktiviertem Studio-Modus
- Laufender Browser-Tools-Server
- Laufender MCP-Server mit OpenAI-Integration

### Verwendung

Um die Prototypen für alle Module zu erstellen:

```bash
npm run create-module-prototypes
```

Optionen:

- `--url <url>`: Die URL der Odoo-Instanz (Standard: http://localhost:8069)
- `--database <database>`: Die Odoo-Datenbank (Standard: odoo)
- `--login <login>`: Der Odoo-Benutzername (Standard: admin)
- `--password <password>`: Das Odoo-Passwort (Standard: admin)
- `--mcp-url <mcpUrl>`: Die URL des MCP-Servers (Standard: http://localhost:9222)
- `--learn-mode`: Aktiviert den Lernmodus, um die Fähigkeiten von Odoo Studio zu erlernen

Beispiel:

```bash
node tools/create_module_prototypes.js --url http://localhost:8069 --login admin --password admin
```

### Lernmodus

Der Lernmodus ist eine spezielle Funktion, die eine ausführliche Einführung in Odoo Studio bietet. Er zeigt schrittweise, wie man Module erstellt, Modelle definiert, Ansichten anpasst und vieles mehr. Dies ist besonders nützlich, um die Fähigkeiten von Odoo Studio nach der kostenlosen Testphase selbstständig zu übernehmen.

Um den Lernmodus zu aktivieren:

```bash
npm run learn-odoo-studio
```

Oder:

```bash
node tools/create_module_prototypes.js --learn-mode
```

## Manuelle Prototypenerstellung

Wenn Sie die Prototypen manuell erstellen möchten, folgen Sie diesen Schritten für jedes Modul:

### 1. Dashboard-Modul

1. Melden Sie sich bei Odoo an
2. Aktivieren Sie den Studio-Modus
3. Erstellen Sie ein neues Modul mit dem technischen Namen `valeo_dashboard`
4. Erstellen Sie ein neues Modell `valeo.dashboard` mit den entsprechenden Feldern
5. Erstellen Sie die Ansichten (Formular, Liste, Kanban) für das Modell
6. Erstellen Sie einen Menüeintrag mit dem Namen "Dashboards" und dem Icon "fa-tachometer-alt"
7. Stellen Sie sicher, dass das Modul als App auf der Startseite verfügbar ist
8. Speichern Sie den Prototyp

### 2. Dokumentenmanagement-Modul

1. Melden Sie sich bei Odoo an
2. Aktivieren Sie den Studio-Modus
3. Erstellen Sie ein neues Modul mit dem technischen Namen `valeo_document_management`
4. Erstellen Sie ein neues Modell `valeo.document` mit den entsprechenden Feldern
5. Erstellen Sie die Ansichten (Formular, Liste, Kanban, Suche) für das Modell
6. Erstellen Sie einen Menüeintrag mit dem Namen "Dokumente" und dem Icon "fa-file-alt"
7. Stellen Sie sicher, dass das Modul als App auf der Startseite verfügbar ist
8. Speichern Sie den Prototyp

### 3. E-Signatur-Modul

1. Melden Sie sich bei Odoo an
2. Aktivieren Sie den Studio-Modus
3. Erstellen Sie ein neues Modul mit dem technischen Namen `valeo_esignature`
4. Erstellen Sie ein neues Modell `valeo.signature` mit den entsprechenden Feldern
5. Erstellen Sie die Ansichten (Formular, Liste, Kanban) für das Modell
6. Erstellen Sie einen Menüeintrag mit dem Namen "E-Signaturen" und dem Icon "fa-signature"
7. Stellen Sie sicher, dass das Modul als App auf der Startseite verfügbar ist
8. Speichern Sie den Prototyp

### 4. Analytik-Modul

1. Melden Sie sich bei Odoo an
2. Aktivieren Sie den Studio-Modus
3. Erstellen Sie ein neues Modul mit dem technischen Namen `valeo_analytics`
4. Erstellen Sie ein neues Modell `valeo.analytics` mit den entsprechenden Feldern
5. Erstellen Sie die Ansichten (Formular, Liste, Kanban, Dashboard) für das Modell
6. Erstellen Sie einen Menüeintrag mit dem Namen "Analytik" und dem Icon "fa-chart-bar"
7. Stellen Sie sicher, dass das Modul als App auf der Startseite verfügbar ist
8. Speichern Sie den Prototyp

## Exportieren der Prototypen

Nach der Erstellung der Prototypen können Sie den generierten Code exportieren und in Ihre eigenen Module integrieren:

1. Öffnen Sie den Prototyp in Odoo Studio
2. Klicken Sie auf den Export-Button
3. Speichern Sie den generierten XML-Code
4. Integrieren Sie den XML-Code in Ihre eigenen Module

## Fehlerbehebung

### MCP-Server-Probleme

Wenn der MCP-Server nicht startet oder nicht korrekt funktioniert, überprüfen Sie Folgendes:

1. Stellen Sie sicher, dass der Browser-Tools-Server läuft
2. Überprüfen Sie, ob der Port 9222 verfügbar ist
3. Stellen Sie sicher, dass die OpenAI-API erreichbar ist

### Odoo-Studio-Probleme

Wenn Odoo Studio nicht korrekt funktioniert, überprüfen Sie Folgendes:

1. Stellen Sie sicher, dass Odoo korrekt installiert ist
2. Überprüfen Sie, ob der Studio-Modus aktiviert ist
3. Stellen Sie sicher, dass Sie über ausreichende Berechtigungen verfügen

## Ressourcen

- [Odoo Studio Dokumentation](https://www.odoo.com/documentation/16.0/applications/general/studio.html)
- [VALEO Enterprise Suite Dokumentation](../README.md)
- [OpenAI-Integration Dokumentation](./openai_integration.md)
- [Manuelle Prototypen-Erstellung](./manual_prototype_creation.md) 