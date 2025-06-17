# Connection Monitor für das ERP-System

## Übersicht

Der Connection Monitor ist ein Dienst, der die Netzwerkverbindung überwacht und bei Unterbrechungen automatisch alle erforderlichen Kubernetes-Services neu startet. Dies gewährleistet eine hohe Verfügbarkeit des ERP-Systems, auch bei vorübergehenden Netzwerkproblemen.

## Funktionen

- **Automatische Überwachung**: Kontinuierliche Überwachung der Internetverbindung
- **Intelligente Wiederherstellung**: Automatischer Neustart aller Services bei Wiederherstellung der Verbindung
- **Dynamisches Port-Management**: Automatische Verwendung alternativer Ports, wenn die primären Ports belegt sind
- **Ausführliche Protokollierung**: Detaillierte Logs für Diagnose und Überwachung
- **Flexible Ausführungsmodi**: Verschiedene Betriebsmodi für unterschiedliche Einsatzszenarien

## Ausführungsmodi

Der Connection Monitor kann in verschiedenen Modi ausgeführt werden:

| Modus | Beschreibung | Befehl |
|-------|-------------|--------|
| Vordergrund | Ausführung im Vordergrund mit Konsolenausgabe | `.\scripts\start_connection_monitor.ps1` |
| Hintergrund | Ausführung als PowerShell-Job im Hintergrund | `.\scripts\start_connection_monitor.ps1 -Mode Background` |
| Geplante Aufgabe | Registrierung als Windows-Aufgabe mit Autostart | `.\scripts\start_connection_monitor.ps1 -Mode Task` |
| Windows-Dienst | Registrierung als Windows-Dienst (benötigt NSSM) | `.\scripts\start_connection_monitor.ps1 -Mode Service` |
| Port-Diagnose | Nur Diagnose der Portverfügbarkeit | `.\scripts\start_connection_monitor.ps1 -Mode Ports` |

## Port-Konfiguration

Der Connection Monitor ist für die folgenden Dienste und Ports konfiguriert:

| Dienst | Primärer Port | Alternative Ports |
|--------|--------------|-------------------|
| frontend | 8080 | 8081, 8082, 8083, 8084 |
| frontend-custom | 8082 | 8182, 8282, 8382, 8482 |
| frontend-react | 8090 | 8091, 8092, 8093, 8094 |
| grafana | 3000 | 3001, 3002, 3003, 3004 |
| jaeger | 16686 | 16687, 16688, 16689, 16690 |
| api-gateway-simple | 8085 | 8185, 8285, 8385, 8485 |
| service-mesh-dashboard | 8095 | 8195, 8295, 8395, 8495 |

## Integration mit dem ERP-System

Der Connection Monitor ist vollständig in das ERP-System integriert und kann automatisch mit dem Systemstart gestartet werden. Die Integration erfolgt über mehrere Komponenten:

1. **Systemkonfiguration**: Die Datei `config/system_config.json` enthält alle Einstellungen für den Connection Monitor.
2. **Starter-Skript**: `scripts/start_connection_monitor.ps1` dient als Brücke zwischen dem Hauptsystem und dem Monitor.
3. **Integrationsskript**: `scripts/connection_monitor_integration.ps1` wird vom Hauptsystem-Starter eingebunden.
4. **Hauptmonitor**: `scripts/connection_monitor.ps1` enthält die eigentliche Überwachungs- und Wiederherstellungslogik.

## Automatischer Start

Der Connection Monitor kann automatisch mit dem ERP-System gestartet werden. Dies wird über die Systemkonfiguration gesteuert:

```json
"ConnectionMonitor": {
    "Enabled": true,
    "AutoStart": true,
    "Mode": "Background",
    "ScriptPath": "scripts/connection_monitor.ps1"
}
```

## Protokollierung

Der Connection Monitor protokolliert alle Aktivitäten in den folgenden Dateien:

- **Hauptprotokoll**: `logs/connection_monitor.log`
- **Starter-Protokoll**: `logs/connection_monitor_launcher.log`
- **Systemstarter-Protokoll**: `logs/connection_monitor_[DATUM].log`

## Fehlerbehebung

### Häufige Probleme

| Problem | Mögliche Ursache | Lösung |
|---------|------------------|--------|
| Monitor startet nicht | Skriptpfad falsch | Überprüfen Sie den Pfad in der Systemkonfiguration |
| Ports sind belegt | Andere Anwendungen nutzen Ports | Verwenden Sie `start_connection_monitor.ps1 -Mode Ports` zur Diagnose |
| Services starten nicht neu | Kubernetes-Cluster nicht erreichbar | Überprüfen Sie, ob Minikube läuft |

### Diagnose

Verwenden Sie den Port-Diagnosemodus, um Probleme mit belegten Ports zu identifizieren:

```powershell
.\scripts\start_connection_monitor.ps1 -Mode Ports
```

### Manueller Neustart

Um den Connection Monitor manuell neu zu starten:

```powershell
# Beenden aller laufenden Instanzen
Get-Process | Where-Object { $_.CommandLine -like "*connection_monitor.ps1*" } | Stop-Process -Force

# Neustart im Hintergrund
.\scripts\start_connection_monitor.ps1 -Mode Background -Force
```

## Anpassung

Die Konfiguration des Connection Monitors kann in der Datei `config/system_config.json` angepasst werden. Die wichtigsten Einstellungen sind:

- **CheckInterval**: Intervall der Verbindungsprüfung in Sekunden
- **MaxRestartAttempts**: Maximale Anzahl an Neustartversuchen
- **ServicesToMonitor**: Liste der zu überwachenden Kubernetes-Services
- **PortForwardConfig**: Konfiguration der Ports für jeden Service

## Technische Details

Der Connection Monitor verwendet die folgenden Technologien:

- **PowerShell**: Für die Skriptausführung und Prozesssteuerung
- **Kubernetes CLI (kubectl)**: Für die Interaktion mit dem Kubernetes-Cluster
- **Windows-Netzwerk-APIs**: Für die Überwachung der Netzwerkverbindung und Portbelegung 