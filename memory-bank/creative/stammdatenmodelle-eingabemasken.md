# Stammdatenmodelle und Eingabemasken für das AI-gestützte ERP-System

## Übersicht

Die folgende Dokumentation beschreibt die Modelle zur Stammdatenpflege und Eingabemasken für unser AI-gestütztes ERP-System. Basierend auf der Analyse etablierter Open-Source-ERP-Systeme (ERPNext, OFBiz, Dolibarr, iDempiere, Metasfresh und Odoo) wurden die besten Praktiken zusammengeführt und für unsere spezifischen Anforderungen optimiert.

## Grundprinzipien der Stammdatenpflege

Aus der Analyse der Open-Source-ERP-Systeme haben wir folgende Kernprinzipien abgeleitet:

1. **Konsistentes Layout** - Alle Eingabemasken folgen einem einheitlichen Gestaltungsprinzip
2. **Progressive Disclosure** - Anzeige nur der aktuell relevanten Informationen
3. **Kontextuelle Hilfe** - Integrierte Hilfestellungen direkt in der Eingabemaske
4. **Validierung in Echtzeit** - Sofortige Prüfung der Eingaben auf Gültigkeit
5. **AI-Unterstützung** - Intelligente Vorschläge und Autovervollständigung
6. **Flexibles Feldmanagement** - Anpassbare Pflichtfelder und optionale Felder

## Stammdatenmodelle und Eingabemasken

### 1. Partnerstammdaten

Basierend auf dem Konzept von Odoo und ERPNext verwenden wir ein einheitliches Partnermodell mit Spezialisierungen:

#### Basismodell: Partner

```
Partner
├── ID (PK)
├── Typ [Kunde, Lieferant, Mitarbeiter, Sonstiger]
├── Name
├── Firmenname
├── Rechtsform
├── Steuernummer/USt-ID
├── Sprache
├── Währung
├── Zahlungsbedingungen
├── Kreditlimit
├── Website
├── Notizen
├── Tags [mehrere möglich]
├── Erstellt am
├── Erstellt von
├── Geändert am
└── Geändert von
```

#### Eingabemasken-Struktur für Partner

Die Eingabemaske folgt dem Tab-basierten Ansatz von Odoo mit folgenden Reitern:

1. **Allgemein** - Grundlegende Informationen
   - Hauptabschnitt: Name, Typ, Firma, Rechtsform, Steuernummer
   - Abschnitt Kommunikation: Hauptkontakt, Telefon, E-Mail, Website
   - Abschnitt Tags und Kategorien: Branchen, Tags, benutzerdefinierte Kategorien

2. **Adressen** - Mehrere Adressen mit Typisierung
   - Tabellarische Übersicht aller Adressen
   - Schnellerfassung für Standard-Liefer- und Rechnungsadressen
   - Karte zur Visualisierung

3. **Kontakte** - Ansprechpartner
   - Tabellarische Übersicht aller Kontaktpersonen
   - Funktionen und Abteilungen
   - Bevorzugte Kommunikationswege

4. **Verkauf** (bei Kunden)
   - Verkäufer/Betreuer
   - Preisliste
   - Zahlungsbedingungen
   - Lieferbedingungen
   - Kreditlimit und Zahlungsverhalten

5. **Einkauf** (bei Lieferanten)
   - Einkäufer/Betreuer
   - Lieferantenpreisliste
   - Zahlungsbedingungen
   - Lieferzeiten
   - Bewertung und Qualitätskriterien

6. **Finanzen**
   - Bankverbindungen
   - Steuereinstellungen
   - Buchungskonten
   - Zahlungsstatistiken

7. **Dokumente**
   - Verknüpfte Dokumente
   - Verträge
   - Zertifikate

8. **Historie**
   - Aktivitätsprotokoll
   - Kommunikationsverlauf
   - Änderungshistorie

### 2. Artikelstammdaten

Basierend auf dem Konzept von Metasfresh und ERPNext mit Verbesserungen aus Odoo:

#### Basismodell: Artikel

```
Artikel
├── ID (PK)
├── Artikelnummer
├── Name
├── Beschreibung (mehrsprachig)
├── Typ [Physisch, Dienstleistung, Verbrauchsgut]
├── Kategorie_ID (FK)
├── Einheit_ID (FK)
├── Basispreis
├── Währung
├── Steuerkategorie
├── Aktiv [Ja/Nein]
├── Verkäuflich [Ja/Nein]
├── Einkäuflich [Ja/Nein]
├── Lagerfähig [Ja/Nein]
├── Chargenführung [Ja/Nein]
├── Seriennummernführung [Ja/Nein]
├── Mindestbestand
├── Gewicht
├── Volumen
├── Abmessungen (L×B×H)
├── Bild/Bilder
├── Erstellt am
├── Erstellt von
├── Geändert am
└── Geändert von
```

