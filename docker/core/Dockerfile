# Dockerfile für VALEO NeuroERP Core
# Zweistufiger Build für optimale Image-Größe

# Build-Stage
FROM python:3.11-slim AS builder

# Arbeitsverzeichnis setzen
WORKDIR /build

# Build-Dependencies installieren
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    build-essential \
    libldap2-dev \
    libsasl2-dev \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Python-Umgebung vorbereiten
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Requirements installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Source-Code klonen (in der Praxis würde hier der Fork heruntergeladen)
RUN git clone https://github.com/odoo/odoo.git --depth=1 --branch=17.0 /build/erp-source

# LGPL-Lizenzdatei kopieren (wichtig für rechtliche Konformität)
COPY LICENSE.txt /build/LICENSE.txt

# Rebranding durchführen
COPY rebrand.py /build/
RUN python rebrand.py /build/erp-source

# Runtime-Stage
FROM python:3.11-slim

# Rechtliche Hinweise und Lizenzinformationen
LABEL maintainer="VALEO GmbH <info@valeo-erp.com>"
LABEL license="LGPLv3 for core components"
LABEL description="VALEO NeuroERP Core - Enterprise Resource Planning"

# Arbeitsverzeichnis setzen
WORKDIR /app

# Runtime-Dependencies installieren
RUN apt-get update && apt-get install -y --no-install-recommends \
    libldap-2.4-2 \
    libsasl2-2 \
    libpq5 \
    fonts-liberation \
    ttf-dejavu \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Virtuelles Python-Environment aus dem Builder kopieren
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Core-Dateien kopieren
COPY --from=builder /build/erp-source /app/core
COPY --from=builder /build/LICENSE.txt /app/LICENSE.txt

# Lizenztexte und rechtliche Hinweise kopieren
COPY legal/README.legal.md /app/
COPY legal/COPYRIGHT /app/
COPY legal/NOTICE /app/

# Konfigurationsverzeichnis erstellen
RUN mkdir -p /etc/valeo

# Standardkonfiguration kopieren
COPY config/valeo.conf /etc/valeo/

# Benutzer für die Ausführung erstellen (keine Root-Privilegien)
RUN groupadd -r valeo && useradd -r -g valeo valeo
RUN chown -R valeo:valeo /app /etc/valeo

# Ports freigeben
EXPOSE 8069

# Verzeichnisse für Daten
VOLUME ["/var/lib/valeo/filestore", "/var/lib/valeo/sessions"]

# Als nicht-privilegierter Benutzer ausführen
USER valeo

# Start-Skript ausführen
COPY entrypoint.sh /app/
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["--config=/etc/valeo/valeo.conf"]

# Hinweis auf LGPL-Lizenz und Quellcode-Verfügbarkeit
# Dieser Hinweis ist wichtig für die rechtliche Konformität mit LGPL
# -------------------------------------------------------------------------
# Dieses Image enthält Komponenten, die unter der LGPLv3 lizenziert sind.
# Der Quellcode dieser Komponenten ist verfügbar unter:
# https://github.com/valeo/neuro-erp-core
# 
# Änderungen am ursprünglichen Code sind im Repository dokumentiert.
# Gemäß LGPL-Lizenz stellt VALEO sicher, dass Benutzer Zugang zum 
# modifizierten Quellcode haben und die Freiheit besitzen, diesen
# zu modifizieren und zu verteilen. 