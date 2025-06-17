# VALERO NeuroERP Kong API-Gateway-Installation
# ======================================

Write-Host "VALERO NeuroERP Kong API-Gateway-Installation" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe, ob der Namespace existiert
$namespace = kubectl get namespace kong-test 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erstelle Namespace kong-test..." -ForegroundColor Yellow
    kubectl create namespace kong-test
} else {
    Write-Host "Namespace kong-test existiert bereits." -ForegroundColor Green
}

# Aktualisiere die Repository-Liste
Write-Host "Aktualisiere Helm-Repositories..." -ForegroundColor Yellow
.\helm repo update
Write-Host "Helm-Repositories aktualisiert." -ForegroundColor Green

# Hosts-Eintrag prüfen
Write-Host "Prüfe, ob der Hosts-Eintrag für Kong Admin vorhanden ist..." -ForegroundColor Yellow
$hostsPath = "$env:windir\System32\drivers\etc\hosts"
$currentHosts = Get-Content -Path $hostsPath
$kongAdminEntry = "127.0.0.1 kong-admin.test"

if ($currentHosts -notcontains $kongAdminEntry) {
    Write-Host "Kong Admin Hosts-Eintrag fehlt. Bitte führen Sie folgendes aus:" -ForegroundColor Red
    Write-Host "echo '127.0.0.1 kong-admin.test' >> $hostsPath" -ForegroundColor Gray
    Write-Host "(Benötigt Administrator-Rechte)" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "Kong Admin Hosts-Eintrag ist vorhanden." -ForegroundColor Green
}

# Installiere Kong
Write-Host ""
Write-Host "Installiere Kong API-Gateway..." -ForegroundColor Yellow
try {
    .\helm install kong kong/kong -n kong-test -f .\api-gateway-tests\kong-config\values.yaml
    Write-Host "Kong API-Gateway erfolgreich installiert." -ForegroundColor Green
} catch {
    Write-Host "Fehler bei der Installation von Kong API-Gateway: $_" -ForegroundColor Red
    exit 1
}

# Warte auf Bereitschaft
Write-Host ""
Write-Host "Warte, bis Kong bereit ist..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=kong -n kong-test --timeout=300s

# Prüfe Status
$kongStatus = kubectl get pods -n kong-test -l app.kubernetes.io/name=kong -o jsonpath='{.items[0].status.phase}'

if ($kongStatus -eq "Running") {
    Write-Host "Kong API-Gateway läuft!" -ForegroundColor Green
    
    # Zeige Zugriffsinformationen
    Write-Host ""
    Write-Host "Kong API-Gateway ist unter folgenden URLs erreichbar:" -ForegroundColor Cyan
    Write-Host "Admin API: http://kong-admin.test:9080" -ForegroundColor White
    Write-Host "Proxy: http://localhost:30081" -ForegroundColor White
} else {
    Write-Host "Kong API-Gateway ist noch nicht bereit. Status: $kongStatus" -ForegroundColor Red
}

Write-Host ""
Write-Host "Installation abgeschlossen." -ForegroundColor Cyan
Write-Host "Drücken Sie eine beliebige Taste zum Beenden..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 