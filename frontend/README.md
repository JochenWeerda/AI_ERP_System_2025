# Folkerts Landhandel ERP-Frontend

Dieses Verzeichnis enthält das Frontend für das Folkerts Landhandel ERP-System, implementiert mit React und Vite.

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

### Installation

```bash
npm install
```

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
