# NeuroERP Recovery System - Administrator-Launcher
# Dieses Skript startet die Konfiguration oder das Recovery mit Administrator-Rechten

param(
    [switch]$Config,
    [switch]$Backup,
    [switch]$Recovery
)

function Elevate-Script {
    param(
        [string]$ScriptPath,
        [string]$Arguments
    )
    
    # Start-Process mit Administrator-Rechten
    Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$ScriptPath`" $Arguments" -Verb RunAs
}

# Banner ausgeben
Write-Host "===========================" -ForegroundColor Cyan
Write-Host "NeuroERP Recovery System" -ForegroundColor Cyan
Write-Host "Administrator-Modus Launcher" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Prüfe Parameter und führe entsprechende Aktion aus
if ($Config) {
    Write-Host "Starte Konfiguration mit Administrator-Rechten..." -ForegroundColor Yellow
    Elevate-Script -ScriptPath "$PSScriptRoot\configure-recovery-tasks.ps1"
} elseif ($Backup) {
    Write-Host "Starte Backup mit Administrator-Rechten..." -ForegroundColor Yellow
    Elevate-Script -ScriptPath "$PSScriptRoot\hibernate-recovery.ps1" -Arguments "-Backup"
} elseif ($Recovery) {
    Write-Host "Starte Recovery mit Administrator-Rechten..." -ForegroundColor Yellow
    Elevate-Script -ScriptPath "$PSScriptRoot\hibernate-recovery.ps1" -Arguments "-Recovery"
} else {
    # Wenn keine Parameter angegeben wurden, Menü anzeigen
    Write-Host "Bitte wählen Sie eine Option:" -ForegroundColor Yellow
    Write-Host "1. Recovery-System konfigurieren" -ForegroundColor White
    Write-Host "2. Manuelles Backup erstellen" -ForegroundColor White
    Write-Host "3. Manuelles Recovery durchführen" -ForegroundColor White
    Write-Host "4. Abbrechen" -ForegroundColor White
    
    $choice = Read-Host "Option [1-4]"
    
    switch ($choice) {
        "1" { 
            Write-Host "Starte Konfiguration mit Administrator-Rechten..." -ForegroundColor Yellow
            Elevate-Script -ScriptPath "$PSScriptRoot\configure-recovery-tasks.ps1"
        }
        "2" { 
            Write-Host "Starte Backup mit Administrator-Rechten..." -ForegroundColor Yellow
            Elevate-Script -ScriptPath "$PSScriptRoot\hibernate-recovery.ps1" -Arguments "-Backup"
        }
        "3" { 
            Write-Host "Starte Recovery mit Administrator-Rechten..." -ForegroundColor Yellow
            Elevate-Script -ScriptPath "$PSScriptRoot\hibernate-recovery.ps1" -Arguments "-Recovery"
        }
        "4" { 
            Write-Host "Vorgang abgebrochen." -ForegroundColor Red
            exit
        }
        default { 
            Write-Host "Ungültige Eingabe. Vorgang abgebrochen." -ForegroundColor Red
            exit
        }
    }
}

Write-Host "`nDer Prozess wurde als Administrator gestartet." -ForegroundColor Cyan
Write-Host "Es sollte sich ein neues PowerShell-Fenster mit erhöhten Rechten öffnen." -ForegroundColor Cyan
Write-Host "Falls eine UAC-Anfrage erscheint, bitte bestätigen Sie diese." -ForegroundColor Yellow 