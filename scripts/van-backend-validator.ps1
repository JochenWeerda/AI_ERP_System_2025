# ===================================================
# VAN-Modus Backend-Validator
# ===================================================
# Dieses Skript prüft die Backend-Entwicklungsumgebung
# auf Compliance mit den definierten VAN-Modus-Standards
# und korrigiert Probleme automatisch.
# ===================================================

# Farbige Ausgabe-Funktionen für bessere Lesbarkeit
function Write-ColorOutput {
    param (
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

function Write-Success {
    param ([string]$Text)
    Write-ColorOutput $Text "Green"
}

function Write-Error {
    param ([string]$Text)
    Write-ColorOutput $Text "Red"
}

function Write-Warning {
    param ([string]$Text)
    Write-ColorOutput $Text "Yellow"
}

function Write-Info {
    param ([string]$Text)
    Write-ColorOutput $Text "Cyan"
}

# Definiere Pfade
$rootDir = Join-Path $PSScriptRoot ".."
$backendDir = Join-Path $rootDir "backend"
$requirementsPath = Join-Path $rootDir "requirements.txt"
$backendRequirementsPath = Join-Path $backendDir "requirements.txt"
$minimalServerPath = Join-Path $backendDir "minimal_server.py"
$cacheManagerPath = Join-Path $backendDir "cache_manager.py"
$observerConfigPath = Join-Path $backendDir "observer_config.json"
$dbPath = Join-Path $backendDir "erp.db"

# Banner ausgeben
Write-Host ""
Write-Host " ======================================================" -ForegroundColor Cyan
Write-Host "  VAN-Modus Backend-Validator - VALEO NeuroERP" -ForegroundColor Cyan
Write-Host " ======================================================" -ForegroundColor Cyan
Write-Host ""

# Zusammenfassung der Prüfungen
$totalChecks = 0
$passedChecks = 0
$failedChecks = 0
$correctedChecks = 0

function Register-Check {
    param (
        [bool]$Result,
        [string]$Name,
        [bool]$Corrected = $false
    )
    
    $script:totalChecks++
    
    if ($Result) {
        $script:passedChecks++
        Write-Success "[✓] $Name"
    } else {
        $script:failedChecks++
        if ($Corrected) {
            $script:correctedChecks++
            Write-Warning "[!] $Name (Korrigiert)"
        } else {
            Write-Error "[✗] $Name"
        }
    }
}

# 1. Verzeichnisstruktur-Validierung
Write-Info "1. Prüfe Verzeichnisstruktur..."

# Prüfe ob Backend-Verzeichnis existiert
$backendDirExists = Test-Path $backendDir
Register-Check -Result $backendDirExists -Name "Backend-Verzeichnis existiert"

if (-not $backendDirExists) {
    Write-Error "Kritischer Fehler: Backend-Verzeichnis nicht gefunden!"
    Write-Info "Erstelle Backend-Verzeichnis..."
    New-Item -ItemType Directory -Path $backendDir | Out-Null
    Register-Check -Result $true -Name "Backend-Verzeichnis erstellt" -Corrected $true
}

# Prüfe ob models-Verzeichnis existiert
$modelsDirPath = Join-Path $backendDir "models"
$modelsDirExists = Test-Path $modelsDirPath
Register-Check -Result $modelsDirExists -Name "models-Verzeichnis existiert"

if (-not $modelsDirExists) {
    Write-Info "Erstelle models-Verzeichnis..."
    New-Item -ItemType Directory -Path $modelsDirPath | Out-Null
    Register-Check -Result $true -Name "models-Verzeichnis erstellt" -Corrected $true
}

# Prüfe ob api-Verzeichnis existiert
$apiDirPath = Join-Path $backendDir "api"
$apiDirExists = Test-Path $apiDirPath
Register-Check -Result $apiDirExists -Name "api-Verzeichnis existiert"

if (-not $apiDirExists) {
    Write-Info "Erstelle api-Verzeichnis..."
    New-Item -ItemType Directory -Path $apiDirPath | Out-Null
    Register-Check -Result $true -Name "api-Verzeichnis erstellt" -Corrected $true
}

# Prüfe ob services-Verzeichnis existiert
$servicesDirPath = Join-Path $backendDir "services"
$servicesDirExists = Test-Path $servicesDirPath
Register-Check -Result $servicesDirExists -Name "services-Verzeichnis existiert"

if (-not $servicesDirExists) {
    Write-Info "Erstelle services-Verzeichnis..."
    New-Item -ItemType Directory -Path $servicesDirPath | Out-Null
    Register-Check -Result $true -Name "services-Verzeichnis erstellt" -Corrected $true
}

# 2. Konfigurationsdateien-Prüfung
Write-Info "2. Prüfe Konfigurationsdateien..."

# Prüfe requirements.txt im Backend-Verzeichnis
$backendRequirementsExists = Test-Path $backendRequirementsPath
Register-Check -Result $backendRequirementsExists -Name "Backend requirements.txt existiert"

if (-not $backendRequirementsExists) {
    # Prüfe auf requirements.txt im Hauptverzeichnis
    $rootRequirementsExists = Test-Path $requirementsPath
    if ($rootRequirementsExists) {
        Write-Info "Kopiere requirements.txt aus dem Hauptverzeichnis ins Backend-Verzeichnis..."
        Copy-Item -Path $requirementsPath -Destination $backendRequirementsPath
        Register-Check -Result $true -Name "Backend requirements.txt erstellt (kopiert)" -Corrected $true
    } else {
        Write-Info "Erstelle Standard-requirements.txt für Backend..."
        @"
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
pydantic==2.4.2
python-multipart==0.0.6
psutil==5.9.6
aiofiles==23.2.1
starlette==0.27.0
jinja2==3.1.2
python-jose==3.3.0
passlib==1.7.4
bcrypt==4.0.1
"@ | Out-File -FilePath $backendRequirementsPath -Encoding utf8
        Register-Check -Result $true -Name "Backend requirements.txt erstellt" -Corrected $true
    }
}

# Prüfe minimal_server.py
$minimalServerExists = Test-Path $minimalServerPath
Register-Check -Result $minimalServerExists -Name "minimal_server.py existiert"

# 3. Python-Umgebung prüfen
Write-Info "3. Prüfe Python-Umgebung..."

try {
    $pythonVersion = python --version 2>&1
    $pythonVersionMatch = $pythonVersion -match "Python 3\.(1[0-3]|9|8|7|6|5|4|3|2|1|0)"
    Register-Check -Result $pythonVersionMatch -Name "Python 3.x installiert"

    if (-not $pythonVersionMatch) {
        Write-Warning "Python-Version könnte inkompatibel sein. Python 3.11 wird empfohlen."
    }
}
catch {
    Register-Check -Result $false -Name "Python konnte nicht ausgeführt werden"
    Write-Error "Python ist nicht installiert oder nicht im PATH."
}

# 4. Port-Verfügbarkeit prüfen
Write-Info "4. Prüfe Port-Verfügbarkeit..."

$portsToCheck = @(8003, 8005, 8007)
foreach ($port in $portsToCheck) {
    $portInUse = $false
    try {
        $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
        $listener.Start()
        $listener.Stop()
    }
    catch {
        $portInUse = $true
    }
    
    Register-Check -Result (-not $portInUse) -Name "Port $port ist verfügbar"
    
    if ($portInUse) {
        Write-Warning "Port $port wird bereits verwendet. Dieser Port wird für das ERP-System benötigt."
    }
}

# 5. Prüfe Observer-Konfiguration
Write-Info "5. Prüfe Observer-Konfiguration..."

$observerConfigExists = Test-Path $observerConfigPath
Register-Check -Result $observerConfigExists -Name "observer_config.json existiert"

if (-not $observerConfigExists) {
    Write-Info "Erstelle Standard-observer_config.json..."
    @"
{
    "monitoring": {
        "interval": 5,
        "metrics_history_length": 1000,
        "log_to_file": true,
        "log_file": "observer.log"
    },
    "thresholds": {
        "cpu_warning": 70,
        "cpu_critical": 85,
        "memory_warning": 75,
        "memory_critical": 90,
        "response_time_warning": 300,
        "response_time_critical": 500
    },
    "alerting": {
        "enabled": true,
        "cooldown_period": 300,
        "alert_methods": ["log"]
    },
    "services": [
        {
            "name": "minimal_server",
            "host": "localhost",
            "port": 8003,
            "health_endpoint": "/health",
            "type": "core"
        },
        {
            "name": "finance_service",
            "host": "localhost",
            "port": 8007,
            "health_endpoint": "/health",
            "type": "microservice"
        },
        {
            "name": "beleg_service",
            "host": "localhost",
            "port": 8005,
            "health_endpoint": "/health",
            "type": "microservice"
        }
    ]
}
"@ | Out-File -FilePath $observerConfigPath -Encoding utf8
    Register-Check -Result $true -Name "observer_config.json erstellt" -Corrected $true
}

# 6. Prüfe Cache-Manager
Write-Info "6. Prüfe Cache-Manager-Konfiguration..."

$cacheManagerExists = Test-Path $cacheManagerPath
Register-Check -Result $cacheManagerExists -Name "cache_manager.py existiert"

# 7. Prüfe, ob Datenbank existiert oder erstellt werden muss
Write-Info "7. Prüfe Datenbankstatus..."

$dbExists = Test-Path $dbPath
Register-Check -Result $dbExists -Name "Datenbank existiert"

if (-not $dbExists) {
    Write-Warning "Datenbank-Datei fehlt. Sie wird beim ersten Start des Servers erstellt."
}

# Zusammenfassung ausgeben
Write-Host ""
Write-Host "VAN-Modus Backend-Validierung abgeschlossen" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "Gesamtzahl der Prüfungen: $totalChecks" -ForegroundColor White
Write-Host "Erfolgreiche Prüfungen: $passedChecks" -ForegroundColor Green
Write-Host "Fehlgeschlagene Prüfungen: $($failedChecks - $correctedChecks)" -ForegroundColor Red
Write-Host "Automatisch korrigierte Probleme: $correctedChecks" -ForegroundColor Yellow
Write-Host ""

if ($failedChecks -eq $correctedChecks) {
    Write-Success "Backend-Umgebung ist bereit für die Entwicklung!"
} else {
    Write-Warning "Es gibt noch ungelöste Probleme in der Backend-Umgebung."
    Write-Warning "Bitte beheben Sie diese Probleme, bevor Sie mit der Entwicklung fortfahren."
}

Write-Host ""
Write-Host "Empfohlene nächste Schritte:" -ForegroundColor Cyan
Write-Host "1. Backend-Server starten: ./backend/start_minimal_server.ps1" -ForegroundColor White
Write-Host "2. Observer-Service starten: ./backend/start_observer.ps1" -ForegroundColor White
Write-Host "3. Verfügbarkeit überprüfen: http://localhost:8003/health" -ForegroundColor White
Write-Host "" 