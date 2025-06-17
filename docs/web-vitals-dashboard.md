# Web Vitals Dashboard

Das Web Vitals Dashboard ist ein leistungsstarkes Tool zur Überwachung und Analyse der Performance-Metriken Ihrer Web-Anwendung. Es basiert auf den [Core Web Vitals](https://web.dev/vitals/) von Google und bietet einen umfassenden Einblick in die Benutzererfahrung Ihrer Anwendung.

## Zugriff auf das Dashboard

Das Dashboard ist unter folgender URL verfügbar, wenn der Backend-Server läuft:

```
http://localhost:8003/api/analytics/web-vitals/dashboard
```

## Überblick über die erfassten Metriken

Das Dashboard erfasst und visualisiert die folgenden Metriken:

| Metrik | Beschreibung | Gute Werte | Optimierungsbedarf | Schlechte Werte |
|--------|--------------|------------|-------------------|----------------|
| **CLS** | Cumulative Layout Shift - Misst die visuelle Stabilität | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| **FID** | First Input Delay - Misst die Interaktivität (in ms) | ≤ 100ms | ≤ 300ms | > 300ms |
| **LCP** | Largest Contentful Paint - Misst die Ladezeit (in ms) | ≤ 2500ms | ≤ 4000ms | > 4000ms |
| **FCP** | First Contentful Paint - Misst die erste Darstellung (in ms) | ≤ 1800ms | ≤ 3000ms | > 3000ms |
| **TTFB** | Time to First Byte - Misst die Serverantwortzeit (in ms) | ≤ 800ms | ≤ 1800ms | > 1800ms |

## Funktionen des Dashboards

### 1. Visualisierung der Metriken

Das Dashboard zeigt für jede Metrik:
- Den aktuellen Durchschnittswert mit farblicher Bewertung
- Einen Liniendiagramm mit den letzten Messwerten
- Weitere Statistiken wie Minimum, Maximum und 75. Perzentil

### 2. Filterung der Daten

Sie können die angezeigten Daten filtern nach:
- **Zeitraum**: Letzter Tag, letzte Woche, letzter Monat, letzte 3 Monate, letztes Jahr
- **Metrik**: Fokussierung auf eine bestimmte Metrik (CLS, FID, LCP, FCP, TTFB)

### 3. Metadaten

Im unteren Bereich des Dashboards werden Metadaten angezeigt:
- Gesamtanzahl der erfassten Metriken
- Zeitstempel der ersten und letzten Aufzeichnung
- Bei gefilterten Ansichten: Informationen über die angewendeten Filter

## Anpassung der Bewertungskriterien

Die Schwellenwerte für die Bewertung der Metriken können in der Konfigurationsdatei angepasst werden:

```
backend/config/web_vitals_thresholds.json
```

## Integration in Ihre Anwendung

Die Web Vitals werden automatisch erfasst, wenn Ihre Anwendung läuft. Die Daten werden im Browser gemessen und an den Backend-Server gesendet.

### Erfassung im Frontend

Der folgende Code in `index.jsx` und `index.tsx` sorgt für die Erfassung der Metriken:

```javascript
reportWebVitals((metric) => {
  // Protokolliere in der Konsole während der Entwicklung
  console.log(metric);
  
  // Im Produktionsumfeld werden die Metriken an einen Analytics-Dienst gesendet
  if (import.meta.env.PROD) {
    const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
    if (analyticsEndpoint) {
      fetch(analyticsEndpoint, {
        method: 'POST',
        body: JSON.stringify(metric),
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
});
```

### API-Endpunkte

Das Dashboard bietet folgende API-Endpunkte:

- `POST /api/analytics/web-vitals`: Zum Senden neuer Metrik-Daten
- `GET /api/analytics/web-vitals/summary`: Abrufen einer Zusammenfassung aller Metriken
- `GET /api/analytics/web-vitals/filter?days=7&metric=LCP`: Gefilterte Metriken abrufen
- `GET /api/analytics/web-vitals/dashboard`: Das Dashboard selbst anzeigen

## Fehlerbehebung

Wenn keine Daten angezeigt werden:

1. Prüfen Sie, ob die Anwendung tatsächlich läuft und Metriken erfasst werden
2. Stellen Sie sicher, dass der Backend-Server läuft und erreichbar ist
3. Überprüfen Sie, ob der Analytics-Endpunkt korrekt konfiguriert ist
4. Prüfen Sie die Browser-Konsole auf Fehler bei der Übertragung der Metriken

## Best Practices für gute Web Vitals

### Cumulative Layout Shift (CLS) verbessern
- Fügen Sie Größenattribute zu Bildern und Video-Elementen hinzu
- Reservieren Sie Platz für Werbung und eingebettete Inhalte
- Vermeiden Sie das dynamische Einfügen von Inhalten über bestehenden Inhalten

### First Input Delay (FID) verbessern
- Reduzieren Sie JavaScript-Ausführungszeit
- Brechen Sie lange Aufgaben auf
- Verwenden Sie Web Workers für aufwändige Berechnungen
- Minimieren Sie unnötige JavaScript-Pakete

### Largest Contentful Paint (LCP) verbessern
- Optimieren Sie Bilder und komprimieren Sie Dateien
- Implementieren Sie Lazy Loading für Inhalte außerhalb des Viewports
- Minimieren Sie CSS-Blockierungen
- Verwenden Sie Server-Side Rendering oder Statische Generierung

### First Contentful Paint (FCP) verbessern
- Optimieren Sie den kritischen Rendering-Pfad
- Minimieren Sie Render-blockierende Ressourcen
- Implementieren Sie HTTP-Caching
- Verwenden Sie CDN für statische Assets

### Time to First Byte (TTFB) verbessern
- Optimieren Sie die Serverantwortzeit
- Implementieren Sie Caching auf Serverseite
- Verwenden Sie einen CDN-Dienst
- Optimieren Sie Datenbankabfragen 