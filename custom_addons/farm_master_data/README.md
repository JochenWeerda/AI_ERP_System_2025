# Landwirtschaftliche Stammdaten

Dieses Modul ermöglicht die Verwaltung landwirtschaftlicher Stammdaten in VALERO NeuroERP.

## Funktionen

* **Betriebsverwaltung**: Erfassen Sie landwirtschaftliche Betriebe mit allen relevanten Informationen wie Größe, Standort und Betriebstyp.
* **Feldverwaltung**: Dokumentieren Sie alle Felder eines Betriebs mit Informationen zu Fläche, Bodenart, GIS-Koordinaten und aktueller Kulturbelegung.
* **Kulturverwaltung**: Verwalten Sie alle angebauten Kulturen mit Informationen zu Aussaat, Ertragserwartung und Nährstoffbedarf.
* **Weizensortenmanagement**: Spezielle Unterstützung für verschiedene Weizensorten (A-Weizen, E-Weizen, Durumweizen) mit automatischer Klassifizierung.
* **ENNI-Schnittstelle**: Exportieren und importieren Sie Daten für die Düngebedarfsermittlung im ENNI-Format.

## Installation

1. Kopieren Sie das Modul in das Verzeichnis `custom_addons`.
2. Aktualisieren Sie die Modulliste im Entwicklermodus.
3. Installieren Sie das Modul über die App-Liste.

## Konfiguration

Nach der Installation ist das Modul sofort einsatzbereit. Es werden automatisch verschiedene Standardkulturen angelegt:

* Verschiedene Weizensorten (Standard, A-Weizen, E-Weizen, Sommerweizen, Durumweizen)
* Gerste
* Mais
* Raps
* Kartoffel
* Sojabohne

## Nutzung

### Betriebe anlegen

1. Navigieren Sie zu **Landwirtschaft > Stammdaten > Betriebe**.
2. Erstellen Sie einen neuen Betrieb.
3. Geben Sie die grundlegenden Betriebsinformationen ein.
4. Speichern Sie den Betrieb.

### Felder anlegen

1. Navigieren Sie zu **Landwirtschaft > Stammdaten > Felder**.
2. Erstellen Sie ein neues Feld.
3. Wählen Sie den zugehörigen Betrieb aus.
4. Geben Sie Informationen wie Fläche, Bodentyp usw. ein.
5. Speichern Sie das Feld.

### Kulturen verwalten

1. Navigieren Sie zu **Landwirtschaft > Stammdaten > Kulturen**.
2. Überprüfen Sie die bestehenden Kulturen oder erstellen Sie neue.
3. Verwalten Sie Informationen wie Aussaatstärke, Saattiefe und Ertragserwartungen.
4. Bei Weizensorten wird automatisch die Weizenklasse erkannt und der passende ENNI-Kulturcode zugewiesen.

### Weizensorten klassifizieren

Das System erkennt automatisch folgende Weizenklassen:
* **A-Weizen**: Qualitätsweizen mit hohem Proteingehalt
* **E-Weizen**: Eliteweizen mit besonders hohem Proteingehalt
* **B-Weizen**: Brotweizen mit mittlerem Proteingehalt
* **C-Weizen**: Futterweizen mit niedrigem Proteingehalt
* **Durumweizen**: Hartweizen für Pasta und Grieß

Die Klassifizierung erfolgt anhand des Namens und der Sortenbezeichnung. Für den ENNI-Export werden automatisch die korrekten Kulturcodes generiert.

### ENNI-Daten exportieren

1. Navigieren Sie zu **Landwirtschaft > ENNI-Export**.
2. Wählen Sie den Betrieb aus.
3. Legen Sie das Düngejahr fest.
4. Wählen Sie die zu exportierenden Datenmodule aus (Düngebedarfsermittlung, Düngungsdokumentation, N-Obergrenze).
5. Klicken Sie auf "XML generieren".
6. Speichern Sie die erzeugte XML-Datei.

### ENNI-Daten importieren

1. Navigieren Sie zu **Landwirtschaft > ENNI-Import**.
2. Wählen Sie den Zielbetrieb aus.
3. Wählen Sie die zu importierende XML-Datei aus.
4. Klicken Sie auf "XML importieren".
5. Überprüfen Sie das Importprotokoll auf Hinweise oder Fehler.

### Datenmigration bei Umfirmierung

Wenn eine Umfirmierung erfolgt und eine neue Betriebsnummer vergeben wird:

1. Exportieren Sie die Daten aus dem alten Betrieb mit dem ENNI-Export.
2. Passen Sie die Betriebsnummer in der exportierten XML-Datei an.
3. Importieren Sie die angepasste XML-Datei in den neuen Betrieb.

## Lizenz

Dieses Modul ist unter der LGPL-3 Lizenz veröffentlicht.

## Autor

VALERO NeuroERP 