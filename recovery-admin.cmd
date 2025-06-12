@echo off
REM NeuroERP Recovery Admin - Automatischer Starter

if "%1"=="config" (
    powershell -ExecutionPolicy Bypass -File "run-as-admin.ps1" -Config
    goto :eof
)

if "%1"=="backup" (
    powershell -ExecutionPolicy Bypass -File "run-as-admin.ps1" -Backup
    goto :eof
)

if "%1"=="recovery" (
    powershell -ExecutionPolicy Bypass -File "run-as-admin.ps1" -Recovery
    goto :eof
)

REM Ohne Parameter das Menü anzeigen
powershell -ExecutionPolicy Bypass -File "run-as-admin.ps1" 