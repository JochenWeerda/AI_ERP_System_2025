# VALEO NeuroERP - Entwicklungsrichtlinien

Diese Dokumentation beschreibt die Entwicklungsprozesse und -richtlinien für das VALEO NeuroERP-Projekt. Wir verfolgen eine kostenoptimierte Entwicklungsstrategie, die später eine kommerzielle Verwertung ermöglicht.

## Entwicklungsstrategie

Das Projekt wird in zwei Phasen durchgeführt:

1. **Open-Source-Entwicklungsphase** - Aktuelle Phase
   - Öffentliches GitHub-Repository
   - LGPL/AGPL-Lizenzierung
   - Community-Beiträge sind willkommen

2. **Kommerzialisierungsphase** - Nach Fertigstellung der Hauptfunktionen
   - Umstellung auf kommerzielle Lizenz für proprietäre Module
   - LGPL-Komponenten bleiben unter LGPL

## Repository-Setup

### Git LFS einrichten

Für große Binärdateien verwenden wir Git Large File Storage (LFS):

```bash
# Git LFS installieren
# Unter Windows:
git lfs install

# Unter Linux:
sudo apt-get install git-lfs
git lfs install

# Unter macOS:
brew install git-lfs
git lfs install

# Repository klonen
git clone https://github.com/valeo/neuroerp.git
cd neuroerp

# Git LFS wird automatisch über .gitattributes konfiguriert
```

### Repository-Struktur

Bitte halte die folgende Struktur ein:

```
valeo-neuroerp/
├── core/                      # LGPL-basierter Code (Fork)
├── modules/
│   ├── public/                # Module unter LGPL
│   └── commercial/            # Zukünftig proprietäre Module
├── docs/                      # Dokumentation
├── deployment/                # Deployment-Konfigurationen
└── tools/                     # Entwicklungswerkzeuge
```

## Entwicklungsrichtlinien

### Umgang mit großen Dateien

1. **KI-Modelle und große Datensätze**:
   - Große Modelle (>10MB) nur als Download-Skripte einchecken
   - Beispiel: `models/download_scripts/download_llm_model.py`
   - Kleine Beispielmodelle können direkt im Repo sein

2. **Bilder und Medien**:
   - Komprimieren vor dem Commit
   - Über Git LFS verwalten (automatisch durch .gitattributes)

3. **Dokumentation**:
   - Text-basierte Formate bevorzugen (Markdown, reStructuredText)
   - Screenshots auf notwendige Größe beschränken

### Contributor License Agreement (CLA)

Alle externen Beiträge müssen unser CLA akzeptieren, das eine spätere Lizenzänderung erlaubt. Das CLA findest du in `docs/legal/CLA.md`.

## Branching-Strategie

Wir verwenden ein modifiziertes Gitflow-Modell:

- `main` - Stabile Releases
- `develop` - Aktive Entwicklung
- `feature/xyz` - Feature-Branches
- `bugfix/xyz` - Bugfix-Branches

## Qualitätssicherung

### Pull Requests

Alle Änderungen müssen über Pull Requests eingereicht werden:

1. Fork des Repositories erstellen (externe Mitwirkende)
2. Feature-Branch aus `develop` erstellen
3. Änderungen implementieren und testen
4. Pull Request gegen `develop` erstellen
5. Code-Review durchführen lassen
6. Automatisierte Tests bestehen
7. Merge nach Freigabe

### Tests

Jede Funktion benötigt entsprechende Tests:

- Unit-Tests für Core-Funktionalität
- Integrationstests für Modulinteraktionen
- End-to-End-Tests für kritische Benutzerflows

## Dokumentation

### Code-Dokumentation

- Docstrings für alle Funktionen und Klassen
- Kommentare für komplexe Logik
- README.md-Dateien für Module und Verzeichnisse

### Benutzer-Dokumentation

- Handbücher in `docs/user/`
- API-Dokumentation in `docs/api/`
- Entwicklerdokumentation in `docs/development/`

## Hinweis zur Lizenzierung

Alle während der Open-Source-Phase erstellten Komponenten werden zunächst unter LGPL/AGPL lizenziert. Nach Abschluss der Entwicklungsphase werden die Core-Komponenten weiterhin unter LGPL bleiben, während spezialisierte Module auf eine kommerzielle Lizenz umgestellt werden.

Diese Absicht ist transparent kommuniziert und durch unser Contributor License Agreement (CLA) abgesichert.

## Lizenz während der Entwicklungsphase

```
VALEO NeuroERP
Copyright (C) 2023-present VALEO GmbH

Dieses Programm ist freie Software: Sie können es unter den Bedingungen
der GNU Lesser General Public License, wie von der Free Software Foundation,
Version 3 der Lizenz oder (nach Ihrer Wahl) jeder neueren
veröffentlichten Version, weiter verteilen und/oder modifizieren.

Dieses Programm wird in der Hoffnung bereitgestellt, dass es nützlich sein wird, jedoch
OHNE JEDE GEWÄHR,; sogar ohne die implizite
Gewähr der MARKTFÄHIGKEIT oder EIGNUNG FÜR EINEN BESTIMMTEN ZWECK.
Siehe die GNU Lesser General Public License für weitere Einzelheiten.

Sie sollten eine Kopie der GNU Lesser General Public License zusammen mit diesem
Programm erhalten haben. Wenn nicht, siehe <https://www.gnu.org/licenses/>.
```

## Kontakt

Bei Fragen zur Entwicklung oder zum Lizenzmodell:

- **GitHub-Issues**: Für öffentliche Fragen und Feature-Requests
- **E-Mail**: development@valeo-erp.com für vertrauliche Anfragen 