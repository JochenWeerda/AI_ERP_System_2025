Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "       VALEO ERP SYSTEM - PORT FORWARD HELPER" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Prüfen, ob Ports bereits verwendet werden
function Test-PortInUse {
    param(
        [int]$Port
    )
    $portInUse = $false
    try {
        $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
        $listener.Start()
        $listener.Stop()
    } catch {
        $portInUse = $true
    }
    return $portInUse
}

# Port-Forwarding starten
function Start-PortForwarding {
    param(
        [string]$ServiceName,
        [int]$LocalPort,
        [string]$Description = ""
    )
    
    if (Test-PortInUse -Port $LocalPort) {
        Write-Host "Port $LocalPort ist bereits in Verwendung. Wähle einen anderen Port." -ForegroundColor Red
        return $false
    }
    
    Write-Host "Starte Port-Forwarding für $ServiceName auf Port $LocalPort..." -ForegroundColor Yellow
    
    # Verwende Start-Process, um den kubectl port-forward Befehl im Hintergrund auszuführen
    $job = Start-Process -FilePath "kubectl" -ArgumentList "port-forward -n erp-system svc/$ServiceName $LocalPort`:80" -WindowStyle Hidden -PassThru
    
    if ($job) {
        Write-Host "Port-Forwarding für $ServiceName auf http://localhost:$LocalPort gestartet (PID: $($job.Id))" -ForegroundColor Green
        if ($Description) {
            Write-Host "  $Description" -ForegroundColor Cyan
        }
        return $true
    } else {
        Write-Host "Fehler beim Starten des Port-Forwarding für $ServiceName" -ForegroundColor Red
        return $false
    }
}

# Alle Dienste mit Port-Forwarding starten
Write-Host "Starte Port-Forwarding für alle Dienste..." -ForegroundColor Yellow
Write-Host ""

# Reverse Proxy (Hauptzugriffspunkt)
Start-PortForwarding -ServiceName "api-gateway-reverse-proxy" -LocalPort 8000 -Description "Hauptzugriffspunkt für alle Dienste"

# Direkter Zugriff auf einzelne Dienste
Start-PortForwarding -ServiceName "dashboard-direct" -LocalPort 8001 -Description "Dashboard UI"
Start-PortForwarding -ServiceName "api-gateway-nodeport" -LocalPort 8002 -Description "API Gateway"
Start-PortForwarding -ServiceName "finance-direct" -LocalPort 8003 -Description "Finance Service"
Start-PortForwarding -ServiceName "document-direct" -LocalPort 8004 -Description "Document Service"
Start-PortForwarding -ServiceName "beleg-direct" -LocalPort 8005 -Description "Beleg Service"
Start-PortForwarding -ServiceName "theme-direct" -LocalPort 8006 -Description "Theme Service"

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "ZUGRIFFS-URLS:" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------" -ForegroundColor Gray
Write-Host "Reverse Proxy:   http://localhost:8000  (HAUPTZUGRIFFSPUNKT)" -ForegroundColor Cyan
Write-Host "Dashboard UI:    http://localhost:8001" -ForegroundColor White
Write-Host "API Gateway:     http://localhost:8002" -ForegroundColor White
Write-Host "Finance Service: http://localhost:8003" -ForegroundColor White
Write-Host "Document Service: http://localhost:8004" -ForegroundColor White
Write-Host "Beleg Service:   http://localhost:8005" -ForegroundColor White
Write-Host "Theme Service:   http://localhost:8006" -ForegroundColor White
Write-Host ""

Write-Host "API-Zugriff über Reverse Proxy: http://localhost:8000/api/" -ForegroundColor White
Write-Host "Service-Zugriff über Reverse Proxy: http://localhost:8000/services/{service-name}/" -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Um die Port-Forwarding-Prozesse zu beenden, beenden Sie die PowerShell-Sitzung oder" -ForegroundColor Yellow
Write-Host "verwenden Sie den Task-Manager, um die kubectl-Prozesse zu beenden." -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan 