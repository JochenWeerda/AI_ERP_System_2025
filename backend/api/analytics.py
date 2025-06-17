"""
Modul für die Erfassung und Analyse von Web-Vitals-Metriken
"""
from fastapi import APIRouter, Request, BackgroundTasks, HTTPException
from fastapi.responses import HTMLResponse
import json
import os
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List

router = APIRouter(prefix="/analytics", tags=["analytics"])

# Konstanten
ANALYTICS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "analytics")
WEB_VITALS_FILE = os.path.join(ANALYTICS_DIR, "web_vitals.jsonl")
CONFIG_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "web_vitals_thresholds.json")

# Stelle sicher, dass das Verzeichnis existiert
os.makedirs(ANALYTICS_DIR, exist_ok=True)

# Lade Konfiguration
def load_config():
    """Lädt die Web-Vitals-Konfiguration"""
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        return {
            "thresholds": {
                "CLS": {"good": 0.1, "needs_improvement": 0.25},
                "FID": {"good": 100, "needs_improvement": 300},
                "LCP": {"good": 2500, "needs_improvement": 4000},
                "FCP": {"good": 1800, "needs_improvement": 3000},
                "TTFB": {"good": 800, "needs_improvement": 1800}
            },
            "descriptions": {
                "CLS": "Cumulative Layout Shift - Misst die visuelle Stabilität",
                "FID": "First Input Delay (ms) - Misst die Interaktivität",
                "LCP": "Largest Contentful Paint (ms) - Misst die Ladezeit",
                "FCP": "First Contentful Paint (ms) - Misst die erste Darstellung",
                "TTFB": "Time to First Byte (ms) - Misst die Serverantwortzeit"
            },
            "colors": {
                "good": "#4caf50",
                "needs_improvement": "#ff9800",
                "poor": "#f44336"
            }
        }
    except Exception as e:
        print(f"Fehler beim Laden der Web-Vitals-Konfiguration: {e}")
        return {}

# Modelle
class WebVitalMetric:
    """Repräsentiert eine Web Vitals Metrik"""
    def __init__(self, data: Dict[str, Any], client_info: Dict[str, Any]):
        self.timestamp = datetime.now().isoformat()
        self.name = data.get("name", "unknown")
        self.value = data.get("value", 0)
        self.id = data.get("id", "")
        self.delta = data.get("delta", 0)
        self.client_ip = client_info.get("client_ip", "")
        self.user_agent = client_info.get("user_agent", "")
        
    def to_dict(self) -> Dict[str, Any]:
        """Konvertiert die Metrik in ein Dictionary"""
        return {
            "timestamp": self.timestamp,
            "name": self.name,
            "value": self.value,
            "id": self.id,
            "delta": self.delta,
            "client_ip": self.client_ip,
            "user_agent": self.user_agent
        }

async def save_web_vital(metric: Dict[str, Any], client_info: Dict[str, Any]):
    """Speichert eine Web Vital Metrik im Hintergrund"""
    try:
        web_vital = WebVitalMetric(metric, client_info)
        
        # Speichere die Metrik im JSONL-Format (eine JSON-Zeile pro Eintrag)
        with open(WEB_VITALS_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(web_vital.to_dict()) + "\n")
    except Exception as e:
        print(f"Fehler beim Speichern der Web Vital Metrik: {e}")

