# Dockerfile für Web-Vitals-Service
# Zweistufiger Build für optimale Image-Größe

# Build-Stage
FROM node:18-alpine AS builder

# Arbeitsverzeichnis setzen
WORKDIR /build

# Build-Dependencies installieren
RUN apk add --no-cache python3 make g++

# Package-Dateien kopieren
COPY modules/web-vitals-service/package*.json ./

# Dependencies installieren
RUN npm ci --only=production

# Service-Dateien kopieren
COPY modules/web-vitals-service/ ./

# Runtime-Stage
FROM node:18-alpine

# Rechtliche Hinweise und Lizenzinformationen
LABEL maintainer="VALEO GmbH <info@valeo-erp.com>"
LABEL license="LGPLv3"
LABEL description="VALEO NeuroERP Web Vitals Service - Performance-Metriken und Dashboard"

# Arbeitsverzeichnis setzen
WORKDIR /app

# Runtime-Dependencies installieren
RUN apk add --no-cache tzdata

# Zeitzone setzen
ENV TZ=Europe/Berlin

# Node in Produktion ausführen
ENV NODE_ENV=production

# Dateien aus dem Builder kopieren
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/src ./src
COPY --from=builder /build/config ./config
COPY --from=builder /build/schemas ./schemas
COPY --from=builder /build/dashboard ./dashboard
COPY --from=builder /build/package.json ./

# Sicherheitsrelevante Konfigurationen
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs
USER 1001

# Datenverzeichnis für Metriken erstellen
RUN mkdir -p /app/data/analytics
VOLUME ["/app/data/analytics"]

# Port freigeben
EXPOSE 8085

# Health-Check konfigurieren
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://localhost:8085/health || exit 1

# Anwendung starten
CMD ["node", "src/index.js"] 