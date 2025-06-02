# Aktuelle Aufgaben

Dieser Bereich wird für aktive, in Bearbeitung befindliche Aufgaben verwendet. Nach Abschluss einer Aufgabe werden die Details in die entsprechende Archivdatei übertragen.

## Container-Infrastruktur-Optimierungsprojekt

Nach der erfolgreichen Implementierung der Containerisierung für unser ERP-System werden die folgenden Verbesserungen als nächste Schritte geplant:

### 1. Kubernetes-Migration

**Ziel:** Migration der bestehenden Docker-Compose-Infrastruktur zu Kubernetes für verbesserte Orchestrierung und Skalierung.

#### Phasen:

- [ ] **Phase 1: Vorbereitung und Planung**
  - [ ] Analyse der aktuellen Containerlast und Ressourcenanforderungen
  - [ ] Auswahl der Kubernetes-Plattform (selbst-gehostet, AKS, EKS, GKE)
  - [ ] Definition der Namespace-Struktur und Ressourcenkontingente
  - [ ] Erstellung eines detaillierten Migrationsplans mit Zeitrahmen

- [ ] **Phase 2: Kubernetes-Grundeinrichtung**
  - [ ] Einrichtung des Kubernetes-Clusters (Dev/Test/Prod)
  - [ ] Konfiguration der Netzwerkrichtlinien und Firewalls
  - [ ] Implementierung des Ingress-Controllers
  - [ ] Einrichtung des persistent storage für Datenbanken und Konfigurationsdaten

- [ ] **Phase 3: Anwendungsmigration**
  - [ ] Erstellung von Kubernetes-Manifesten für jeden Dienst
  - [ ] Konvertierung von Docker-Compose-Volumes zu PersistentVolumeClaims
  - [ ] Implementierung von ConfigMaps und Secrets für Konfigurationsdaten
  - [ ] Entwicklung von Readiness- und Liveness-Probes für jeden Dienst

- [ ] **Phase 4: Erweiterte Kubernetes-Funktionen**
  - [ ] Implementierung von HorizontalPodAutoscalers für automatische Skalierung
  - [ ] Konfiguration von ResourceQuotas und LimitRanges
  - [ ] Einrichtung von PodDisruptionBudgets für Hochverfügbarkeit
  - [ ] Implementierung von NetworkPolicies für Netzwerksicherheit

- [ ] **Phase 5: Validierung und Rollout**
  - [ ] Durchführung von Lasttests auf der Kubernetes-Infrastruktur
  - [ ] Überprüfung der Failover- und Recovery-Mechanismen
  - [ ] Schrittweise Migration der Produktionsworkloads
  - [ ] Schulung des Betriebsteams für Kubernetes-Administration

### 2. Automatisierte Warnungen

**Ziel:** Implementierung eines umfassenden Warnsystems basierend auf den gesammelten Metriken.

#### Aufgaben:

- [ ] **Warnungsklassifizierung erstellen**
  - [ ] Definition von Schweregrad-Ebenen (kritisch, hoch, mittel, niedrig)
  - [ ] Festlegung von Eskalationspfaden für jede Schweregrad-Ebene
  - [ ] Dokumentation der Reaktionsverfahren für verschiedene Warnungstypen

- [ ] **Technische Implementierung**
  - [ ] Integration von Alertmanager mit Prometheus
  - [ ] Konfiguration von Warnungsregeln in Prometheus
  - [ ] Einrichtung von Benachrichtigungskanälen (E-Mail, SMS, Slack, PagerDuty)
  - [ ] Implementierung von Deduplizierung und Gruppierung von Warnungen

- [ ] **Warnungsregeln erstellen**
  - [ ] Systemressourcen-Warnungen (CPU, Speicher, Festplatte > 80%)
  - [ ] Anwendungsspezifische Warnungen (API-Fehlerrate, Antwortzeit)
  - [ ] Infrastruktur-Warnungen (Node-Ausfall, Netzwerkprobleme)
  - [ ] Geschäftsspezifische Warnungen (Transaktionsvolumen, Auftragsverarbeitung)

- [ ] **Automatische Reaktionen**
  - [ ] Integration mit Runbooks für häufige Probleme
  - [ ] Entwicklung von automatisierten Wiederherstellungsaktionen für bekannte Probleme
  - [ ] Implementierung von präventiven Maßnahmen basierend auf Trendanalyse

