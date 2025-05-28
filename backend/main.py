"""
Hauptanwendungsdatei für das AI-gestützte ERP-System.

Diese Datei initialisiert die FastAPI-Anwendung und bindet alle API-Routen ein.
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

from .database import engine, Base
from .api import (
    user_api, 
    auth_api, 
    quality_api, 
    production_api, 
    inventory_api, 
    analytics_api, 
    emergency_api,
    notification_api
)

# API-Router importieren
try:
    from backend.api import partner_router
    from backend.api.emergency_api import router as emergency_router
    from backend.api.anomaly_api import router as anomaly_router
except ImportError:
    try:
        from api import partner_router
        from api.emergency_api import router as emergency_router
        from api.anomaly_api import router as anomaly_router
    except ImportError:
        # Für den Fall, dass die Import-Pfade nicht stimmen
        from api.partner_api import router as partner_router
        from api.emergency_api import router as emergency_router
        from api.anomaly_api import router as anomaly_router

# Services initialisieren
try:
    from backend.services.anomaly_detection_service import anomaly_detection_service
except ImportError:
    try:
        from services.anomaly_detection_service import anomaly_detection_service
    except ImportError:
        pass  # Service wird dynamisch erstellt

# Logging einrichten
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Datenbank initialisieren
Base.metadata.create_all(bind=engine)

# FastAPI-Anwendung erstellen
app = FastAPI(
    title="KI-gesteuertes ERP für Futtermittelherstellung",
    description="ERP-System für die Optimierung der Futtermittelproduktion mit KI-Funktionalitäten",
    version="0.1.0"
)

# CORS-Einstellungen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router registrieren
app.include_router(auth_api.router)
app.include_router(user_api.router)
app.include_router(quality_api.router)
app.include_router(production_api.router)
app.include_router(inventory_api.router)
app.include_router(analytics_api.router)
app.include_router(emergency_api.router)
app.include_router(notification_api.router)

# Weitere Router können hier registriert werden

@app.get("/")
async def root():
    return {
        "message": "Willkommen im KI-gesteuerten ERP für Futtermittelherstellung",
        "version": "0.1.0",
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Stammdatenmodelle-Informationen
@app.get("/api/info")
def api_info():
    """
    Gibt Informationen über die verfügbaren Stammdatenmodelle zurück.
    """
    return {
        "name": "AI-gestütztes ERP-System API",
        "version": "0.1.0",
        "stammdatenmodelle": [
            {
                "name": "Partner",
                "beschreibung": "Partner-Stammdaten (Kunden, Lieferanten, Mitarbeiter)",
                "endpoint": "/api/v1/partner"
            },
            {
                "name": "Artikel",
                "beschreibung": "Artikel-Stammdaten",
                "endpoint": "/api/v1/artikel"
            },
            {
                "name": "Lager",
                "beschreibung": "Lager-Stammdaten",
                "endpoint": "/api/v1/lager"
            },
            {
                "name": "Finanzen",
                "beschreibung": "Finanz-Stammdaten",
                "endpoint": "/api/v1/finanzen"
            },
            {
                "name": "Notfall",
                "beschreibung": "Notfall- und Krisenmanagement",
                "endpoint": "/api/v1/emergency"
            },
            {
                "name": "Anomalieerkennung",
                "beschreibung": "KI-basierte Anomalieerkennung für verschiedene Unternehmensbereiche",
                "endpoint": "/api/v1/anomaly"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    
    # Konfiguration für den Uvicorn-Server
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    
    logger.info(f"Server wird gestartet auf http://{host}:{port}")
    logger.info("API-Dokumentation verfügbar unter: http://localhost:8000/docs")
    
    # Server starten
    uvicorn.run("backend.main:app", host=host, port=port, reload=True) 