@router.post("/web-vitals")
async def record_web_vital(request: Request, background_tasks: BackgroundTasks):
    """
    Endpunkt zum Speichern von Web Vitals Metriken
    
    Die Metriken werden asynchron im Hintergrund gespeichert, um die Antwortzeit zu minimieren.
    """
    try:
        metric = await request.json()
        
        # Validierung der Metrik
        if not isinstance(metric, dict):
            return {"status": "error", "message": "Ungültiges Metrik-Format. Ein JSON-Objekt wird erwartet."}
        
        required_fields = ["name", "value"]
        for field in required_fields:
            if field not in metric:
                return {"status": "error", "message": f"Fehlendes Pflichtfeld: {field}"}
        
        # Prüfe, ob die Metrik einen gültigen Namen hat
        valid_metrics = ["CLS", "FID", "LCP", "FCP", "TTFB"]
        if metric.get("name") not in valid_metrics:
            return {"status": "error", "message": f"Ungültiger Metrik-Name. Erlaubt sind: {', '.join(valid_metrics)}"}
        
        # Client-Informationen sammeln
        client_info = {
            "client_ip": request.client.host if request.client else "",
            "user_agent": request.headers.get("user-agent", "")
        }
        
        # Im Hintergrund speichern
        background_tasks.add_task(save_web_vital, metric, client_info)
        
        return {"status": "success"}
    except json.JSONDecodeError:
        return {"status": "error", "message": "Ungültiges JSON-Format"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/web-vitals/summary")
async def get_web_vitals_summary():
    """
    Liefert eine Zusammenfassung der Web Vitals Metriken
    """
    try:
        if not os.path.exists(WEB_VITALS_FILE):
            return {"status": "success", "data": {"metrics": {}}}
            
        metrics = {"CLS": [], "FID": [], "LCP": [], "FCP": [], "TTFB": []}
        timestamps = []
        
        with open(WEB_VITALS_FILE, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    data = json.loads(line.strip())
                    name = data.get("name")
                    if name in metrics:
                        metrics[name].append(data.get("value", 0))
                        
                    # Sammle Timestamps für die Zeitfilterung
                    if "timestamp" in data:
                        timestamps.append(data["timestamp"])
                except:
                    continue
        
        # Berechne Durchschnitt für jede Metrik
        summary = {}
        for name, values in metrics.items():
            if values:
                summary[name] = {
                    "avg": sum(values) / len(values),
                    "min": min(values),
                    "max": max(values),
                    "count": len(values),
                    "p75": sorted(values)[int(len(values) * 0.75)] if len(values) > 3 else None,
                    "values": values[-20:] if len(values) > 20 else values  # Letzte 20 Werte für Grafiken
                }
            else:
                summary[name] = {"count": 0}
                
        # Metadaten
        metadata = {
            "total_records": sum(len(v) for v in metrics.values()),
            "first_record": min(timestamps) if timestamps else None,
            "last_record": max(timestamps) if timestamps else None
        }
        
        return {
            "status": "success", 
            "data": {
                "metrics": summary,
                "metadata": metadata
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/web-vitals/dashboard", response_class=HTMLResponse)
async def web_vitals_dashboard():
    """
    Liefert ein einfaches Dashboard zur Visualisierung der Web Vitals Metriken
    """
    try:
        summary_response = await get_web_vitals_summary()
        if summary_response.get("status") != "success":
            raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Metriken")
            
        metrics_data = summary_response.get("data", {}).get("metrics", {})
        metadata = summary_response.get("data", {}).get("metadata", {})
        
        # Lade die Konfiguration
        config = load_config()
        thresholds = config.get("thresholds", {})
        descriptions = config.get("descriptions", {})
        colors = config.get("colors", {})
        
        # Einfaches HTML-Dashboard erstellen
        html_content = """
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Web Vitals Dashboard</title>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .header {
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .metric-card {
                    background-color: white;
                    border-radius: 8px;
                    padding: 15px;
                    box-shadow: 0 1px 5px rgba(0,0,0,0.05);
                }
                .metric-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .metric-title {
                    font-size: 18px;
                    font-weight: bold;
                }
                .metric-value {
                    font-size: 24px;
                    font-weight: bold;
                }
                .chart-container {
                    height: 200px;
                }
                .good {
                    color: """ + colors.get("good", "#4caf50") + """;
                }
                .needs-improvement {
                    color: """ + colors.get("needs_improvement", "#ff9800") + """;
                }
                .poor {
                    color: """ + colors.get("poor", "#f44336") + """;
                }
                .metadata {
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 20px;
                }
                .refresh-button {
                    background-color: #4a7c59;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .refresh-button:hover {
                    background-color: #3a6247;
                }
                .metric-details {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-top: 10px;
                }
                .detail-item {
                    font-size: 14px;
                }
                .detail-label {
                    font-weight: bold;
                    color: #666;
                }
                .filter-controls {
                    margin-bottom: 20px;
                    padding: 15px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    align-items: center;
                }
                .filter-control {
                    display: flex;
                    flex-direction: column;
                }
                .filter-label {
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .filter-select, .filter-button {
                    padding: 8px;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                }
                .filter-button {
                    background-color: #4a7c59;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
                .filter-button:hover {
                    background-color: #3a6247;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Web Vitals Dashboard</h1>
                    <p>Übersicht der Performance-Metriken der Anwendung</p>
                </div>
                
                <div class="filter-controls">
                    <div class="filter-control">
                        <label class="filter-label" for="time-filter">Zeitraum</label>
                        <select id="time-filter" class="filter-select">
                            <option value="1">Letzter Tag</option>
                            <option value="7" selected>Letzte Woche</option>
                            <option value="30">Letzter Monat</option>
                            <option value="90">Letzte 3 Monate</option>
                            <option value="365">Letztes Jahr</option>
                        </select>
                    </div>
                    <div class="filter-control">
                        <label class="filter-label" for="metric-filter">Metrik</label>
                        <select id="metric-filter" class="filter-select">
                            <option value="">Alle Metriken</option>
                            <option value="CLS">CLS (Layout Shift)</option>
                            <option value="FID">FID (Input Delay)</option>
                            <option value="LCP">LCP (Content Paint)</option>
                            <option value="FCP">FCP (First Paint)</option>
                            <option value="TTFB">TTFB (Time to First Byte)</option>
                        </select>
                    </div>
                    <div class="filter-control">
                        <label class="filter-label">&nbsp;</label>
                        <button id="apply-filter" class="filter-button">Filter anwenden</button>
                    </div>
                    <div class="filter-control">
                        <label class="filter-label">&nbsp;</label>
                        <button id="refresh-data" class="filter-button">Daten aktualisieren</button>
                    </div>
                </div>
                
                <div class="metrics-grid">
        """
        
        # Funktionen zur Bewertung der Metriken basierend auf der Konfiguration
        def get_rating(metric_name, value):
            if metric_name not in thresholds:
                return ""
                
            threshold = thresholds[metric_name]
            if value <= threshold.get("good", 0):
                return "good"
            elif value <= threshold.get("needs_improvement", 0):
                return "needs-improvement"
            return "poor"
        
        # Metrik-Karten erstellen
        for metric_name, metric_data in metrics_data.items():
            if metric_data.get("count", 0) > 0:
                avg_value = metric_data.get("avg", 0)
                rating_class = get_rating(metric_name, avg_value)
                description = descriptions.get(metric_name, f"Leistungsmetrik: {metric_name}")
                
                html_content += f"""
                <div class="metric-card" data-metric="{metric_name}">
                    <div class="metric-header">
                        <div class="metric-title">{metric_name}</div>
                        <div class="metric-value {rating_class}">{avg_value:.2f}</div>
                    </div>
                    <p>{description}</p>
                    <div class="chart-container">
                        <canvas id="{metric_name.lower()}-chart"></canvas>
                    </div>
                    <div class="metric-details">
                        <div class="detail-item">
                            <span class="detail-label">Min:</span> {metric_data.get("min", 0):.2f}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Max:</span> {metric_data.get("max", 0):.2f}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">P75:</span> {metric_data.get("p75", 0):.2f if metric_data.get("p75") is not None else "N/A"}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Anzahl:</span> {metric_data.get("count", 0)}
                        </div>
                    </div>
                </div>
                """
        
        # Metadaten
        html_content += """
                </div>
                
                <div class="metadata">
                    <h3>Metadaten</h3>
        """
        
        total_records = metadata.get("total_records", 0)
        first_record = metadata.get("first_record", "Keine Daten")
        last_record = metadata.get("last_record", "Keine Daten")
        
        html_content += f"""
                    <p><strong>Gesamtanzahl der Metriken:</strong> {total_records}</p>
                    <p><strong>Erste Aufzeichnung:</strong> {first_record}</p>
                    <p><strong>Letzte Aufzeichnung:</strong> {last_record}</p>
                </div>
            </div>
            
            <script>
                // Chart.js-Konfiguration
                const chartOptions = {{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {{
                        y: {{
                            beginAtZero: true
                        }}
                    }}
                }};
                
                // Farben für die Diagramme
                const chartColors = {{
                    CLS: 'rgba(54, 162, 235, 0.5)',
                    FID: 'rgba(255, 99, 132, 0.5)',
                    LCP: 'rgba(75, 192, 192, 0.5)',
                    FCP: 'rgba(255, 159, 64, 0.5)',
                    TTFB: 'rgba(153, 102, 255, 0.5)'
                }};
                
                // Chart-Objekte
                const charts = {{}};
        """
        
        # JavaScript für die Diagramme
        for metric_name, metric_data in metrics_data.items():
            if metric_data.get("count", 0) > 0 and "values" in metric_data:
                values = metric_data["values"]
                value_str = ", ".join(str(v) for v in values)
                
                html_content += f"""
                // {metric_name} Chart
                charts['{metric_name}'] = new Chart(document.getElementById('{metric_name.lower()}-chart'), {{
                    type: 'line',
                    data: {{
                        labels: Array.from({{length: {len(values)}}}, (_, i) => i + 1),
                        datasets: [{{
                            label: '{metric_name}',
                            data: [{value_str}],
                            backgroundColor: chartColors.{metric_name} || 'rgba(75, 192, 192, 0.5)',
                            borderColor: chartColors.{metric_name} || 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            tension: 0.1
                        }}]
                    }},
                    options: chartOptions
                }});
                """
        
        # Filter-Funktionalität
        html_content += """
                // Filter-Funktionalität
                document.getElementById('apply-filter').addEventListener('click', function() {
                    applyFilters();
                });
                
                document.getElementById('refresh-data').addEventListener('click', function() {
                    window.location.reload();
                });
                
                function applyFilters() {
                    const days = document.getElementById('time-filter').value;
                    const metric = document.getElementById('metric-filter').value;
                    
                    // API-Aufruf zum Filtern der Daten
                    fetch(`/api/analytics/web-vitals/filter?days=${days}${metric ? `&metric=${metric}` : ''}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 'success') {
                                updateFilteredView(data, metric);
                            } else {
                                alert('Fehler beim Filtern der Daten: ' + (data.message || 'Unbekannter Fehler'));
                            }
                        })
                        .catch(error => {
                            console.error('Fehler beim Filtern:', error);
                            alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
                        });
                }
                
                function updateFilteredView(data, metricFilter) {
                    // Verarbeite die gefilterten Daten
                    const metricCards = document.querySelectorAll('.metric-card');
                    
                    // Alle Karten ausblenden oder anzeigen je nach Filter
                    metricCards.forEach(card => {
                        const cardMetric = card.getAttribute('data-metric');
                        if (metricFilter && cardMetric !== metricFilter) {
                            card.style.display = 'none';
                        } else {
                            card.style.display = 'block';
                        }
                    });
                    
                    // Aktualisiere die Metadaten
                    const metadataSection = document.querySelector('.metadata');
                    metadataSection.innerHTML = `
                        <h3>Metadaten (Gefiltert)</h3>
                        <p><strong>Anzahl der gefilterten Metriken:</strong> ${data.count}</p>
                        <p><strong>Filter:</strong> ${data.filter.days} Tage${metricFilter ? `, nur ${metricFilter}` : ''}</p>
                    `;
                }
            </script>
        </body>
        </html>
        """
        
        return HTMLResponse(content=html_content)
    except Exception as e:
        return HTMLResponse(content=f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Fehler</title>
            <style>
                body {{ font-family: Arial, sans-serif; padding: 20px; }}
                .error-container {{ 
                    background-color: #ffebee; 
                    padding: 20px; 
                    border-radius: 8px;
                    max-width: 800px;
                    margin: 0 auto;
                }}
                h1 {{ color: #d32f2f; }}
            </style>
        </head>
        <body>
            <div class="error-container">
                <h1>Fehler beim Laden des Dashboards</h1>
                <p>{str(e)}</p>
                <button onclick="window.location.reload()">Erneut versuchen</button>
            </div>
        </body>
        </html>
        """)

@router.get("/web-vitals/filter")
async def filter_web_vitals(days: int = 7, metric: Optional[str] = None):
    """
    Filtert Web Vitals Metriken nach Zeitraum und Metrik-Typ
    """
    try:
        if not os.path.exists(WEB_VITALS_FILE):
            return {"status": "success", "data": []}
            
        filtered_metrics = []
        cutoff_date = datetime.now() - timedelta(days=days)
        
        with open(WEB_VITALS_FILE, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    data = json.loads(line.strip())
                    
                    # Zeitfilter
                    timestamp_str = data.get("timestamp", "")
                    if timestamp_str:
                        try:
                            record_date = datetime.fromisoformat(timestamp_str)
                            if record_date < cutoff_date:
                                continue
                        except ValueError:
                            continue
                    
                    # Metrik-Typ-Filter
                    if metric and data.get("name") != metric:
                        continue
                        
                    filtered_metrics.append(data)
                except:
                    continue
        
        return {
            "status": "success", 
            "data": filtered_metrics,
            "count": len(filtered_metrics),
            "filter": {
                "days": days,
                "metric": metric
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)} 