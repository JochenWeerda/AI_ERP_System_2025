#!/usr/bin/env python3
"""
VALEO NeuroERP - Rebranding-Skript
----------------------------------

Dieses Skript nimmt einen Quellcode-Fork und ersetzt alle geschützten Marken und Referenzen
durch VALEO-eigene Bezeichnungen. Es ist Teil des legalen Compliance-Prozesses für
die Nutzung von LGPL-lizenziertem Code.

Das Skript dokumentiert alle Änderungen in einer Log-Datei für Transparenz.
"""

import os
import re
import sys
import logging
import shutil
from pathlib import Path
from datetime import datetime

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("rebranding.log"),
        logging.StreamHandler()
    ]
)

# Konstanten für Ersetzungen
REPLACEMENTS = {
    # Markenname ersetzen (Groß-/Kleinschreibung beachten)
    r'\bodoo\b': 'valeo',
    r'\bOdoo\b': 'VALEO',
    r'\bODOO\b': 'VALEO',
    
    # Spezifische Referenzen ersetzen
    r'Odoo S\.A\.': 'VALEO GmbH',
    r'https://www\.odoo\.com': 'https://www.valeo-erp.com',
    r'@odoo\.com': '@valeo-erp.com',
    
    # Datenbankpräfixe ändern
    r'oe_': 've_',
    r'ir_': 'vr_',
    
    # Modulnamen anpassen
    r'addons\.': 'valeo_modules.',
    
    # API-Endpunkte
    r'/web/': '/valeo/',
    r'/api/': '/api/v1/',
}

# Dateitypen, die bearbeitet werden sollen
TEXT_EXTENSIONS = {
    '.py', '.js', '.xml', '.html', '.css', '.scss', '.md', '.rst', '.txt',
    '.json', '.csv', '.po', '.pot', '.sql', '.yml', '.yaml', '.conf', '.cfg'
}

# Verzeichnisse, die übersprungen werden sollen
SKIP_DIRS = {
    '.git', '__pycache__', 'node_modules', 'venv', 'env',
    'tests', 'doc', 'documentation', 'examples'
}

# Dateinamen, die umbenannt werden sollen
FILES_TO_RENAME = {
    'odoo': 'valeo',
    'odoo.conf': 'valeo.conf',
    'odoo-bin': 'valeo-bin',
    'odoo.py': 'valeo.py',
}

def should_process_file(path):
    """Prüft, ob eine Datei verarbeitet werden soll."""
    if any(dir_name in path.parts for dir_name in SKIP_DIRS):
        return False
    
    return path.suffix.lower() in TEXT_EXTENSIONS

def rename_files(base_dir):
    """Dateien gemäß der Umbenennungsregeln umbenennen."""
    counter = 0
    
    for root, dirs, files in os.walk(base_dir):
        # Verzeichnisse filtern, die übersprungen werden sollen
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        
        for filename in files:
            lower_filename = filename.lower()
            
            # Prüfen, ob der Dateiname umbenannt werden soll
            new_name = None
            for old, new in FILES_TO_RENAME.items():
                pattern = rf'^{re.escape(old)}([_\-\.].+)?$'
                if re.match(pattern, lower_filename):
                    if '.' in filename:
                        name, ext = filename.rsplit('.', 1)
                        new_name = re.sub(rf'^{re.escape(old)}', new, name, flags=re.IGNORECASE) + '.' + ext
                    else:
                        new_name = re.sub(rf'^{re.escape(old)}', new, filename, flags=re.IGNORECASE)
                    break
            
            if new_name:
                old_path = os.path.join(root, filename)
                new_path = os.path.join(root, new_name)
                
                try:
                    shutil.move(old_path, new_path)
                    counter += 1
                    logging.info(f"Renamed: {old_path} -> {new_path}")
                except Exception as e:
                    logging.error(f"Failed to rename {old_path}: {e}")
    
    return counter

