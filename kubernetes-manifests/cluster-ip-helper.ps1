Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "       VALEO ERP SYSTEM - CLUSTER ACCESS HELPER" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Node-IPs abrufen
Write-Host "CLUSTER NODES:" -ForegroundColor Yellow
kubectl get nodes -o wide | Format-Table

# Hole den Cluster-Server (k3d-Hosts)
$clusterServer = kubectl get nodes -o jsonpath="{.items[?(@.metadata.labels.node-role\.kubernetes\.io/master=='true')].status.addresses[?(@.type=='InternalIP')].address}"
Write-Host "K3d Cluster Server IP: $clusterServer" -ForegroundColor Green
Write-Host ""

# NodePort Services anzeigen
Write-Host "NODEPORT SERVICES:" -ForegroundColor Yellow
kubectl get services -n erp-system | Where-Object { $_ -match "NodePort" } | Format-Table

# Direkte URLs für den Zugriff anzeigen
Write-Host "DIRECT ACCESS URLS:" -ForegroundColor Green
Write-Host "----------------------------------------------------------------" -ForegroundColor Gray

# Dashboard URL
$dashboardPort = kubectl get svc -n erp-system dashboard-direct -o jsonpath="{.spec.ports[0].nodePort}"
Write-Host "Dashboard:       http://${clusterServer}:$dashboardPort" -ForegroundColor White

# API Gateway URL
$apiGatewayPort = kubectl get svc -n erp-system api-gateway-nodeport -o jsonpath="{.spec.ports[0].nodePort}"
Write-Host "API Gateway:     http://${clusterServer}:$apiGatewayPort" -ForegroundColor White

# Reverse Proxy URL (Hauptzugriffspunkt)
$reverseProxyPort = kubectl get svc -n erp-system api-gateway-reverse-proxy-nodeport -o jsonpath="{.spec.ports[0].nodePort}"
Write-Host "Reverse Proxy:   http://${clusterServer}:$reverseProxyPort  (EMPFOHLEN)" -ForegroundColor Cyan

# Finance URL
$financePort = kubectl get svc -n erp-system finance-direct -o jsonpath="{.spec.ports[0].nodePort}"
Write-Host "Finance Service: http://${clusterServer}:$financePort" -ForegroundColor White

# Document URL
$documentPort = kubectl get svc -n erp-system document-direct -o jsonpath="{.spec.ports[0].nodePort}"
Write-Host "Document Service: http://${clusterServer}:$documentPort" -ForegroundColor White

# Beleg URL
$belegPort = kubectl get svc -n erp-system beleg-direct -o jsonpath="{.spec.ports[0].nodePort}"
Write-Host "Beleg Service:   http://${clusterServer}:$belegPort" -ForegroundColor White

# Theme URL
$themePort = kubectl get svc -n erp-system theme-direct -o jsonpath="{.spec.ports[0].nodePort}"
Write-Host "Theme Service:   http://${clusterServer}:$themePort" -ForegroundColor White

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "WICHTIG: Verwenden Sie den Reverse Proxy für den Hauptzugriff!" -ForegroundColor Yellow
Write-Host "API-Zugriff: http://${clusterServer}:$reverseProxyPort/api/" -ForegroundColor White
Write-Host "Service-Zugriff: http://${clusterServer}:$reverseProxyPort/services/{service-name}/" -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Cyan 