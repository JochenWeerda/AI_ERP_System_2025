"""
API-Modul für Analytics und Web Vitals

Dieses Modul stellt Endpunkte für die Erfassung und Analyse von Web Vitals
und anderen Nutzungsstatistiken bereit.
"""

from fastapi import APIRouter, HTTPException
from .analytics import router as analytics_router

# Router-Instanz erstellen
router = APIRouter(prefix="/api", tags=["analytics"])

# Analytics-Router einbinden
router.include_router(analytics_router)

# Zusätzliche Endpunkte für die Analyse der Nutzung können hier definiert werden
@router.get("/analytics/info")
async def analytics_info():
    """Liefert Informationen über die verfügbaren Analytics-Endpunkte"""
    return {
        "status": "active",
        "endpoints": {
            "web_vitals": "/api/analytics/web-vitals",
            "summary": "/api/analytics/web-vitals/summary"
        },
        "description": "API für die Erfassung und Analyse von Web Vitals und Nutzungsstatistiken"
    } 