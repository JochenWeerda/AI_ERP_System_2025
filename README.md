# Folkerts Landhandel ERP-System

Ein umfassendes ERP-System für Folkerts Landhandel, das speziell auf die Anforderungen der Landwirtschaftsbranche zugeschnitten ist.

## Projektübersicht

Das ERP-System besteht aus mehreren Komponenten:

- **Frontend**: React-basierte Single-Page-Application
- **Backend**: FastAPI-basierte Microservices 
- **Finance-Service**: Eigenständiger Microservice für Finanzen und Buchhaltung
- **Observer-Service**: Überwachungsdienst für Systemperformance

## Starten der Anwendung

### Frontend starten

```powershell
# PowerShell-Skript für einfachen Start
.\start_frontend.ps1
```

oder manuell:

```powershell
cd frontend
npm run dev
```

Das Frontend ist dann unter http://localhost:3001 verfügbar.

### Finance-Service starten

```powershell
.\start_finance_311.ps1
```

Der Finance-Service ist dann unter http://localhost:8007 verfügbar.

### Beleg-Service starten

```powershell
.\start_beleg_service_311.ps1
```

Der Beleg-Service ist dann unter http://localhost:8005 verfügbar.

## Projektstruktur

- `/frontend` - Frontend-Anwendung (React/Vite)
- `/backend` - Backend-Services und API-Endpunkte
- `/memory-bank` - Projektdokumentation und Entwicklungsfortschritt
- `/scripts` - Hilfsskripte und Automatisierungen

## Features

### CRM-Modul
- Kundenstammdaten
- Kundengruppen
- Vertrieb und Angebote
- Kommunikation und Newsletter

### ERP-Modul
- Artikelstammdaten
- Lagerverwaltung
- Einkauf und Verkauf
- Landwirtschaftsspezifische Funktionen:
  - Waage/Getreideannahme
  - Pflanzenschutz- und Düngemitteldatenbank
  - Kontrakte
  - THG-Quote
  - Etikettendruck/Gefahrstoffkennzeichnung

### FIBU-Modul
- Buchhaltung
- Rechnungswesen
- Kostenrechnung
- Finanzplanung
- Lohnbuchhaltung
- DATEV-Integration

## Technologien

- **Frontend**: React, Material-UI, Vite
- **Backend**: Python, FastAPI, Pydantic
- **Datenbank**: Verschiedene Datenbankanbindungen je nach Microservice
- **Überwachung**: Custom Observer-Service

## Entwicklung

Für detaillierte Entwicklungsinformationen siehe:
- `frontend/README.md` für Frontend-Entwicklung
- `memory-bank/techContext.md` für technische Architektur
- `memory-bank/systemPatterns.md` für Systemdesign-Patterns
- `memory-bank/tasks.md` für aktuelle Aufgaben und Fortschritt

## Lizenz

Proprietär - Alle Rechte vorbehalten
