# Analyse von ERP-Datenmodellen

## Übersicht der analysierten Systeme

Für die Entwicklung eines konsistenten und redundanzfreien Datenmodells für unser AI-gesteuertes ERP-System wurden folgende Open-Source-ERP-Systeme analysiert:

1. **ERPNext** (Frappe) - Modulares und anpassbares ERP-System mit Python/JavaScript
2. **Apache OFBiz** - Komponenten-basiertes Business-Automations-Framework in Java
3. **Dolibarr** - PHP-basiertes ERP/CRM für kleine und mittlere Unternehmen
4. **iDempiere** - Java-basiertes ERP-System mit umfassender Geschäftsprozessabdeckung
5. **Metasfresh** - Java-basiertes modernes ERP-System mit Fokus auf Benutzererfahrung
6. **Odoo** - Python-basiertes modulares und skalierbares ERP-System

## Kernerkenntnisse

### Allgemeine Designprinzipien

Bei der Analyse der verschiedenen ERP-Systeme wurden folgende übergreifende Prinzipien identifiziert:

1. **Modulare Architektur**: Alle erfolgreichen Systeme teilen Funktionen in klar definierte Module auf
2. **Erweiterbarkeit**: Flexible Datenmodelle ermöglichen Anpassungen ohne Kernänderungen
3. **Normalisierung**: Konsistente Datenstrukturen mit minimaler Redundanz
4. **Mehrschichtige Beziehungen**: Komplexe Entitätsbeziehungen werden durch Zwischentabellen gelöst
5. **Versionierung**: Tracking von Änderungen über Zeit (besonders bei Dolibarr und Odoo)
6. **Mehrmandantenfähigkeit**: Isolation von Daten zwischen verschiedenen Unternehmen/Organisationen

### Kernentitäten in ERP-Systemen

Die Analyse zeigt, dass alle ERP-Systeme folgende Kernentitäten implementieren:

#### 1. Organisationsstrukturen
- Unternehmen/Organisation (mit Hierarchien)
- Filialen/Standorte
- Abteilungen/Kostenstellen
- Nutzer und Berechtigungen

#### 2. Partner
- Kunden
- Lieferanten
- Mitarbeiter
- Kontakte/Ansprechpartner

#### 3. Produkte und Dienstleistungen
- Artikel/Produkte
- Artikelkategorien
- Preislisten
- Attributsätze
- Stücklisten (BOM)
- Packungen/Gebinde

#### 4. Lager und Bestand
- Lagerorte/Lager
- Bestandsbewegungen
- Chargen/Seriennummern
- Inventuren

#### 5. Verkauf
- Angebote
- Aufträge
- Lieferungen
- Rechnungen
- Zahlungen

#### 6. Einkauf
- Anfragen
- Bestellungen
- Wareneingänge
- Lieferantenrechnungen

#### 7. Finanzen
- Kontenplan
- Buchungen
- Steuern
- Kostenrechnung
- Banktransaktionen

## Detailanalyse der Artikel/Produkt-Struktur

Da der Fokus besonders auf der Modellierung von Artikeln liegt, wurde dieser Bereich detaillierter analysiert:

### Gemeinsame Artikelattribute

Aus den verschiedenen Systemen wurden folgende wichtige Artikelattribute identifiziert:

- **Basis-Identifikation**: ID, Artikelnummer, Barcode(s), Name, Beschreibung
- **Kategorisierung**: Kategorie, Typ, Tags, Attribute
- **Maße und Einheiten**: Gewicht, Volumen, Abmessungen, Maßeinheit
- **Preise**: Einkaufspreis, Verkaufspreis, verschiedene Preislisten
- **Bestand**: Mindestbestand, Maximalbestand, Nachbestellmenge, Lagerwert
- **Steuern und Finanzen**: Steuerklasse, Kostenstelle, Buchungskonten
- **Lieferanten**: Primärer Lieferant, alternative Lieferanten, Lieferzeiten
- **Fertigung**: Stückliste (BOM), Fertigungszeit, Arbeitsschritte
- **Logistik**: Lagerplätze, Packmaße, Gewicht
- **Verkauf**: Verkaufbarkeit, Webshop-Freigabe, Saisonalität
- **Tracking**: Chargen-/Seriennummernverfolgung, MHD-Tracking

