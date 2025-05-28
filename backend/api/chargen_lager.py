"""
API-Funktionen für die Chargen-Lager-Integration.
"""

from starlette.responses import JSONResponse
from datetime import datetime, UTC
from backend.cache_manager import cache

# Demo-Daten für die Chargen-Lager-Integration (werden in minimal_server.py überschrieben)
chargen_lager_bewegungen = []
chargen_reservierungen = []
chargen = []
lager = []
lagerorte = []

@cache.cached(ttl=180)
async def get_chargen_lager_bewegungen(request):
    """Alle Chargen-Lagerbewegungen abrufen"""
    charge_id = request.query_params.get("charge_id")
    lager_id = request.query_params.get("lager_id")
    
    results = chargen_lager_bewegungen.copy()
    
    if charge_id:
        charge_id = int(charge_id)
        results = [clb for clb in results if clb["charge_id"] == charge_id]
    
    if lager_id:
        lager_id = int(lager_id)
        results = [clb for clb in results if clb["lager_id"] == lager_id]
    
    return JSONResponse(results)

@cache.cached(ttl=180)
async def get_chargen_lager_bewegung_by_id(request):
    """Eine spezifische Chargen-Lagerbewegung abrufen"""
    bewegung_id = int(request.path_params["id"])
    result = next((clb for clb in chargen_lager_bewegungen if clb["id"] == bewegung_id), None)
    if result:
        return JSONResponse(result)
    return JSONResponse({"error": "Chargen-Lagerbewegung nicht gefunden"}, status_code=404)

async def create_chargen_lager_bewegung(request):
    """Neue Chargen-Lagerbewegung erstellen"""
    data = await request.json()
    
    # Pflichtfelder prüfen
    required_fields = ["charge_id", "lager_id", "bewegungs_typ", "menge", "einheit_id"]
    for field in required_fields:
        if field not in data:
            return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
    
    # Prüfen, ob die Charge existiert
    charge = next((c for c in chargen if c["id"] == data["charge_id"]), None)
    if not charge:
        return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
    
    # Prüfen, ob das Lager existiert
    lager_obj = next((l for l in lager if l["id"] == data["lager_id"]), None)
    if not lager_obj:
        return JSONResponse({"error": "Lager nicht gefunden"}, status_code=404)
    
    # Bei Transfers Ziellager prüfen
    if data["bewegungs_typ"] == "transfer":
        if "ziel_lager_id" not in data:
            return JSONResponse({"error": "Bei Transfers ist ziel_lager_id erforderlich"}, status_code=400)
        
        ziel_lager = next((l for l in lager if l["id"] == data["ziel_lager_id"]), None)
        if not ziel_lager:
            return JSONResponse({"error": "Ziellager nicht gefunden"}, status_code=404)
    
    # Neue ID generieren
    new_id = max([clb["id"] for clb in chargen_lager_bewegungen], default=0) + 1
    
    # Neue Bewegung erstellen
    new_bewegung = {
        "id": new_id,
        "erstellt_am": datetime.now(UTC).isoformat(),
        **data
    }
    
    # Zur Liste hinzufügen
    chargen_lager_bewegungen.append(new_bewegung)
    
    # Bei Eingang, Ausgang oder Transfer auch den Chargenbestand aktualisieren
    if data["bewegungs_typ"] in ["eingang", "ausgang", "transfer"]:
        # In einer realen Anwendung würde hier eine Transaktion verwendet werden
        charge_index = next((i for i, c in enumerate(chargen) if c["id"] == data["charge_id"]), None)
        if charge_index is not None:
            # Menge aktualisieren
            if "menge" not in chargen[charge_index]:
                chargen[charge_index]["menge"] = 0
            
            if data["bewegungs_typ"] == "eingang":
                chargen[charge_index]["menge"] += data["menge"]
            elif data["bewegungs_typ"] == "ausgang":
                chargen[charge_index]["menge"] -= data["menge"]
            elif data["bewegungs_typ"] == "transfer":
                chargen[charge_index]["menge"] -= data["menge"]
                # In einer realen Anwendung würde hier eine neue Charge oder Bestand im Ziellager erstellt
    
    return JSONResponse(new_bewegung, status_code=201)

