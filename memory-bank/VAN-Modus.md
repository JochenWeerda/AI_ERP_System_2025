# VAN-Modus (Validation and Navigation)

## Überblick

Der VAN-Modus (Validation and Navigation) ist der erste Schritt im Entwicklungsprozess des VALEO NeuroERP-Systems. Er dient dazu, die Entwicklungsumgebung zu validieren und einen Navigationsplan für die bevorstehende Entwicklung zu erstellen.

## Zweck des VAN-Modus

1. **Validierung** der Entwicklungsumgebung und des Projektstatus
2. **Navigation** durch die Codebasis und Erstellung eines Entwicklungsplans
3. **Identifikation** von technischen Schulden und Verbesserungspotentialen
4. **Standardisierung** der Entwicklungspraktiken und -prozesse

## VAN-Modus Prozess

### 1. Validierung

In der Validierungsphase werden folgende Aspekte überprüft:

- **Systemarchitektur**: Überprüfung der vorhandenen Komponenten und ihrer Beziehungen
- **Entwicklungsumgebung**: Validierung der benötigten Software, Versionen und Konfigurationen
- **Codequalität**: Überprüfung des Codes auf Einhaltung von Standards und Best Practices
- **Startprozesse**: Validierung der Prozesse zum Starten der verschiedenen Systemkomponenten

### 2. Navigation

In der Navigationsphase werden folgende Aspekte behandelt:

- **Architektur-Roadmap**: Festlegung einer Roadmap für zukünftige Architekturentwicklungen
- **Technische Priorisierung**: Priorisierung von technischen Aufgaben nach Wichtigkeit und Dringlichkeit
- **Ressourcen-Allokation**: Zuordnung von Ressourcen zu den verschiedenen Entwicklungsbereichen
- **Technische Schulden**: Identifikation und Planung zur Beseitigung von technischen Schulden

## VAN-Modus Artefakte

Der VAN-Modus produziert folgende Artefakte:

1. **VAN-Analyse im `activeContext.md`**: Eine umfassende Analyse des aktuellen Systemstatus
2. **VAN-Statusbericht im `progress.md`**: Ein Statusbericht mit konkreten nächsten Schritten
3. **Validierungsskripte**: Skripte zur automatisierten Validierung der Entwicklungsumgebung
   - `scripts/van-frontend-validator.ps1`: Validiert die Frontend-Entwicklungsumgebung
   - `scripts/van-backend-validator.ps1`: Validiert die Backend-Entwicklungsumgebung
4. **Einheitliches Startsystem**: Ein Skript zum einheitlichen Starten aller Komponenten
   - `start_valeo_system.ps1`: Zentrales Startskript mit VAN-Validierung

## VAN-Modus Validierungsskripte

### Frontend-Validator

Der Frontend-Validator (`scripts/van-frontend-validator.ps1`) überprüft folgende Aspekte:

- Existenz des Frontend-Verzeichnisses und der Unterverzeichnisse
- Korrekte Konfiguration von `package.json` und `vite.config.js`
- Installation der benötigten Abhängigkeiten
- JSX-Konfiguration für React-Komponenten
- Portverfügbarkeit für den Frontend-Server

Der Validator kann fehlende Verzeichnisse erstellen und Konfigurationsdateien korrigieren.

### Backend-Validator

Der Backend-Validator (`scripts/van-backend-validator.ps1`) überprüft folgende Aspekte:

- Existenz des Backend-Verzeichnisses und der Unterverzeichnisse (models, api, services)
- Korrekte Konfiguration von `requirements.txt` und anderen Konfigurationsdateien
- Python-Version und Abhängigkeiten
- Portverfügbarkeit für Backend-Services
- Observer-Konfiguration und Cache-Manager

Der Validator kann fehlende Verzeichnisse erstellen und Standardkonfigurationen bereitstellen.

## Einheitliches Startsystem

Das einheitliche Startsystem (`start_valeo_system.ps1`) bietet folgende Funktionen:

- Start aller Komponenten mit einem einzigen Befehl
- Optionale VAN-Validierung vor dem Start
- Konfigurierbare Ports und Logging-Level
- Unterstützung für selektiven Start einzelner Komponenten
- Ausführliche Zustandsberichte und Fehlerbehandlung

### Verwendung

```powershell
.\start_valeo_system.ps1 [-All] [-Frontend] [-Backend] [-Finance] [-Beleg] [-Observer] [-Van]
                         [-OpenBrowser] [-BackendPort <port>] [-FinancePort <port>]
                         [-BelegPort <port>] [-LogLevel <level>] [-Verbose]
```

## Regelmäßige VAN-Analyse

Es wird empfohlen, alle 4 Wochen eine neue VAN-Analyse durchzuführen, um:

1. Den Fortschritt zu bewerten
2. Neue Prioritäten festzulegen
3. Technische Schulden zu identifizieren
4. Die Entwicklungsrichtung anzupassen

Die Ergebnisse der VAN-Analyse sollten in der Memory Bank dokumentiert werden:

- Aktuelle VAN-Analyse in `activeContext.md`
- VAN-Statusbericht in `progress.md`
- Neue Aufgaben in `tasks.md`

## VAN-Modus Best Practices

1. **Immer mit VAN beginnen**: Bevor neue Entwicklungen gestartet werden, sollte eine VAN-Analyse durchgeführt werden
2. **Validierungsskripte aktualisieren**: Bei Änderungen an der Architektur oder den Abhängigkeiten
3. **Technische Schulden sofort dokumentieren**: Wenn technische Schulden identifiziert werden
4. **Entwicklungsplan verfolgen**: Den in der VAN-Analyse erstellten Plan konsequent verfolgen
5. **Regelmäßige Neubewertung**: Alle 4 Wochen eine neue VAN-Analyse durchführen 