#!/usr/bin/env python
"""
Finance-Microservice für das ERP-System
Hauptmodul für den Start des Dienstes
"""

import os
import sys
import logging
import asyncio
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import psutil
import time
from datetime import datetime, timedelta

# Lokale Module importieren
from core.config import settings
# Nur das System-Modul importieren, LLM weglassen, um Abhängigkeiten zu reduzieren
from api.v1 import system
from utils.register_with_observer import register_service, get_service_data

# Observability-Modul importieren
from finance_observability import finance_observability, get_logger

# Logger initialisieren
logger = get_logger() or logging.getLogger("finance_service")

# Logging für nicht-strukturiertes Logging konfigurieren, falls strukturiertes Logging nicht verfügbar
if not hasattr(logger, "bind"):
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("finance_service.log")
        ]
    )
    logger = logging.getLogger("finance_service")

# Globale Metriken
start_time = time.time()
request_count = 0
error_count = 0
request_times = []

# FastAPI-App erstellen
app = FastAPI(
    title="Finance-Microservice",
    description="Microservice für Finanz- und Buchhaltungsprozesse",
    version="0.1.0"
)

# Observability initialisieren
finance_observability.init_app(app)

# CORS-Middleware hinzufügen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Für Produktion einschränken
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router registrieren
# Nur den System-Router registrieren
app.include_router(system.router, prefix="/api/v1/finanzen", tags=["System"])

# Middleware für Metriken - nicht benötigt, da durch finance_observability abgedeckt
# Behalten wir die Health-Checks bei, da sie spezifische Logik enthalten

@app.get("/health")
async def health_check():
    """
    Endpoint für Gesundheitsüberprüfung und Metriken.
    Gibt den Status des Service und grundlegende Metriken zurück.
    """
    global start_time, request_count, error_count, request_times
    
    # Systemmetriken abrufen
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory_info = psutil.virtual_memory()
    
    # Durchschnittliche Antwortzeit berechnen
    avg_response_time = sum(request_times) / len(request_times) if request_times else 0
    
    # Fehlerrate berechnen
    error_rate = (error_count / request_count) * 100 if request_count > 0 else 0
    
    # Laufzeit berechnen
    uptime_seconds = time.time() - start_time
    uptime = str(timedelta(seconds=int(uptime_seconds)))
    
    # Metriken zusammenstellen
    metrics = {
        "status": "healthy",
        "uptime": uptime,
        "timestamp": datetime.now().isoformat(),
        "metrics": {
            "cpu_usage_percent": cpu_percent,
            "memory_usage_percent": memory_info.percent,
            "total_requests": request_count,
            "error_count": error_count,
            "error_rate_percent": error_rate,
            "average_response_time_ms": avg_response_time * 1000,  # Umrechnung in ms
        }
    }
    
    return metrics

@app.get("/ready")
async def readiness_check():
    """
    Endpoint für Bereitschaftsprüfung.
    Prüft, ob der Service bereit ist, Anfragen zu verarbeiten.
    """
    return {"status": "ready", "service": "finance-service"}

@app.on_event("startup")
async def startup_event():
    """Ereignishandler für den Start des Services"""
    logger.info("Finance-Microservice wird gestartet...")
    
    # Beispiel für die Verwendung der Observability-Metriken
    finance_observability.set_active_accounts("asset", 0)
    finance_observability.set_active_accounts("liability", 0)
    finance_observability.set_active_accounts("equity", 0)
    finance_observability.set_active_accounts("revenue", 0)
    finance_observability.set_active_accounts("expense", 0)
    
    finance_observability.set_transaction_queue_size("high", 0)
    finance_observability.set_transaction_queue_size("normal", 0)
    finance_observability.set_transaction_queue_size("low", 0)
    
    # Bei Observer-Service registrieren
    observer_url = os.environ.get("OBSERVER_SERVICE_URL", "http://localhost:8010/register")
    try:
        service_data = get_service_data()
        # Asynchron registrieren (im Hintergrund)
        asyncio.create_task(register_service(observer_url, service_data))
        logger.info("Registrierung beim Observer-Service eingeleitet", observer_url=observer_url)
    except Exception as e:
        logger.warning("Konnte nicht beim Observer-Service registrieren", error=str(e))
    
    logger.info("Finance-Microservice ist bereit")

@app.on_event("shutdown")
async def shutdown_event():
    """Ereignishandler für das Herunterfahren des Services"""
    logger.info("Finance-Microservice wird heruntergefahren...")

def main():
    """Hauptfunktion zum Starten des Services"""
    port = int(os.environ.get("PORT", "8007"))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"Finanzmodul-Server wird gestartet...")
    print(f"Server läuft auf http://localhost:{port}")
    print(f"Endpunkte verfügbar unter: http://localhost:{port}/api/v1/finanzen/...")
    print(f"Metriken verfügbar unter: http://localhost:{port}/metrics")
    print(f"Health-Check verfügbar unter: http://localhost:{port}/health")
    
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    main() 