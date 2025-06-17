# VALERO NeuroERP API-Gateway-Wechselskript
# ========================================

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("traefik", "kong")]
    [string]$Gateway
)

Write-Host "VALERO NeuroERP API-Gateway-Wechsel" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Wechsle zu API-Gateway: $Gateway" -ForegroundColor Yellow
Write-Host ""

function Set-IngressAnnotation {
    param(
        [string]$IngressClass
    )
    
    # Aktualisiere die Ingress-Ressourcen
    Write-Host "Aktualisiere Ingress-Ressourcen..." -ForegroundColor Yellow
    
    # Mock-Service Ingress
    $mockIngressYaml = Get-Content .\api-gateway-tests\mock-backend.yaml -Raw
    $mockIngressYaml = $mockIngressYaml -replace 'kubernetes.io/ingress.class: "(.*?)"', "kubernetes.io/ingress.class: `"$IngressClass`""
    $mockIngressYaml | Out-File .\api-gateway-tests\mock-backend.yaml -Encoding utf8
    
    # Odoo-Mock Ingress
    $odooIngressYaml = Get-Content .\api-gateway-tests\odoo-mock.yaml -Raw
    $odooIngressYaml = $odooIngressYaml -replace 'kubernetes.io/ingress.class: "(.*?)"', "kubernetes.io/ingress.class: `"$IngressClass`""
    $odooIngressYaml | Out-File .\api-gateway-tests\odoo-mock.yaml -Encoding utf8
    
    # Wende die aktualisierten Ingress-Ressourcen an
    kubectl apply -f .\api-gateway-tests\mock-backend.yaml
    kubectl apply -f .\api-gateway-tests\odoo-mock.yaml
    
    Write-Host "Ingress-Ressourcen aktualisiert." -ForegroundColor Green
}

switch ($Gateway) {
    "traefik" {
        # Prüfe, ob Traefik installiert ist
        $traefik = kubectl get pods -n traefik-test -l app.kubernetes.io/name=traefik 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Traefik ist nicht installiert. Installiere..." -ForegroundColor Yellow
            .\helm install traefik traefik/traefik -n traefik-test -f .\api-gateway-tests\traefik-config\values.yaml
        } else {
            Write-Host "Traefik ist bereits installiert." -ForegroundColor Green
        }
        
        # Setze Ingress-Klasse auf Traefik
        Set-IngressAnnotation -IngressClass "traefik"
        
        # Konfiguriere die Test-URL
        $testUrl = "http://mock.test:9080/get"
        Write-Host "Test-URL für Traefik: $testUrl" -ForegroundColor White
    }
    "kong" {
        # Prüfe, ob Kong installiert ist
        $kong = kubectl get pods -n kong-test -l app.kubernetes.io/name=kong 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Kong ist nicht installiert. Bitte führen Sie zuerst das Kong-Installationsskript aus:" -ForegroundColor Yellow
            Write-Host ".\api-gateway-tests\kong-install.ps1" -ForegroundColor White
            exit 1
        } else {
            Write-Host "Kong ist bereits installiert." -ForegroundColor Green
        }
        
        # Setze Ingress-Klasse auf Kong
        Set-IngressAnnotation -IngressClass "kong"
        
        # Konfiguriere die Test-URL
        $testUrl = "http://mock.test:30081/get"
        Write-Host "Test-URL für Kong: $testUrl" -ForegroundColor White
    }
}

# Aktualisiere die Performance-Test-Konfiguration
$perfTestScript = Get-Content .\api-gateway-tests\run-performance-test.ps1 -Raw
$perfTestScript = $perfTestScript -replace '\$testUrl = "(.*?)"', "`$testUrl = `"$testUrl`""
$perfTestScript | Out-File .\api-gateway-tests\run-performance-test.ps1 -Encoding utf8

Write-Host ""
Write-Host "API-Gateway erfolgreich gewechselt zu: $Gateway" -ForegroundColor Green
Write-Host "Sie können nun Tests mit dem aktuellen Gateway durchführen." -ForegroundColor Green
Write-Host ""
Write-Host "Drücken Sie eine beliebige Taste zum Beenden..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 