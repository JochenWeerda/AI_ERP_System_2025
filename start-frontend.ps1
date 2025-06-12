# NeuroERP Frontend Starter
# Dieses Skript startet das Frontend ohne &&-Operator

Write-Host "Wechsle zum Frontend-Verzeichnis..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\frontend"

Write-Host "Installiere NPM-Pakete..." -ForegroundColor Yellow
npm install

Write-Host "Starte Frontend-Server..." -ForegroundColor Green
npm start 