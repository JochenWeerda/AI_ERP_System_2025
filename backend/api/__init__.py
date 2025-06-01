"""
API-Modul-Initialisierung für das modulare ERP-System.
Dieses Modul definiert Router und API-Endpunkte für verschiedene Funktionsbereiche.
"""

from fastapi import APIRouter

# Haupt-Router für alle API-Endpunkte
api_router = APIRouter()

# Router für Batch-Operationen und Performance-Monitoring
try:
    from .batch_api import router as batch_router
    api_router.include_router(batch_router, prefix="/batch", tags=["Batch"])
    print("Batch-API erfolgreich registriert")
except ImportError as e:
    print(f"Batch-API konnte nicht importiert werden: {e}")

try:
    from .performance_api import router as performance_router
    api_router.include_router(performance_router, prefix="/performance", tags=["Performance"])
    print("Performance-API erfolgreich registriert")
except ImportError as e:
    print(f"Performance-API konnte nicht importiert werden: {e}")

# Status-API für Health-Checks und Monitoring
@api_router.get("/status", tags=["System"])
async def status():
    """Grundlegender Statusendpunkt für Health-Checks"""
    return {"status": "online"}