### 3. Container-Sicherheitsoptimierung

**Ziel:** Verbesserung der Sicherheit der Container-Infrastruktur durch Best Practices und Sicherheitsscans.

#### Aufgaben:

- [ ] **Sicherheitsanalyse**
  - [ ] Durchführung einer Sicherheitsbewertung der aktuellen Container-Infrastruktur
  - [ ] Identifizierung von Schwachstellen und Risiken
  - [ ] Priorisierung von Sicherheitsverbesserungen

- [ ] **Container-Image-Sicherheit**
  - [ ] Implementierung von Image-Scanning in der CI/CD-Pipeline
  - [ ] Einrichtung von Richtlinien für minimale Base-Images
  - [ ] Entfernung unnötiger Pakete und Abhängigkeiten
  - [ ] Regelmäßige Aktualisierung der Base-Images

- [ ] **Laufzeit-Sicherheit**
  - [ ] Implementierung von Container-Laufzeit-Sicherheitslösungen
  - [ ] Konfiguration von Seccomp- und AppArmor-Profilen
  - [ ] Einrichtung von Netzwerksegmentierung und Pod-Sicherheitsrichtlinien
  - [ ] Überwachung und Protokollierung von Container-Aktivitäten

- [ ] **Secrets-Management**
  - [ ] Implementierung einer sicheren Secrets-Management-Lösung
  - [ ] Rotation von Secrets und Zugangsdaten
  - [ ] Verschlüsselung von ruhenden und übertragenen Daten
  - [ ] Überprüfung und Beschränkung der Zugriffsrechte

- [ ] **Compliance und Dokumentation**
  - [ ] Erstellung von Sicherheitsrichtlinien für Container
  - [ ] Dokumentation der Sicherheitsmaßnahmen und -kontrollen
  - [ ] Durchführung regelmäßiger Sicherheitsaudits
  - [ ] Entwicklung von Incident-Response-Plänen

### 4. Multi-Stage-Builds Implementierung

**Ziel:** Optimierung der Docker-Images durch Multi-Stage-Builds für kleinere und sicherere Images.

#### Aufgaben:

- [ ] **Analyse der aktuellen Dockerfiles**
  - [ ] Größen- und Schichtenanalyse der aktuellen Images
  - [ ] Identifizierung von Optimierungsmöglichkeiten
  - [ ] Benchmark der Build- und Deploymentzeiten

- [ ] **Implementierung von Multi-Stage-Builds**
  - [ ] Umschreiben des API-Server-Dockerfiles mit Multi-Stage-Ansatz
  - [ ] Optimierung der Celery-Worker und Flower-Dockerfiles
  - [ ] Anpassung der Redis- und Prometheus-Container

- [ ] **Evaluierung und Optimierung**
  - [ ] Vergleich der Image-Größen vor und nach der Optimierung
  - [ ] Messung der Startup-Zeiten und Leistung
  - [ ] Identifizierung weiterer Optimierungsmöglichkeiten

- [ ] **CI/CD-Integration**
  - [ ] Anpassung der Build-Pipeline für Multi-Stage-Builds
  - [ ] Implementierung von Build-Caching für schnellere Builds
  - [ ] Automatisierte Tests der optimierten Images

### 5. Backup-Automatisierung

**Ziel:** Entwicklung automatisierter Backup- und Wiederherstellungsprozesse für persistente Daten.

#### Aufgaben:

- [ ] **Backup-Strategie entwickeln**
  - [ ] Identifizierung kritischer Daten, die gesichert werden müssen
  - [ ] Definition von Backup-Häufigkeit und Aufbewahrungsrichtlinien
  - [ ] Festlegung von RTO (Recovery Time Objective) und RPO (Recovery Point Objective)

- [ ] **Backup-Infrastruktur**
  - [ ] Auswahl der Backup-Technologie (Velero für Kubernetes, native Tools)
  - [ ] Einrichtung von Backup-Speicher (S3-kompatibel, NFS, etc.)
  - [ ] Konfiguration der Netzwerkverbindungen für Backups

- [ ] **Implementierung**
  - [ ] Entwicklung von Backup-Skripten und -Jobs
  - [ ] Automatisierung von Redis-Snapshots und WAL-Backups
  - [ ] Implementierung von Prometheus-Daten-Backups
  - [ ] Sicherung von Konfigurationsdaten und Secrets