### Komplexe Artikelstrukturen

Besonders wichtig ist die Beziehung zwischen Artikeln in Form von:

1. **Stücklisten (BOM)**: Ein Artikel besteht aus mehreren anderen Artikeln
2. **Varianten**: Ein Artikel kann verschiedene Varianten haben (z.B. Farbe, Größe)
3. **Packungen/Gebinde**: Ein Artikel kann als Verpackungseinheit anderer Artikel dienen
4. **Ersatzartikel**: Alternative Artikel, die stattdessen verwendet werden können
5. **Zubehörartikel**: Ergänzende Artikel, die häufig zusammen verkauft werden

### ERPNext-Artikelmodell

ERPNext implementiert ein besonders flexibles Artikelmodell:

```
Item (Artikel)
├── Item Code (eindeutige ID)
├── Item Name
├── Item Group (hierarchische Kategorie)
├── Default Unit of Measure
├── Brand
├── Description
├── Image
├── Is Stock Item (Lagerartikel ja/nein)
├── Is Sales Item (Verkaufsartikel ja/nein)
├── Is Purchase Item (Einkaufsartikel ja/nein)
├── Is Fixed Asset (Anlagegut ja/nein)
├── Disabled (deaktiviert ja/nein)
└── Verknüpfungen zu:
    ├── Item Price (verschiedene Preise)
    ├── Item Supplier (Lieferanteninformationen)
    ├── Item Alternative (alternative Artikel)
    ├── Item Variant (Varianten)
    ├── Bill of Materials (Stücklisten)
    ├── Item Attribute (Attribute wie Farbe, Größe)
    ├── Item Tax (artikelspezifische Steuern)
    ├── Item Barcode (verschiedene Barcodes)
    └── Item Quality (Qualitätsparameter)
```

### Odoo-Artikelmodell

Odoo bietet eine umfassende Produktstruktur mit:

```
Product Template (Produktvorlage)
├── Name
├── Product Type (Dienstleistung, Verbrauchsgut, Lagerartikel)
├── Product Category (hierarchisch)
├── Sale Price / Cost
├── Default UoM
├── Attributes (Farbe, Größe, etc.)
└── Verknüpfungen zu:
    ├── Product Variant (konkrete Varianten)
    ├── Pricelist Items (verschiedene Preislisten)
    ├── Routes (Beschaffungs-/Fertigungswege)
    ├── Packaging (verschiedene Verpackungseinheiten)
    ├── Bill of Materials (Stücklisten)
    ├── Supplier Info (Lieferanteninformationen)
    └── Product Images (Bilder)
```

### Besonderheit: Gebinde/Packungen

Besonders interessant für unsere Anforderung sind die Implementierungen von Gebinden:

1. **ERPNext**: Verwendet "Product Bundle" als eigenständige Entität
2. **Odoo**: Implementiert "Packaging" und "Product Pack" Module
3. **OFBiz**: Nutzt "GoodIdentification" für Packungen und "ProductAssoc" für Beziehungen
4. **Metasfresh**: Implementiert "HU (Handling Unit)" Konzept für Gebinde/Verpackungen

## Erkenntnisse für unser Datenmodell

Basierend auf der Analyse werden folgende Empfehlungen abgeleitet:

1. **Trennung von Produkt und Variante**: Nach dem Vorbild von Odoo und ERPNext
2. **Flexible Attributstrukturen**: Attribute sollten dynamisch erweiterbar sein
3. **Mehrschichtige Kategorisierung**: Hierarchische Kategorien und zusätzliche Tags
4. **Mehrstufige Stücklisten**: Vollständige Unterstützung für komplexe Produktstrukturen
5. **Packungen/Gebinde als eigenständige Entitäten**: Separate Modellierung von Verpackungseinheiten
6. **Umfassende Preis- und Kostenstruktur**: Verschiedene Preistypen und Preislisten

Diese Erkenntnisse fließen in das nachfolgende SERM-Modell ein. 