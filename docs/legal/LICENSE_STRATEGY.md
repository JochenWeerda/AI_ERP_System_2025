# VALEO NeuroERP - Lizenzstrategie

## Zweistufige Lizenzstrategie

VALEO NeuroERP verwendet eine zweistufige Lizenzstrategie, um sowohl die Vorteile von Open-Source-Software zu nutzen als auch kommerzielle Aspekte zu schützen.

### 1. Core-System (LGPL v3)

Der Core-Bereich von VALEO NeuroERP ist unter der GNU Lesser General Public License v3.0 (LGPL-3.0) lizenziert. Dies umfasst:

- Grundlegende ERP-Funktionalität
- Stammdatenverwaltung
- Bestellwesen
- Lagerverwaltung
- Finanzbuchhaltung
- Berichtswesen
- Benutzerverwaltung
- Dokumentenmanagement

Die LGPL-Lizenz wurde gewählt, weil sie:
- Die Verwendung der Software in kommerziellen Anwendungen erlaubt
- Die Entwicklung proprietärer Module ermöglicht, die mit dem Core-System interagieren
- Sicherstellt, dass Verbesserungen am Core-System selbst wieder der Community zugutekommen

### 2. Kommerzielle Module (VALEO Commercial License)

Die kommerziellen Module von VALEO NeuroERP sind unter der VALEO Commercial License lizenziert. Diese Module bieten spezialisierte Funktionen und Mehrwert:

- **QS-Modul**: Qualitätssicherung und Prüfverfahren
- **Chargenmanagement-Modul**: Rückverfolgbarkeit von Produkten
- **Waagen-Integrationsmodul**: Anbindung verschiedener Waagentypen
- **TSE-Modul**: Kassensicherung gemäß KassenSichV
- **MCP-Modul**: Model Context Protocol für KI-Integration
- **KI-Modul**: Integration von künstlicher Intelligenz

Die VALEO Commercial License:
- Schützt das geistige Eigentum von VALEO
- Ermöglicht kundenspezifische Anpassungen und Erweiterungen
- Sichert Supportleistungen und Wartung
- Garantiert Kompatibilität mit zukünftigen Versionen des Core-Systems

## Rechtliche Compliance

### LGPL-Compliance

Um die Compliance mit der LGPL-Lizenz sicherzustellen, müssen folgende Bedingungen erfüllt sein:

1. Der Quellcode des Core-Systems muss zugänglich gemacht werden.
2. Änderungen am Core-System müssen unter der LGPL lizenziert werden.
3. Die Verbindung von kommerziellen Modulen mit dem Core-System muss über klar definierte Schnittstellen erfolgen.
4. Es muss möglich sein, das Core-System gegen neuere oder modifizierte Versionen auszutauschen, ohne dass die kommerziellen Module angepasst werden müssen.

### Kommerzielle Lizenzierung

Die kommerzielle Lizenzierung der Module umfasst:

1. Zeitlich unbegrenzte oder abonnementbasierte Nutzungsrechte
2. Definierte Service Level Agreements (SLAs)
3. Regelmäßige Updates und Verbesserungen
4. Technischer Support und Wartung
5. Optionale Anpassungen und Erweiterungen

## Open-Source-Beiträge

VALEO begrüßt Beiträge zum Core-System von VALEO NeuroERP. Um die rechtliche Klarheit zu gewährleisten, wird von allen Beitragenden die Unterzeichnung eines Contributor License Agreement (CLA) verlangt, das:

1. Bestätigt, dass der Beitragende das Recht hat, den Code beizutragen
2. Die Lizenzierung des Beitrags unter der LGPL v3 erlaubt
3. VALEO das Recht einräumt, den Beitrag auch unter anderen Lizenzen zu verwenden

## Dual-Licensing-Option

Für spezielle Anwendungsfälle bietet VALEO eine Dual-Licensing-Option für das Core-System an, die es Kunden ermöglicht, das Core-System unter einer kommerziellen Lizenz zu nutzen, wenn die LGPL-Bedingungen nicht mit ihren Geschäftsanforderungen vereinbar sind. 