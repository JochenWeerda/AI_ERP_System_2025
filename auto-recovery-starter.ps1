# NeuroERP Auto-Recovery Starter
# Dieses Skript führt verschiedene Aktionen zur Auto-Recovery durch

# Banner anzeigen
Write-Host "=== NeuroERP Auto-Recovery System ===" -ForegroundColor Cyan

# Verfügbare Aktionen
Write-Host "`nVerfügbare Aktionen:" -ForegroundColor Yellow
Write-Host "1. Auto-Recovery einrichten (im Windows-Autostart)" -ForegroundColor White
Write-Host "2. Auto-Recovery einrichten (als geplante Aufgabe)" -ForegroundColor White
Write-Host "3. Manuelles Backup erstellen" -ForegroundColor White
Write-Host "4. Status prüfen" -ForegroundColor White
Write-Host "5. Beenden" -ForegroundColor White

# Benutzerauswahl
$choice = Read-Host "`nBitte wählen Sie eine Option (1-5)"

# Aktionen ausführen
switch ($choice) {
    "1" {
        Write-Host "Auto-Recovery wird im Windows-Autostart eingerichtet..." -ForegroundColor Yellow
        
        # Bestimme Pfade
        $projectPath = (Get-Item -Path "$PSScriptRoot").FullName
        $autoRecoveryFile = "$projectPath\auto-recovery.cmd"
        $startupFolder = [Environment]::GetFolderPath('Startup')
        $startupLink = "$startupFolder\NeuroERP-Auto-Recovery.lnk"
        
        # Erstelle Verknüpfung
        try {
            $WshShell = New-Object -ComObject WScript.Shell
            $Shortcut = $WshShell.CreateShortcut($startupLink)
            $Shortcut.TargetPath = $autoRecoveryFile
            $Shortcut.WorkingDirectory = $projectPath
            $Shortcut.Description = "NeuroERP Auto-Recovery nach Stromausfall"
            $Shortcut.Save()
            
            Write-Host "Auto-Recovery wurde erfolgreich im Windows-Autostart eingerichtet." -ForegroundColor Green
            Write-Host "Der Speicherort der Verknüpfung ist: $startupLink" -ForegroundColor Gray
        }
        catch {
            Write-Host "Fehler beim Erstellen der Autostart-Verknüpfung: $_" -ForegroundColor Red
        }
    }
    "2" {
        Write-Host "Auto-Recovery wird als geplante Aufgabe eingerichtet..." -ForegroundColor Yellow
        Write-Host "Hierfür werden Administratorrechte benötigt. Es öffnet sich ein UAC-Dialog." -ForegroundColor Yellow
        
        # Führe Skript mit Admin-Rechten aus
        try {
            # Bestimme Pfad
            $projectPath = (Get-Item -Path "$PSScriptRoot").FullName
            $scriptPath = "$projectPath\install-recovery.cmd"
            
            # Starte Prozess
            Start-Process $scriptPath
            
            Write-Host "Das Setup wurde gestartet. Bitte folgen Sie den Anweisungen im neuen Fenster." -ForegroundColor Green
        }
        catch {
            Write-Host "Fehler beim Starten des Admin-Setups: $_" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host "Manuelles Backup wird erstellt..." -ForegroundColor Yellow
        
        # Führe Backup-Skript aus
        try {
            Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -Command `"& { Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \`"$PSScriptRoot\hibernate-recovery.ps1\`" -Backup' -Verb RunAs }`""
            
            Write-Host "Das Backup wurde gestartet. Bitte folgen Sie den Anweisungen im neuen Fenster." -ForegroundColor Green
        }
        catch {
            Write-Host "Fehler beim Starten des Backups: $_" -ForegroundColor Red
        }
    }
    "4" {
        Write-Host "Status wird geprüft..." -ForegroundColor Yellow
        
        # Führe Recovery-Check aus
        try {
            & "$PSScriptRoot\recovery-check.ps1"
        }
        catch {
            Write-Host "Fehler beim Ausführen des Recovery-Checks: $_" -ForegroundColor Red
        }
    }
    "5" {
        Write-Host "Programm wird beendet." -ForegroundColor Yellow
        exit
    }
    default {
        Write-Host "Ungültige Option. Programm wird beendet." -ForegroundColor Red
        exit
    }
}

Write-Host "`nDrücken Sie eine beliebige Taste zum Beenden..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 