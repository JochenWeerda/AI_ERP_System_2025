# Kubernetes-basiertes ERP-System Backup

Dieses Backup wurde am 12.06.2025 erstellt, bevor auf eine Odoo-basierte Lösung umgestellt wurde.

## Enthaltene Komponenten

- **Microservices**: API-Gateway, Artikel-Stammdaten, Einheiten-Service, Beleg-Service, Finance-Service, Document-Service
- **Frontend**: Valeo-Dashboard
- **Datenbanken**: MongoDB, PostgreSQL
- **Monitoring**: Prometheus, Grafana, Jaeger, Alertmanager

## Status bei Backup-Erstellung

- Dashboard funktioniert über NodePort 30190
- API-Gateway funktioniert, aber einige Routen fehlen
- Artikel-Service wurde konfiguriert, aber hat noch Verbindungsprobleme
- Einheiten-Service wurde erstellt, aber nicht vollständig getestet
- Alle ConfigMaps für die Services wurden erstellt

## Wiederherstellung

Um dieses Backup wiederherzustellen, können die YAML-Dateien mit `kubectl apply -f` angewendet werden.

## Bekannte Probleme

- Port-Forwarding funktioniert nicht zuverlässig
- Einige Services können nicht erreicht werden
- Dashboard hat Probleme mit der Anzeige von Stammdaten
- API-Gateway-Routen sind nicht vollständig konfiguriert 