@cache.cached(ttl=180)
async def get_chargen_reservierungen(request):
    """Alle Chargen-Reservierungen abrufen"""
    charge_id = request.query_params.get("charge_id")
    lager_id = request.query_params.get("lager_id")
    status = request.query_params.get("status")
    
    results = chargen_reservierungen.copy()
    
    if charge_id:
        charge_id = int(charge_id)
        results = [cr for cr in results if cr["charge_id"] == charge_id]
    
    if lager_id:
        lager_id = int(lager_id)
        results = [cr for cr in results if cr["lager_id"] == lager_id]
    
    if status:
        results = [cr for cr in results if cr["status"] == status]
    
    return JSONResponse(results)

@cache.cached(ttl=180)
async def get_chargen_reservierung_by_id(request):
    """Eine spezifische Chargen-Reservierung abrufen"""
    reservierung_id = int(request.path_params["id"])
    result = next((cr for cr in chargen_reservierungen if cr["id"] == reservierung_id), None)
    if result:
        return JSONResponse(result)
    return JSONResponse({"error": "Chargen-Reservierung nicht gefunden"}, status_code=404)

async def create_chargen_reservierung(request):
    """Neue Chargen-Reservierung erstellen"""
    data = await request.json()
    
    # Pflichtfelder prüfen
    required_fields = ["charge_id", "lager_id", "menge", "einheit_id"]
    for field in required_fields:
        if field not in data:
            return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
    
    # Prüfen, ob die Charge existiert
    charge = next((c for c in chargen if c["id"] == data["charge_id"]), None)
    if not charge:
        return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
    
    # Prüfen, ob das Lager existiert
    lager_obj = next((l for l in lager if l["id"] == data["lager_id"]), None)
    if not lager_obj:
        return JSONResponse({"error": "Lager nicht gefunden"}, status_code=404)
    
    # Prüfen, ob genügend Bestand verfügbar ist
    if "menge" in charge:
        # Summe aller aktiven Reservierungen für diese Charge
        bestehende_reservierungen = sum(
            cr["menge"] for cr in chargen_reservierungen 
            if cr["charge_id"] == data["charge_id"] and cr["status"] == "aktiv"
        )
        
        if charge["menge"] - bestehende_reservierungen < data["menge"]:
            return JSONResponse({
                "error": "Nicht genügend Bestand verfügbar",
                "verfuegbar": charge["menge"] - bestehende_reservierungen,
                "angefordert": data["menge"]
            }, status_code=400)
    
    # Neue ID generieren
    new_id = max([cr["id"] for cr in chargen_reservierungen], default=0) + 1
    
    # Neue Reservierung erstellen
    new_reservierung = {
        "id": new_id,
        "status": data.get("status", "aktiv"),
        "erstellt_am": datetime.now(UTC).isoformat(),
        **data
    }
    
    # Zur Liste hinzufügen
    chargen_reservierungen.append(new_reservierung)
    
    return JSONResponse(new_reservierung, status_code=201)

async def update_chargen_reservierung(request):
    """Chargen-Reservierung aktualisieren"""
    reservierung_id = int(request.path_params["id"])
    data = await request.json()
    
    # Reservierung finden
    reservierung_index = next((i for i, cr in enumerate(chargen_reservierungen) if cr["id"] == reservierung_id), None)
    if reservierung_index is None:
        return JSONResponse({"error": "Chargen-Reservierung nicht gefunden"}, status_code=404)
    
    # Bei Mengenänderung Verfügbarkeit prüfen
    if "menge" in data and data["menge"] > chargen_reservierungen[reservierung_index]["menge"]:
        charge_id = chargen_reservierungen[reservierung_index]["charge_id"]
        charge = next((c for c in chargen if c["id"] == charge_id), None)
        
        if charge and "menge" in charge:
            # Summe aller aktiven Reservierungen für diese Charge (außer der aktuellen)
            bestehende_reservierungen = sum(
                cr["menge"] for cr in chargen_reservierungen 
                if cr["charge_id"] == charge_id and cr["status"] == "aktiv" and cr["id"] != reservierung_id
            )
            
            if charge["menge"] - bestehende_reservierungen < data["menge"]:
                return JSONResponse({
                    "error": "Nicht genügend Bestand verfügbar",
                    "verfuegbar": charge["menge"] - bestehende_reservierungen,
                    "angefordert": data["menge"]
                }, status_code=400)
    
    # Reservierung aktualisieren
    chargen_reservierungen[reservierung_index].update(data)
    chargen_reservierungen[reservierung_index]["geaendert_am"] = datetime.now(UTC).isoformat()
    
    return JSONResponse(chargen_reservierungen[reservierung_index])

