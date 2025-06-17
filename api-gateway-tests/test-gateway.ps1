# VALERO NeuroERP API-Gateway-Testskript
# =====================================

Write-Host "VALERO NeuroERP API-Gateway-Test" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe, ob die Dienste laufen
Write-Host "Prüfe Traefik-Status..." -ForegroundColor Yellow
$traefik = kubectl get pods -n traefik-test | Select-String "traefik"

if ($traefik -match "Running") {
    Write-Host "Traefik läuft: $traefik" -ForegroundColor Green
} else {
    Write-Host "Traefik ist nicht bereit: $traefik" -ForegroundColor Red
    Write-Host "Bitte warten Sie, bis alle Dienste gestartet sind." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Prüfe Mock-Service-Status..." -ForegroundColor Yellow
$mockService = kubectl get pods -n mock-backends | Select-String "mock-service"

if ($mockService -match "Running") {
    Write-Host "Mock-Service läuft: $mockService" -ForegroundColor Green
} else {
    Write-Host "Mock-Service ist nicht bereit: $mockService" -ForegroundColor Red
    Write-Host "Tests werden trotzdem fortgesetzt..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Prüfe Odoo-Mock-Status..." -ForegroundColor Yellow
$odooMock = kubectl get pods -n odoo-integration | Select-String "odoo-mock"

if ($odooMock -match "Running") {
    Write-Host "Odoo-Mock läuft: $odooMock" -ForegroundColor Green
} else {
    Write-Host "Odoo-Mock ist nicht bereit: $odooMock" -ForegroundColor Red
    Write-Host "Tests werden trotzdem fortgesetzt..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Führe API-Tests durch..." -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Traefik Dashboard
Write-Host "Test 1: Traefik Dashboard" -ForegroundColor Yellow
Write-Host "URL: http://dashboard.traefik.test:9080/dashboard/" -ForegroundColor Gray
Write-Host ""
Write-Host "Statuscode: " -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://dashboard.traefik.test:9080/dashboard/" -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host $response.StatusCode -ForegroundColor Green
} catch {
    Write-Host "Fehler: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Mock-Service
Write-Host "Test 2: Mock-Service" -ForegroundColor Yellow
Write-Host "URL: http://mock.test:9080/get" -ForegroundColor Gray
Write-Host ""
Write-Host "Statuscode: " -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://mock.test:9080/get" -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host $response.StatusCode -ForegroundColor Green
    
    Write-Host "Antwort (gekürzt):" -ForegroundColor Gray
    $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)) + "..."
} catch {
    Write-Host "Fehler: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Odoo-Mock (falls bereit)
Write-Host "Test 3: Odoo-Mock" -ForegroundColor Yellow
Write-Host "URL: http://odoo.test:9080/web/login" -ForegroundColor Gray
Write-Host ""
Write-Host "Statuscode: " -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://odoo.test:9080/web/login" -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host $response.StatusCode -ForegroundColor Green
    
    Write-Host "Antwort enthält Odoo-Login: " -NoNewline
    if ($response.Content -match "Odoo") {
        Write-Host "Ja" -ForegroundColor Green
    } else {
        Write-Host "Nein" -ForegroundColor Red
    }
} catch {
    Write-Host "Fehler: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Tests abgeschlossen." -ForegroundColor Cyan 