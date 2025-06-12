@echo off
REM NeuroERP Auto-Recovery Installer
REM Diese Batch-Datei führt das Setup-Skript mit Admin-Rechten aus

echo NeuroERP Auto-Recovery Setup wird mit Administrator-Rechten gestartet...

REM UAC-Elevation über PowerShell
powershell -Command "Start-Process powershell.exe -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0setup-auto-recovery.ps1\"' -Verb RunAs"

echo.
echo Falls eine Berechtigungsanfrage erscheint, bitte bestätigen Sie diese.
echo.
echo Drücken Sie eine beliebige Taste zum Beenden...
pause > nul 