#### Artikelvarianten-Modell

```
Artikelvariante
├── ID (PK)
├── Basis_Artikel_ID (FK)
├── Variantencode
├── Attribut_1_ID (FK)
├── Attribut_1_Wert
├── Attribut_2_ID (FK)
├── Attribut_2_Wert
├── ...
├── Variantenspezifischer_Preis
├── Variantenspezifisches_Bild
├── Aktiv [Ja/Nein]
├── Erstellt am
└── Geändert am
```

#### Eingabemasken-Struktur für Artikel

Die Eingabemaske orientiert sich am Tab-basierten Ansatz mit dynamisch ein-/ausgeblendeten Bereichen je nach Artikeltyp:

1. **Allgemein** - Grundlegende Informationen
   - Hauptabschnitt: Artikelnummer, Name, Beschreibung, Typ, Kategorie
   - Abschnitt Einheiten: Basiseinheit, Verkaufseinheit, Einkaufseinheit
   - Abschnitt Status: Aktiv, Verkäuflich, Einkäuflich, Lagerfähig

2. **Bilder und Medien**
   - Hauptbild
   - Zusätzliche Bilder
   - Dokumente (Datenblätter, Anleitungen)

3. **Varianten** (nur wenn Variantenstruktur aktiviert)
   - Matrixdarstellung der möglichen Varianten
   - Attribut-Auswahloptionen
   - Massenbearbeitung von Varianten

4. **Preise**
   - Basispreis und Währung
   - Preislisten-Übersicht
   - Staffelpreise
   - Kundenspezifische Preise

5. **Lager** (nur wenn lagerfähig)
   - Aktueller Bestand nach Lagerorten
   - Mindest-/Maximalbestand
   - Beschaffungsregeln
   - Chargen-/Seriennummerneinstellungen

6. **Einkauf** (nur wenn einkäuflich)
   - Lieferanten
   - Einkaufspreise
   - Beschaffungszeiten
   - Bestellmengen

7. **Verkauf** (nur wenn verkäuflich)
   - Verkaufsinformationen
   - Webshop-Einstellungen
   - Cross-Selling-Artikel
   - Alternativprodukte

8. **Stücklisten & Gebinde**
   - Stücklistendefinition
   - Gebindedefinition
   - Produktionsregeln

9. **Attribute & Eigenschaften**
   - Technische Eigenschaften
   - Qualitätsmerkmale
   - Benutzerdefinierte Attribute

10. **Historie**
    - Preisänderungen
    - Bestandsänderungen
    - Artikeländerungen

### 3. Lagerstammdaten

Basierend auf dem Lagerkonzept von Odoo und ERPNext:

#### Basismodell: Lager

```
Lager
├── ID (PK)
├── Code
├── Name
├── Typ [Haupt, Transit, Ausschuss, Kunde, Lieferant]
├── Adresse_ID (FK)
├── Verantwortlicher_ID (FK)
├── Aktiv [Ja/Nein]
├── Erstellt am
├── Erstellt von
├── Geändert am
└── Geändert von
```

#### Modell: Lagerort

```
Lagerort
├── ID (PK)
├── Lager_ID (FK)
├── Code
├── Name
├── Eltern_Lagerort_ID (FK, optional)
├── Kapazität
├── Kapazitätseinheit
├── Max. Gewicht
├── Lagerorttyp [Regal, Fach, Zone, Palette]
├── Aktiv [Ja/Nein]
├── Erstellt am
└── Geändert am
```

#### Eingabemasken-Struktur für Lager und Lagerorte

1. **Lager-Hauptmaske**
   - Grunddaten: Code, Name, Typ, Adresse
   - Verantwortlichkeiten
   - Lagerortstruktur (hierarchische Baumansicht)
   - Kapazitätsübersicht

2. **Lagerort-Maske**
   - Grunddaten: Code, Name, übergeordneter Lagerort
   - Position: Gang, Regal, Fach, Koordinaten
   - Kapazitäten und Beschränkungen
   - Belegungsstatus

3. **Lagerübersicht**
   - Grafische Darstellung der Lagerbelegung
   - Heatmap nach Artikelgruppen
   - Kapazitätsauslastung

### 4. Kontenpläne und Finanzdaten

Basierend auf dem Finanzsystem von ERPNext und Odoo:

#### Basismodell: Kontenplan

```
Kontenplan
├── ID (PK)
├── Code
├── Name
├── Land
├── Währung
├── Beschreibung
├── Aktiv [Ja/Nein]
├── Erstellt am
└── Geändert am
```

#### Modell: Konto

