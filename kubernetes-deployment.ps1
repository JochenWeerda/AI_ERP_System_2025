# Kubernetes Deployment Skript für VALEO ERP
# Dieses Skript führt ein vollständiges Deployment des ERP-Systems in Kubernetes durch
# und stellt sicher, dass alle Komponenten stabil laufen

param (
    [switch]$RestartDeployment,
    [switch]$CleanStart,
    [switch]$SkipConfirmation,
    [string]$Namespace = "erp-system"
)

# Farben für die Ausgabe
$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Red = [ConsoleColor]::Red

# Hilfsfunktion zum Anzeigen von Statusmeldungen
function Write-Status {
    param (
        [string]$Message,
        [ConsoleColor]$Color = [ConsoleColor]::White
    )
    
    Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] $Message" -ForegroundColor $Color
}

# Hilfsfunktion zum Überprüfen, ob ein Namespace existiert
function Test-Namespace {
    param (
        [string]$Namespace
    )
    
    $existingNamespaces = kubectl get namespaces -o jsonpath="{.items[*].metadata.name}"
    return $existingNamespaces -match $Namespace
}

# Hilfsfunktion zum Warten, bis alle Pods bereit sind
function Wait-ForPodsReady {
    param (
        [string]$Namespace,
        [int]$TimeoutSeconds = 300
    )
    
    Write-Status "Warte auf Ready-Status aller Pods in Namespace $Namespace..." $Yellow
    
    $startTime = Get-Date
    $allReady = $false
    
    while (-not $allReady) {
        $currentTime = Get-Date
        $elapsedSeconds = [math]::Round(($currentTime - $startTime).TotalSeconds)
        
        if ($elapsedSeconds -gt $TimeoutSeconds) {
            Write-Status "Timeout beim Warten auf Pods in Namespace $Namespace!" $Red
            return $false
        }
        
        $notReadyPods = kubectl get pods -n $Namespace --no-headers | Where-Object { $_ -notmatch '\s+(\d+)\/\1\s+' }
        
        if ([string]::IsNullOrWhiteSpace($notReadyPods)) {
            $allReady = $true
        } else {
            Write-Host "." -NoNewline
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host ""
    Write-Status "Alle Pods in Namespace $Namespace sind bereit!" $Green
    return $true
}

# Hilfsfunktion zum Überprüfen der Dienstverfügbarkeit durch Port-Forwarding
function Test-ServiceConnectivity {
    param (
        [string]$Namespace,
        [string]$Service,
        [int]$Port = 80,
        [int]$LocalPort = 8080,
        [int]$TimeoutSeconds = 10
    )
    
    Write-Status "Überprüfe Konnektivität für Service $Service in Namespace $Namespace..." $Yellow
    
    # Freier lokaler Port finden
    $portFound = $false
    $currentPort = $LocalPort
    
    while (-not $portFound -and $currentPort -lt ($LocalPort + 20)) {
        try {
            $testConnection = New-Object System.Net.Sockets.TcpClient
            $testConnection.Connect("127.0.0.1", $currentPort)
            $testConnection.Close()
            # Port ist in Benutzung, nächsten probieren
            $currentPort++
        } catch {
            # Port ist frei
            $portFound = $true
        }
    }
    
    if (-not $portFound) {
        Write-Status "Konnte keinen freien Port im Bereich $LocalPort bis $($LocalPort + 20) finden!" $Red
        return $false
    }
    
    # Port-Forwarding in einem separaten Prozess starten
    $job = Start-Job -ScriptBlock {
        param($ns, $svc, $localPort, $targetPort)
        & kubectl port-forward -n $ns "svc/$svc" "$localPort`:$targetPort"
    } -ArgumentList $Namespace, $Service, $currentPort, $Port
    
    # Warten, bis Port-Forwarding etabliert ist
    Start-Sleep -Seconds 2
    
    # Verbindung testen
    $startTime = Get-Date
    $success = $false
    
    while (-not $success) {
        $currentTime = Get-Date
        $elapsedSeconds = [math]::Round(($currentTime - $startTime).TotalSeconds)
        
        if ($elapsedSeconds -gt $TimeoutSeconds) {
            Write-Status "Timeout beim Testen der Verbindung zu $Service!" $Red
            Stop-Job -Job $job
            Remove-Job -Job $job
            return $false
        }
        
        try {
            $webRequest = Invoke-WebRequest -Uri "http://localhost:$currentPort" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($webRequest.StatusCode -eq 200) {
                $success = $true
            }
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    
    # Port-Forwarding beenden
    Stop-Job -Job $job
    Remove-Job -Job $job
    
    if ($success) {
        Write-Status "Verbindung zu Service $Service erfolgreich hergestellt!" $Green
        return $true
    } else {
        Write-Status "Verbindung zu Service $Service konnte nicht hergestellt werden!" $Red
        return $false
    }
}

# Funktion zum Löschen eines Deployments
function Remove-Deployment {
    param (
        [string]$Namespace,
        [string]$DeploymentName
    )
    
    Write-Status "Lösche Deployment $DeploymentName in Namespace $Namespace..." $Yellow
    kubectl delete deployment $DeploymentName -n $Namespace --ignore-not-found
    
    # Warten, bis Pods heruntergefahren sind
    $retryCount = 0
    $maxRetries = 10
    
    while ($retryCount -lt $maxRetries) {
        $pods = kubectl get pods -n $Namespace -l app=$DeploymentName --no-headers 2>$null
        
        if ([string]::IsNullOrWhiteSpace($pods)) {
            Write-Status "Deployment $DeploymentName erfolgreich gelöscht." $Green
            return $true
        }
        
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
        $retryCount++
    }
    
    Write-Status "Timeout beim Löschen von Deployment $DeploymentName!" $Red
    return $false
}

# Funktion zum Neustart eines Deployments
function Restart-Deployment {
    param (
        [string]$Namespace,
        [string]$DeploymentName
    )
    
    # Überprüfen, ob das Deployment existiert
    $deploymentExists = kubectl get deployment $DeploymentName -n $Namespace --no-headers 2>$null
    
    if ([string]::IsNullOrWhiteSpace($deploymentExists)) {
        Write-Status "Deployment $DeploymentName existiert nicht in Namespace $Namespace." $Yellow
        return $false
    }
    
    Write-Status "Starte Deployment $DeploymentName in Namespace $Namespace neu..." $Yellow
    kubectl rollout restart deployment $DeploymentName -n $Namespace
    
    # Warten, bis Neustart abgeschlossen ist
    $rolloutStatus = kubectl rollout status deployment $DeploymentName -n $Namespace --timeout=60s
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Deployment $DeploymentName erfolgreich neu gestartet." $Green
        return $true
    } else {
        Write-Status "Fehler beim Neustart von Deployment $DeploymentName!" $Red
        return $false
    }
}

# Funktion zum Bereinigen des Namespace
function Clear-Namespace {
    param (
        [string]$Namespace
    )
    
    if (-not $SkipConfirmation) {
        $confirmation = Read-Host "Möchten Sie wirklich alle Ressourcen im Namespace $Namespace löschen? (j/n)"
        if ($confirmation -ne "j") {
            Write-Status "Bereinigung abgebrochen." $Yellow
            return
        }
    }
    
    Write-Status "Lösche alle Ressourcen im Namespace $Namespace..." $Yellow
    
    # Deployments löschen
    kubectl delete deployments --all -n $Namespace
    
    # Services löschen
    kubectl delete services --all -n $Namespace
    
    # ConfigMaps löschen
    kubectl delete configmaps --all -n $Namespace
    
    # PVCs löschen
    kubectl delete pvc --all -n $Namespace
    
    Write-Status "Bereinigung des Namespace $Namespace abgeschlossen." $Green
}

# Haupt-Deployment-Funktion
function Start-ERPDeployment {
    Write-Status "Starte Deployment des ERP-Systems..." $Green
    
    # 1. Überprüfe, ob der Namespace existiert, andernfalls erstelle ihn
    if (-not (Test-Namespace -Namespace $Namespace)) {
        Write-Status "Erstelle Namespace $Namespace..." $Yellow
        kubectl create namespace $Namespace
    } else {
        Write-Status "Namespace $Namespace existiert bereits." $Green
        
        # Clean Start Option
        if ($CleanStart) {
            Clear-Namespace -Namespace $Namespace
        }
        
        # Restart Option
        if ($RestartDeployment) {
            Write-Status "Starte vorhandene Deployments neu..." $Yellow
            Restart-Deployment -Namespace $Namespace -DeploymentName "valeo-final-dashboard"
            Restart-Deployment -Namespace $Namespace -DeploymentName "api-gateway"
            Restart-Deployment -Namespace $Namespace -DeploymentName "theme-service"
        }
    }
    
    # 2. Core-Dienste bereitstellen (Datenbanken, Monitoring)
    Write-Status "Stelle Core-Dienste bereit..." $Yellow
    kubectl apply -f kubernetes-manifests/core-services.yaml -n $Namespace
    
    # 3. Warten, bis Core-Dienste bereit sind
    if (-not (Wait-ForPodsReady -Namespace $Namespace -TimeoutSeconds 180)) {
        Write-Status "Core-Dienste konnten nicht gestartet werden. Deployment wird abgebrochen." $Red
        return
    }
    
    # 4. Backend-Dienste bereitstellen
    Write-Status "Stelle Backend-Dienste bereit..." $Yellow
    kubectl apply -f kubernetes-manifests/backend-services.yaml -n $Namespace
    
    # 5. Warten, bis Backend-Dienste bereit sind
    if (-not (Wait-ForPodsReady -Namespace $Namespace -TimeoutSeconds 180)) {
        Write-Status "Backend-Dienste konnten nicht gestartet werden. Deployment wird abgebrochen." $Red
        return
    }
    
    # 6. VALEO-Dashboard und Frontend-Dienste bereitstellen
    Write-Status "Stelle VALEO-Dashboard und Frontend-Dienste bereit..." $Yellow
    
    # ConfigMaps für das Dashboard anwenden
    kubectl apply -f kubernetes-manifests/dashboard-configmaps.yaml -n $Namespace
    
    # Dashboard-Deployment anwenden
    kubectl apply -f kubernetes-manifests/valeo-final-dashboard-deployment.yaml -n $Namespace
    
    # NodePort-Service für das Dashboard anwenden
    kubectl apply -f kubernetes-manifests/valeo-dashboard-nodeport-service.yaml -n $Namespace
    
    # 7. Warten, bis Frontend-Dienste bereit sind
    if (-not (Wait-ForPodsReady -Namespace $Namespace -TimeoutSeconds 180)) {
        Write-Status "Frontend-Dienste konnten nicht gestartet werden. Deployment wird fortgesetzt." $Yellow
    }
    
    # 8. Überprüfen der Dashboard-Verfügbarkeit
    $dashboardTest = Test-ServiceConnectivity -Namespace $Namespace -Service "valeo-final-dashboard" -LocalPort 8095
    
    if ($dashboardTest) {
        Write-Status "VALEO-Dashboard ist verfügbar!" $Green
    } else {
        Write-Status "VALEO-Dashboard ist möglicherweise nicht verfügbar. Überprüfen Sie die Logs mit 'kubectl logs -n $Namespace svc/valeo-final-dashboard'." $Yellow
    }
    
    # 9. Überprüfen der API-Gateway-Verfügbarkeit
    $apiGatewayTest = Test-ServiceConnectivity -Namespace $Namespace -Service "api-gateway" -LocalPort 8096
    
    if ($apiGatewayTest) {
        Write-Status "API-Gateway ist verfügbar!" $Green
    } else {
        Write-Status "API-Gateway ist möglicherweise nicht verfügbar. Überprüfen Sie die Logs mit 'kubectl logs -n $Namespace svc/api-gateway'." $Yellow
    }
    
    # 10. Deployment-Zusammenfassung
    Write-Status "Deployment des ERP-Systems abgeschlossen!" $Green
    Write-Status "Namespace: $Namespace" $Green
    
    # NodePort-Informationen anzeigen
    $nodePorts = kubectl get svc -n $Namespace -o jsonpath="{.items[?(@.spec.type=='NodePort')].metadata.name}" | ForEach-Object { 
        $name = $_
        $ports = kubectl get svc $name -n $Namespace -o jsonpath="{.spec.ports[*].nodePort}"
        [PSCustomObject]@{
            Service = $name
            NodePorts = $ports
        }
    }
    
    Write-Status "NodePort-Services:" $Green
    $nodePorts | Format-Table -AutoSize
    
    # Zugriffsinformationen
    Write-Status "Zugriff auf VALEO-Dashboard: http://localhost:30080" $Green
    Write-Status "Zugriff auf API-Gateway: http://localhost:30090" $Green
    
    # Hinweis zur Port-Weiterleitung
    Write-Status "Alternativ kann Port-Forwarding verwendet werden:" $Yellow
    Write-Status "kubectl port-forward -n $Namespace svc/valeo-final-dashboard 8080:80" $Yellow
    Write-Status "kubectl port-forward -n $Namespace svc/api-gateway 8081:80" $Yellow
}

# Skript ausführen
Start-ERPDeployment 