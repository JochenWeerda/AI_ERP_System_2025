# VALERO NeuroERP API-Gateway-Testumgebung

Diese Testumgebung ermöglicht es, verschiedene API-Gateway-Lösungen (Traefik, Kong) für das VALERO NeuroERP-System zu vergleichen.

## Voraussetzungen

- Windows 10/11
- Docker Desktop
- kubectl
- k3d
- Helm

## Cluster-Setup

Der Testcluster wurde bereits mit folgendem Befehl erstellt:

```powershell
k3d cluster create valero-test-cluster --servers 1 --agents 2 --port "9080:80@loadbalancer" --port "9443:443@loadbalancer" --api-port 6551 --k3s-arg "--disable=traefik@server:0" --wait
```

## Namespaces

Folgende Namespaces werden verwendet:

- `traefik-test`: Für die Traefik-Installation
- `kong-test`: Für die Kong-Installation
- `monitoring`: Für Prometheus und Grafana
- `mock-backends`: Für Mock-Services zum Testen
- `odoo-integration`: Für den Odoo-Mock-Service

## Installation von Traefik

Traefik kann mit folgendem Befehl installiert werden:

```powershell
.\helm install traefik traefik/traefik -n traefik-test -f .\api-gateway-tests\traefik-config\values.yaml
```

## Installation von Kong (Alternative)

Alternativ können Sie Kong als API-Gateway installieren:

```powershell
.\api-gateway-tests\kong-install.ps1
```

## Installation der Test-Services

Die Mock-Services können mit folgenden Befehlen installiert werden:

```powershell
kubectl apply -f .\api-gateway-tests\mock-backend.yaml
kubectl apply -f .\api-gateway-tests\odoo-mock.yaml
```

## Konfiguration der Hosts-Datei

Damit die Test-Domains funktionieren, müssen die entsprechenden Einträge in der Hosts-Datei vorhanden sein. Führen Sie dazu das folgende PowerShell-Skript **als Administrator** aus:

```powershell
.\api-gateway-tests\update-hosts.ps1
```

Das Skript fügt folgende Einträge zur Hosts-Datei (`C:\Windows\System32\drivers\etc\hosts`) hinzu:

```
127.0.0.1 mock.test
127.0.0.1 odoo.test
127.0.0.1 dashboard.traefik.test
127.0.0.1 kong-admin.test
```

## Überprüfen des Systemstatus

Um den aktuellen Status der gesamten Testumgebung zu überprüfen, verwenden Sie:

```powershell
.\api-gateway-tests\check-status.ps1
```

Das Skript zeigt Ihnen den Status aller Komponenten und wichtige URLs an.

## Wechseln zwischen API-Gateways

Um zwischen den API-Gateways zu wechseln, verwenden Sie das folgende Skript:

```powershell
# Wechseln zu Traefik
.\api-gateway-tests\switch-gateway.ps1 -Gateway traefik

# Wechseln zu Kong
.\api-gateway-tests\switch-gateway.ps1 -Gateway kong
```

Das Skript aktualisiert automatisch die Ingress-Ressourcen und konfiguriert die Test-URLs für das entsprechende Gateway.

## Durchführung der Tests

Das Testskript kann wie folgt ausgeführt werden:

```powershell
.\api-gateway-tests\test-gateway.ps1
```

Für Performance-Tests:

```powershell
.\api-gateway-tests\run-performance-test.ps1
```

## Zugriff auf die Dashboards

### Traefik-Dashboard

Das Traefik-Dashboard ist unter folgender URL erreichbar:

```
http://dashboard.traefik.test:9080/dashboard/
```

### Kong-Admin-Dashboard

Das Kong-Admin-Dashboard ist unter folgender URL erreichbar:

```
http://kong-admin.test:9080/
```

## Aufräumen

Um die Testumgebung zu bereinigen, führen Sie das folgende Skript aus:

```powershell
.\api-gateway-tests\cleanup.ps1 