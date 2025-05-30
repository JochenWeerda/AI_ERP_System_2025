# ===================================================
# Frontend-Starter Skript
# ===================================================
# Startet den Frontend-Entwicklungsserver mit 
# verbesserter PowerShell-Kompatibilität
# ===================================================

# Lade Hilfsfunktionen
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
. "$scriptPath\powershell_compatibility.ps1"

# Banner anzeigen
Write-Host ""
Write-Host " =====================================================" -ForegroundColor Cyan
Write-Host "  Frontend-Starter - Folkerts Landhandel ERP" -ForegroundColor Cyan
Write-Host " =====================================================" -ForegroundColor Cyan
Write-Host ""

# Pfade definieren
$rootDir = Split-Path -Parent $scriptPath
$frontendDir = Join-Path $rootDir "frontend"
$packageJsonPath = Join-Path $frontendDir "package.json"
$viteConfigPath = Join-Path $frontendDir "vite.config.js"

# Versuche den Port zu bestimmen (Standard: 3000)
$port = 3000
if ($env:PORT) {
    $port = [int]$env:PORT
}

# Überprüfe, ob Frontend-Verzeichnis existiert
if (-not (Test-Path $frontendDir)) {
    Write-Error "Frontend-Verzeichnis nicht gefunden: $frontendDir"
    Write-Info "Möchten Sie das Setup-Skript ausführen, um die Frontend-Umgebung einzurichten?"
    $runSetup = Read-Host "Einrichtung starten? (j/n)"
    
    if ($runSetup -eq "j") {
        & "$scriptPath\setup_frontend.ps1"
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Setup fehlgeschlagen. Bitte überprüfen Sie die Fehlermeldungen."
            exit 1
        }
    } else {
        Write-Error "Abbruch. Bitte erstellen Sie das Frontend-Verzeichnis manuell."
        exit 1
    }
}

# Ins Frontend-Verzeichnis wechseln
Set-Location $frontendDir
Write-Info "Arbeitsverzeichnis: $frontendDir"

# NPM-Version anzeigen
$npmVersion = Invoke-Expression "npm --version"
Write-Info "Verwende npm Version: $npmVersion"

# Überprüfe, ob package.json existiert
if (-not (Test-Path $packageJsonPath)) {
    Write-Error "package.json nicht gefunden: $packageJsonPath"
    Write-Info "Möchten Sie das Setup-Skript ausführen, um die Frontend-Umgebung einzurichten?"
    $runSetup = Read-Host "Einrichtung starten? (j/n)"
    
    if ($runSetup -eq "j") {
        & "$scriptPath\setup_frontend.ps1"
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Setup fehlgeschlagen. Bitte überprüfen Sie die Fehlermeldungen."
            exit 1
        }
    } else {
        Write-Error "Abbruch. Bitte erstellen Sie eine package.json manuell mit 'npm init'."
        exit 1
    }
}

# Überprüfe, ob node_modules existiert
$nodeModulesPath = Join-Path $frontendDir "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Warning "node_modules nicht gefunden. Installiere Abhängigkeiten..."
    Invoke-Expression "npm install"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Installation der Abhängigkeiten fehlgeschlagen."
        exit 1
    }
    Write-Success "Abhängigkeiten installiert"
}

# Überprüfe, ob vite.config.js existiert und JSX-Konfiguration enthält
if (-not (Test-Path $viteConfigPath)) {
    Write-Warning "vite.config.js nicht gefunden. Erstelle Standard-Konfiguration..."
    
    $viteConfig = @"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: { '.js': 'jsx' },
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  server: {
    port: $port,
    open: true
  }
});
"@

    Set-Content -Path $viteConfigPath -Value $viteConfig
    Write-Success "vite.config.js erstellt mit JSX-Unterstützung"
} else {
    # Überprüfe und aktualisiere JSX-Konfiguration
    $jsxConfigOk = Test-JSXConfiguration -ViteConfigPath $viteConfigPath
    if (-not $jsxConfigOk) {
        Write-Warning "JSX-Konfiguration in vite.config.js fehlt oder ist fehlerhaft. Wird korrigiert..."
        Set-JSXConfiguration -ViteConfigPath $viteConfigPath
    }
}

# Überprüfe, ob der Port bereits verwendet wird
$portAvailable = Test-PortAvailable -Port $port
if (-not $portAvailable) {
    Write-Warning "Port $port ist bereits belegt."
    $stopProcess = Read-Host "Prozess auf Port $port beenden? (j/n)"
    
    if ($stopProcess -eq "j") {
        Stop-ProcessOnPort -Port $port -Force
    } else {
        Write-Info "Suche alternativen Port..."
        $port = Find-FreePort -StartPort $port
        if (-not $port) {
            Write-Error "Konnte keinen freien Port finden. Bitte beenden Sie den blockierenden Prozess manuell."
            exit 1
        }
        Write-Success "Alternativer Port gefunden: $port"
    }
}

# Ermittle das korrekte npm-Skript zum Starten
$packageJson = Get-Content -Path $packageJsonPath -Raw | ConvertFrom-Json
$startCommand = ""

if ($packageJson.scripts.start) {
    $startCommand = "npm start"
} elseif ($packageJson.scripts.dev) {
    $startCommand = "npm run dev"
} else {
    # Wenn kein Start-Skript definiert ist, versuche npx vite direkt
    $startCommand = "npx vite"
}

# Konfiguriere den Port
$env:PORT = $port

# Starte den Entwicklungsserver
Write-Info "Starte Entwicklungsserver..."
Write-Info "Die Anwendung wird unter http://localhost:$port verfügbar sein"
Write-Info "Drücke STRG+C, um den Server zu beenden"

# Führe den Startbefehl aus
Invoke-Expression $startCommand

# Falls der Befehl fehlschlägt, versuche alternative Methoden
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Start mit '$startCommand' fehlgeschlagen. Versuche alternativen Befehl..."
    
    $commands = @(
        "npx vite --port $port",
        "npx vite --host --port $port",
        "npx http-server -p $port ."
    )
    
    foreach ($cmd in $commands) {
        Write-Info "Versuche: $cmd"
        Invoke-Expression $cmd
        
        if ($LASTEXITCODE -eq 0) {
            break
        }
    }
}

Write-Host ""
Write-Host " =====================================================" -ForegroundColor Cyan
Write-Host "  Frontend-Server beendet" -ForegroundColor Cyan
Write-Host " =====================================================" -ForegroundColor Cyan
Write-Host "" 