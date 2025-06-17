# PowerShell-Skript zum Aufräumen alter Frontend-Dateien und Designs

# Definiere zu löschende alte Designs (falls vorhanden)
$oldDesignsToDelete = @(
    "frontend/public/dashboard-design",
    "frontend/public/old-dashboard",
    "frontend/public/prototype",
    "frontend/public/valeo-dashboard-old"
)

# Lösche alte Design-Verzeichnisse
Write-Host "Lösche alte Design-Verzeichnisse..."
foreach ($design in $oldDesignsToDelete) {
    $path = "$design"
    if (Test-Path $path) {
        Remove-Item $path -Recurse -Force
        Write-Host "  Gelöscht: $path"
    } else {
        Write-Host "  Nicht gefunden: $path"
    }
}

# Lösche alte oder doppelte Dashboard-Dateien in public/
Write-Host "Lösche alte oder doppelte Dashboard-Dateien in public/..."
$filesToDelete = @(
    "frontend/public/dashboard.html",
    "frontend/public/dashboard.css",
    "frontend/public/valeo-dashboard.html",
    "frontend/public/valeo-dashboard.css"
)

foreach ($file in $filesToDelete) {
    $path = "$file"
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "  Gelöscht: $file"
    } else {
        Write-Host "  Nicht gefunden: $file"
    }
}

# Stelle sicher, dass das aktuelle Design beibehalten wird
Write-Host "Stelle sicher, dass das aktuelle VALEO-final-design beibehalten wird..."
$finalDesignPath = "frontend/public/VALEO-final-design"
if (Test-Path $finalDesignPath) {
    Write-Host "  Beibehalten: $finalDesignPath"
} else {
    Write-Host "  Warnung: VALEO-final-design nicht gefunden: $finalDesignPath"
}

# Bereinige leere Verzeichnisse
Write-Host "Bereinige leere Verzeichnisse in public/..."
$dirsToCheck = @(
    "frontend/public/styles"
)

foreach ($dir in $dirsToCheck) {
    $path = "$dir"
    if (Test-Path $path) {
        $isEmpty = $true
        $items = Get-ChildItem -Path $path -Force
        
        if ($items.Count -eq 0) {
            Remove-Item $path -Force
            Write-Host "  Gelöscht leeres Verzeichnis: $path"
        } else {
            Write-Host "  Verzeichnis nicht leer, beibehalten: $path"
        }
    } else {
        Write-Host "  Verzeichnis nicht gefunden: $path"
    }
}

Write-Host "Frontend-Aufräumen abgeschlossen." 