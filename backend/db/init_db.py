"""
Datenbankinitialierung für das AI-gestützte ERP-System.

Dieses Skript erstellt die Datenbank und alle Tabellen.
"""

import os
import sys

# Füge das Wurzelverzeichnis zum Pfad hinzu, um relative Importe zu ermöglichen
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importiere die Datenbankkomponenten
from db.base import Base, engine
from models import *

def init_db():
    """Initialisiert die Datenbank und erstellt alle Tabellen."""
    print("Erstelle Datenbank und Tabellen...")
    Base.metadata.create_all(bind=engine)
    print("Datenbank erfolgreich initialisiert!")

if __name__ == "__main__":
    init_db() 