@cache.cached(ttl=180)
async def get_charge_lagerbestaende(request):
    """Lagerbestände einer Charge abrufen"""
    charge_id = int(request.path_params["id"])
    
    # Charge prüfen
    charge = next((c for c in chargen if c["id"] == charge_id), None)
    if not charge:
        return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
    
    # Lagerbewegungen für die Charge finden
    bewegungen = [clb for clb in chargen_lager_bewegungen if clb["charge_id"] == charge_id]
    
    # Reservierungen für die Charge finden
    reservierungen = [cr for cr in chargen_reservierungen if cr["charge_id"] == charge_id and cr["status"] == "aktiv"]
    
    # Lagerbestände berechnen
    lagerbestaende = {}
    
    for bewegung in bewegungen:
        lager_id = bewegung["lager_id"]
        lagerort_id = bewegung["lagerort_id"]
        key = f"{lager_id}_{lagerort_id}"
        
        if key not in lagerbestaende:
            lagerbestaende[key] = {
                "lager_id": lager_id,
                "lagerort_id": lagerort_id,
                "menge": 0,
                "reserviert": 0,
                "verfuegbar": 0
            }
        
        if bewegung["bewegungs_typ"] == "eingang":
            lagerbestaende[key]["menge"] += bewegung["menge"]
        elif bewegung["bewegungs_typ"] == "ausgang":
            lagerbestaende[key]["menge"] -= bewegung["menge"]
        elif bewegung["bewegungs_typ"] == "transfer":
            lagerbestaende[key]["menge"] -= bewegung["menge"]
            
            # Zielbestand bei Transfers erhöhen
            if "ziel_lager_id" in bewegung and "ziel_lagerort_id" in bewegung:
                ziel_key = f"{bewegung['ziel_lager_id']}_{bewegung['ziel_lagerort_id']}"
                
                if ziel_key not in lagerbestaende:
                    lagerbestaende[ziel_key] = {
                        "lager_id": bewegung["ziel_lager_id"],
                        "lagerort_id": bewegung["ziel_lagerort_id"],
                        "menge": 0,
                        "reserviert": 0,
                        "verfuegbar": 0
                    }
                
                lagerbestaende[ziel_key]["menge"] += bewegung["menge"]
    
    # Reservierungen berücksichtigen
    for reservierung in reservierungen:
        lager_id = reservierung["lager_id"]
        lagerort_id = reservierung["lagerort_id"]
        key = f"{lager_id}_{lagerort_id}"
        
        if key in lagerbestaende:
            lagerbestaende[key]["reserviert"] += reservierung["menge"]
    
    # Verfügbare Menge berechnen
    for key in lagerbestaende:
        lagerbestaende[key]["verfuegbar"] = max(0, lagerbestaende[key]["menge"] - lagerbestaende[key]["reserviert"])
    
    # Lagerinformationen hinzufügen
    result_list = []
    for key, bestand in lagerbestaende.items():
        lager_obj = next((l for l in lager if l["id"] == bestand["lager_id"]), {})
        lagerort_obj = next((lo for lo in lagerorte if lo["id"] == bestand["lagerort_id"]), {})
        
        result_list.append({
            **bestand,
            "lager_name": lager_obj.get("bezeichnung", ""),
            "lagerort_name": lagerort_obj.get("name", "")
        })
    
    return JSONResponse(result_list) 