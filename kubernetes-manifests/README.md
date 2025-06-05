# VALEO ERP Kubernetes Manifests

Diese Verzeichnis enthält alle Kubernetes-Manifeste für das VALEO ERP-System.

## Übersicht der Komponenten

### API-Gateway und Routing

* **api-gateway.yaml**: Hauptkonfiguration des API-Gateways
* **api-gateway-reverse-proxy.yaml**: Zentraler Reverse-Proxy für alle Services
* **direct-access-ingress.yaml**: Ingress-Ressource für Host-basiertes Routing
* **direct-nodeport-access.yaml**: Direkte NodePort-Services für alle Komponenten
* **external-access-solution.yaml**: LoadBalancer-Service für externen Zugriff

### Dashboard und Frontend

* **valeo-final-dashboard-deployment.yaml**: Dashboard-Deployment mit NGINX-Konfiguration
* **valeo-dashboard-nodeport-service.yaml**: NodePort-Service für Dashboard-Zugriff

### Helper-Skripte

* **cluster-ip-helper.ps1**: Zeigt alle NodePort-Services und deren Zugriffs-URLs an
* **forward-helper.ps1**: Richtet Port-Forwarding für alle Services ein

## Zugriffsmethoden

Das VALEO ERP-System bietet mehrere Zugriffsmethoden:

### 1. Über den Reverse Proxy (empfohlen)

Der zentrale Reverse Proxy bietet Zugriff auf alle Dienste über einen einzigen Punkt:

* **NodePort**: http://[cluster-ip]:30095
* **Port-Forwarding**: http://localhost:8000 (über forward-helper.ps1)

**Pfade**:
* `/` - Dashboard-UI
* `/api/` - API-Gateway
* `/services/finance/` - Finance Service
* `/services/document/` - Document Service
* `/services/beleg/` - Beleg Service
* `/services/theme/` - Theme Service

### 2. Über direkte NodePort-Services

Jeder Dienst hat einen eigenen NodePort-Service:

* Dashboard: http://[cluster-ip]:30080
* Finance: http://[cluster-ip]:30081
* Document: http://[cluster-ip]:30082
* Beleg: http://[cluster-ip]:30083
* Theme: http://[cluster-ip]:30084
* API Gateway: http://[cluster-ip]:30091

### 3. Über Port-Forwarding

Mit dem `forward-helper.ps1` Skript:

* Reverse Proxy: http://localhost:8000
* Dashboard: http://localhost:8001
* API Gateway: http://localhost:8002
* Finance: http://localhost:8003
* Document: http://localhost:8004
* Beleg: http://localhost:8005
* Theme: http://localhost:8006

### 4. Über Ingress (erfordert Hostnamen-Konfiguration)

* Dashboard: http://erp.local
* API Gateway: http://erp.local/api

## Verwendung der Helper-Skripte

### Cluster-IP-Helper

Zeigt alle verfügbaren Zugriffs-URLs an:

```powershell
.\kubernetes-manifests\cluster-ip-helper.ps1
```

### Forward-Helper

Startet Port-Forwarding für alle Dienste:

```powershell
.\kubernetes-manifests\forward-helper.ps1
```

## Troubleshooting

### Port-Forwarding-Probleme

Wenn Port-Forwarding fehlschlägt oder instabil ist:
1. Verwenden Sie die direkten NodePort-Services (siehe oben)
2. Stellen Sie sicher, dass der Pod läuft: `kubectl get pods -n erp-system`
3. Versuchen Sie es mit einem anderen Port

### API-Gateway-Fehler

Bei Problemen mit dem API-Gateway:
1. Prüfen Sie die Logs: `kubectl logs -n erp-system -l app=api-gateway-reverse-proxy`
2. Überprüfen Sie die Pod-Status: `kubectl get pods -n erp-system -l app=api-gateway-reverse-proxy`
3. Verwenden Sie direkte Service-NodePorts als Workaround 