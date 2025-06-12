# NeuroERP Recovery System Check
# Dieses Skript überprüft den Status des Recovery-Systems ohne Administratorrechte

function Write-ColorLog {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [System.ConsoleColor]$ForegroundColor = [System.ConsoleColor]::White
    )
    
    Write-Host $Message -ForegroundColor $ForegroundColor
}

Write-ColorLog "=== NeuroERP Recovery System Check ===" -ForegroundColor Cyan
Write-ColorLog "Prüfe Recovery-Komponenten..." -ForegroundColor Cyan

# Überprüfe Recovery-Skript
if (Test-Path "hibernate-recovery.ps1") {
    Write-ColorLog "[OK] Recovery-Skript gefunden" -ForegroundColor Green
} else {
    Write-ColorLog "[FEHLER] Recovery-Skript nicht gefunden!" -ForegroundColor Red
}

# Überprüfe Konfigurationsskript
if (Test-Path "configure-recovery-tasks.ps1") {
    Write-ColorLog "[OK] Konfigurationsskript gefunden" -ForegroundColor Green
} else {
    Write-ColorLog "[FEHLER] Konfigurationsskript nicht gefunden!" -ForegroundColor Red
}

# Überprüfe Admin-Launcher
if (Test-Path "run-as-admin.ps1") {
    Write-ColorLog "[OK] Administrator-Launcher gefunden" -ForegroundColor Green
} else {
    Write-ColorLog "[WARNUNG] Administrator-Launcher nicht gefunden!" -ForegroundColor Yellow
}

# Überprüfe Verzeichnisstruktur
$directories = @("logs\recovery", "backups\mongodb", "backups\postgres", "state")
foreach ($dir in $directories) {
    $fullPath = Join-Path -Path $PSScriptRoot -ChildPath $dir
    
    if (-not (Test-Path $fullPath)) {
        # Versuche das Verzeichnis zu erstellen (ohne Administratorrechte)
        try {
            New-Item -Path $fullPath -ItemType Directory -Force | Out-Null
            Write-ColorLog "[INFO] Verzeichnis '$dir' wurde erstellt" -ForegroundColor Yellow
        } catch {
            Write-ColorLog "[WARNUNG] Verzeichnis '$dir' konnte nicht erstellt werden: $_" -ForegroundColor Yellow
        }
    } else {
        Write-ColorLog "[OK] Verzeichnis '$dir' gefunden" -ForegroundColor Green
    }
}

# Überprüfe geplante Aufgaben (ohne Administratorrechte)
$tasks = @(
    "NeuroERP-Hourly-Backup",
    "NeuroERP-Hibernation-Recovery",
    "NeuroERP-Pre-Hibernation-Backup",
    "NeuroERP-Power-Event-Handler"
)

Write-ColorLog "`nÜberprüfe geplante Aufgaben:" -ForegroundColor Cyan
foreach ($taskName in $tasks) {
    try {
        $task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
        if ($task) {
            $status = $task.State
            Write-ColorLog "[OK] Task '$taskName' gefunden (Status: $status)" -ForegroundColor Green
        } else {
            Write-ColorLog "[INFO] Task '$taskName' nicht gefunden. Führen Sie configure-recovery-tasks.ps1 als Administrator aus" -ForegroundColor Yellow
        }
    } catch {
        Write-ColorLog "[WARNUNG] Konnte Task '$taskName' nicht überprüfen: $_" -ForegroundColor Yellow
    }
}

# Überprüfe Docker-Status
Write-ColorLog "`nÜberprüfe Docker:" -ForegroundColor Cyan
try {
    $dockerVersion = docker --version
    Write-ColorLog "[OK] Docker ist installiert: $dockerVersion" -ForegroundColor Green
    
    $dockerRunning = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-ColorLog "[OK] Docker läuft" -ForegroundColor Green
        
        # Zeige laufende Container
        Write-ColorLog "`nLaufende Container:" -ForegroundColor Cyan
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    } else {
        Write-ColorLog "[WARNUNG] Docker ist nicht gestartet" -ForegroundColor Yellow
    }
} catch {
    Write-ColorLog "[FEHLER] Docker ist nicht verfügbar: $_" -ForegroundColor Red
}

Write-ColorLog "`n=== Recovery System Installation ===" -ForegroundColor Cyan
Write-ColorLog "Verwenden Sie den Administrator-Launcher (empfohlen):" -ForegroundColor White
Write-ColorLog ".\run-as-admin.ps1 -Config" -ForegroundColor Yellow

Write-ColorLog "`nOder falls Sie bereits eine PowerShell mit Administratorrechten geöffnet haben:" -ForegroundColor White
Write-ColorLog "powershell -ExecutionPolicy Bypass -File `"configure-recovery-tasks.ps1`"" -ForegroundColor Yellow

Write-ColorLog "`n=== Manuelles Recovery ===" -ForegroundColor Cyan
Write-ColorLog "Verwenden Sie den Administrator-Launcher:" -ForegroundColor White
Write-ColorLog ".\run-as-admin.ps1 -Recovery" -ForegroundColor Yellow

Write-ColorLog "`n=== Manuelles Backup ===" -ForegroundColor Cyan
Write-ColorLog "Verwenden Sie den Administrator-Launcher:" -ForegroundColor White
Write-ColorLog ".\run-as-admin.ps1 -Backup" -ForegroundColor Yellow

Write-ColorLog "`nRecovery-System Check abgeschlossen." -ForegroundColor Cyan 