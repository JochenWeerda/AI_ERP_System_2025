# Integration von BrowserTools MCP mit Odoo Studio

## Übersicht

Dieses Dokument beschreibt, wie BrowserTools MCP verwendet wird, um mit Odoo Studio zu interagieren und Prototypen für die VALEO Enterprise Suite zu erstellen.

## Installation und Einrichtung

### 1. BrowserTools MCP Server starten

```bash
# In Cursor IDE ausführen
npx @agentdeskai/browser-tools-mcp@latest

# In einem separaten Terminal ausführen
npx @agentdeskai/browser-tools-server@latest
```

### 2. Chrome-Erweiterung installieren

1. Chrome-Erweiterung von GitHub herunterladen: [BrowserTools MCP Chrome Extension](https://github.com/AgentDeskAI/browser-tools-mcp)
2. In Chrome installieren (chrome://extensions/ → "Entpackte Erweiterung laden")
3. Chrome DevTools öffnen (F12) und zum "BrowserToolsMCP" Tab navigieren

### 3. Verbindung zu Odoo herstellen

1. Odoo im Browser öffnen: http://localhost:8069
2. Mit Admin-Zugangsdaten anmelden (admin/admin)
3. Zu Studio navigieren: http://localhost:8069/web#action=studio&mode=app_creator

## Verwendung von BrowserTools MCP mit Odoo Studio

### Grundlegende Funktionen

1. **Screenshots aufnehmen**: Verwendet `captureScreenshot` Tool, um den aktuellen Zustand von Odoo Studio zu erfassen
2. **DOM-Elemente analysieren**: Verwendet `getSelectedElement` Tool, um Details zu UI-Elementen zu erhalten
3. **Konsolenausgaben überwachen**: Verwendet `getLogs` Tool, um JavaScript-Fehler und -Warnungen zu erkennen
4. **Netzwerkaktivität überwachen**: Verwendet `getNetworkLogs` Tool, um API-Aufrufe zu analysieren

### Workflow für Prototypenerstellung

1. **App erstellen**: 
   - In Studio: "Neue App erstellen" wählen
   - Name und Icon festlegen
   - Screenshot mit BrowserTools MCP erfassen

2. **Modelle definieren**:
   - Modellname und Felder festlegen
   - Feldtypen und -attribute konfigurieren
   - DOM-Elemente mit BrowserTools MCP analysieren, um Feldkonfigurationen zu verstehen

3. **Ansichten erstellen**:
   - Formular-, Listen-, Kanban- und Suchansichten erstellen
   - UI-Elemente anordnen und konfigurieren
   - Screenshots der Ansichten mit BrowserTools MCP erfassen

4. **Aktionen und Menüs definieren**:
   - Aktionen für Modelle erstellen
   - Menüstruktur aufbauen
   - Navigation testen und mit BrowserTools MCP dokumentieren

5. **Export und Analyse**:
   - Studio-generierte XML-Dateien exportieren
   - Mit BrowserTools MCP die XML-Struktur analysieren
   - Erkenntnisse für die manuelle Implementierung dokumentieren

## Dokumentation der Erkenntnisse

### 1. Dashboard-Modul

#### Schritte in Odoo Studio:
1. Neue App "VALEO Dashboard" erstellen
2. Modell `valeo.dashboard` mit Feldern anlegen
3. Formularansicht mit Header, Hauptbereich und Notebook erstellen
4. Kanban- und Listenansicht konfigurieren
5. Aktionen und Menüs definieren

#### Erkenntnisse:
- Studio generiert XML-IDs im Format `studio_customization.xxx`
- Berechnete Felder werden als normale Felder angelegt, die Logik muss separat implementiert werden
- Für spezielle Widgets wie JSON-Editor ist zusätzlicher Code erforderlich

### 2. Dokumentenmanagement-Modul

#### Schritte in Odoo Studio:
1. Neue App "VALEO Dokumente" erstellen
2. Hauptmodell `valeo.document` mit Basis-, Datei- und Metadatenfeldern anlegen
3. Hilfsmodelle für Tags und Ordner erstellen
4. Formularansicht mit Dateivorschau und Metadaten konfigurieren
5. Kanban- und Listenansicht für Dokumentenübersicht erstellen

#### Erkenntnisse:
- Binary-Felder benötigen spezielle Behandlung für die Vorschau
- Hierarchische Strukturen (Ordner) werden mit parent_path-Feld implementiert
- OCR und KI-Funktionen erfordern externe Dienste

### 3. E-Signatur-Modul

#### Schritte in Odoo Studio:
1. Neue App "VALEO E-Signatur" erstellen
2. Hauptmodell `valeo.esignature` mit Prozess- und Sicherheitsfeldern anlegen
3. Hilfsmodelle für Unterzeichner und Protokollierung erstellen
4. Formularansicht mit Statusbar und Prozess-Buttons konfigurieren
5. Kanban-Ansicht mit Statusgruppierung erstellen

#### Erkenntnisse:
- Statusübergänge werden durch Buttons im Header gesteuert
- Für Sicherheitsfunktionen ist zusätzlicher Code erforderlich
- E-Mail-Integration erfolgt über Server-Aktionen

## Exportierte XML-Strukturen

### Beispiel: Dashboard-Formularansicht

```xml
<record id="view_valeo_dashboard_form" model="ir.ui.view">
    <field name="name">valeo.dashboard.form</field>
    <field name="model">valeo.dashboard</field>
    <field name="arch" type="xml">
        <form string="Dashboard">
            <header>
                <button name="action_update_dashboard" string="Aktualisieren" type="object" class="oe_highlight"/>
            </header>
            <sheet>
                <div class="oe_title">
                    <h1><field name="name" placeholder="Dashboard-Name"/></h1>
                </div>
                <group>
                    <group>
                        <field name="dashboard_type"/>
                        <field name="user_id"/>
                    </group>
                    <group>
                        <field name="is_favorite"/>
                        <field name="kpi_count"/>
                    </group>
                </group>
                <notebook>
                    <page string="Konfiguration">
                        <field name="config"/>
                    </page>
                </notebook>
            </sheet>
            <div class="oe_chatter">
                <field name="message_follower_ids" widget="mail_followers"/>
                <field name="message_ids" widget="mail_thread"/>
            </div>
        </form>
    </field>
</record>
```

## Zusammenfassung

Die Integration von BrowserTools MCP mit Odoo Studio ermöglicht eine effiziente Erstellung und Dokumentation von Prototypen für die VALEO Enterprise Suite. Durch die Analyse der Studio-generierten XML-Strukturen können wir die Implementierung unserer Module optimieren und sicherstellen, dass sie den Odoo-Standards entsprechen.

Die wichtigsten Vorteile dieser Integration sind:

1. **Visuelle Dokumentation**: Screenshots und DOM-Analysen bieten eine klare Referenz für die Implementierung
2. **Fehleranalyse**: Konsolenausgaben und Netzwerkaktivität helfen bei der Identifizierung von Problemen
3. **Strukturanalyse**: Die Untersuchung der generierten XML-Dateien liefert wertvolle Einblicke in die Odoo-Architektur
4. **Effizienzsteigerung**: Die Kombination aus visuellem Design und Code-Analyse beschleunigt den Entwicklungsprozess

Mit diesem Wissen können wir unsere Module weiterentwickeln und eine vollständige Enterprise-ähnliche Erfahrung in der Community-Edition bieten, auch wenn der Zugang zu Odoo Studio in Zukunft nicht mehr verfügbar sein sollte. 