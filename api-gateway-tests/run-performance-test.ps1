# API-Gateway Performance-Testskript
# =============================

# Konfiguration
$testUrl = "http://localhost:9080/api/test"
$numberOfRequests = 1000
$concurrentUsers = 10
$testDuration = 60  # Sekunden

Write-Host "VALERO NeuroERP API-Gateway Performance-Test"
Write-Host "============================================="
Write-Host ""
Write-Host "Testparameter:"
Write-Host "- URL: $testUrl"
Write-Host "- Anzahl Anfragen: $numberOfRequests"
Write-Host "- Gleichzeitige Nutzer: $concurrentUsers"
Write-Host "- Testdauer: $testDuration Sekunden"
Write-Host ""

# Prüfen, ob Hey Lasttesttool installiert ist
$heyInstalled = $null
try {
    $heyInstalled = Get-Command hey -ErrorAction SilentlyContinue
} catch {}

if (-not $heyInstalled) {
    Write-Host "Hey Lasttesttool wird installiert..." -ForegroundColor Yellow
    # Download Hey für Windows
    Invoke-WebRequest -Uri "https://storage.googleapis.com/hey-release/hey_windows_amd64" -OutFile "hey.exe"
    Write-Host "Hey Lasttesttool wurde heruntergeladen." -ForegroundColor Green
    $heyCommand = ".\hey.exe"
} else {
    $heyCommand = "hey"
}

# Führe den Test durch
Write-Host "Starte Performance-Test..." -ForegroundColor Cyan
Write-Host ""

try {
    # Führe Hey mit den konfigurierten Parametern aus
    Invoke-Expression "$heyCommand -n $numberOfRequests -c $concurrentUsers -z ${testDuration}s $testUrl"
} catch {
    Write-Host "Fehler beim Ausführen des Tests: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Test abgeschlossen!" -ForegroundColor Green 