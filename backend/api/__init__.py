"""
API-Module für das AI-gestützte ERP-System.

Dieses Paket enthält alle API-Routen für das ERP-System.
"""

# Import der API-Router
from fastapi import APIRouter
from .partner_api import router as partner_router
from .emergency_api import router as emergency_router
from .anomaly_api import router as anomaly_router
from .users_api import router as users_router
from .emergencies_api import router as emergencies_router
from .notifications_api import router as notifications_router
from .customers_api import router as customers_router
from .safety_api import router as safety_router

# Exportiere alle wichtigen Router
__all__ = [
    'partner_router',
    'emergency_router',
    'anomaly_router',
    'users_router',
    'emergencies_router',
    'notifications_router',
    'customers_router',
    'safety_router',
]

api_router = APIRouter()
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(emergencies_router, prefix="/emergencies", tags=["emergencies"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
api_router.include_router(customers_router, prefix="/customers", tags=["customers"])
api_router.include_router(safety_router, prefix="/safety", tags=["safety"]) 