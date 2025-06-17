# Dockerfile für VALEO NeuroERP AI-Modul
# Dieses Modul ist proprietär und unter VALEO Commercial License lizenziert

FROM python:3.11-slim

# Rechtliche Hinweise und Lizenzinformationen
LABEL maintainer="VALEO GmbH <info@valeo-erp.com>"
LABEL license="VALEO Commercial License"
LABEL description="VALEO NeuroERP AI Module - Proprietäre KI-Erweiterung"

# Arbeitsverzeichnis setzen
WORKDIR /app

# System-Dependencies installieren
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Python-Dependencies installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# KI-Modelldateien kopieren
COPY models/ /app/models/

# Anwendungscode kopieren
COPY src/ /app/src/
COPY config/ /app/config/

# Lizenzdateien und rechtliche Hinweise kopieren
COPY LICENSE.commercial.txt /app/LICENSE.txt
COPY README.md /app/

# Konfigurationsverzeichnis erstellen
RUN mkdir -p /etc/valeo-ai

# Standardkonfiguration kopieren
COPY config/valeo-ai.conf /etc/valeo-ai/

# Benutzer für die Ausführung erstellen (keine Root-Privilegien)
RUN groupadd -r valeo && useradd -r -g valeo valeo
RUN chown -R valeo:valeo /app /etc/valeo-ai

# Port für API freigeben
EXPOSE 8000

# Als nicht-privilegierter Benutzer ausführen
USER valeo

# Anwendung starten
CMD ["python", "-m", "src.main"]

# Proprietärer Lizenzhinweis
# -------------------------------------------------------------------------
# VALEO NeuroERP AI Module
# Copyright (C) 2023-present VALEO GmbH. Alle Rechte vorbehalten.
# 
# Dieses Modul ist proprietäre Software der VALEO GmbH und darf ohne
# gültige Lizenz nicht verwendet, kopiert oder verteilt werden.
# 
# Im Gegensatz zu den LGPL-lizenzierten Core-Komponenten ist dieses Modul
# unter der VALEO Commercial License lizenziert und unterliegt nicht den
# Anforderungen der LGPL.
# 
# VALEO NeuroERP ist eine Marke der VALEO GmbH. 