def replace_content(base_dir):
    """Textinhalt in Dateien ersetzen."""
    counter = 0
    file_counter = 0
    
    for path in Path(base_dir).rglob('*'):
        if path.is_file() and should_process_file(path):
            file_counter += 1
            changes_made = False
            
            try:
                # Datei als Text einlesen
                with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                    content = file.read()
                
                # Ersetzungen durchführen
                new_content = content
                for pattern, replacement in REPLACEMENTS.items():
                    if re.search(pattern, new_content):
                        new_content = re.sub(pattern, replacement, new_content)
                        changes_made = True
                
                # Nur schreiben, wenn Änderungen vorgenommen wurden
                if changes_made:
                    with open(path, 'w', encoding='utf-8') as file:
                        file.write(new_content)
                    counter += 1
                    logging.info(f"Modified: {path}")
            
            except Exception as e:
                logging.error(f"Failed to process {path}: {e}")
    
    return counter, file_counter

def add_license_headers(base_dir):
    """Lizenzhinweise zu Dateien hinzufügen."""
    counter = 0
    
    # Datum für den Lizenzhinweis
    current_year = datetime.now().year
    
    # Lizenzhinweis je nach Dateityp
    license_headers = {
        '.py': f"""#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# Copyright (C) 2023-{current_year} VALEO GmbH
# Copyright (C) 2004-present Odoo S.A. (Original Code)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#
# VALEO NeuroERP - Enterprise Resource Planning
#
""",
        '.js': f"""/**
 * Copyright (C) 2023-{current_year} VALEO GmbH
 * Copyright (C) 2004-present Odoo S.A. (Original Code)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * VALEO NeuroERP - Enterprise Resource Planning
 */
""",
        '.xml': f"""<?xml version="1.0" encoding="UTF-8"?>
<!--
    Copyright (C) 2023-{current_year} VALEO GmbH
    Copyright (C) 2004-present Odoo S.A. (Original Code)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    VALEO NeuroERP - Enterprise Resource Planning
-->
""",
    }
    
    # Standardlizenzhinweis für andere Dateitypen
    default_license = f"""/*
 * Copyright (C) 2023-{current_year} VALEO GmbH
 * Copyright (C) 2004-present Odoo S.A. (Original Code)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * VALEO NeuroERP - Enterprise Resource Planning
 */
"""
    
    for path in Path(base_dir).rglob('*'):
        if path.is_file() and should_process_file(path):
            # Nur bestimmte Dateitypen mit Header versehen
            suffix = path.suffix.lower()
            
            if suffix in license_headers or suffix in ['.css', '.scss', '.html']:
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                        content = file.read()
                    
                    # Wenn die Datei bereits einen Lizenzhinweis hat, überspringen
                    if 'Copyright' in content and 'VALEO' in content and 'Odoo' in content:
                        continue
                    
                    # Passenden Lizenzhinweis auswählen
                    if suffix in license_headers:
                        license_header = license_headers[suffix]
                    else:
                        license_header = default_license
                    
                    # Hinweis hinzufügen und Datei schreiben
                    with open(path, 'w', encoding='utf-8') as file:
                        file.write(license_header + content)
                    
                    counter += 1
                    logging.info(f"Added license header to: {path}")
                
                except Exception as e:
                    logging.error(f"Failed to add license header to {path}: {e}")
    
    return counter

