#!/usr/bin/env python
"""Registriert den MCP Microservice beim Observer-Service"""
import os
import asyncio
import httpx
from typing import Dict, Any, Optional
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type, RetryError


@retry(stop=stop_after_attempt(5), wait=wait_fixed(3),
       retry=retry_if_exception_type((httpx.HTTPError, httpx.ConnectError, httpx.TimeoutException)),
       reraise=True)
async def register_service(observer_url: str, service_data: Dict[str, Any]) -> None:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(observer_url, json=service_data, headers={"Content-Type": "application/json"})
        response.raise_for_status()


def get_service_data() -> Dict[str, Any]:
    return {
        "service_name": "mcp-service",
        "service_type": "microservice",
        "version": os.environ.get("SERVICE_VERSION", "0.1.0"),
        "host": "localhost",
        "port": int(os.environ.get("PORT", "8015")),
        "health_endpoint": "/health",
        "api_endpoints": [
            "/api/mcp/v1/completions",
            "/api/mcp/v1/embeddings"
        ],
    }


def get_observer_url_from_env() -> Optional[str]:
    return os.environ.get("OBSERVER_SERVICE_URL")


async def main() -> None:
    observer_url = get_observer_url_from_env()
    if not observer_url:
        print("Keine OBSERVER_SERVICE_URL definiert. Überspringe Registrierung.")
        return
    try:
        await register_service(observer_url, get_service_data())
    except RetryError:
        print("WARNUNG: Registrierung beim Observer-Service fehlgeschlagen")


if __name__ == "__main__":
    asyncio.run(main())
