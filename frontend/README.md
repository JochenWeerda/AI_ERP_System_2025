# VALEO NeuroERP Frontend

## Übersicht
Dieses Verzeichnis enthält das Frontend für das VALEO NeuroERP-System. Das System verwendet ein modernes, responsives Design mit einer benutzerfreundlichen Oberfläche.

## Finales Design
Das finale Frontend-Design befindet sich im Verzeichnis `public/VALEO-final-design/`. 

### Hauptfunktionen
- Modernes Dashboard mit einheitlichem Design
- Ausklappbare Chat-Sidebar mit internem Chat, Kundenchat und KI-Assistent
- Benutzer- und Benachrichtigungssystem
- Belegfolgen-Visualisierung
- Modulare Darstellung aller ERP-Komponenten

### Technische Details
- HTML5 und CSS3
- Responsive Design für verschiedene Bildschirmgrößen
- Font Awesome Icons
- Modulare CSS-Struktur

## Lokaler Entwicklungsserver
Um das Frontend lokal zu testen, führe den folgenden Befehl aus:

```bash
cd frontend
python -m http.server 8088
```

Anschließend ist das Frontend unter http://localhost:8088/public/VALEO-final-design/ erreichbar.

## Weiterentwicklung
Die nächsten Schritte für die Frontend-Entwicklung sind:
1. Integration der Backend-Routen
2. Entwicklung der Unterseiten für die verschiedenen Module
3. Implementierung der Authentifizierung und Benutzerverwaltung
4. Funktionale Erweiterung der Chat- und KI-Assistentenfunktionen

## Architektur

Die Frontend-Architektur folgt einem modularen Ansatz:

- **Micro-Frontend-Struktur** - Separate Module für verschiedene Geschäftsbereiche
- **Containerisierte Bereitstellung** - Deployment via Kubernetes für Skalierbarkeit
- **API-Gateway-Integration** - Zentrale Schnittstelle zu Backend-Diensten

## Apps-Dashboard

Das zentrale Element der Benutzeroberfläche ist das Apps-Dashboard, das alle verfügbaren Anwendungen kategorisiert anzeigt:

### Kategorien

1. **Belegfolge**
   - Angebote
   - Aufträge
   - Lieferscheine
   - Rechnungen
   - Gutschriften

2. **Stammdaten**
   - Artikel
   - Kunden
   - Lieferanten
   - Preislisten
   - Lager/Standorte

3. **Finanzen**
   - Buchhaltung
   - Controlling
   - Reporting
   - Budgetplanung
   - Kostenrechnung

4. **Produktion**
   - Fertigungsaufträge
   - Materialplanung
   - Kapazitätsplanung
   - Qualitätssicherung

5. **Personal**
   - Mitarbeiterverwaltung
   - Zeiterfassung
   - Schichtplanung
   - Gehaltsabrechnung

### Design-Prinzipien

- Übersichtliche Kachelanordnung mit aussagekräftigen Icons
- Farbliche Kategorisierung für intuitive Bedienung
- Responsive Design für alle Endgeräte
- Barrierefreiheit nach WCAG 2.1 AA-Standard

## Weitere Funktionen

### KI-Assistenten

- **VALEO** - Männlicher KI-Assistent für allgemeine ERP-Fragen
- **Valerie** - Weiblicher KI-Assistent für spezialisierte Hilfestellung

### Sprach- und Audiounterstützung

- Sprachgesteuerte Suche und Navigation
- Headset- und Bluetooth-Unterstützung
- Text-to-Speech für Vorlesefunktionen

### System-Monitoring

- Echtzeit-Statusanzeige aller Systemkomponenten
- Performance-Metriken und Warnmeldungen
- Serverauslastung und -verfügbarkeit

## Technische Details

### Verwendete Technologien

- HTML5, CSS3, JavaScript (ES6+)
- FontAwesome für Icons
- Responsive Design mit CSS Grid/Flexbox
- WebSockets für Echtzeit-Updates

### Entwicklung und Deployment

- Lokale Entwicklung mit Live-Reload
- Containerisierung mit Docker
- Kubernetes-Deployment für Produktionsumgebungen
- CI/CD-Pipeline für automatisierte Tests und Bereitstellung

## Erste Schritte

1. Repository klonen
2. Abhängigkeiten installieren
3. Lokalen Entwicklungsserver starten
4. Zugriff über Browser unter http://localhost:8080

## Kubernetes-Deployment

Das Frontend wird als Kubernetes-Service bereitgestellt:

```yaml
# frontend-modular.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-html
  namespace: erp-system
data:
  index.html: |
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VALEO - Die NeuroERP</title>
        <!-- CSS und JavaScript werden hier eingebunden -->
    </head>
    <body>
        <!-- Frontend-Content -->
    </body>
    </html>

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-modular
  namespace: erp-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend-modular
  template:
    metadata:
      labels:
        app: frontend-modular
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        volumeMounts:
        - name: html-volume
          mountPath: /usr/share/nginx/html
      volumes:
      - name: html-volume
        configMap:
          name: frontend-html

---
apiVersion: v1
kind: Service
metadata:
  name: frontend-modular
  namespace: erp-system
spec:
  selector:
    app: frontend-modular
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

## Zugriff auf die Anwendung

```bash
# Port-Forwarding für lokalen Zugriff
kubectl port-forward service/frontend-modular -n erp-system 8080:80

# Zugriff im Browser
http://localhost:8080
```
