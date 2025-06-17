#!/usr/bin/env pwsh
# Update-Dashboard.ps1
# Dieses Skript aktualisiert das VALEO NeuroERP Dashboard

Write-Host "VALEO NeuroERP Dashboard wird aktualisiert..." -ForegroundColor Cyan

# ConfigMap und Deployment anwenden
kubectl apply -f kubernetes-manifests/valeo-dashboard-complete.yaml
kubectl rollout restart deployment/valeo-final-dashboard -n erp-system

# Warten bis das neue Pod bereit ist
Write-Host "Warte auf Bereitschaft des neuen Pods..." -ForegroundColor Yellow
kubectl rollout status deployment/valeo-final-dashboard -n erp-system

Write-Host "Dashboard wurde aktualisiert!" -ForegroundColor Green
Write-Host "Zugriff über: http://localhost:8086 (API-Gateway) oder http://localhost:8085 (direkter Zugriff)" -ForegroundColor Cyan 