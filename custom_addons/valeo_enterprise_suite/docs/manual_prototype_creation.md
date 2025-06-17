# Manuelle Erstellung von Modul-Prototypen in Odoo Studio

Diese Anleitung beschreibt die Schritte zur manuellen Erstellung von Modul-Prototypen für die VALEO Enterprise Suite mit Odoo Studio.

## Voraussetzungen

- Odoo-Installation mit aktiviertem Studio-Modus
- Zugriff auf ein Odoo-Konto mit Administratorrechten

## Allgemeine Schritte für alle Module

1. Melden Sie sich bei Odoo an (http://localhost:8069 oder Ihre Odoo-URL)
2. Geben Sie Ihren Benutzernamen und Passwort ein (Standard: admin/admin)
3. Klicken Sie auf "Anmelden"
4. Aktivieren Sie den Studio-Modus durch Klicken auf das Studio-Symbol in der Navigationsleiste (Werkzeug-Symbol)

## 1. Dashboard-Modul erstellen

### Schritt 1: Neues Modul erstellen
1. Klicken Sie im Studio-Modus auf "Neue App"
2. Geben Sie folgende Informationen ein:
   - App-Name: Dashboard
   - Technischer Name: valeo_dashboard
   - Icon: fa-tachometer-alt (oder wählen Sie ein passendes Dashboard-Icon)
3. Klicken Sie auf "Erstellen"

### Schritt 2: Modell erstellen
1. Klicken Sie auf "Neues Modell"
2. Geben Sie folgende Informationen ein:
   - Modellname: Dashboard
   - Technischer Name: valeo.dashboard
3. Klicken Sie auf "Bestätigen"

### Schritt 3: Felder hinzufügen
1. Fügen Sie folgende Felder hinzu:
   - Name (Typ: Text, Erforderlich: Ja)
   - Beschreibung (Typ: Text)
   - Typ (Typ: Auswahl, Optionen: KPI, Chart, List, Filter)
   - Aktiv (Typ: Boolean, Standard: Ja)
   - Benutzer (Typ: Many2one, Relation: res.users)
   - Erstellt am (Typ: Datum und Uhrzeit)
   - Konfiguration (Typ: JSON)

### Schritt 4: Ansichten erstellen
1. Erstellen Sie eine Formularansicht:
   - Fügen Sie alle Felder in logischen Gruppen hinzu
   - Organisieren Sie die Felder in Registerkarten (Allgemein, Konfiguration)
2. Erstellen Sie eine Listenansicht:
   - Fügen Sie die wichtigsten Felder hinzu (Name, Typ, Aktiv, Benutzer)
3. Erstellen Sie eine Kanban-Ansicht:
   - Konfigurieren Sie die Karten mit Name und Typ
   - Fügen Sie Farben basierend auf dem Typ hinzu

### Schritt 5: Menüeintrag erstellen
1. Klicken Sie auf "Neuer Menüpunkt"
2. Geben Sie folgende Informationen ein:
   - Name: Dashboards
   - Übergeordneter Menüpunkt: (leer für Hauptmenü)
   - Aktion: Öffnen Sie die Listenansicht des valeo.dashboard-Modells
3. Klicken Sie auf "Speichern"

### Schritt 6: App auf der Startseite verfügbar machen
1. Stellen Sie sicher, dass die App als Hauptmenüpunkt definiert ist
2. Überprüfen Sie, ob das Icon korrekt angezeigt wird
3. Speichern Sie alle Änderungen

## 2. Dokumentenmanagement-Modul erstellen

### Schritt 1: Neues Modul erstellen
1. Klicken Sie im Studio-Modus auf "Neue App"
2. Geben Sie folgende Informationen ein:
   - App-Name: Dokumentenmanagement
   - Technischer Name: valeo_document_management
   - Icon: fa-file-alt (oder wählen Sie ein passendes Dokument-Icon)
3. Klicken Sie auf "Erstellen"

### Schritt 2: Modell erstellen
1. Klicken Sie auf "Neues Modell"
2. Geben Sie folgende Informationen ein:
   - Modellname: Dokument
   - Technischer Name: valeo.document
3. Klicken Sie auf "Bestätigen"

### Schritt 3: Felder hinzufügen
1. Fügen Sie folgende Felder hinzu:
   - Name (Typ: Text, Erforderlich: Ja)
   - Beschreibung (Typ: Text)
   - Datei (Typ: Binär, Erforderlich: Ja)
   - Dateityp (Typ: Auswahl, Optionen: PDF, Word, Excel, Bild, Sonstiges)
   - Kategorie (Typ: Many2one, Relation: valeo.document.category)
   - Tags (Typ: Many2many, Relation: valeo.document.tag)
   - Version (Typ: Integer)
   - Erstellt von (Typ: Many2one, Relation: res.users)
   - Erstellt am (Typ: Datum und Uhrzeit)
   - Zuletzt geändert am (Typ: Datum und Uhrzeit)

### Schritt 4: Zusätzliche Modelle erstellen
1. Erstellen Sie ein Modell für Kategorien:
   - Modellname: Dokument-Kategorie
   - Technischer Name: valeo.document.category
   - Felder: Name, Beschreibung, Übergeordnete Kategorie (Many2one zu sich selbst)
2. Erstellen Sie ein Modell für Tags:
   - Modellname: Dokument-Tag
   - Technischer Name: valeo.document.tag
   - Felder: Name, Farbe

### Schritt 5: Ansichten erstellen
1. Erstellen Sie eine Formularansicht für Dokumente:
   - Organisieren Sie die Felder in logischen Gruppen
   - Fügen Sie eine Vorschau für die Datei hinzu
2. Erstellen Sie eine Listenansicht:
   - Zeigen Sie Name, Dateityp, Kategorie, Version und Erstellungsdatum an
3. Erstellen Sie eine Kanban-Ansicht:
   - Gruppieren Sie nach Kategorie
   - Zeigen Sie Name, Dateityp und Tags an
4. Erstellen Sie eine Suchansicht:
   - Ermöglichen Sie die Suche nach Name, Beschreibung, Kategorie und Tags
   - Fügen Sie Filter für Dateityp und Erstellungsdatum hinzu

### Schritt 6: Menüeinträge erstellen
1. Erstellen Sie einen Hauptmenüeintrag für Dokumente
2. Erstellen Sie Untermenüs für:
   - Alle Dokumente
   - Kategorien
   - Tags

### Schritt 7: App auf der Startseite verfügbar machen
1. Stellen Sie sicher, dass die App als Hauptmenüpunkt definiert ist
2. Überprüfen Sie, ob das Icon korrekt angezeigt wird
3. Speichern Sie alle Änderungen

## 3. E-Signatur-Modul erstellen

### Schritt 1: Neues Modul erstellen
1. Klicken Sie im Studio-Modus auf "Neue App"
2. Geben Sie folgende Informationen ein:
   - App-Name: E-Signatur
   - Technischer Name: valeo_esignature
   - Icon: fa-signature (oder wählen Sie ein passendes Signatur-Icon)
3. Klicken Sie auf "Erstellen"

### Schritt 2: Modell erstellen
1. Klicken Sie auf "Neues Modell"
2. Geben Sie folgende Informationen ein:
   - Modellname: Signatur
   - Technischer Name: valeo.signature
3. Klicken Sie auf "Bestätigen"

### Schritt 3: Felder hinzufügen
1. Fügen Sie folgende Felder hinzu:
   - Name (Typ: Text, Erforderlich: Ja)
   - Dokument (Typ: Many2one, Relation: valeo.document)
   - Unterzeichner (Typ: Many2one, Relation: res.partner)
   - Status (Typ: Auswahl, Optionen: Entwurf, Gesendet, Unterzeichnet, Abgelehnt)
   - Signatur (Typ: Binär)
   - Signiert am (Typ: Datum und Uhrzeit)
   - Gültig bis (Typ: Datum)
   - Notizen (Typ: Text)

### Schritt 4: Ansichten erstellen
1. Erstellen Sie eine Formularansicht:
   - Organisieren Sie die Felder in logischen Gruppen
   - Fügen Sie Statusleisten hinzu
   - Fügen Sie Buttons für Aktionen hinzu (Senden, Unterzeichnen, Ablehnen)
2. Erstellen Sie eine Listenansicht:
   - Zeigen Sie Name, Dokument, Unterzeichner, Status und Signiert am an
3. Erstellen Sie eine Kanban-Ansicht:
   - Gruppieren Sie nach Status
   - Zeigen Sie Name, Dokument und Unterzeichner an
   - Verwenden Sie Farben für verschiedene Status

### Schritt 5: Menüeintrag erstellen
1. Klicken Sie auf "Neuer Menüpunkt"
2. Geben Sie folgende Informationen ein:
   - Name: E-Signaturen
   - Übergeordneter Menüpunkt: (leer für Hauptmenü)
   - Aktion: Öffnen Sie die Listenansicht des valeo.signature-Modells
3. Klicken Sie auf "Speichern"

### Schritt 6: App auf der Startseite verfügbar machen
1. Stellen Sie sicher, dass die App als Hauptmenüpunkt definiert ist
2. Überprüfen Sie, ob das Icon korrekt angezeigt wird
3. Speichern Sie alle Änderungen

## 4. Analytik-Modul erstellen

### Schritt 1: Neues Modul erstellen
1. Klicken Sie im Studio-Modus auf "Neue App"
2. Geben Sie folgende Informationen ein:
   - App-Name: Analytik
   - Technischer Name: valeo_analytics
   - Icon: fa-chart-bar (oder wählen Sie ein passendes Analytik-Icon)
3. Klicken Sie auf "Erstellen"

### Schritt 2: Modell erstellen
1. Klicken Sie auf "Neues Modell"
2. Geben Sie folgende Informationen ein:
   - Modellname: Analytik
   - Technischer Name: valeo.analytics
3. Klicken Sie auf "Bestätigen"

### Schritt 3: Felder hinzufügen
1. Fügen Sie folgende Felder hinzu:
   - Name (Typ: Text, Erforderlich: Ja)
   - Beschreibung (Typ: Text)
   - Typ (Typ: Auswahl, Optionen: KPI, Bericht, Vorhersage, Anomalie)
   - Datenquelle (Typ: Many2one, Relation: valeo.analytics.datasource)
   - Parameter (Typ: JSON)
   - Ergebnis (Typ: JSON)
   - Erstellt am (Typ: Datum und Uhrzeit)
   - Zuletzt aktualisiert am (Typ: Datum und Uhrzeit)
   - Benutzer (Typ: Many2one, Relation: res.users)
   - KI-Modell (Typ: Many2one, Relation: valeo.analytics.model)

### Schritt 4: Zusätzliche Modelle erstellen
1. Erstellen Sie ein Modell für Datenquellen:
   - Modellname: Datenquelle
   - Technischer Name: valeo.analytics.datasource
   - Felder: Name, Typ (Datenbank, API, Datei), Konfiguration (JSON)
2. Erstellen Sie ein Modell für KI-Modelle:
   - Modellname: KI-Modell
   - Technischer Name: valeo.analytics.model
   - Felder: Name, Typ (OpenAI, Eigenes Modell), Konfiguration (JSON)

### Schritt 5: Ansichten erstellen
1. Erstellen Sie eine Formularansicht:
   - Organisieren Sie die Felder in logischen Gruppen
   - Fügen Sie eine Visualisierung für die Ergebnisse hinzu
2. Erstellen Sie eine Listenansicht:
   - Zeigen Sie Name, Typ, Datenquelle und Zuletzt aktualisiert am an
3. Erstellen Sie eine Kanban-Ansicht:
   - Gruppieren Sie nach Typ
   - Zeigen Sie Name und Beschreibung an
4. Erstellen Sie eine Dashboard-Ansicht:
   - Kombinieren Sie mehrere Analytiken in einem Dashboard
   - Fügen Sie Filter und Auswahlmöglichkeiten hinzu

### Schritt 6: Menüeinträge erstellen
1. Erstellen Sie einen Hauptmenüeintrag für Analytik
2. Erstellen Sie Untermenüs für:
   - Alle Analytiken
   - Datenquellen
   - KI-Modelle
   - Dashboards

### Schritt 7: App auf der Startseite verfügbar machen
1. Stellen Sie sicher, dass die App als Hauptmenüpunkt definiert ist
2. Überprüfen Sie, ob das Icon korrekt angezeigt wird
3. Speichern Sie alle Änderungen

## Exportieren der Prototypen

Nach der Erstellung der Prototypen können Sie den generierten Code exportieren:

1. Öffnen Sie den Prototyp in Odoo Studio
2. Klicken Sie auf das Menü mit den drei Punkten (⋮) in der oberen rechten Ecke
3. Wählen Sie "Exportieren"
4. Speichern Sie die generierte XML-Datei
5. Integrieren Sie den XML-Code in Ihre eigenen Module

## Tipps und Tricks

### Felder und Relationen
- Verwenden Sie aussagekräftige Namen für Felder und Modelle
- Definieren Sie sinnvolle Standardwerte
- Verwenden Sie die richtigen Feldtypen für Ihre Daten
- Achten Sie auf die korrekte Definition von Relationen

### Ansichten
- Gestalten Sie Ihre Ansichten benutzerfreundlich
- Gruppieren Sie zusammengehörige Felder
- Verwenden Sie Registerkarten für komplexe Formulare
- Fügen Sie Hilfetext zu Feldern hinzu

### Menüs und Aktionen
- Strukturieren Sie Ihre Menüs logisch
- Verwenden Sie aussagekräftige Icons
- Definieren Sie sinnvolle Standardaktionen

### Berechtigungen
- Definieren Sie Zugriffsrechte für verschiedene Benutzergruppen
- Beschränken Sie den Zugriff auf sensible Daten
- Testen Sie die Berechtigungen mit verschiedenen Benutzern

## Häufige Probleme und Lösungen

### Problem: Änderungen werden nicht gespeichert
- Lösung: Klicken Sie auf den Speichern-Button in der oberen rechten Ecke
- Lösung: Aktualisieren Sie die Seite und versuchen Sie es erneut

### Problem: Ansicht wird nicht korrekt angezeigt
- Lösung: Überprüfen Sie die Feldnamen und -typen
- Lösung: Löschen Sie die Ansicht und erstellen Sie sie neu

### Problem: Menüeintrag erscheint nicht auf der Startseite
- Lösung: Stellen Sie sicher, dass es sich um einen Hauptmenüpunkt handelt
- Lösung: Überprüfen Sie, ob das Icon korrekt definiert ist
- Lösung: Aktualisieren Sie die Seite und prüfen Sie erneut 