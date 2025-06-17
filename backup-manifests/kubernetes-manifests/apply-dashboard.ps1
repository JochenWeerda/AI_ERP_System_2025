#!/usr/bin/env pwsh
# apply-dashboard.ps1
# Dieses Skript wendet die neue VALEO-Final-Design Dashboard-Konfigurationen an

Write-Host "VALEO NeuroERP Dashboard wird aktualisiert..." -ForegroundColor Cyan

# ConfigMaps anwenden
Write-Host "Wende Dashboard-Konfigurationen an..." -ForegroundColor Yellow
kubectl apply -f kubernetes-manifests/valeo-dashboard-configmap-part1.yaml
kubectl apply -f kubernetes-manifests/valeo-dashboard-configmap-part2.yaml
kubectl apply -f kubernetes-manifests/valeo-dashboard-system-status.yaml

# Erstelle ein vollständiges Dashboard durch Zusammenführen der Teile
Write-Host "Erstelle vollständige Dashboard-HTML..." -ForegroundColor Yellow
$part1 = kubectl get configmap valeo-dashboard-html-part1 -n erp-system -o jsonpath="{.data['index-part1\.html']}"
$part2 = kubectl get configmap valeo-dashboard-html-part2 -n erp-system -o jsonpath="{.data['index-part2\.html']}"
$combined = $part1 + "`n" + $part2

# Erstelle temporäre Datei mit dem kombinierten Inhalt
$tempFile = "temp-dashboard.yaml"
@"
apiVersion: v1
kind: ConfigMap
metadata:
  name: valeo-dashboard-html
  namespace: erp-system
data:
  index.html: |
$($combined -split "`n" | ForEach-Object { "    $_" })
"@ | Out-File $tempFile -Encoding utf8

# Anwenden der kombinierten ConfigMap
kubectl apply -f $tempFile
Remove-Item $tempFile

# Erstelle System-Status-Seite ConfigMap
Write-Host "Erstelle System-Status-Seite..." -ForegroundColor Yellow
$systemStatus = kubectl get configmap valeo-dashboard-system-status -n erp-system -o jsonpath="{.data['system-status\.html']}"

# Erstelle temporäre Datei für System-Status
$tempStatusFile = "temp-system-status.yaml"
@"
apiVersion: v1
kind: ConfigMap
metadata:
  name: valeo-system-status-html
  namespace: erp-system
data:
  system-status.html: |
$($systemStatus -split "`n" | ForEach-Object { "    $_" })
"@ | Out-File $tempStatusFile -Encoding utf8

# Anwenden der System-Status ConfigMap
kubectl apply -f $tempStatusFile
Remove-Item $tempStatusFile

# Deployment für das Dashboard aktualisieren
Write-Host "Aktualisiere Dashboard-Deployment..." -ForegroundColor Yellow
kubectl rollout restart deployment/valeo-final-dashboard -n erp-system

# Warten bis das neue Pod bereit ist
Write-Host "Warte auf Bereitschaft des neuen Pods..." -ForegroundColor Yellow
kubectl rollout status deployment/valeo-final-dashboard -n erp-system

Write-Host "Dashboard wurde erfolgreich aktualisiert!" -ForegroundColor Green
Write-Host "Zugriff über: http://localhost:30080 (NodePort)" -ForegroundColor Cyan
Write-Host "Oder starte Port-Forwarding mit: kubectl port-forward -n erp-system svc/valeo-dashboard-nodeport 8080:80" -ForegroundColor Cyan 