- [ ] **Wiederherstellungsverfahren**
  - [ ] Dokumentation der Wiederherstellungsverfahren
  - [ ] Automatisierung von Wiederherstellungsprozessen
  - [ ] Durchführung regelmäßiger Wiederherstellungstests
  - [ ] Training des Teams in Wiederherstellungsprozeduren

- [ ] **Überwachung und Berichterstellung**
  - [ ] Implementierung von Backup-Erfolgs-/Fehlerbenachrichtigungen
  - [ ] Entwicklung von Backup-Prüfverfahren
  - [ ] Erstellung regelmäßiger Backup-Berichte
  - [ ] Integration mit dem Monitoring-System

## Kubernetes-Migration

### Aktuelle Aufgaben (Hohe Priorität)
- [x] **NetworkPolicy für Document-Service implementieren**
  - Relevante Ports definieren
  - Ingress-Regeln für andere Services festlegen
  - Egress-Regeln für externe Dienste festlegen
  
- [x] **HorizontalPodAutoscaler-Optimierung**
  - CPU- und Memory-Schwellwerte für alle Services anpassen
  - Stabilisierungsfenster optimieren
  - Tests unter Last durchführen
  
- [x] **Integrationstests erweitern**
  - Erweiterte Tests für Document-Service hinzufügen
  - End-to-End-Tests für kompletten Workflow implementieren
  - Automatisierte CI/CD-Pipeline für Tests konfigurieren

### Kubernetes Nächste Schritte (Mittlere Priorität)
- [ ] **Gesundheitsüberwachung verbessern**
  - Readiness- und Liveness-Probes für alle Services optimieren
  - Prometheus-Metriken für alle Services implementieren
  - Grafana-Dashboard für Kubernetes-Monitoring erstellen
  
- [ ] **Secret-Management verbessern**
  - Implementierung von HashiCorp Vault für Secret-Management
  - Rotation von Secrets automatisieren
  - Zugriffsrechte für Secrets begrenzen
  
- [ ] **Ressourcenlimits überprüfen und optimieren**
  - CPU- und Memory-Anforderungen basierend auf realen Lastprofilen anpassen
  - Ressourcen-Quotas für den Namespace definieren
  - QoS-Klassen für kritische Services festlegen

## Zukünftige Aufgaben (Niedrige Priorität)

### 6. Autonomes System für externe Erreichbarkeit des ERP-Systems

**Ziel:** Entwicklung eines vollständig autonomen Systems zur dynamischen Erreichbarkeit des ERP-Frontends über die Domain `n8n-services.com`.

> **HINWEIS:** Diese Aufgabe wurde nach sorgfältiger Analyse für eine spätere Implementierung priorisiert. Sie sollte erst nach Abschluss und Validierung des Connection Monitors angegangen werden.

#### Teilaufgaben:

- [ ] **Dynamic DNS mit Cloudflare**
  - [ ] Entwicklung eines Skripts zur automatischen Aktualisierung der öffentlichen IP-Adresse
  - [ ] Integration mit der Cloudflare API für automatische A-Record-Updates
  - [ ] Implementierung eines Cron-Jobs oder Docker-Services für kontinuierliche Überwachung
  - [ ] Protokollierungs- und Benachrichtigungssystem für IP-Änderungen

- [ ] **Reverse-Proxy mit Traefik**
  - [ ] Installation und Konfiguration von Traefik als Reverse-Proxy
  - [ ] Einrichtung von Routen für verschiedene Dienste (`/frontend`, `/api`, `/qs`)
  - [ ] Konfiguration von Traefik mit Label- oder Datei-Provider
  - [ ] Integration mit dem Kubernetes-Cluster
  - [ ] Implementierung von Rate-Limiting und Circuit-Breaking

- [ ] **SSL/HTTPS mit Let's Encrypt**
  - [ ] Konfiguration von Traefik zur Verwendung von Let's Encrypt
  - [ ] Implementierung der DNS-Challenge über Cloudflare
  - [ ] Automatisierung der Zertifikatserneuerung
  - [ ] Sichere Speicherung der Zertifikate
  - [ ] SSL-Konfiguration gemäß Best Practices (TLS 1.3, starke Cipher, HSTS)

