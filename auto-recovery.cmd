@echo off
REM NeuroERP Automatische Recovery nach Stromausfall oder Neustart
REM Diese Datei sollte im Windows Autostart-Ordner platziert werden

echo NeuroERP Auto-Recovery wird gestartet...
echo Zeitstempel: %date% %time%

REM Warte kurz, bis das System vollständig gestartet ist
timeout /t 30

REM Setze Arbeitsverzeichnis auf den Projektordner
cd /d "C:\AI_driven_ERP\AI_driven_ERP"

REM Führe Recovery mit Admin-Rechten aus
powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"C:\AI_driven_ERP\AI_driven_ERP\hibernate-recovery.ps1\" -Recovery' -Verb RunAs"

echo Auto-Recovery wurde gestartet. Bitte warten Sie, bis der Prozess abgeschlossen ist.
echo Falls eine UAC-Anfrage angezeigt wird, bestätigen Sie diese bitte. 