"""
Basismodule für die Datenbankverbindung im AI-gestützten ERP-System.

Dieses Modul stellt die SQLAlchemy-Basisklassen und Konfiguration zur Verfügung.
"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import os

# Erstelle die deklarative Basisklasse
Base = declarative_base()

# Datenbankverbindung konfigurieren
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///./erp_database.db')

# Engine erstellen
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith('sqlite') else {},
    echo=False
)

# Session Factory erstellen
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Hilfsfunktion zur Erstellung einer neuen Datenbanksession
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 