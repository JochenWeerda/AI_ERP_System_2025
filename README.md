# NeuroERP - KI-gesteuertes ERP-System

Ein modernes, KI-gesteuertes ERP-System mit Microservice-Architektur und Odoo-Integration.

## Funktionen

- Benutzerauthentifizierung und -autorisierung
- Rollenbasierte Zugriffskontrolle
- API-Versionierung
- Leistungsüberwachung mit Prometheus/Grafana
- Containerisierte Entwicklungsumgebung
- Multi-Datenbank-Architektur (MongoDB, PostgreSQL, Redis)

## Technologie-Stack

### Backend
- Node.js mit Express
- TypeScript
- MongoDB (Dokumentenspeicher)
- PostgreSQL (relationale Daten)
- Redis (Caching & Session-Management)

### Frontend
- React
- TypeScript
- Material-UI
- Redux Toolkit

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Prometheus & Grafana (Monitoring)

## Schnellstart

```powershell
# Entwicklungsumgebung starten
.\start-dev-env.ps1

# Backend manuell starten
.\start-backend.ps1

# Frontend manuell starten
.\start-frontend.ps1
```

> **Hinweis:** PowerShell erfordert, dass Skripte im aktuellen Verzeichnis mit `.\` aufgerufen werden. Verwenden Sie **immer** den Punkt und Backslash vor dem Skriptnamen.

## Microservices

Das System nutzt folgende Microservices:

- **odoo-auth**: Authentifizierung über Odoo mit JWT
- **web-vitals-service**: Erfassung und Analyse von Web-Vitals-Daten
- **enni-integration**: Integration mit externen ERP-Systemen 
- **ai-service**: KI-Funktionen und Vorhersagemodelle
- **core-service**: Zentrale Geschäftslogik und Datenverarbeitung

Details siehe [Microservice-Architektur](memory-bank/microservices-architecture.md)

## Hibernation Recovery System

Das System verfügt über ein automatisches Recovery-System nach Ruhezustand oder Neustart.

### Recovery-System überprüfen

```powershell
.\recovery-check.ps1
```

### Recovery-System installieren

Verwenden Sie den Administrator-Launcher (empfohlen):

```powershell
.\run-as-admin.ps1 -Config
```

Oder, falls Sie bereits eine PowerShell mit Administratorrechten geöffnet haben:

```powershell
powershell -ExecutionPolicy Bypass -File "configure-recovery-tasks.ps1"
```

### Manuelles Backup oder Recovery

Verwenden Sie den Administrator-Launcher:

```powershell
# Menü anzeigen
.\run-as-admin.ps1

# Direkt Backup erstellen
.\run-as-admin.ps1 -Backup

# Direkt Recovery ausführen
.\run-as-admin.ps1 -Recovery
```

### Automatische Recovery nach Stromausfall

Das System kann so konfiguriert werden, dass es nach einem Stromausfall oder unerwarteten Neustart automatisch wiederhergestellt wird:

```powershell
# Als Administrator ausführen
.\setup-auto-recovery.ps1
```

Dies bietet folgende Optionen:
1. Auto-Recovery im Windows-Autostart einrichten (aktueller Benutzer)
2. Auto-Recovery als geplante Aufgabe einrichten (alle Benutzer)
3. Beide Methoden kombinieren für maximale Zuverlässigkeit (empfohlen)
4. Auto-Recovery deaktivieren

## Entwicklung

- Frontend: React + TypeScript
- Backend: Node.js + Express
- Datenbank: MongoDB + PostgreSQL
- Kubernetes: k3d-basierte Cluster-Umgebung

## Lizenz

Proprietär - Alle Rechte vorbehalten

## Erste Schritte

### Voraussetzungen
- Docker & Docker Compose
- Node.js (>= 14)
- npm oder yarn

### Installation

1. Repository klonen:
```bash
git clone https://github.com/yourusername/ai-driven-erp.git
cd ai-driven-erp
```

2. Umgebungsvariablen konfigurieren:
```bash
cp .env.example .env
# Bearbeiten Sie .env mit Ihren Einstellungen
```

3. Docker-Container starten:
```bash
docker-compose up -d
```

4. Backend-Abhängigkeiten installieren:
```bash
cd backend
npm install
```

5. Frontend-Abhängigkeiten installieren:
```bash
cd frontend
npm install
```

### Entwicklung

1. Backend-Server starten:
```bash
cd backend
npm run dev
```

2. Frontend-Server starten:
```bash
cd frontend
npm start
```

Die Anwendung ist nun verfügbar unter:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

## API-Dokumentation

### Authentifizierung

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

#### Token aktualisieren
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

### Benutzer-Management

#### Benutzer auflisten (Admin)
```http
GET /api/v1/users
Authorization: Bearer <token>
```

#### Benutzer erstellen (Admin)
```http
POST /api/v1/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "role": "string"
}
```

#### Benutzer aktualisieren
```http
PUT /api/v1/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "string",
  "role": "string"
}
```

#### Benutzer löschen (Admin)
```http
DELETE /api/v1/users/:id
Authorization: Bearer <token>
```

## Monitoring

Das System verwendet Prometheus und Grafana für Monitoring und Visualisierung:

- Metriken-Endpunkt: `/metrics`
- Standardmetriken:
  - HTTP-Anfragen pro Route
  - Antwortzeiten
  - Fehlerraten
  - Systemressourcen

## Sicherheit

- JWT-basierte Authentifizierung
- Token-Blacklisting für Logout
- Refresh-Token-Rotation
- Rollenbasierte Zugriffskontrolle
- Sicherheits-Middleware (Helmet)
- Rate Limiting
- CORS-Konfiguration

## Beitragen

1. Fork erstellen
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen
