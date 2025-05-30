# Start-System-Improved.ps1
#
# Dieses Skript startet alle erforderlichen Komponenten des ERP-Systems:
# - Redis-Server
# - Celery-Worker
# - Celery-Flower
# - FastAPI-Server
#
# Verwendung: .\start_system_improved.ps1

# Konfiguration
$WORKSPACE_ROOT = "C:\AI_driven_ERP\AI_driven_ERP"
$REDIS_PATH = Join-Path $WORKSPACE_ROOT "redis"
$LOG_DIR = Join-Path $WORKSPACE_ROOT "logs"

# Erstelle Log-Verzeichnis, falls nicht vorhanden
if (-not (Test-Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR
    Write-Host "Log-Verzeichnis erstellt: $LOG_DIR"
}

# Aktuelles Datum für Log-Dateien
$DATE = Get-Date -Format "yyyy-MM-dd_HH-mm"

# Log-Dateien definieren
$REDIS_LOG = Join-Path $LOG_DIR "redis_$DATE.log"
$CELERY_LOG = Join-Path $LOG_DIR "celery_$DATE.log"
$FLOWER_LOG = Join-Path $LOG_DIR "flower_$DATE.log"
$API_LOG = Join-Path $LOG_DIR "api_$DATE.log"

# Funktion zum Starten von Prozessen im Hintergrund mit PowerShell
function Start-BackgroundProcess {
    param (
        [string]$Name,
        [string]$Command,
        [string]$LogFile
    )
    
    Write-Host "Starte $Name..." -ForegroundColor Green
    
    # Die korrekte Syntax für PowerShell - OHNE -NoExit Parameter
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "powershell.exe"
    $psi.Arguments = "-Command `"$Command | Tee-Object -FilePath '$LogFile'`""
    $psi.UseShellExecute = $true
    $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Minimized
    
    $process = [System.Diagnostics.Process]::Start($psi)
    
    return $process
}

# Wechsle zum Projektverzeichnis
Set-Location $WORKSPACE_ROOT
Write-Host "Arbeitsverzeichnis: $WORKSPACE_ROOT" -ForegroundColor Cyan

# 1. Redis-Server starten
$redisCommand = "Set-Location '$REDIS_PATH'; .\redis-server.exe"
$redisProcess = Start-BackgroundProcess -Name "Redis-Server" -Command $redisCommand -LogFile $REDIS_LOG

# Warte einen Moment, damit Redis hochfahren kann
Start-Sleep -Seconds 3
Write-Host "Redis-Server gestartet" -ForegroundColor Green

# 2. Celery-Worker starten
$celeryCommand = "celery -A backend.tasks.celery_app worker --loglevel=info -n worker1@%computername% -Q default,reports,imports,exports,optimization"
$celeryProcess = Start-BackgroundProcess -Name "Celery-Worker" -Command $celeryCommand -LogFile $CELERY_LOG

# Warte einen Moment, damit Celery hochfahren kann
Start-Sleep -Seconds 5
Write-Host "Celery-Worker gestartet" -ForegroundColor Green

# 3. Celery-Flower starten
$flowerCommand = "celery -A backend.tasks.celery_app flower --port=5555"
$flowerProcess = Start-BackgroundProcess -Name "Celery-Flower" -Command $flowerCommand -LogFile $FLOWER_LOG

# Warte einen Moment, damit Flower hochfahren kann
Start-Sleep -Seconds 3
Write-Host "Celery-Flower gestartet (http://localhost:5555)" -ForegroundColor Green

# 4. Demo-Server starten (statt modularem Server, da dieser besser funktioniert)
$apiCommand = "uvicorn backend.demo_server_celery:app --reload --host 0.0.0.0 --port 8003"
$apiProcess = Start-BackgroundProcess -Name "Demo-Server" -Command $apiCommand -LogFile $API_LOG

# Warte einen Moment, damit der API-Server hochfahren kann
Start-Sleep -Seconds 3
Write-Host "Demo-Server gestartet (http://localhost:8003)" -ForegroundColor Green

# System-Status anzeigen
Write-Host "`nERP-System erfolgreich gestartet!" -ForegroundColor Cyan
Write-Host "--------------------------------------" -ForegroundColor Cyan
Write-Host "Redis-Server     : localhost:6379" -ForegroundColor White
Write-Host "Celery-Worker    : Aktiv (siehe Logs)" -ForegroundColor White
Write-Host "Celery-Flower UI : http://localhost:5555" -ForegroundColor White
Write-Host "Demo-Server      : http://localhost:8003" -ForegroundColor White
Write-Host "API-Dokumentation: http://localhost:8003/docs" -ForegroundColor White
Write-Host "Log-Verzeichnis  : $LOG_DIR" -ForegroundColor White
Write-Host "--------------------------------------" -ForegroundColor Cyan
Write-Host "Verwenden Sie Ctrl+C in den jeweiligen Fenstern, um die Dienste zu beenden."
Write-Host "Alle Log-Dateien werden im Verzeichnis $LOG_DIR gespeichert."
Write-Host "Die gestarteten Prozesse laufen im Hintergrund. Schließen Sie dieses Fenster nicht, um sie zu überwachen."

# Speichere die Prozess-IDs für möglichen späteren Zugriff
$processInfo = @{
    "Redis" = $redisProcess.Id
    "Celery" = $celeryProcess.Id
    "Flower" = $flowerProcess.Id
    "API" = $apiProcess.Id
}

# Optionale Funktion zum Beenden aller Prozesse
function Stop-AllProcesses {
    foreach ($key in $processInfo.Keys) {
        $id = $processInfo[$key]
        try {
            Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
            Write-Host "$key-Prozess (PID: $id) beendet" -ForegroundColor Yellow
        } catch {
            Write-Host "Konnte $key-Prozess (PID: $id) nicht beenden: $_" -ForegroundColor Red
        }
    }
    Write-Host "Alle Prozesse wurden beendet" -ForegroundColor Green
}

# Warte auf Benutzeraktion
Write-Host "`nDrücken Sie 'Q' zum Beenden aller Prozesse oder 'X' zum Verlassen dieser Überwachung..." -ForegroundColor Yellow

# Halte das Skript am Laufen und ermögliche das Beenden aller Prozesse
while ($true) {
    if ([Console]::KeyAvailable) {
        $key = [Console]::ReadKey($true).Key
        if ($key -eq 'Q') {
            Write-Host "Beende alle Prozesse..." -ForegroundColor Yellow
            Stop-AllProcesses
            break
        } elseif ($key -eq 'X') {
            Write-Host "Verlasse die Überwachung. Prozesse laufen weiter im Hintergrund." -ForegroundColor Yellow
            break
        }
    }
    Start-Sleep -Seconds 1
} 