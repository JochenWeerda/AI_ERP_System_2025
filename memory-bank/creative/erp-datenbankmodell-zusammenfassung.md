# Zusammenfassung des ERP-Datenbankmodells

## Überblick

Basierend auf der Analyse etablierter Open-Source-ERP-Systeme (ERPNext, OFBiz, Dolibarr, iDempiere, Metasfresh und Odoo) wurde ein umfassendes, redundanzfreies und konsistentes Datenbankmodell entwickelt. Das Modell folgt dem SERM-Ansatz (Structured Entity Relationship Model) und wurde durch UML-Diagramme visualisiert.

## Kernkomponenten des Datenmodells

### 1. Organisationsstruktur
- Hierarchische Abbildung von Organisation, Standorten und Abteilungen
- Flexibles Berechtigungskonzept über Benutzer und Rollen

### 2. Partner-Management
- Einheitliche Basisentität "Partner" mit Spezialisierungen für Kunden, Lieferanten und Mitarbeiter
- Umfassende Adressverwaltung mit Typisierung (Liefer-/Rechnungsadresse)
- Kommunikationsdaten mit Priorisierung

### 3. Artikel- und Produktstruktur
- Trennung von Produktvorlage und konkreten Produktvarianten
- Hierarchische Kategorisierung mit Mehrfachebenen
- Flexible Attributstruktur für dynamische Erweiterbarkeit
- Unterstützung verschiedener Produkttypen (Physisch, Dienstleistung, Verbrauchsgut)

### 4. Preisgestaltung
- Mehrere Preislisten mit zeitlicher Gültigkeit
- Kundenspezifische und mengenbezogene Preise
- Rabattstrukturen auf verschiedenen Ebenen

### 5. Lagerverwaltung
- Mehrstufige Lagerortstruktur mit Kapazitätsplanung
- Chargen- und Seriennummernverfolgung
- Detaillierte Bewegungshistorie für Audit-Zwecke

### 6. Verkaufs- und Einkaufsprozesse
- Vollständige Prozessketten (Angebot → Auftrag → Lieferung → Rechnung)
- Dokumentenreferenzierung über den gesamten Prozessfluss
- Statusverfolgung in jedem Prozessschritt

### 7. Finanzen
- Doppelte Buchführung mit hierarchischem Kontenplan
- Direkte Integration von Geschäftsprozessen in die Buchhaltung
- Referenzierung von Belegen und Geschäftsvorfällen

## Spezialfokus: Gebinde und Stücklisten

### Stücklisten-Konzept

Das entwickelte Datenmodell bietet eine besonders flexible und leistungsfähige Implementierung von Stücklisten:

```
Stückliste [0..*]
├── ID (PK)
├── Produkt_ID (FK)
├── Name
├── Beschreibung
├── Typ (Normal, Variante, Vorlage, Phantom)
├── Menge
├── Einheit_ID (FK)
├── Ist_Aktiv
├── Ist_Standard
└── Verknüpfungen zu:
    └── Stücklistenpositionen [1..*]

Stücklistenposition [1..*]
├── ID (PK)
├── Stückliste_ID (FK)
├── Position
├── Komponente_ID (FK → Produktvariante)
├── Menge
├── Einheit_ID (FK)
├── Operation_ID (FK, nullable)
└── Ist_Optional
```

**Besonderheiten:**

1. **Typisierung von Stücklisten:**
   - **Normal**: Standard-Stückliste für Fertigung
   - **Variante**: Spezifisch für bestimmte Produktvarianten
   - **Vorlage**: Dient als Basis für andere Stücklisten
   - **Phantom**: Wird nur für die Berechnung verwendet, existiert nicht physisch

2. **Flexible Komponentenstruktur:**
   - Komponenten können sowohl Produktvorlagen als auch spezifische Varianten sein
   - Unterstützung für optionale Komponenten
   - Verknüpfung mit Fertigungsoperationen möglich

3. **Mehrstufige Hierarchie:**
   - Stücklisten können verschachtelt werden (Produkte mit Komponenten, die selbst Stücklisten haben)
   - Unbegrenzte Hierarchieebenen möglich

4. **Mengen- und Einheitenflexibilität:**
   - Jede Komponente kann eine eigene Maßeinheit haben
   - Automatische Umrechnung durch das Einheitensystem

### Gebinde-Konzept

Für die spezifische Anforderung, dass Artikel auch als Gebinde oder Pack aus anderen Artikeln bestehen können, wurde eine spezielle Struktur implementiert:

