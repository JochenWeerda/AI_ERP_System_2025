# Model Context Protocol (MCP)

Dieses Modul ermöglicht die nahtlose Integration von KI-Modellen mit dem ERP-System und bietet erweiterte Funktionen für die Chargenverwaltung mit Artikelkonto-Integration.

## Funktionen

### KI-Integration
* Kontextualisierung: Automatische Bereitstellung von relevanten Geschäftsdaten als Kontext für KI-Modelle
* Standardisierte Schnittstellen: Einheitliche API für die Kommunikation mit verschiedenen KI-Anbietern
* Datenkonnektivität: Sichere Verbindungen zu KI-Modellen mit entsprechenden Authentifizierungs- und Autorisierungsmechanismen
* Prompt-Management: Verwaltung und Optimierung von Prompts für verschiedene Geschäftsprozesse

### Stammdaten-Migration
* Import von Artikeln und Einheiten aus L3-Export
* Mapping-Konfigurationen zwischen L3-Export und Odoo-Modellen
* Konvertierungsfunktionen für komplexe Datenübertragungen

### Chargenverwaltung mit Artikelkonto-Integration
* **Erweiterte Chargenattribute:** Jede Charge kann mit einem eigenen Artikelkonto, Einstandspreis und Qualitätsstatus verknüpft werden.
* **Automatische Chargenerstellung:** Bei Wareneingang können basierend auf Produktkonfiguration automatisch Chargen erstellt werden.
* **Finanzkonto-Integration:** Chargen können mit eigenen Artikelkonten für eine präzise Bestandsbewertung verknüpft werden.
* **Qualitätsmanagement:** Workflow für Qualitätsprüfung mit Status (Neu, Prüfung ausstehend, Freigegeben, Gesperrt).
* **Lieferanten-Chargennummern:** Separate Speicherung der Lieferanten-Chargennummern.
* **Haltbarkeitsdaten:** Erfassung von Produktions- und Mindesthaltbarkeitsdatum pro Charge.
* **Bestandsbewertung:** Automatische Berechnung des Bestandswerts je Charge basierend auf Menge und Einstandspreis.
* **Berichtswesen:** Integrierte Berichte für Chargenbewegungen und Chargen-Bestandswerte.

## Verwendung

### Konfiguration von Produkten für Chargenverwaltung

1. Aktivieren Sie die Chargenverfolgung im Produktformular ("Nachverfolgung" = "Nach Chargen")
2. Konfigurieren Sie die Chargenverwaltungsoptionen im Tab "Chargenverwaltung":
   - Standard-Artikelkonto für Chargen: Das Finanzkonto, das standardmäßig für neue Chargen verwendet wird
   - Chargenvalidierung erforderlich: Wenn aktiviert, müssen Chargen vor der Verwendung validiert werden
   - Automatische Chargennummern: Aktiviert die automatische Erstellung von Chargennummern bei Wareneingang
   - Chargennummern-Präfix: Präfix für automatisch generierte Chargennummern (z.B. "P-" erzeugt Nummern wie "P-230501-1")

### Chargenerstellung und -verwaltung

#### Automatische Chargenerstellung
1. Öffnen Sie einen Wareneingang für Produkte mit aktivierter Chargenverfolgung
2. Aktivieren Sie "Automatische Chargenerstellung"
3. Bei der Validierung des Wareneingangs werden automatisch Chargen erzeugt

#### Manuelle Chargenerstellung
1. Navigieren Sie zu Lager > Lagerverwaltung > Chargennummern
2. Erstellen Sie eine neue Charge und füllen Sie die Felder aus:
   - Produkt
   - Chargennummer
   - Artikelkonto
   - Einstandspreis
   - Qualitätsdetails

#### Qualitätsmanagement für Chargen
1. Chargen haben standardmäßig den Status "Neu"
2. Verwenden Sie die Aktionen in der Statusleiste, um Chargen zur Prüfung zu setzen, freizugeben oder zu sperren
3. Gesperrte Chargen können nicht für Lieferungen verwendet werden

### Berichtswesen

#### Chargenwertbericht
Navigieren Sie zu Lager > Lagerverwaltung > Chargenwerte, um eine Übersicht über die Bestandsbewertung nach Chargen zu erhalten.

#### Chargenqualität
Navigieren Sie zu Lager > Lagerverwaltung > Chargenqualität, um Chargen mit ausstehendem Qualitätsstatus zu überprüfen.

## Technische Informationen

### Modelle
- **stock.lot:** Erweitert mit Feldern für Artikelkonto, Einstandspreis, Bestandswert, Qualitätsstatus
- **product.template:** Erweitert mit Konfigurationsoptionen für Chargenverwaltung
- **stock.picking:** Erweitert mit Funktionen für automatische Chargenerstellung und Qualitätsprüfung
- **stock.move.line:** Erweitert mit Hilfsmethoden für die Chargenanzeige

### Ansichten
- Erweiterte Ansichten für Chargen, Produkte und Wareneingänge
- Spezielle Berichte für Chargen-Bestandswerte und Qualitätsmanagement

## Abhängigkeiten
- stock
- account
- stock_account 