# Dockerfile für Finance-Microservice
FROM python:3.11-slim

WORKDIR /app

# Systemabhängigkeiten installieren
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Python-Abhängigkeiten kopieren und installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Anwendungscode kopieren
COPY simple_finance_server.py .

# Port freigeben
EXPOSE 8000

# Umgebungsvariable für den Port setzen (kann bei Bedarf überschrieben werden)
ENV PORT=8000

# Startbefehl
CMD ["python", "simple_finance_server.py", "${PORT}"] 