```
Konto
├── ID (PK)
├── Kontenplan_ID (FK)
├── Kontonummer
├── Name
├── Beschreibung
├── Kontenart [Aktiva, Passiva, Aufwand, Ertrag, Eigenkapital]
├── Übergeordnetes_Konto_ID (FK, optional)
├── Steuerrelevant [Ja/Nein]
├── Währung
├── Ist_Gruppe [Ja/Nein]
├── Aktiv [Ja/Nein]
├── Erstellt am
└── Geändert am
```

#### Eingabemasken-Struktur für Finanzdaten

1. **Kontenplan-Übersicht**
   - Baumstrukturansicht des Kontenplans
   - Filterung nach Kontenart
   - Saldenanzeige

2. **Konto-Detailmaske**
   - Grunddaten: Kontonummer, Name, Kontenart
   - Steuereinstellungen
   - Buchungsregeln
   - Saldenentwicklung (Grafik)

3. **Währungen und Kurse**
   - Währungsverwaltung
   - Wechselkurse und -historien

### 5. Steuerstammdaten

Basierend auf dem Steuermodell von Odoo:

#### Basismodell: Steuersatz

```
Steuersatz
├── ID (PK)
├── Code
├── Name
├── Beschreibung
├── Prozentsatz
├── Land
├── Steuerart [USt, VSt, Einkommensteuer, etc.]
├── Steuerkonto_ID (FK)
├── Gültig_ab
├── Gültig_bis
├── Aktiv [Ja/Nein]
├── Erstellt am
└── Geändert am
```

#### Eingabemasken-Struktur für Steuerdaten

1. **Steuersatz-Übersicht**
   - Tabellarische Übersicht aller Steuersätze
   - Filtermöglichkeiten nach Land, Typ, Gültigkeit

2. **Steuersatz-Detailmaske**
   - Grunddaten: Code, Name, Prozentsatz
   - Gültigkeitszeitraum
   - Buchungskonten
   - Steuerregeln

## AI-Unterstützung in den Eingabemasken

Basierend auf den fortschrittlichen Assistenzsystemen von Odoo und ERPNext haben wir folgende KI-Funktionen in allen Stammdaten-Eingabemasken implementiert:

1. **Intelligente Feldvorschläge**
   - Automatische Vorschläge basierend auf bereits eingegebenen Informationen
   - Mustererkennung aus vorhandenen Daten

2. **Duplikaterkennung**
   - Echtzeit-Prüfung auf mögliche Dubletten während der Eingabe
   - Ähnlichkeitsanalyse für Namen, Adressen und Identifikationsnummern

3. **Datenqualitätsprüfung**
   - Validierung von Adressen, Steuernummern, Bankverbindungen
   - Formatierungsvorschläge für uneinheitliche Eingaben

4. **Kontextuelle Hilfestellung**
   - Dynamische Hilfestellungen basierend auf der aktuellen Eingabesituation
   - Häufig gestellte Fragen zu spezifischen Feldern

5. **Prozessvorschläge**
   - Empfehlungen für nachfolgende Aktionen nach Anlage eines Stammdatensatzes
   - Checklisten für vollständige Datenpflege

6. **Automatische Klassifikation**
   - Vorschläge für Kategorisierung und Tagging von Partnern und Artikeln
   - Ähnlichkeitsbasierte Gruppierungsvorschläge

## Implementierung und Technologie

Die Eingabemasken werden mit folgenden Technologien umgesetzt:

1. **Frontend**
   - Responsive Design mit Vue.js
   - Komponentenbasierte Architektur für konsistentes Look & Feel
   - Progressive Web App (PWA) Funktionalität für Offline-Nutzung

2. **Backend**
   - REST-API für alle Stammdatenoperationen
   - Validierungslogik serverseitig für maximale Datensicherheit
   - Ereignisgesteuerte Architektur für Echtzeit-Updates

3. **KI-Integration**
   - Vortrainierte Modelle für Textklassifikation und Ähnlichkeitsanalyse
   - Maschinelles Lernen für kontinuierliche Verbesserung der Vorschläge
   - Natürliche Sprachverarbeitung für Freitextsuche und -analyse

## Fazit

Die entwickelten Stammdatenmodelle und Eingabemasken kombinieren die besten Ansätze aus den analysierten Open-Source-ERP-Systemen und erweitern diese um KI-gestützte Funktionen. Die Gestaltung folgt durchgängig den Prinzipien der Benutzerfreundlichkeit, Flexibilität und Datenqualität.

Durch die konsequente Trennung von Datenmodell und Benutzeroberfläche ist die Lösung zukunftssicher und kann leicht an spezifische Anforderungen angepasst werden. Die AI-Komponenten sorgen für eine kontinuierliche Verbesserung der Benutzerführung und Datenqualität im laufenden Betrieb. 