- [ ] **Sicherheitskonzept**
  - [ ] Durchführung einer Sicherheitsanalyse für öffentlich zugängliche Dienste
  - [ ] Implementierung von WAF-Regeln (Web Application Firewall)
  - [ ] Konfiguration von Zugriffsbeschränkungen und Authentifizierung
  - [ ] Implementierung von IP-basierten Zugriffskontrollen
  - [ ] Sichere Handhabung von API-Schlüsseln und Zugangsdaten

- [ ] **Dokumentation und Monitoring**
  - [ ] Erstellung einer umfassenden Dokumentation zur Systemarchitektur
  - [ ] Implementierung von Monitoring für externe Erreichbarkeit
  - [ ] Entwicklung von Alarmen für Verbindungs- und Zertifikatsprobleme
  - [ ] Dokumentation der Wiederherstellungsverfahren
  - [ ] Erstellung von Benutzerhandbüchern für den externen Zugriff

#### Infrastrukturkomponenten:

```
/infra/
├── docker-compose.yml      # Container-Orchestrierung
├── .env                    # Umgebungsvariablen (sensible Daten)
├── traefik.yml             # Traefik-Hauptkonfiguration
├── dynamic.yml             # Dynamische Traefik-Konfiguration
├── ddns/
│   └── cloudflare-ddns.py  # Script für DDNS-Updates
└── acme.json               # SSL-Zertifikate (persistent)
```

#### Voraussetzungen vor der Implementierung:

1. Abschluss und Validierung des Connection Monitors
2. Umfassende Sicherheitsbewertung der zu exponierenden Dienste
3. DNS-Konfiguration und Zugriff auf Cloudflare-API
4. Firewall-Konfiguration für eingehenden Verkehr

## Microservice-Implementierung

### Auth-Service Aufgaben
- [ ] **JWT-Token-Validierung optimieren**
  - Token-Lebensdauer und Erneuerung konfigurieren
  - Blacklisting für abgemeldete Benutzer implementieren
  - Cache für Token-Validierung einrichten
  
- [ ] **Rollenbasierte Zugriffssteuerung erweitern**
  - Feinkörnigere Rollenstrukturen implementieren
  - Hierarchische Rollen unterstützen
  - API für Rollenverwaltung erstellen
  
- [ ] **Passwort-Richtlinien implementieren**
  - Konfigurierbare Passwort-Komplexitätsanforderungen
  - Historie für Passwörter speichern
  - Passwort-Ablauf und Erneuerung implementieren

### Reporting-Service Aufgaben
- [ ] **Berichts-Templateengine erweitern**
  - Unterstützung für benutzerdefinierte Templates
  - Dynamische Diagramm-Generierung
  - Export in verschiedene Formate (PDF, XLSX, CSV)
  
- [ ] **Datenintegration verbessern**
  - Datenzugriff über GraphQL implementieren
  - Caching-Strategie für häufige Abfragen
  - Aggregation und Filterung auf Server-Seite
  
- [ ] **Zeitbasierte Berichtserstellung implementieren**
  - Geplante Berichte über Cron-Jobs
  - E-Mail-Versand von Berichten
  - Speicherung und Archivierung von Berichten

### Document-Service Aufgaben
- [ ] **Versionierung von Dokumenten implementieren**
  - Versionsverwaltung für alle Dokumente
  - Diff-Ansicht für Textdokumente
  - Wiederherstellung früherer Versionen
  
- [ ] **Dokumenten-Metadaten erweitern**
  - Volltextsuche für Dokumente implementieren
  - Automatische Metadaten-Extraktion
  - Benutzerdefinierbares Tagging-System
  
- [ ] **Dokumentenfreigabe und Berechtigungen**
  - Feinkörnige Berechtigungen pro Dokument
  - Freigabe-Links mit Ablaufdatum
  - Audit-Trail für Dokumentenzugriffe

### Notification-Service Aufgaben
- [ ] **Push-Benachrichtigungen implementieren**
  - FCM-Integration für mobile Geräte
  - Web-Push-Benachrichtigungen für Browser
  - Benutzereinstellungen für Benachrichtigungskanäle
  
- [ ] **Benachrichtigungsvorlagen erweitern**
  - Template-Engine für verschiedene Kanäle (E-Mail, Push, In-App)
  - Lokalisierung von Benachrichtigungen
  - Personalisierung von Benachrichtigungen
  
