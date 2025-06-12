# NeuroERP Backend Starter
# Dieses Skript startet das Backend ohne &&-Operator

Write-Host "Wechsle zum Backend-Verzeichnis..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\core\backend"

Write-Host "Installiere NPM-Pakete..." -ForegroundColor Yellow
npm install

Write-Host "Starte Backend-Server..." -ForegroundColor Green
npm run dev 