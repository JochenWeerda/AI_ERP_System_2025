# VALERO NeuroERP API-Gateway-Testumgebung Bereinigung
# ==================================================

Write-Host "VALERO NeuroERP API-Gateway Bereinigung" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Diese Aktion wird alle Test-Ressourcen löschen." -ForegroundColor Yellow
Write-Host "Möchten Sie fortfahren? (j/n)" -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -ne "j") {
    Write-Host "Abbruch. Keine Änderungen wurden vorgenommen." -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "1. Lösche Traefik-Installation..." -ForegroundColor Yellow
try {
    .\helm uninstall traefik -n traefik-test
    Write-Host "   Traefik erfolgreich deinstalliert." -ForegroundColor Green
} catch {
    Write-Host "   Fehler beim Deinstallieren von Traefik: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Lösche Mock-Services..." -ForegroundColor Yellow
try {
    kubectl delete -f .\api-gateway-tests\mock-backend.yaml
    kubectl delete -f .\api-gateway-tests\odoo-mock.yaml
    Write-Host "   Mock-Services erfolgreich gelöscht." -ForegroundColor Green
} catch {
    Write-Host "   Fehler beim Löschen der Mock-Services: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Lösche Namespaces..." -ForegroundColor Yellow
try {
    kubectl delete namespace traefik-test
    kubectl delete namespace kong-test
    kubectl delete namespace monitoring
    kubectl delete namespace mock-backends
    kubectl delete namespace odoo-integration
    Write-Host "   Namespaces erfolgreich gelöscht." -ForegroundColor Green
} catch {
    Write-Host "   Fehler beim Löschen der Namespaces: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Lösche Cluster..." -ForegroundColor Yellow
Write-Host "   Möchten Sie auch den k3d-Cluster löschen? (j/n)" -ForegroundColor Yellow
$confirmCluster = Read-Host

if ($confirmCluster -eq "j") {
    try {
        k3d cluster delete valero-test-cluster
        Write-Host "   Cluster erfolgreich gelöscht." -ForegroundColor Green
    } catch {
        Write-Host "   Fehler beim Löschen des Clusters: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   Cluster bleibt erhalten." -ForegroundColor Green
}

Write-Host ""
Write-Host "Bereinigung abgeschlossen." -ForegroundColor Cyan
Write-Host "Drücken Sie eine beliebige Taste zum Beenden..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 