```
Gebinde [0..*]
├── ID (PK)
├── Produkt_ID (FK)
├── Name
├── Beschreibung
├── Menge
├── Einheit_ID (FK)
├── Höhe
├── Breite
├── Tiefe
├── Gewicht
├── Volumen
├── Ist_Standardgebinde
├── Ist_Verkaufseinheit
├── Barcode
└── Verknüpfungen zu:
    └── Gebindepositionen [1..*]

Gebindeposition [1..*]
├── ID (PK)
├── Gebinde_ID (FK)
├── Produkt_ID (FK)
├── Menge
└── Einheit_ID (FK)
```

**Besonderheiten:**

1. **Trennung von Stücklisten:**
   - Gebinde sind explizit von Stücklisten getrennt, da sie einen anderen Geschäftszweck erfüllen
   - Stücklisten beschreiben die Herstellung, Gebinde die Verpackung/Bündelung

2. **Logistische Attribute:**
   - Spezifische Attribute für Transporteigenschaften (Abmessungen, Gewicht, Volumen)
   - Unterstützung für Barcode-Identifikation

3. **Verkaufsrelevante Eigenschaften:**
   - Kennzeichnung als Verkaufseinheit möglich
   - Standard-Gebinde-Markierung für Standardverpackungen

4. **Flexibilität in der Zusammensetzung:**
   - Ein Gebinde kann verschiedene Artikel in unterschiedlichen Mengen enthalten
   - Ein Artikel kann in mehreren Gebinden vorkommen

### Unterschied zwischen Stücklisten und Gebinden

| Eigenschaft | Stückliste | Gebinde |
|-------------|------------|---------|
| Primärer Zweck | Fertigung/Herstellung | Verkauf/Logistik |
| Bestandsführung | Komponenten werden verbraucht | Artikel bleiben erhalten |
| Zeitpunkt | Vor/während der Produktion | Nach der Produktion |
| Lagerverwaltung | Führt zu Bestandsveränderungen | Nur organisatorische Einheit |
| Preiskalkulation | Herstellkosten werden berechnet | Verkaufspreise werden definiert |
| Prozessintegration | Fertigungsaufträge | Verkaufsaufträge, Lieferscheine |

### Implementierung in Geschäftsprozessen

Die Gebinde- und Stücklistenstrukturen sind in folgende Geschäftsprozesse integriert:

1. **Fertigung:**
   - Stücklisten definieren die zu fertigenden Artikel
   - Komponenten werden automatisch aus dem Lager entnommen
   - Fertige Produkte werden eingelagert

2. **Verkauf:**
   - Gebinde können als eigenständige Verkaufseinheiten angeboten werden
   - Preiskalkulation basierend auf enthaltenen Artikeln oder eigenem Preis
   - Automatische Auflösung in Einzelartikel bei Lieferung möglich

3. **Einkauf:**
   - Bestellungen können auf Gebinde- oder Artikelebene erfolgen
   - Automatische Umrechnung zwischen Gebinden und Einzelartikeln

4. **Lagerverwaltung:**
   - Bestandsführung auf Artikelebene
   - Gebinde können als virtuelle Lagereinheiten fungieren
   - Chargen- und Seriennummernverfolgung bleibt auf Artikelebene

## Validierung und Qualitätssicherung

Das Datenmodell wurde umfassend validiert:

1. **Integritätsprüfungen:**
   - Entitätsintegrität durch Primärschlüssel
   - Referentielle Integrität durch Fremdschlüssel
   - Domänenintegrität durch Attributtypen und Constraints

2. **Normalisierung:**
   - 1NF: Atomare Werte, keine Wiederholungsgruppen
   - 2NF: Keine partiellen Abhängigkeiten
   - 3NF: Keine transitiven Abhängigkeiten

3. **Geschäftsregeln:**
   - Vollständige Abbildung aller fachlichen Anforderungen
   - Konsistente Statusübergänge in Prozessen
   - Korrekte Werteberechnungen

4. **Performance und Skalierbarkeit:**
   - Optimierte Indexstrukturen
   - Vermeidung unnötiger Redundanzen
   - Unterstützung für große Datenmengen

## Fazit

Das entwickelte Datenbankmodell bietet eine solide Grundlage für ein umfassendes ERP-System mit besonderem Fokus auf die flexible Abbildung von Produktstrukturen, Stücklisten und Gebinden. Durch die Analyse und Integration der besten Konzepte aus etablierten Open-Source-ERP-Systemen wurde ein Modell geschaffen, das sowohl aktuellen Anforderungen gerecht wird als auch für zukünftige Erweiterungen offen ist.

Die klare Trennung zwischen Stücklisten für die Fertigung und Gebinden für Verkauf/Logistik ermöglicht eine präzise Abbildung der unterschiedlichen Geschäftsprozesse und vermeidet die typischen Probleme vieler ERP-Systeme, die diese Konzepte vermischen. 