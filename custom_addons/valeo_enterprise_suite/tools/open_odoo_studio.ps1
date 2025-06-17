# PowerShell-Skript zum Öffnen von Odoo Studio mit automatischer Anmeldung

# Pfad zum Login-Skript
$scriptPath = Join-Path $PSScriptRoot "odoo_login_and_navigate.js"

# Prüfen, ob das Skript existiert
if (-not (Test-Path $scriptPath)) {
    Write-Error "Login-Skript nicht gefunden: $scriptPath"
    exit 1
}

# Login-Skript lesen
$loginScript = Get-Content -Path $scriptPath -Raw

# Anweisungen für den Benutzer
Write-Host "Öffne Chrome mit der Odoo-Anmeldeseite..." -ForegroundColor Green
Write-Host "Bitte führen Sie folgende Schritte aus:" -ForegroundColor Yellow
Write-Host "1. Warten Sie, bis die Anmeldeseite vollständig geladen ist" -ForegroundColor Yellow
Write-Host "2. Drücken Sie F12, um die Entwicklertools zu öffnen" -ForegroundColor Yellow
Write-Host "3. Wechseln Sie zum 'Console'-Tab" -ForegroundColor Yellow
Write-Host "4. Fügen Sie das folgende Skript ein und drücken Sie Enter:" -ForegroundColor Yellow
Write-Host "---------------------------------------------------------" -ForegroundColor Cyan
Write-Host $loginScript -ForegroundColor White
Write-Host "---------------------------------------------------------" -ForegroundColor Cyan

# Chrome mit der Odoo-Anmeldeseite öffnen
Start-Process "chrome" -ArgumentList "https://jochenweerda1.odoo.com/web/login"

# Skript in die Zwischenablage kopieren
$loginScript | Set-Clipboard

Write-Host "Das Login-Skript wurde in die Zwischenablage kopiert. Sie können es mit Strg+V in die Konsole einfügen." -ForegroundColor Green 