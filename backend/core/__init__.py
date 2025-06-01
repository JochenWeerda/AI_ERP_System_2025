"""
Core-Modul für das modulare ERP-System
"""

from .server import create_app, run_server, middleware
from .health import get_health_check, health_check_handler
from .routing import APIRouter, main_router

__all__ = [
    "create_app",
    "run_server",
    "middleware",
    "get_health_check",
    "health_check_handler",
    "APIRouter",
    "main_router"
]

# Initialisierung der Pfadregistrierung
try:
    from .path_registry import get_registry
    
    # Singleton-Instanz initialisieren
    registry = get_registry()
    
    # Informationsmeldung
    print("Pfadregister erfolgreich initialisiert.")
except ImportError as e:
    print(f"Warnung: Pfadregister konnte nicht initialisiert werden: {e}")
    print("Falle zurück auf Standard-Import-Mechanismen.")

# Initialisierung des Import-Handlers
try:
    from .import_handler import get_import_handler
    
    # Singleton-Instanz initialisieren
    handler = get_import_handler()
    
    # Informationsmeldung
    print("Import-Handler erfolgreich initialisiert.")
except ImportError as e:
    print(f"Warnung: Import-Handler konnte nicht initialisiert werden: {e}")
    print("Falle zurück auf Standard-Import-Mechanismen.") 