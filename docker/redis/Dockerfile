FROM redis:7.0-alpine

# Kopiere die benutzerdefinierte Redis-Konfiguration
COPY redis.conf /usr/local/etc/redis/redis.conf

# Erstelle das Verzeichnis für die Redis-Daten
RUN mkdir -p /data

# Port freigeben
EXPOSE 6379

# Health-Check konfigurieren
HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=3 \
    CMD redis-cli ping | grep PONG || exit 1

# Redis mit der benutzerdefinierten Konfiguration starten
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"] 