def create_legal_documentation(base_dir):
    """Erstellt rechtliche Dokumentation für die LGPL-Konformität."""
    legal_dir = os.path.join(base_dir, 'legal')
    os.makedirs(legal_dir, exist_ok=True)
    
    # README.legal.md - Rechtliche Hinweise
    with open(os.path.join(legal_dir, 'README.legal.md'), 'w', encoding='utf-8') as file:
        file.write(f"""# Rechtliche Hinweise für VALEO NeuroERP

## Lizenzierung

VALEO NeuroERP besteht aus mehreren Komponenten mit unterschiedlichen Lizenzen:

1. **Core-Komponenten**: GNU Lesser General Public License (LGPL) Version 3
   - Basiert auf [Odoo Community Edition](https://github.com/odoo/odoo)
   - Alle Änderungen am LGPL-Code sind unter derselben Lizenz verfügbar

2. **VALEO-Module**: VALEO Commercial License
   - Proprietäre Module mit zusätzlicher Funktionalität
   - Separate Lizenzierung für kommerzielle Nutzung

## LGPL-Compliance

Gemäß den Anforderungen der LGPL-Lizenz:

1. Der Quellcode der LGPL-Komponenten ist verfügbar unter:
   https://github.com/valeo/neuro-erp-core

2. Alle Änderungen am ursprünglichen LGPL-Code sind dokumentiert und 
   in diesem Repository enthalten.

3. Benutzer haben das Recht, den LGPL-Code zu modifizieren und weiterzuverteilen
   unter den Bedingungen der LGPL.

## Markenhinweis

VALEO und VALEO NeuroERP sind Marken der VALEO GmbH.
Odoo ist eine eingetragene Marke der Odoo S.A.

Dieses Produkt ist nicht mit Odoo S.A. verbunden oder wird von Odoo S.A. unterstützt.

## Kontakt

Bei Fragen zur Lizenzierung oder für den Zugang zum Quellcode kontaktieren Sie bitte:

VALEO GmbH
legal@valeo-erp.com
""")
    
    # COPYRIGHT - Copyright-Informationen
    with open(os.path.join(legal_dir, 'COPYRIGHT'), 'w', encoding='utf-8') as file:
        current_year = datetime.now().year
        file.write(f"""VALEO NeuroERP - Enterprise Resource Planning System

Core components based on Odoo Community Edition
Copyright (C) 2004-present Odoo S.A.

Modifications and extensions:
Copyright (C) 2023-{current_year} VALEO GmbH

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
""")
    
    # NOTICE - Hinweis auf Änderungen
    with open(os.path.join(legal_dir, 'NOTICE'), 'w', encoding='utf-8') as file:
        file.write("""VALEO NeuroERP

This product includes software developed by:
- Odoo S.A. (https://www.odoo.com/) under LGPL v3
- VALEO GmbH (https://www.valeo-erp.com/)

The following modifications have been made to the original Odoo code:
1. Rebranding from Odoo to VALEO NeuroERP
2. Extended data models for specialized industries
3. Integration of AI capabilities
4. Quality management modules
5. Batch tracking system
6. TSE module for fiscal compliance
7. Scale integration
8. MCP interface

For a detailed changelog, please see the Git commit history.
""")
    
    # LICENSE.txt - Vollständiger LGPL-Text
    shutil.copy(
        os.path.join(os.path.dirname(__file__), 'LICENSE.txt'),
        os.path.join(legal_dir, 'LICENSE.txt')
    )
    
    logging.info(f"Created legal documentation in {legal_dir}")
    return True

def main():
    if len(sys.argv) != 2:
        print("Usage: python rebrand.py <source_directory>")
        sys.exit(1)
    
    base_dir = sys.argv[1]
    if not os.path.isdir(base_dir):
        print(f"Error: {base_dir} is not a valid directory")
        sys.exit(1)
    
    logging.info(f"Starting rebranding process for {base_dir}")
    
    # Statistiken
    renamed = rename_files(base_dir)
    logging.info(f"Renamed {renamed} files")
    
    modified, total = replace_content(base_dir)
    logging.info(f"Modified content in {modified} out of {total} files")
    
    license_headers = add_license_headers(base_dir)
    logging.info(f"Added license headers to {license_headers} files")
    
    legal_docs = create_legal_documentation(base_dir)
    logging.info("Legal documentation created")
    
    logging.info("Rebranding completed successfully")

if __name__ == "__main__":
    main() 