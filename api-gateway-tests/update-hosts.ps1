# VALERO NeuroERP API-Gateway-Testumgebung Hosts-Konfiguration
# =====================================================

Write-Host "VALERO NeuroERP API-Gateway Hosts-Konfiguration" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe Administrator-Rechte
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Dieses Skript muss mit Administrator-Rechten ausgeführt werden." -ForegroundColor Red
    Write-Host "Bitte starten Sie PowerShell als Administrator und führen Sie das Skript erneut aus." -ForegroundColor Red
    Write-Host ""
    Write-Host "Drücken Sie eine beliebige Taste zum Beenden..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

$hostsPath = "$env:windir\System32\drivers\etc\hosts"
$hostEntries = @(
    "127.0.0.1 mock.test",
    "127.0.0.1 odoo.test",
    "127.0.0.1 dashboard.traefik.test",
    "127.0.0.1 kong-admin.test"
)

Write-Host "Prüfe, ob die Einträge bereits in der Hosts-Datei vorhanden sind..." -ForegroundColor Yellow
$currentHosts = Get-Content -Path $hostsPath

$entriesToAdd = @()
foreach ($entry in $hostEntries) {
    if ($currentHosts -notcontains $entry) {
        $entriesToAdd += $entry
    }
}

if ($entriesToAdd.Count -eq 0) {
    Write-Host "Alle benötigten Einträge sind bereits in der Hosts-Datei vorhanden." -ForegroundColor Green
} else {
    Write-Host "Folgende Einträge werden zur Hosts-Datei hinzugefügt:" -ForegroundColor Yellow
    $entriesToAdd | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    
    try {
        Add-Content -Path $hostsPath -Value "`n# VALERO NeuroERP API-Gateway-Testumgebung"
        $entriesToAdd | ForEach-Object { Add-Content -Path $hostsPath -Value $_ }
        Write-Host "Hosts-Datei wurde erfolgreich aktualisiert." -ForegroundColor Green
    } catch {
        Write-Host "Fehler beim Aktualisieren der Hosts-Datei: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Drücken Sie eine beliebige Taste zum Beenden..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 