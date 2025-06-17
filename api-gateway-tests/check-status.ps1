# VALERO NeuroERP API-Gateway-Statusbericht
# =======================================

Write-Host "VALERO NeuroERP API-Gateway-Statusbericht" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cluster-Status:" -ForegroundColor Yellow
try {
    $clusterInfo = kubectl cluster-info | Out-String
    Write-Host $clusterInfo -ForegroundColor Gray
} catch {
    Write-Host "Fehler beim Abrufen der Cluster-Informationen: $_" -ForegroundColor Red
}

Write-Host "Gateway-Status:" -ForegroundColor Yellow
Write-Host ""

# Traefik-Status
Write-Host "1. Traefik" -ForegroundColor Yellow
try {
    $traefikPods = kubectl get pods -n traefik-test -l app.kubernetes.io/name=traefik -o wide | Out-String
    if ($traefikPods -match "Running") {
        Write-Host "   Status: Installiert und aktiv" -ForegroundColor Green
        
        $traefikService = kubectl get svc -n traefik-test | Out-String
        Write-Host "   Service-Details:" -ForegroundColor Gray
        Write-Host $traefikService -ForegroundColor Gray
    } else {
        Write-Host "   Status: Nicht bereit oder nicht installiert" -ForegroundColor Red
    }
} catch {
    Write-Host "   Status: Nicht installiert" -ForegroundColor Red
}

Write-Host ""

# Kong-Status
Write-Host "2. Kong" -ForegroundColor Yellow
try {
    $kongPods = kubectl get pods -n kong-test -l app.kubernetes.io/name=kong -o wide 2>&1
    if ($LASTEXITCODE -eq 0 -and $kongPods -match "Running") {
        Write-Host "   Status: Installiert und aktiv" -ForegroundColor Green
        
        $kongService = kubectl get svc -n kong-test | Out-String
        Write-Host "   Service-Details:" -ForegroundColor Gray
        Write-Host $kongService -ForegroundColor Gray
    } else {
        Write-Host "   Status: Nicht bereit oder nicht installiert" -ForegroundColor Red
    }
} catch {
    Write-Host "   Status: Nicht installiert" -ForegroundColor Red
}

Write-Host ""

# Test-Services
Write-Host "Test-Services:" -ForegroundColor Yellow
Write-Host ""

# Mock-Service
Write-Host "1. Mock-Service" -ForegroundColor Yellow
try {
    $mockPods = kubectl get pods -n mock-backends -l app=mock-service | Out-String
    if ($mockPods -match "Running") {
        Write-Host "   Status: Aktiv" -ForegroundColor Green
        
        $mockIngress = kubectl get ingress -n mock-backends | Out-String
        Write-Host "   Ingress-Details:" -ForegroundColor Gray
        Write-Host $mockIngress -ForegroundColor Gray
    } else {
        Write-Host "   Status: Nicht bereit" -ForegroundColor Red
    }
} catch {
    Write-Host "   Status: Nicht installiert" -ForegroundColor Red
}

Write-Host ""

# Odoo-Mock
Write-Host "2. Odoo-Mock" -ForegroundColor Yellow
try {
    $odooPods = kubectl get pods -n odoo-integration -l app=odoo-mock | Out-String
    if ($odooPods -match "Running") {
        Write-Host "   Status: Aktiv" -ForegroundColor Green
    } else {
        Write-Host "   Status: Nicht bereit" -ForegroundColor Red
        
        # Zeige Details zum Status
        Write-Host "   Pod-Details:" -ForegroundColor Gray
        $odooPodDetails = kubectl describe pods -n odoo-integration -l app=odoo-mock | Out-String
        Write-Host $odooPodDetails -ForegroundColor Gray
    }
} catch {
    Write-Host "   Status: Nicht installiert" -ForegroundColor Red
}

Write-Host ""
Write-Host "Zugriffs-URLs:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Traefik-Dashboard: http://dashboard.traefik.test:9080/dashboard/" -ForegroundColor White
Write-Host "Mock-Service (Traefik): http://mock.test:9080/get" -ForegroundColor White
Write-Host "Kong-Admin: http://kong-admin.test:9080/" -ForegroundColor White
Write-Host "Mock-Service (Kong): http://mock.test:30081/get" -ForegroundColor White

Write-Host ""
Write-Host "Statusbericht abgeschlossen." -ForegroundColor Cyan
Write-Host "Drücken Sie eine beliebige Taste zum Beenden..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 