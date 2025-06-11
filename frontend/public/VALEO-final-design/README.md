# VALEO-Final-Design Dashboard

Dieses Verzeichnis enthält das finale VALEO-Dashboard-Design mit vollständiger Funktionalität, einschließlich:

- Modernes und responsives UI
- Chat-Funktionalität (intern, Kunden, KI-Assistent)
- Alle Modulkarten für ERP-Funktionen
- Systemstatus-Übersicht
- Belegfolgen-Visualisierung
- Benachrichtigungen
- Benutzerprofilmenü

## Dateien

- `index.html`: Die Hauptdatei des Dashboards mit allen UI-Elementen
- `styles/styles.css`: Die CSS-Stilrichtlinien für das Dashboard

## Kubernetes-Deployment

Das Dashboard wird über folgende Kubernetes-Ressourcen bereitgestellt:

- **Deployment**: `valeo-final-dashboard` (in `kubernetes-manifests/valeo-dashboard-deployment.yaml`)
- **ConfigMaps**:
  - `valeo-dashboard-html` (HTML-Inhalt)
  - `valeo-dashboard-css` (CSS-Stile)
- **Services**:
  - `valeo-final-dashboard` (ClusterIP)
  - `valeo-dashboard-nodeport` (NodePort 30080)
  - `valeo-dashboard-nodeport-alt` (NodePort 30090)

## Zugriff

Das Dashboard ist über folgende Methoden erreichbar:

1. **NodePort**: 
   - http://localhost:30080
   - http://localhost:30090

2. **Port-Forwarding**:
   ```
   kubectl port-forward -n erp-system svc/valeo-final-dashboard 8095:80
   ```
   Dann über http://localhost:8095 erreichbar

## Systemübersichtsseite

Die alte Systemübersichtsseite (`valeo-dashboard-system-status.yaml`) wurde für spätere Wiederverwendung beibehalten. Sie kann als Unterseite in das finale Dashboard integriert werden, indem:

1. Die HTML/CSS-Inhalte aus dem `valeo-dashboard-system-status.yaml` extrahiert werden
2. Eine neue Route/Unterseite im Dashboard erstellt wird
3. Die Systemübersichtsseite in diese Route eingebunden wird

## Nächste Schritte

- Integration der Systemübersichtsseite als Unterseite
- Verknüpfung der Modulkarten mit entsprechenden Unterseiten
- Implementierung der API-Endpunkte für die Datenanbindung
- Fertigstellung der Chat-Funktionalität mit Backend-Anbindung 