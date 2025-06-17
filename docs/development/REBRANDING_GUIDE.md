# VALEO NeuroERP - Rebranding-Anleitung

## Übersicht

Dieses Dokument beschreibt den Prozess und die Best Practices für das Rebranding des Odoo-Quellcodes zu VALEO NeuroERP. Ein gründliches Rebranding ist sowohl aus rechtlichen Gründen als auch für die Markenidentität entscheidend.

## Rechtliche Anforderungen

Die LGPL v3-Lizenz, unter der Odoo steht, erlaubt das Forken und Modifizieren des Codes, verlangt aber:

1. Die Einhaltung der Copyright-Hinweise der Originalautoren
2. Klare Kennzeichnung von Änderungen
3. Die Bereitstellung des modifizierten Quellcodes unter derselben Lizenz

Die Markenrechte an "Odoo" und dessen Logos gehören jedoch der Odoo S.A. und müssen respektiert werden.

## Schritt-für-Schritt-Anleitung

### 1. Vorbereitung

- Erstellen Sie eine vollständige Bestandsaufnahme aller zu ändernden Markenelemente
- Dokumentieren Sie den aktuellen Zustand vor dem Rebranding (Screenshots, Dateilisten)
- Erstellen Sie ein Backup des Originalcodes

### 2. Code-Analyse und Markierung

Folgende Elemente müssen identifiziert und geändert werden:

- **Textuelle Referenzen**: "Odoo", "OpenERP", "openerp" in:
  - Python-Dateien (.py)
  - JavaScript-Dateien (.js)
  - XML-Dateien (.xml)
  - HTML-Vorlagen (.html)
  - CSS-Dateien (.css)
  - Dokumentation (.md, .rst, .txt)

- **Visuelle Elemente**:
  - Logos und Icons
  - Farbschemata
  - Schriftarten

- **Systembezogene Bezeichnungen**:
  - Datenbankpräfixe (z.B. `odoo_` → `valeo_`)
  - Modulnamen und -präfixe
  - Namespaces und Paketnamen

### 3. Automatisierte Ersetzung

Verwenden Sie das `rebranding.ps1`-Skript für die automatisierte Textesetzung mit folgenden Ersetzungspaaren:

```
"Odoo" → "VALEO NeuroERP"
"odoo" → "valeo"
"OpenERP" → "VALEO NeuroERP"
"openerp" → "valeo"
```

### 4. Manuelle Überprüfung und Korrektur

Nach der automatisierten Ersetzung müssen folgende Bereiche manuell überprüft werden:

- **Kritische Dateien**:
  - setup.py und ähnliche Installationsdateien
  - Konfigurationsdateien
  - Hauptmodule und Initialisierungsdateien
  - Lizenz- und Urheberrechtsdateien

- **Spezialfälle**:
  - Pfadnamen und Importe, die Anpassungen erfordern
  - Zusammengesetzte Begriffe, die teilweise erhalten bleiben müssen
  - Codefragmente, bei denen Ersetzungen zu Syntaxfehlern führen könnten

### 5. Visuelle Elemente ersetzen

- Ersetzen Sie alle Logos, Favicons und andere bildliche Darstellungen
- Aktualisieren Sie das Farbschema in CSS-Dateien und Designkomponenten
- Stellen Sie sicher, dass alle Benutzeroberflächen-Elemente das neue Branding widerspiegeln

### 6. Dokumentation aktualisieren

- Erstellen oder aktualisieren Sie die COPYRIGHT-Datei
- Überarbeiten Sie die README.md und andere Dokumentationsdateien
- Aktualisieren Sie Installationsanleitungen und Benutzerhandbücher

### 7. Rechtliche Absicherung

- Fügen Sie einen Hinweis auf den Fork von Odoo hinzu, wie gesetzlich erforderlich
- Stellen Sie sicher, dass alle Copyright-Hinweise der Originalautoren erhalten bleiben
- Aktualisieren Sie die Lizenzdatei gemäß den LGPL-Anforderungen

### 8. Testen

Nach dem Rebranding müssen umfangreiche Tests durchgeführt werden:

- Funktionalitätstests zur Sicherstellung, dass keine Funktionen beeinträchtigt wurden
- UI-Tests zur Überprüfung aller visuellen Elemente
- Installations- und Konfigurationstests

## Besondere Hinweise

### Präfixe und Namespaces

Besondere Aufmerksamkeit sollte den folgenden Elementen gewidmet werden:

- Python-Module und -Pakete (`odoo` → `valeo`)
- JavaScript-Namespaces (`odoo` → `valeo`)
- CSS-Klassen (`.o_` → `.v_`)
- Datenbankschema-Präfixe (`ir_`, `res_` beibehalten, aber modulspezifische anpassen)

### Technische Herausforderungen

- Einige Änderungen können Importpfade beeinflussen und erfordern zusätzliche Anpassungen
- Änderungen an Datenbankstrukturen müssen sorgfältig geplant werden
- API-Endpunkte müssen konsistent umbenannt werden

## Werkzeuge und Ressourcen

- [rebranding.ps1](../../implementation-tasks/rebranding.ps1): Automatisiertes Rebranding-Skript
- [grep](https://www.gnu.org/software/grep/): Zum Identifizieren von zu ändernden Texten
- [sed](https://www.gnu.org/software/sed/): Für komplexe Textersetzungen
- [diff](https://www.gnu.org/software/diffutils/): Zum Vergleichen von Dateien vor und nach dem Rebranding

## Abschluss

Nach Abschluss des Rebrandings sollte eine vollständige Dokumentation des Prozesses erstellt werden, einschließlich:

- Liste aller durchgeführten Änderungen
- Bekannte Bereiche, die besondere Aufmerksamkeit erfordern
- Empfehlungen für zukünftige Updates

Diese Dokumentation hilft bei der Wartung und zukünftigen Aktualisierungen des Codes. 