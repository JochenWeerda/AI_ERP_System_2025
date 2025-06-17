#!/usr/bin/env python
"""Startpunkt für den MCP Microservice"""
import os
import asyncio
import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.v1 import mcp
from core.config import settings
from utils.register_with_observer import register_service, get_service_data, get_observer_url_from_env

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mcp_service")

app = FastAPI(title="MCP Microservice", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mcp.router, prefix="/api/mcp/v1", tags=["mcp"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    observer_url = get_observer_url_from_env() or settings.observer_service_url
    try:
        await register_service(observer_url, get_service_data())
        logger.info("Beim Observer-Service registriert")
    except Exception as e:
        logger.warning("Registrierung beim Observer-Service fehlgeschlagen: %s", e)


def main():
    port = int(os.environ.get("PORT", settings.port))
    uvicorn.run(app, host="0.0.0.0", port=port)


if __name__ == "__main__":
    main()
