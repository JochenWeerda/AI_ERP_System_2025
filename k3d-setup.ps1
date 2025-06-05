# 1. Installiere Docker Desktop, falls noch nicht installiert
# Prüfe, ob Docker bereits installiert ist
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker wird installiert..." -ForegroundColor Green
    # Installiere Docker Desktop via winget
    winget install Docker.DockerDesktop
    
    Write-Host "Bitte starte den Computer neu und führe das Skript danach erneut aus" -ForegroundColor Yellow
    exit
}

# 2. Installiere Chocolatey, falls noch nicht installiert
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Chocolatey wird installiert..." -ForegroundColor Green
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # Aktualisiere die PATH-Umgebungsvariable ohne Neustart
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}

# 3. Installiere k3d mit Chocolatey
Write-Host "k3d wird installiert..." -ForegroundColor Green
choco install k3d -y

# 4. Installiere kubectl, falls noch nicht installiert
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "kubectl wird installiert..." -ForegroundColor Green
    choco install kubernetes-cli -y
}

# 5. Aktualisiere die PATH-Umgebungsvariable ohne Neustart
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

# 6. Prüfe die Installationen
Write-Host "Installierte Versionen:" -ForegroundColor Green
Write-Host "Docker: $(docker --version)"
Write-Host "k3d: $(k3d --version)"
Write-Host "kubectl: $(kubectl version --client)"

# 7. Erstelle einen optimierten k3d-Cluster
Write-Host "Erstelle optimierten k3d-Cluster..." -ForegroundColor Green

# Lösche einen vorhandenen Cluster mit dem Namen "valeo-cluster", falls vorhanden
k3d cluster delete valeo-cluster 2>$null

# Erstelle einen neuen Cluster mit optimierten Einstellungen
k3d cluster create valeo-cluster `
    --servers 1 `
    --agents 2 `
    --port 8080:80@loadbalancer `
    --api-port 6443 `
    --k3s-arg "--disable=traefik@server:0" `
    --image rancher/k3s:v1.25.6-k3s1 `
    --registry-create valeo-registry:0.0.0.0:5000 `
    --timeout 5m

# 8. Konfiguriere kubectl für den neuen Cluster
Write-Host "Konfiguriere kubectl für den neuen Cluster..." -ForegroundColor Green
k3d kubeconfig merge valeo-cluster --switch-context

# 9. Erstelle den erp-system Namespace
Write-Host "Erstelle erp-system Namespace..." -ForegroundColor Green
kubectl create namespace erp-system

# 10. Weise mehr Ressourcen für die Nodes zu
# In k3d werden Ressourcen durch Docker-Container-Limits definiert,
# dies wird durch die übergeordneten Docker-Desktop-Einstellungen begrenzt

# 11. Wende die Kubernetes-Manifeste an
Write-Host "Wende Kubernetes-Manifeste an..." -ForegroundColor Green
$manifestsPfad = "C:\AI_driven_ERP\AI_driven_ERP\kubernetes-manifests"
kubectl apply -f "$manifestsPfad"

# 12. Überprüfe den Status
Write-Host "Überprüfe den Status der Deployments..." -ForegroundColor Green
kubectl get pods -n erp-system
kubectl get services -n erp-system

Write-Host "k3d-Cluster 'valeo-cluster' wurde erfolgreich eingerichtet." -ForegroundColor Green
Write-Host "Zugriff auf Dienste über http://localhost:8080" -ForegroundColor Green