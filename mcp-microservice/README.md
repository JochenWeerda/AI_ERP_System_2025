# MCP Microservice

Dieser Microservice implementiert das Model Context Protocol (MCP) zur Integration von KI-Modellen in das VALEO NeuroERP. Er stellt REST-Endpunkte bereit, um Texte zu verarbeiten und Kontextinformationen aus dem ERP-System bereitzustellen.

## Funktionen
- `/api/mcp/v1/completions` – Generiert Texte über ein angebundenes LLM
- `/api/mcp/v1/embeddings` – Erstellt Text-Embeddings

Der Service registriert sich beim Observer-Service, sofern die Umgebungsvariable `OBSERVER_SERVICE_URL` gesetzt ist.

## Starten
```bash
cd mcp-microservice
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8015
```