- [ ] **Benachrichtigungsaggregation implementieren**
  - Ähnliche Benachrichtigungen zusammenfassen
  - Zeitliche Gruppierung von Benachrichtigungen
  - Priorisierung von Benachrichtigungen

## Frontend-Integration

### UI-Komponenten für Microservices
- [ ] **Auth-Service UI**
  - Login- und Registrierungsformulare
  - Profilverwaltung und Passwortänderung
  - Zweifaktor-Authentifizierung
  
- [ ] **Reporting-Service UI**
  - Dashboard für verfügbare Berichte
  - Berichtsparameter-Konfiguration
  - Interaktive Diagramme und Tabellen
  
- [ ] **Document-Service UI**
  - Dokumentenexplorer mit Vorschau
  - Upload- und Downloadfunktionen
  - Versionsverwaltung und Vergleichsansicht
  
- [ ] **Notification-Service UI**
  - Benachrichtigungszentrum
  - Einstellungen für Benachrichtigungskanäle
  - Benachrichtigungsarchiv
  
### Allgemeine Frontend-Aufgaben
- [ ] **Error-Handling und Offline-Modus**
  - Verbesserte Fehlerbehandlung für API-Aufrufe
  - Offline-Funktionalität für kritische Funktionen
  - Automatische Wiederverbindung bei Netzwerkproblemen
  
- [ ] **Performance-Optimierung**
  - Code-Splitting und Lazy Loading
  - Caching-Strategien für API-Anfragen
  - Bundle-Größenoptimierung

## CI/CD-Pipeline

- [ ] **GitHub Actions für Kubernetes-Deployment einrichten**
  - Automatische Tests vor dem Deployment
  - Deployment in Staging- und Produktionsumgebung
  - Rollback-Mechanismus bei fehlgeschlagenem Deployment
  
- [ ] **Image-Build-Prozess optimieren**
  - Multi-Stage-Builds für kleinere Images
  - Caching von Build-Artefakten
  - Sicherheitsscans für Container-Images
  
- [ ] **Monitoring und Alarme einrichten**
  - Prometheus-Alarme für kritische Metriken
  - Slack/E-Mail-Benachrichtigungen bei Problemen
  - Automatische Skalierung basierend auf Metriken

## Aktuelle Aufgaben - Frontend-Implementierung

### TODO: VALEO Frontend Funktionalitäten
- [x] **Detaillierte Modulseiten**
  - [x] Artikelverwaltung mit Formular für Artikeldetails
  - [ ] Kundenverwaltung mit Adressfeldern und Kontaktdaten
  - [ ] Rechnungsformular mit Positionserfassung
  - [ ] Lagerverwaltung mit Bestandsanzeige
  - [ ] Priorität: HOCH

- [ ] **Such- und Filterfunktion**
  - [ ] Globale Suche über alle Module
  - [ ] Erweiterte Filter mit Speicherfunktion
  - [ ] Autovervollständigung für Suchfelder
  - [ ] Priorität: MITTEL

- [ ] **Benutzerauthentifizierung**
  - [ ] Login/Logout-Funktionalität
  - [ ] Benutzerprofile mit Einstellungen
  - [ ] Rollenbasierte Berechtigungen
  - [ ] Priorität: HOCH

- [ ] **Backend-Integration**
  - [ ] API-Verbindungen zu Datenservices
  - [ ] Formularvalidierung
  - [ ] Fehlerbehandlung bei API-Aufrufen
  - [ ] Priorität: HOCH

- [ ] **Benachrichtigungssystem**
  - [ ] Echtzeit-Benachrichtigungen
  - [ ] Aufgabenliste/To-Dos
  - [ ] Statusaktualisierungen
  - [ ] Priorität: NIEDRIG

- [ ] **Dashboard-Personalisierung**
  - [ ] Anpassbare Dashboard-Ansicht
  - [ ] Favoriten-Funktion
  - [ ] Widget-Konfiguration
  - [ ] Priorität: NIEDRIG

- [ ] **Reporting und Visualisierung**
  - [ ] Diagramme für Datenanalyse
  - [ ] Export-Funktionen (PDF, Excel)
  - [ ] Anpassbare Berichtsvorlagen
  - [ ] Priorität: MITTEL

