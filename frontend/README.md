# Folkerts Landhandel ERP Frontend

Dieses Verzeichnis enthält das Frontend für das Folkerts Landhandel ERP-System, entwickelt mit React, TypeScript und Material UI.

## Schnellstart

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Build erstellen
npm run build
```

## Theme-System

Das ERP-System verfügt über ein flexibles Theme-System, das verschiedene Darstellungsmodi und Designvarianten unterstützt:

### Theme-Modi
- **Hell** (Standard): Helles Design für normale Verwendung
- **Dunkel**: Augenfreundliches dunkles Design
- **Hoher Kontrast**: Barrierefreies Design mit verstärktem Kontrast

### Theme-Varianten
- **Default**: Standarddesign
- **Modern**: Modernes, flaches Design
- **Classic**: Klassisches, strukturiertes Design
- **Odoo**: An Odoo-ERP angelehnte Designvariante

### Theme-Demo starten

```bash
# Option 1: npm-Skript verwenden (vom Root-Verzeichnis aus)
npm run theme-demo

# Option 2: Direkt im Frontend-Verzeichnis
npm run dev
```

## Bekannte Probleme und Lösungen

### JSX-Konfiguration

Wenn bei der Entwicklung der Fehler "The JSX syntax extension is not currently enabled" auftritt, stellen Sie sicher, dass die vite.config.js die richtige JSX-Konfiguration enthält:

```javascript
// vite.config.js
export default defineConfig({
  // ...
  esbuild: {
    loader: { '.js': 'jsx', '.ts': 'tsx' },
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  // ...
});
```

### React-Versionskompatibilität

Einige Pakete können Kompatibilitätsprobleme mit React 18 haben:

- **react-qr-reader**: Die Version 3.0.0-beta-1 ist nur mit React 16/17 kompatibel und verursacht Fehler mit React 18.
- Wenn Sie die QR-Code-Funktionalität benötigen, verwenden Sie stattdessen kompatible Alternativen wie `react-qr-code` oder `html5-qrcode`.

### PowerShell-Kompatibilität

Bei der Ausführung von Befehlen in PowerShell:

- Verwenden Sie `;` anstelle von `&&` zur Befehlsverkettung:
  ```powershell
  # Falsch
  cd frontend && npm start
  
  # Richtig
  cd frontend; npm start
  ```

- Für Umgebungsvariablen verwenden Sie `$env:`:
  ```powershell
  $env:PORT=3000; npm start
  ```

## Architektur

Die Frontend-Anwendung verwendet folgende Haupttechnologien:

- **React 18**: UI-Bibliothek
- **TypeScript**: Typsicheres JavaScript
- **Material UI**: Komponenten-Bibliothek
- **Vite**: Build-Tool
- **React Router**: Routing
- **Axios**: HTTP-Client

Die Anwendung ist modular aufgebaut mit:

```
src/
├── components/      # Wiederverwendbare UI-Komponenten
├── contexts/        # React-Kontexte für State-Management
├── hooks/           # Benutzerdefinierte React-Hooks
├── pages/           # Seitenkomponenten
├── services/        # API-Services
├── themes/          # Theme-System
│   ├── variants/    # Theme-Varianten
│   └── index.ts     # Theme-Exporte
├── utils/           # Hilfsfunktionen
└── App.tsx          # Root-Komponente
```

## Nützliche Skripte

Im Root-Verzeichnis finden Sie mehrere nützliche PowerShell-Skripte:

- **cd_frontend.ps1**: Wechselt zum Frontend-Verzeichnis
- **start_frontend.ps1**: Startet den Entwicklungsserver
- **van-frontend-validator.ps1**: Validiert die Frontend-Umgebung
- **start_theme_demo.ps1**: Startet die Theme-Demo-Anwendung

## Projektstruktur

- `/src` - Hauptquellcode
  - `/components` - Wiederverwendbare UI-Komponenten
  - `/pages` - Seitenkomponenten für das Routing
  - `/themes` - Theme-System und Konfiguration
  - `/data` - Statische Daten und Dummy-Daten für die Entwicklung
  - `/utils` - Hilfsfunktionen und Utilities
  - `/services` - API-Services und Datenanbindung
  - `/store` - State Management
  - `/assets` - Statische Assets wie Bilder und Fonts
  - `App.jsx` - Hauptanwendungskomponente
  - `main.jsx` - Einstiegspunkt der Anwendung

- `/public` - Statische Dateien, die direkt bereitgestellt werden
  - `/img` - Bilder, die öffentlich zugänglich sein müssen
  - `/images` - Weitere Bildressourcen

## Hauptfunktionen

- **Apps-Dashboard** - Zentrale Übersicht mit kategorisierten Anwendungen
- **QS-Futtermittel** - Futtermittel-Qualitätssicherungs-Dashboard
- **Theme-System** - Unterstützung für verschiedene Theme-Varianten und Modi
- **Responsive Design** - Vollständig responsives Layout für alle Gerätetypen
- **API-Anbindung** - Integration mit dem Backend über REST-APIs

## Entwicklung

### Entwicklungsserver starten

```bash
npm run dev
```

Der Entwicklungsserver wird standardmäßig auf http://localhost:3001 gestartet.

### Build für Produktionsumgebung

```bash
npm run build
```

Die Build-Dateien werden im `/dist`-Verzeichnis erstellt.

### Build-Vorschau

```bash
npm run preview
```

## Hinweise zur Frontend-Struktur

- Das Frontend ist als Single-Page-Application (SPA) implementiert
- React Router wird für die Navigation verwendet
- Material-UI (MUI) bildet die Basis für das UI-Framework
- Redux wird für State Management eingesetzt
- Responsive Design für alle Komponenten
