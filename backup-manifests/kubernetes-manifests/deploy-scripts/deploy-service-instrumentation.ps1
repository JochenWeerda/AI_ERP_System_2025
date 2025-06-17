# PowerShell-Skript zum Deployment der Observability-Instrumentierungen
# für alle Services im ERP-System

Write-Host "==========================================" -ForegroundColor Green
Write-Host "Observability-Instrumentierung für das ERP-System" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Verzeichnis für Instrumentierungen
$InstrumentationDir = "..\service-instrumentation"

# Pfad überprüfen
if (-not (Test-Path -Path $InstrumentationDir)) {
    Write-Host "Fehler: Das Verzeichnis $InstrumentationDir wurde nicht gefunden." -ForegroundColor Red
    exit 1
}

# Namespace prüfen und erstellen
Write-Host "Überprüfe ERP-System Namespace..." -ForegroundColor Cyan
$NamespaceExists = kubectl get namespace erp-system 2>$null
if (-not $NamespaceExists) {
    Write-Host "Namespace erp-system existiert nicht. Wird erstellt..." -ForegroundColor Yellow
    kubectl create namespace erp-system
    Write-Host "Namespace erp-system wurde erstellt." -ForegroundColor Green
} else {
    Write-Host "Namespace erp-system existiert bereits." -ForegroundColor Green
}

# Alert-Rules zuerst anwenden, da sie von anderen Services verwendet werden
Write-Host "Wende Alert-Rules an..." -ForegroundColor Cyan
$AlertRulesPath = Join-Path $InstrumentationDir "alertmanager-rules.yaml"
if (Test-Path $AlertRulesPath) {
    kubectl apply -f $AlertRulesPath
    Write-Host "Alert-Rules wurden erfolgreich angewendet." -ForegroundColor Green
} else {
    Write-Host "Warnung: $AlertRulesPath wurde nicht gefunden." -ForegroundColor Yellow
}

# Finance-Service instrumentieren
Write-Host "Instrumentiere Finance-Service..." -ForegroundColor Cyan
$FinanceServicePath = Join-Path $InstrumentationDir "finance-service-instrumentation.yaml"
if (Test-Path $FinanceServicePath) {
    kubectl apply -f $FinanceServicePath
    Write-Host "Finance-Service-Instrumentierung wurde erfolgreich angewendet." -ForegroundColor Green
} else {
    Write-Host "Warnung: $FinanceServicePath wurde nicht gefunden." -ForegroundColor Yellow
}

# Auth-Service instrumentieren
Write-Host "Instrumentiere Auth-Service..." -ForegroundColor Cyan
$AuthServicePath = Join-Path $InstrumentationDir "auth-service-instrumentation.yaml"
if (Test-Path $AuthServicePath) {
    kubectl apply -f $AuthServicePath
    Write-Host "Auth-Service-Instrumentierung wurde erfolgreich angewendet." -ForegroundColor Green
} else {
    Write-Host "Warnung: $AuthServicePath wurde nicht gefunden." -ForegroundColor Yellow
}

# Beleg-Service instrumentieren
Write-Host "Instrumentiere Beleg-Service..." -ForegroundColor Cyan
$BelegServicePath = Join-Path $InstrumentationDir "beleg-service-instrumentation.yaml"
if (Test-Path $BelegServicePath) {
    kubectl apply -f $BelegServicePath
    Write-Host "Beleg-Service-Instrumentierung wurde erfolgreich angewendet." -ForegroundColor Green
} else {
    Write-Host "Warnung: $BelegServicePath wurde nicht gefunden." -ForegroundColor Yellow
}

# Reporting-Service instrumentieren
Write-Host "Instrumentiere Reporting-Service..." -ForegroundColor Cyan
$ReportingServicePath = Join-Path $InstrumentationDir "reporting-service-patch.yaml"
if (Test-Path $ReportingServicePath) {
    kubectl apply -f $ReportingServicePath
    Write-Host "Reporting-Service-Instrumentierung wurde erfolgreich angewendet." -ForegroundColor Green
} else {
    Write-Host "Warnung: $ReportingServicePath wurde nicht gefunden." -ForegroundColor Yellow
}

