# NeuroERP Auto-Recovery Setup
# Dieses Skript richtet die automatische Recovery nach Stromausfall oder Neustart ein

#Requires -RunAsAdministrator

Write-Host "=== NeuroERP Auto-Recovery Setup ===" -ForegroundColor Cyan

# Pfade definieren
$projectPath = (Get-Item -Path "$PSScriptRoot").FullName
$autoRecoveryFile = "$projectPath\auto-recovery.cmd"
$startupFolder = [Environment]::GetFolderPath('Startup')
$startupLink = "$startupFolder\NeuroERP-Auto-Recovery.lnk"
$taskName = "NeuroERP-Auto-Recovery"

# 1. Prüfe, ob auto-recovery.cmd existiert
if (-not (Test-Path $autoRecoveryFile)) {
    Write-Host "Die Datei 'auto-recovery.cmd' wurde nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Ausgabe Installationsoptionen
Write-Host "`nInstallationsoptionen:" -ForegroundColor Yellow
Write-Host "1. Auto-Recovery im Windows-Autostart einrichten (für den aktuellen Benutzer)" -ForegroundColor White
Write-Host "2. Auto-Recovery als geplante Aufgabe einrichten (für alle Benutzer)" -ForegroundColor White
Write-Host "3. Beide Optionen einrichten (empfohlen)" -ForegroundColor Green
Write-Host "4. Auto-Recovery entfernen" -ForegroundColor Red
Write-Host "5. Abbrechen" -ForegroundColor White

$choice = Read-Host "`nOption wählen (1-5)"

# Funktion zum Erstellen einer Verknüpfung
function Create-Shortcut {
    param (
        [string]$SourceFile,
        [string]$DestinationPath
    )
    
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($DestinationPath)
    $Shortcut.TargetPath = $SourceFile
    $Shortcut.WorkingDirectory = $projectPath
    $Shortcut.Description = "NeuroERP Auto-Recovery nach Stromausfall oder Neustart"
    $Shortcut.Save()
    
    Write-Host "Verknüpfung erstellt: $DestinationPath" -ForegroundColor Green
}

# Funktion zum Erstellen der geplanten Aufgabe
function Create-ScheduledTask {
    try {
        $taskExists = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
        
        if ($taskExists) {
            Write-Host "Geplante Aufgabe '$taskName' existiert bereits. Wird entfernt..." -ForegroundColor Yellow
            Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        }
        
        $trigger = New-ScheduledTaskTrigger -AtLogOn
        $action = New-ScheduledTaskAction -Execute $autoRecoveryFile -WorkingDirectory $projectPath
        $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
        $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -WakeToRun

        Register-ScheduledTask -TaskName $taskName -Trigger $trigger -Action $action -Principal $principal -Settings $settings
        Write-Host "Geplante Aufgabe '$taskName' erfolgreich erstellt" -ForegroundColor Green
    }
    catch {
        Write-Host "Fehler beim Erstellen der geplanten Aufgabe: $_" -ForegroundColor Red
    }
}

# Funktion zum Entfernen der Auto-Recovery
function Remove-AutoRecovery {
    try {
        # Entferne Verknüpfung im Autostart
        if (Test-Path $startupLink) {
            Remove-Item -Path $startupLink -Force
            Write-Host "Autostart-Verknüpfung entfernt" -ForegroundColor Yellow
        }
        
        # Entferne geplante Aufgabe
        $taskExists = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
        
        if ($taskExists) {
            Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
            Write-Host "Geplante Aufgabe '$taskName' entfernt" -ForegroundColor Yellow
        }
        
        Write-Host "Auto-Recovery wurde erfolgreich entfernt" -ForegroundColor Green
    }
    catch {
        Write-Host "Fehler beim Entfernen der Auto-Recovery: $_" -ForegroundColor Red
    }
}

# Ausführung je nach Auswahl
switch ($choice) {
    "1" {
        # Option 1: Autostart für aktuellen Benutzer
        Create-Shortcut -SourceFile $autoRecoveryFile -DestinationPath $startupLink
        Write-Host "`nAuto-Recovery wurde im Windows-Autostart eingerichtet." -ForegroundColor Green
    }
    "2" {
        # Option 2: Geplante Aufgabe für alle Benutzer
        Create-ScheduledTask
        Write-Host "`nAuto-Recovery wurde als geplante Aufgabe eingerichtet." -ForegroundColor Green
    }
    "3" {
        # Option 3: Beide Methoden
        Create-Shortcut -SourceFile $autoRecoveryFile -DestinationPath $startupLink
        Create-ScheduledTask
        Write-Host "`nAuto-Recovery wurde mit beiden Methoden eingerichtet (maximale Zuverlässigkeit)." -ForegroundColor Green
    }
    "4" {
        # Option 4: Entfernen
        Remove-AutoRecovery
    }
    "5" {
        # Option 5: Abbrechen
        Write-Host "`nVorgang abgebrochen. Es wurden keine Änderungen vorgenommen." -ForegroundColor Yellow
        exit
    }
    default {
        Write-Host "`nUngültige Option. Vorgang abgebrochen." -ForegroundColor Red
        exit
    }
}

Write-Host "`nSetup abgeschlossen." -ForegroundColor Cyan
Write-Host "Das System wird nun nach einem Stromausfall oder Neustart automatisch wiederhergestellt." -ForegroundColor White 