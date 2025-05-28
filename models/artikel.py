"""
Artikel-Stammdatenmodell für das AI-gestützte ERP-System.

Basierend auf dem Konzept von Metasfresh und ERPNext mit Verbesserungen aus Odoo.
Unterstützt Artikel, Artikelvarianten, Attribute und Kategorien.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text, Enum, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import os
import sys

# Versuche verschiedene Import-Pfade
try:
    from db.base import Base
except ImportError:
    try:
        from backend.db.base import Base
    except ImportError:
        try:
            from backend.app.db.base import Base
        except ImportError:
            try:
                from app.db.base import Base
            except ImportError:
                # Erstelle eine Dummy-Basis-Klasse, wenn keine gefunden wird
                from sqlalchemy.ext.declarative import declarative_base
                Base = declarative_base()
                print("WARNUNG: Dummy-Base-Klasse wird verwendet!")


class ArtikelTyp(enum.Enum):
    """Typen von Artikeln"""
    PHYSISCH = "physisch"
    DIENSTLEISTUNG = "dienstleistung"
    VERBRAUCHSGUT = "verbrauchsgut" 