# Document-Service instrumentieren
Write-Host "Instrumentiere Document-Service..." -ForegroundColor Cyan
$DocumentServicePath = Join-Path $InstrumentationDir "document-service-tracing-patch.yaml"
if (Test-Path $DocumentServicePath) {
    kubectl apply -f $DocumentServicePath
    Write-Host "Document-Service-Instrumentierung wurde erfolgreich angewendet." -ForegroundColor Green
} else {
    Write-Host "Warnung: $DocumentServicePath wurde nicht gefunden." -ForegroundColor Yellow
}

# Observer-Service instrumentieren
Write-Host "Instrumentiere Observer-Service..." -ForegroundColor Cyan
$ObserverServicePath = Join-Path $InstrumentationDir "observer-service-instrumentation.yaml"
if (Test-Path $ObserverServicePath) {
    kubectl apply -f $ObserverServicePath
    Write-Host "Observer-Service-Instrumentierung wurde erfolgreich angewendet." -ForegroundColor Green
} else {
    Write-Host "Warnung: $ObserverServicePath wurde nicht gefunden." -ForegroundColor Yellow
}

# Grafana-Dashboard für Reporting-Service installieren
Write-Host "Installiere Grafana-Dashboard für Reporting-Service..." -ForegroundColor Cyan
$ReportingDashboardPath = Join-Path $InstrumentationDir "reporting-service-grafana-dashboard.json"
if (Test-Path $ReportingDashboardPath) {
    # Dashboard als ConfigMap erstellen
    kubectl create configmap reporting-service-dashboard -n erp-system --from-file=dashboard.json=$ReportingDashboardPath --dry-run=client -o yaml | kubectl apply -f -
    
    # Prüfen, ob Grafana-Dashboard-Provider existiert
    $GrafanaDashboardProviderExists = kubectl get configmap grafana-dashboard-provisioning -n erp-system 2>$null
    if (-not $GrafanaDashboardProviderExists) {
        Write-Host "Warnung: Grafana-Dashboard-Provider nicht gefunden. Dashboard wurde als ConfigMap erstellt, muss aber manuell in Grafana importiert werden." -ForegroundColor Yellow
    } else {
        Write-Host "Grafana-Dashboard für Reporting-Service wurde erfolgreich installiert." -ForegroundColor Green
    }
} else {
    Write-Host "Warnung: $ReportingDashboardPath wurde nicht gefunden." -ForegroundColor Yellow
}

# Status überprüfen
Write-Host ""
Write-Host "Status der Instrumentierungen:" -ForegroundColor Cyan
Write-Host "----------------------------" -ForegroundColor Cyan

# ConfigMaps auflisten
Write-Host "ConfigMaps für Service-Instrumentierung:" -ForegroundColor Cyan
kubectl get configmaps -n erp-system | Select-String -Pattern "service-|dashboard|alerting"

# Services neustarten (optional)
$RestartServices = Read-Host "Möchten Sie die Services neu starten, um die Instrumentierung zu aktivieren? (j/n)"
if ($RestartServices -eq "j") {
    Write-Host "Starte Services neu..." -ForegroundColor Cyan
    kubectl rollout restart deployment/finance-service -n erp-system
    kubectl rollout restart deployment/auth-service -n erp-system
    kubectl rollout restart deployment/reporting-service -n erp-system
    kubectl rollout restart deployment/document-service -n erp-system
    kubectl rollout restart deployment/beleg-service -n erp-system
    kubectl rollout restart deployment/observer-service -n erp-system
    
    Write-Host "Services werden neu gestartet. Überprüfen Sie den Status mit:" -ForegroundColor Green
    Write-Host "kubectl get pods -n erp-system" -ForegroundColor Yellow
} else {
    Write-Host "Bitte starten Sie die Services manuell neu, um die Instrumentierung zu aktivieren." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Observability-Instrumentierung abgeschlossen" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green 