- [ ] **Offline-Funktionalität**
  - [ ] Progressive Web App-Setup
  - [ ] Offline-Datenspeicherung
  - [ ] Service Worker Implementierung
  - [ ] Priorität: NIEDRIG

- [ ] **Hilfe- und Dokumentationssystem**
  - [ ] Kontextsensitive Hilfe
  - [ ] Onboarding-Tutorials
  - [ ] Tastenkombinationen
  - [ ] Priorität: NIEDRIG

- [ ] **Mehrsprachigkeit**
  - [ ] i18n-Framework einrichten
  - [ ] Deutsche und englische Übersetzungen
  - [ ] Sprachumschalter in UI
  - [ ] Priorität: MITTEL

- [ ] **KI-Assistenten Integration**
  - [ ] Kontextbezogene Hilfestellungen
  - [ ] Automatisierte Arbeitsabläufe
  - [ ] Natürliche Sprachverarbeitung
  - [ ] Priorität: MITTEL

- [ ] **Mobile Optimierung**
  - [ ] Responsive Design für kleine Bildschirme
  - [ ] Touch-freundliche UI-Elemente
  - [ ] Mobile-spezifische Workflows
  - [ ] Priorität: MITTEL

- [ ] **Theme-Anpassungen**
  - [ ] Dunkelmodus
  - [ ] Barrierefreiheit-Optionen
  - [ ] Benutzerdefinierte Themes
  - [ ] Priorität: NIEDRIG

- [ ] **Feedback-System**
  - [ ] Ladeanzeigen
  - [ ] Erfolgs-/Fehlermeldungen
  - [ ] Prozessstatusanzeigen
  - [ ] Priorität: HOCH

- [ ] **Kollaborative Funktionen**
  - [ ] Kommentare zu Datensätzen
  - [ ] Aufgabenzuweisung
  - [ ] Aktivitätsprotokolle
  - [ ] Priorität: NIEDRIG

## Implementierungsplan

### Phase 1: Grundlegende Funktionalität
1. Detaillierte Modulseiten für Kernfunktionen (Artikel, Kunden)
2. Benutzerauthentifizierung und Grundgerüst
3. Backend-Integration für Datenpersistenz
4. Feedback-System für Benutzerinteraktionen

### Phase 2: Erweiterte Funktionalität
1. Such- und Filterfunktion
2. Reporting und Visualisierung
3. Mehrsprachigkeit
4. KI-Assistenten Integration

### Phase 3: Optimierung und Erweiterung
1. Mobile Optimierung
2. Dashboard-Personalisierung
3. Benachrichtigungssystem
4. Theme-Anpassungen

### Phase 4: Zusätzliche Funktionen
1. Offline-Funktionalität
2. Hilfe- und Dokumentationssystem
3. Kollaborative Funktionen

## Aktuelle Fokus-Aufgabe
**Implementierung der Artikelverwaltung**
- [x] Formular für Artikeldetails erstellen
- [x] Tabellenansicht für Artikelliste implementieren
- [x] Filter- und Sortierfunktionen einbauen
- [x] Mit Backend-API verbinden (simuliert mit Dummy-Daten)

**Nächste Aufgabe: Kundenverwaltung**
- [ ] Kundenliste mit Suchfunktion erstellen
- [ ] Kundendetails-Formular implementieren
- [ ] Adressen und Kontaktdaten verwalten
- [ ] Kundenkategorien einrichten

## Frontend-Design Finalisierung

- [x] Design des Dashboard vereinheitlichen
- [x] Chat-Sidebar implementieren
- [x] Benutzer- und Benachrichtigungssystem hinzufügen
- [x] Finales Design speichern und archivieren
- [x] Dateien im VALEO-final-design Ordner zusammenfassen
- [x] Nicht mehr benötigte Frontend-Dateien bereinigen
- [x] Kubernetes-Manifeste aktualisieren und bereinigen
- [ ] Backend-Routen integrieren
- [ ] Unterseiten entwickeln

## Nächste Schritte

- Integration des finalen Designs mit den Backend-Services
- Implementierung der Funktionalität für die Belegfolge-Prozesse
- Verbindung zur Datenbank für dynamische Inhalte
- Entwicklung der modulspezifischen Unterseiten
- Implementierung der Authentifizierung und Benutzerverwaltung

# Abgeschlossene Aufgaben
