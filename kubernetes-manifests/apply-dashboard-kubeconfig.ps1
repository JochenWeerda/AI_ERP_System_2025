Write-Host "Setze KUBECONFIG-Umgebungsvariable..." -ForegroundColor Cyan
$env:KUBECONFIG = "C:\Users\Jochen\.config\k3d\kubeconfig-valeo-cluster.yaml"

Write-Host "Starte Deployment des VALEO Dashboard..." -ForegroundColor Cyan

Write-Host "1. Anwenden der Dashboard ConfigMap..." -ForegroundColor Yellow
kubectl apply -f dashboard-part1.yaml

Write-Host "2. Anwenden des Dashboard Deployments..." -ForegroundColor Yellow
kubectl apply -f dashboard-part2.yaml

Write-Host "3. Anwenden der Dashboard Services..." -ForegroundColor Yellow
kubectl apply -f dashboard-part3.yaml

Write-Host "4. Warten auf Bereitschaft des Pods..." -ForegroundColor Yellow
kubectl wait --namespace erp-system --for=condition=ready pod --selector=app=valeo-dashboard --timeout=90s

Write-Host "5. Dashboard-Status:" -ForegroundColor Green
kubectl get pods,svc -n erp-system -l app=valeo-dashboard

Write-Host "`nDas Dashboard ist verfügbar unter: http://localhost:30080" -ForegroundColor Cyan
Write-Host "Sie können den Browser mit folgendem Befehl öffnen:" -ForegroundColor Cyan
Write-Host "start chrome http://localhost:30080" -ForegroundColor White 