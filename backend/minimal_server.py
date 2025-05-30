"""
Minimaler Server für das AI-gesteuerte ERP-System ohne FastAPI/Pydantic
Optimiert für Python 3.11
"""

import sys
import os
import json
from pathlib import Path
from datetime import datetime, timedelta, timezone, UTC
from uuid import uuid4
import psutil
import time
import asyncio
import logging
import uvicorn
from starlette.applications import Starlette
from starlette.responses import JSONResponse, Response, FileResponse, RedirectResponse, HTMLResponse
from starlette.routing import Route, Mount
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from starlette.background import BackgroundTask
from starlette.exceptions import ExceptionMiddleware

# Füge Verzeichnisse zum Python-Pfad hinzu
current_dir = Path(__file__).parent
sys.path.append(str(current_dir.parent))
sys.path.append(str(current_dir))

# Importiere Produktionsauftrags-API-Funktionen
from backend.api.produktion import (
    get_produktionsauftraege,
    get_produktionsauftrag_by_id,
    create_produktionsauftrag,
    starte_produktion,
    abschliesse_produktion,
)

# Import des Cache-Managers
from cache_manager import cache

# Import der Chargen-Lager-Integration
from api.chargen_lager import (
    get_chargen_lager_bewegungen, get_chargen_lager_bewegung_by_id, create_chargen_lager_bewegung,
    get_chargen_reservierungen, get_chargen_reservierung_by_id, create_chargen_reservierung,
    update_chargen_reservierung,
    get_charge_lagerbestaende, generate_qrcode_for_charge, get_charge_qrcode,
    # Neue Funktionen für Chargenberichte
    get_charge_bericht_typen, generate_charge_bericht
)
from api.demo_data.chargen_lager_data import chargen_lager_bewegungen, chargen_reservierungen, lagerorte

# Import der Produktions-Integration
from backend.api.produktion import (
    get_produktionsauftraege, get_produktionsauftrag_by_id, 
    create_produktionsauftrag, starte_produktion, abschliesse_produktion,
    produktionsauftraege, produktionsmaterialien
)

# Produktions-Demo-Daten
try:
    from backend.api.demo_data.produktions_data import (
        produktionsschritte, produktions_chargen_verfolgungen
    )
except ImportError:
    # Fallback wenn Demo-Daten nicht verfügbar
    produktionsschritte = []
    produktions_chargen_verfolgungen = []

# Starlette importieren statt FastAPI
from starlette.applications import Starlette
from starlette.responses import JSONResponse, PlainTextResponse
from starlette.routing import Route, Mount
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
import uvicorn

# Importiere die QS-Futtermittel-API-Funktionen
from backend.api.qs_futtermittel import (
    get_qs_futtermittel_chargen,
    get_qs_futtermittel_charge_by_id,
    create_qs_futtermittel_charge,
    update_qs_futtermittel_charge,
    delete_qs_futtermittel_charge,
    add_monitoring,
    add_ereignis,
    add_benachrichtigung,
    add_dokument,
    simulate_qs_api_lieferantenstatus,
    simulate_qs_api_probenupload,
    analyze_charge_anomalies
)

# Importiere die Scanner-API-Funktionen
from api.scanner import (
    verarbeite_scan, 
    get_picklisten_fuer_mitarbeiter, 
    get_inventur_auftraege_fuer_mitarbeiter, 
    submit_inventur_ergebnis,
    get_scan_history
)

# Importiere die API-Funktionen aus den Modulen
from backend.api.partner_api import (
    get_partner_data, get_partner_by_id, create_partner, update_partner,
    get_partner_categories, get_partner_contacts, get_partner_addresses
)

# --------------- Demo-Daten ---------------

# Inventur-Daten
inventuren = [
    {
        "id": 1,
        "bezeichnung": "Jahresinventur 2023",
        "inventurdatum": "2023-12-31",
        "status": "abgeschlossen",
        "lager_id": 1,
        "bemerkung": "Komplette Jahresinventur",
        "created_at": "2023-12-30T08:00:00",
        "updated_at": "2023-12-31T16:00:00"
    },
    {
        "id": 2,
        "bezeichnung": "Zwischeninventur Q1 2024",
        "inventurdatum": "2024-03-31",
        "status": "in_bearbeitung",
        "lager_id": 1,
        "bemerkung": "Quartalsinventur",
        "created_at": "2024-03-30T08:00:00",
        "updated_at": None
    }
]

# Artikel-Daten
artikel = [
    {
        "id": 1,
        "artikelnummer": "A-10001",
        "bezeichnung": "Bürostuhl Comfort Plus",
        "kategorie": "Büromöbel",
        "einheit": "Stück",
        "preis": 249.99,
        "lagerbestand": 15,
        "min_bestand": 5,
        "lieferant_id": 1
    },
    {
        "id": 2,
        "artikelnummer": "A-10002",
        "bezeichnung": "Schreibtisch ergonomisch",
        "kategorie": "Büromöbel",
        "einheit": "Stück",
        "preis": 349.99,
        "lagerbestand": 8,
        "min_bestand": 3,
        "lieferant_id": 1
    }
]

# Lager-Daten
lager = [
    {
        "id": 1,
        "bezeichnung": "Hauptlager",
        "standort": "Berlin",
        "verantwortlicher": "Max Mustermann"
    },
    {
        "id": 2,
        "bezeichnung": "Außenlager",
        "standort": "Hamburg",
        "verantwortlicher": "Erika Musterfrau"
    }
]

# Kunden-Daten
kunden = [
    {
        "id": 1,
        "kundennummer": "K-1001",
        "firma": "Muster GmbH",
        "ansprechpartner": "Thomas Müller",
        "strasse": "Hauptstraße 1",
        "plz": "10115",
        "ort": "Berlin",
        "telefon": "+49 30 12345678",
        "email": "kontakt@muster-gmbh.de",
        "kundenseit": "2022-01-15"
    },
    {
        "id": 2,
        "kundennummer": "K-1002",
        "firma": "Example AG",
        "ansprechpartner": "Lisa Schmidt",
        "strasse": "Industrieweg 42",
        "plz": "20095",
        "ort": "Hamburg",
        "telefon": "+49 40 87654321",
        "email": "info@example-ag.de",
        "kundenseit": "2023-03-10"
    }
]

# Adressen-Daten (im Format der L3-API)
adressen = [
    {
        "Nummer": 3,
        "Anrede": "",
        "Briefanr": "",
        "Name1": "Kunde 1",
        "Name2": "Name 2",
        "Name3": "Name 3",
        "Strasse": "Hauptstraße 100",
        "Nat": "D",
        "Plz": "48935",
        "Ort": "Wietmarschen-Lohne",
        "Telefon1": "05908 9009 222",
        "Telefon2": "05908 9009 200",
        "Email": "support@service-erp.de",
        "Art": "K",
        "Kundennr": 10000
    },
    {
        "Nummer": 4,
        "Anrede": "Firma",
        "Briefanr": "",
        "Name1": "Kunde 2",
        "Name2": "Zweigstelle",
        "Name3": "",
        "Strasse": "Industriestraße 42",
        "Nat": "D",
        "Plz": "48455",
        "Ort": "Bad Bentheim",
        "Telefon1": "05922 12345",
        "Telefon2": "",
        "Email": "kontakt@example.com",
        "Art": "K",
        "Kundennr": 10001
    }
]

# Aufträge-Daten
auftraege = [
    {
        "id": 1,
        "auftragsnummer": "A-2024-001",
        "kunde_id": 1,
        "auftragsdatum": "2024-01-10",
        "lieferdatum": "2024-01-20",
        "status": "abgeschlossen",
        "bemerkung": "Standardlieferung",
        "positionen": [
            {"artikel_id": 1, "menge": 5, "einzelpreis": 249.99},
            {"artikel_id": 2, "menge": 2, "einzelpreis": 349.99}
        ]
    },
    {
        "id": 2,
        "auftragsnummer": "A-2024-002",
        "kunde_id": 2,
        "auftragsdatum": "2024-02-15",
        "lieferdatum": "2024-03-01",
        "status": "in_bearbeitung",
        "bemerkung": "Expresslieferung",
        "positionen": [
            {"artikel_id": 1, "menge": 3, "einzelpreis": 249.99}
        ]
    }
]

# Bestellungen-Daten
bestellungen = [
    {
        "id": 1,
        "bestellnummer": "B-2024-001",
        "lieferant_id": 1,
        "bestelldatum": "2024-01-05",
        "lieferdatum": "2024-01-15",
        "status": "abgeschlossen",
        "bemerkung": "Standardbestellung",
        "positionen": [
            {"artikel_id": 1, "menge": 10, "einzelpreis": 149.99},
            {"artikel_id": 2, "menge": 5, "einzelpreis": 249.99}
        ]
    },
    {
        "id": 2,
        "bestellnummer": "B-2024-002",
        "lieferant_id": 2,
        "bestelldatum": "2024-02-10",
        "lieferdatum": "2024-02-25",
        "status": "in_bearbeitung",
        "bemerkung": "Dringend",
        "positionen": [
            {"artikel_id": 1, "menge": 5, "einzelpreis": 149.99}
        ]
    }
]

# Lieferanten-Daten
lieferanten = [
    {
        "id": 1,
        "lieferantennummer": "L-1001",
        "firma": "Büromöbel GmbH",
        "ansprechpartner": "Klaus Weber",
        "strasse": "Industriestraße 10",
        "plz": "50678",
        "ort": "Köln",
        "telefon": "+49 221 12345678",
        "email": "kontakt@bueromoebel-gmbh.de",
        "lieferant_seit": "2020-01-01"
    },
    {
        "id": 2,
        "lieferantennummer": "L-1002",
        "firma": "IT-Zubehör AG",
        "ansprechpartner": "Sandra Meier",
        "strasse": "Technikweg 5",
        "plz": "80331",
        "ort": "München",
        "telefon": "+49 89 87654321",
        "email": "info@it-zubehoer.de",
        "lieferant_seit": "2021-03-15"
    }
]

# Rechnungen-Daten
rechnungen = [
    {
        "id": 1,
        "rechnungsnummer": "R-2024-001",
        "auftrag_id": 1,
        "kunde_id": 1,
        "rechnungsdatum": "2024-01-21",
        "faelligkeitsdatum": "2024-02-20",
        "status": "bezahlt",
        "zahlungseingang": "2024-02-18",
        "betrag": 1748.93,
        "bemerkung": "Zahlung per Überweisung"
    },
    {
        "id": 2,
        "rechnungsnummer": "R-2024-002",
        "auftrag_id": 2,
        "kunde_id": 2,
        "rechnungsdatum": "2024-03-02",
        "faelligkeitsdatum": "2024-04-01",
        "status": "offen",
        "zahlungseingang": None,
        "betrag": 749.97,
        "bemerkung": "Standardrechnung"
    }
]

# Eingangslieferscheine-Daten
eingangslieferscheine = [
    {
        "id": 1,
        "nummer": "ELS-2024-001",
        "bestellung_id": 1,
        "lieferant_id": 1,
        "lieferdatum": "2024-01-15",
        "status": "abgeschlossen",
        "bemerkung": "Komplette Lieferung",
        "positionen": [
            {"artikel_id": 1, "menge": 10, "lager_id": 1},
            {"artikel_id": 2, "menge": 5, "lager_id": 1}
        ]
    },
    {
        "id": 2,
        "nummer": "ELS-2024-002",
        "bestellung_id": 2,
        "lieferant_id": 2,
        "lieferdatum": "2024-02-25",
        "status": "teillieferung",
        "bemerkung": "Teillieferung, Rest folgt",
        "positionen": [
            {"artikel_id": 1, "menge": 3, "lager_id": 1}
        ]
    }
]

# Verkaufslieferscheine-Daten
verkaufslieferscheine = [
    {
        "id": 1,
        "nummer": "VLS-2024-001",
        "auftrag_id": 1,
        "kunde_id": 1,
        "lieferdatum": "2024-01-20",
        "status": "abgeschlossen",
        "bemerkung": "Komplette Lieferung",
        "positionen": [
            {"artikel_id": 1, "menge": 5, "lager_id": 1},
            {"artikel_id": 2, "menge": 2, "lager_id": 1}
        ]
    },
    {
        "id": 2,
        "nummer": "VLS-2024-002",
        "auftrag_id": 2,
        "kunde_id": 2,
        "lieferdatum": "2024-03-01",
        "status": "in_vorbereitung",
        "bemerkung": "Express-Versand",
        "positionen": [
            {"artikel_id": 1, "menge": 3, "lager_id": 1}
        ]
    }
]

# Projekte-Daten
projekte = [
    {
        "id": 1,
        "projektnummer": "P-2024-001",
        "kunde_id": 1,
        "bezeichnung": "Büroausstattung Hauptsitz",
        "startdatum": "2024-01-10",
        "enddatum": "2024-02-28",
        "status": "abgeschlossen",
        "budget": 10000.00,
        "projektleiter": "Anna Schmidt",
        "bemerkung": "Komplettausstattung für neuen Hauptsitz"
    },
    {
        "id": 2,
        "projektnummer": "P-2024-002",
        "kunde_id": 2,
        "bezeichnung": "IT-Infrastruktur Upgrade",
        "startdatum": "2024-03-01",
        "enddatum": "2024-06-30",
        "status": "in_bearbeitung",
        "budget": 25000.00,
        "projektleiter": "Michael Weber",
        "bemerkung": "Modernisierung der IT-Infrastruktur"
    }
]

# Zeiterfassungen-Daten
zeiterfassungen = [
    {
        "id": 1,
        "mitarbeiter_id": 1,
        "projekt_id": 1,
        "datum": "2024-01-15",
        "stunden": 8.5,
        "taetigkeit": "Installation Büromöbel",
        "bemerkung": "Etage 1 komplett"
    },
    {
        "id": 2,
        "mitarbeiter_id": 2,
        "projekt_id": 1,
        "datum": "2024-01-15",
        "stunden": 7.75,
        "taetigkeit": "Installation Büromöbel",
        "bemerkung": "Etage 2 teilweise"
    }
]

# Dokumente-Daten
dokumente = [
    {
        "id": 1,
        "titel": "Angebot Büroausstattung",
        "typ": "Angebot",
        "pfad": "/dokumente/angebote/A-2024-001.pdf",
        "kunde_id": 1,
        "projekt_id": 1,
        "hochgeladen_am": "2024-01-05",
        "hochgeladen_von": "Michael Weber",
        "bemerkung": "Ursprüngliches Angebot"
    },
    {
        "id": 2,
        "titel": "Lieferschein Bürostühle",
        "typ": "Lieferschein",
        "pfad": "/dokumente/lieferscheine/L-2024-001.pdf",
        "kunde_id": 1,
        "projekt_id": 1,
        "hochgeladen_am": "2024-01-12",
        "hochgeladen_von": "Anna Schmidt",
        "bemerkung": "Lieferung Bürostühle"
    }
]

# E-Commerce-Daten
produkte = [
    {
        "id": 1,
        "sku": "P-10001",
        "name": "Business Laptop Pro",
        "description": "Leistungsstarker Laptop für professionelle Anwendungen",
        "price": 1299.99,
        "cost_price": 899.99,
        "inventory_level": 25,
        "category_id": 1,
        "tax_rate": 19.0,
        "weight": 1.8,
        "dimensions": "35 x 25 x 2 cm",
        "active": True,
        "created_at": "2024-01-01T10:00:00",
        "updated_at": None,
        "image_urls": ["https://example.com/images/laptop1.jpg"],
        "tags": ["business", "laptop", "premium"]
    },
    {
        "id": 2,
        "sku": "P-10002",
        "name": "Wireless Office Headset",
        "description": "Komfortables Headset für Bürokommunikation",
        "price": 129.99,
        "cost_price": 69.99,
        "inventory_level": 42,
        "category_id": 2,
        "tax_rate": 19.0,
        "weight": 0.3,
        "dimensions": "20 x 18 x 8 cm",
        "active": True,
        "created_at": "2024-01-05T11:30:00",
        "updated_at": None,
        "image_urls": ["https://example.com/images/headset1.jpg"],
        "tags": ["audio", "büro", "kommunikation"]
    }
]

produkt_kategorien = [
    {
        "id": 1,
        "name": "Computer & Laptops",
        "description": "Computer, Laptops und Zubehör",
        "parent_id": None,
        "active": True,
        "created_at": "2024-01-01T08:00:00",
        "updated_at": None
    },
    {
        "id": 2,
        "name": "Audio & Headsets",
        "description": "Kopfhörer, Mikrofone und Audiozubehör",
        "parent_id": None,
        "active": True,
        "created_at": "2024-01-01T08:15:00",
        "updated_at": None
    }
]

warenkörbe = [
    {
        "id": 1,
        "customer_id": 1,
        "session_id": "sess_abc123",
        "created_at": "2024-03-15T14:30:00",
        "updated_at": "2024-03-15T14:45:00",
        "items": [
            {
                "id": 1,
                "cart_id": 1,
                "product_id": 1,
                "quantity": 1,
                "price": 1299.99,
                "created_at": "2024-03-15T14:30:00",
                "updated_at": None
            }
        ]
    }
]

bestellungen_ecommerce = [
    {
        "id": 1,
        "order_number": "ORD-20240310-abc123",
        "customer_id": 1,
        "order_date": "2024-03-10T15:30:00",
        "status": "versandt",
        "shipping_address_id": 1,
        "billing_address_id": 1,
        "payment_method": "kreditkarte",
        "shipping_method": "standard",
        "subtotal": 1299.99,
        "tax_amount": 246.99,
        "shipping_cost": 4.99,
        "discount_amount": 0.0,
        "total_amount": 1551.97,
        "notes": "Bitte vor der Haustür abstellen",
        "created_at": "2024-03-10T15:30:00",
        "updated_at": "2024-03-11T09:15:00"
    }
]

bestellpositionen = [
    {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "product_name": "Business Laptop Pro",
        "quantity": 1,
        "unit_price": 1299.99,
        "tax_rate": 19.0,
        "discount_amount": 0.0,
        "total_price": 1546.98,
        "created_at": "2024-03-10T15:30:00"
    }
]

adressen_ecommerce = [
    {
        "id": 1,
        "customer_id": 1,
        "address_type": "shipping",
        "first_name": "Thomas",
        "last_name": "Müller",
        "company": "Muster GmbH",
        "street": "Hauptstraße 1",
        "additional": "Etage 3",
        "postal_code": "10115",
        "city": "Berlin",
        "country": "Deutschland",
        "phone": "+49 30 12345678",
        "is_default": True,
        "created_at": "2024-01-15T10:00:00",
        "updated_at": None
    },
    {
        "id": 2,
        "customer_id": 1,
        "address_type": "billing",
        "first_name": "Thomas",
        "last_name": "Müller",
        "company": "Muster GmbH",
        "street": "Hauptstraße 1",
        "additional": "Etage 3",
        "postal_code": "10115",
        "city": "Berlin",
        "country": "Deutschland",
        "phone": "+49 30 12345678",
        "is_default": True,
        "created_at": "2024-01-15T10:00:00",
        "updated_at": None
    }
]

rabatte = [
    {
        "id": 1,
        "code": "SOMMER2024",
        "description": "Sommerrabatt 2024",
        "discount_type": "prozentual",
        "discount_value": 10.0,
        "minimum_order_value": 50.0,
        "valid_from": "2024-06-01T00:00:00",
        "valid_to": "2024-08-31T23:59:59",
        "usage_limit": 1000,
        "used_count": 45,
        "active": True,
        "created_at": "2024-05-15T09:00:00",
        "updated_at": None
    }
]

bewertungen = [
    {
        "id": 1,
        "product_id": 1,
        "customer_id": 1,
        "rating": 5,
        "title": "Hervorragendes Produkt",
        "comment": "Bin sehr zufrieden mit dem Laptop. Schnell, leise und tolles Display.",
        "verified_purchase": True,
        "created_at": "2024-03-20T18:30:00",
        "updated_at": None,
        "is_approved": True
    }
]

# Finanzen-Daten
konten = [
    {
        "id": 1,
        "kontonummer": "0100",
        "bezeichnung": "Geschäftsbauten",
        "typ": "Aktiv",
        "saldo": 150000.00,
        "waehrung": "EUR",
        "ist_aktiv": True
    },
    {
        "id": 2,
        "kontonummer": "1700",
        "bezeichnung": "Bank",
        "typ": "Aktiv",
        "saldo": 35000.00,
        "waehrung": "EUR",
        "ist_aktiv": True
    },
    {
        "id": 3,
        "kontonummer": "1800",
        "bezeichnung": "Kasse",
        "typ": "Aktiv",
        "saldo": 1500.00,
        "waehrung": "EUR",
        "ist_aktiv": True
    },
    {
        "id": 4,
        "kontonummer": "2000",
        "bezeichnung": "Eigenkapital",
        "typ": "Passiv",
        "saldo": 100000.00,
        "waehrung": "EUR",
        "ist_aktiv": True
    },
    {
        "id": 5,
        "kontonummer": "8000",
        "bezeichnung": "Umsatzerlöse 19% USt",
        "typ": "Ertrag",
        "saldo": 75000.00,
        "waehrung": "EUR",
        "ist_aktiv": True
    }
]

buchungen = [
    {
        "id": 1,
        "buchungsnummer": "B-2024-001",
        "betrag": 1500.00,
        "buchungstext": "Verkauf Ware",
        "buchungsdatum": "2024-04-15",
        "valutadatum": "2024-04-15",
        "konto_id": 2,
        "gegenkonto_id": 5,
        "beleg_id": 1
    },
    {
        "id": 2,
        "buchungsnummer": "B-2024-002",
        "betrag": 500.00,
        "buchungstext": "Barverkauf",
        "buchungsdatum": "2024-04-16",
        "valutadatum": "2024-04-16",
        "konto_id": 3,
        "gegenkonto_id": 5,
        "beleg_id": 2
    }
]

belege = [
    {
        "id": 1,
        "belegnummer": "RE-2024-001",
        "belegdatum": "2024-04-15",
        "belegtyp": "Rechnung",
        "belegbetrag": 1500.00,
        "belegtext": "Verkauf Produkt XYZ",
        "datei_pfad": "/belege/2024/04/RE-2024-001.pdf"
    },
    {
        "id": 2,
        "belegnummer": "KA-2024-001",
        "belegdatum": "2024-04-16",
        "belegtyp": "Kassenbeleg",
        "belegbetrag": 500.00,
        "belegtext": "Barverkauf Waren",
        "datei_pfad": "/belege/2024/04/KA-2024-001.pdf"
    }
]

kostenstellen = [
    {
        "id": 1,
        "kostenstellen_nr": "1000",
        "bezeichnung": "Verwaltung",
        "beschreibung": "Allgemeine Verwaltungskosten",
        "budget": 100000.00,
        "ist_aktiv": True
    },
    {
        "id": 2,
        "kostenstellen_nr": "2000",
        "bezeichnung": "Vertrieb",
        "beschreibung": "Vertrieb und Marketing",
        "budget": 150000.00,
        "ist_aktiv": True
    }
]

# --------------- API-Endpunkte ---------------

async def root(request):
    """Wurzel-Endpunkt für den minimalen Server"""
    return JSONResponse({
        "name": "ERP-API Minimal Server",
        "version": "1.0.0",
        "description": "Minimaler API-Server für das ERP-System",
        "documentation_url": "/docs"
    })

# Gesundheitscheck mit Performance-Optimierung
@cache.cached(ttl=10)  # 10 Sekunden cachen
async def health_check(request):
    # CPU-Nutzung des aktuellen Prozesses ermitteln - reduziertes Intervall
    current_process = psutil.Process(os.getpid())
    
    # Keine CPU-Messung bei jeder Anfrage, da teuer
    # Stattdessen alle 10 Sekunden per Cache-TTL
    cpu_usage = current_process.cpu_percent(interval=0.05)
    
    # Speichernutzung ermitteln
    memory_info = current_process.memory_info()
    memory_usage_percent = current_process.memory_percent()
    
    # Laufzeit berechnen
    start_time = current_process.create_time()
    uptime_seconds = time.time() - start_time
    
    # Aktuelle Zeit im ISO-Format mit UTC
    current_time = datetime.now(UTC).isoformat()
    
    # API-Anfragen zählen (einfache statische Variable für Demonstration)
    if not hasattr(health_check, "request_count"):
        health_check.request_count = 0
    health_check.request_count += 1
    
    # Durchschnittliche Antwortzeit (Mock-Wert für Demonstration)
    avg_response_time = 42.5  # ms
    
    return JSONResponse({
        "status": "online",
        "version": "1.0.0",
        "timestamp": current_time,
        "uptime_seconds": int(uptime_seconds),
        "metrics": {
            "cpu_usage_percent": round(cpu_usage, 2),
            "memory_usage_percent": round(memory_usage_percent, 2),
            "request_count": health_check.request_count,
            "average_response_time_ms": avg_response_time,
            "database_connections": 3,
            "queue_size": 0
        },
        "services": {
            "database": "connected",
            "auth": "operational",
            "file_storage": "operational"
        }
    })

# --- Adresse-Endpunkte (im L3-Format) ---
@cache.cached(ttl=60)
async def get_adressen(request):
    filter_query = request.query_params.get("$filter")
    if filter_query:
        # Einfache Filterung für Demo-Zwecke
        if "Nummer eq " in filter_query:
            nummer = int(filter_query.split("Nummer eq ")[1])
            # Direkter Lookup statt Liste filtern
            addr = lookup_maps['adressen_by_nummer'].get(nummer)
            if addr:
                return JSONResponse({"Data": [addr]})
            return JSONResponse({"Data": []})
    
    return JSONResponse({"Data": adressen})

# --- Artikel-Endpunkte (im L3-Format) ---
@cache.cached(ttl=120)
async def get_artikel_l3_format(request):
    filter_query = request.query_params.get("$filter")
    if filter_query:
        # Einfache Filterung für Demo-Zwecke
        if "Nummer eq '" in filter_query:
            nummer = filter_query.split("Nummer eq '")[1].split("'")[0]
            # Verwende Lookup-Map statt Liste filtern
            artikel_item = lookup_maps['artikel_by_nummer'].get(nummer)
            if artikel_item:
                l3_artikel = {
                    "Nummer": artikel_item["artikelnummer"],
                    "Bezeichnung": artikel_item["bezeichnung"],
                    "Beschreibung": f"Kategorie: {artikel_item['kategorie']}",
                    "VerkPreis": artikel_item["preis"],
                    "EinkPreis": artikel_item["preis"] * 0.6,  # Demo-Zwecke
                    "Einheit": artikel_item["einheit"],
                    "Bestand": artikel_item["lagerbestand"]
                }
                return JSONResponse({"Data": [l3_artikel]})
            return JSONResponse({"Data": []})
    
    # Konvertiere in L3-Format - einmal berechnen und cachen
    l3_artikel = [
        {
            "Nummer": a["artikelnummer"],
            "Bezeichnung": a["bezeichnung"],
            "Beschreibung": f"Kategorie: {a['kategorie']}",
            "VerkPreis": a["preis"],
            "EinkPreis": a["preis"] * 0.6,  # Demo-Zwecke
            "Einheit": a["einheit"],
            "Bestand": a["lagerbestand"]
        } 
        for a in artikel
    ]
    
    return JSONResponse({"Data": l3_artikel})

# --- Inventur-Endpunkte ---
@cache.cached(ttl=300)
async def get_inventuren(request):
    return JSONResponse({"inventuren": inventuren})

@cache.cached(ttl=300)
async def get_inventur(request):
    inventur_id = int(request.path_params["inventur_id"])
    inv = lookup_maps['inventuren_by_id'].get(inventur_id)
    if inv:
        return JSONResponse(inv)
    return JSONResponse({"error": "Inventur nicht gefunden"}, status_code=404)

# --- Artikel-Endpunkte (Standard-Format) ---
@cache.cached(ttl=120)
async def get_artikel_standard(request):
    return JSONResponse({"artikel": artikel})

@cache.cached(ttl=120)
async def get_artikel_by_id(request):
    artikel_id = int(request.path_params["artikel_id"])
    art = lookup_maps['artikel_by_id'].get(artikel_id)
    if art:
        return JSONResponse(art)
    return JSONResponse({"error": "Artikel nicht gefunden"}, status_code=404)

# --- Lager-Endpunkte ---
@cache.cached(ttl=300)
async def get_lager(request):
    filter_query = request.query_params.get("$filter")
    if filter_query:
        # Implementiere L3-ähnliche Filterung hier
        pass
    
    return JSONResponse({"lager": lager})

@cache.cached(ttl=300)
async def get_lager_by_id(request):
    lager_id = int(request.path_params["lager_id"])
    l = lookup_maps['lager_by_id'].get(lager_id)
    if l:
        return JSONResponse(l)
    return JSONResponse({"error": "Lager nicht gefunden"}, status_code=404)

# --- Kunden-Endpunkte ---
@cache.cached(ttl=180)
async def get_kunden(request):
    filter_query = request.query_params.get("$filter")
    if filter_query:
        # Implementiere L3-ähnliche Filterung hier
        if "Nummer eq " in filter_query:
            nummer = int(filter_query.split("Nummer eq ")[1])
            # Verwende Lookup statt Liste filtern
            kunde = lookup_maps['kunden_by_id'].get(nummer)
            if kunde:
                return JSONResponse({"Data": [kunde]})
            return JSONResponse({"Data": []})
    
    return JSONResponse({"kunden": kunden})

@cache.cached(ttl=180)
async def get_kunde_by_id(request):
    kunde_id = int(request.path_params["kunde_id"])
    k = lookup_maps['kunden_by_id'].get(kunde_id)
    if k:
        return JSONResponse(k)
    return JSONResponse({"error": "Kunde nicht gefunden"}, status_code=404)

# --- Aufträge-Endpunkte ---
@cache.cached(ttl=120)
async def get_auftraege(request):
    filter_query = request.query_params.get("$filter")
    if filter_query:
        # Implementiere L3-ähnliche Filterung hier
        if "Nummer eq '" in filter_query:
            nummer = filter_query.split("Nummer eq '")[1].split("'")[0]
            # Verwende Lookup statt Liste filtern
            auftrag = lookup_maps['auftraege_by_nummer'].get(nummer)
            if auftrag:
                return JSONResponse({"Data": [auftrag]})
            return JSONResponse({"Data": []})
    
    return JSONResponse({"auftraege": auftraege})

@cache.cached(ttl=120)
async def get_auftrag_by_id(request):
    auftrag_id = int(request.path_params["auftrag_id"])
    a = lookup_maps['auftraege_by_id'].get(auftrag_id)
    if a:
        return JSONResponse(a)
    return JSONResponse({"error": "Auftrag nicht gefunden"}, status_code=404)

# --- Bestellungen-Endpunkte ---
@cache.cached(ttl=120)
async def get_bestellungen(request):
    return JSONResponse({"bestellungen": bestellungen})

@cache.cached(ttl=120)
async def get_bestellung_by_id(request):
    bestellung_id = int(request.path_params["bestellung_id"])
    b = lookup_maps['bestellungen_by_id'].get(bestellung_id)
    if b:
        return JSONResponse(b)
    return JSONResponse({"error": "Bestellung nicht gefunden"}, status_code=404)

# --- Lieferanten-Endpunkte ---
@cache.cached(ttl=300)
async def get_lieferanten(request):
    return JSONResponse({"lieferanten": lieferanten})

@cache.cached(ttl=300)
async def get_lieferant_by_id(request):
    lieferant_id = int(request.path_params["lieferant_id"])
    l = lookup_maps['lieferanten_by_id'].get(lieferant_id)
    if l:
        return JSONResponse(l)
    return JSONResponse({"error": "Lieferant nicht gefunden"}, status_code=404)

# --- Rechnungen-Endpunkte ---
@cache.cached(ttl=180)
async def get_rechnungen(request):
    return JSONResponse({"rechnungen": rechnungen})

@cache.cached(ttl=180)
async def get_rechnung_by_id(request):
    rechnung_id = int(request.path_params["rechnung_id"])
    r = lookup_maps['rechnungen_by_id'].get(rechnung_id)
    if r:
        return JSONResponse(r)
    return JSONResponse({"error": "Rechnung nicht gefunden"}, status_code=404)

# --- Eingangslieferscheine-Endpunkte ---
@cache.cached(ttl=180)
async def get_eingangslieferscheine(request):
    return JSONResponse({"eingangslieferscheine": eingangslieferscheine})

@cache.cached(ttl=180)
async def get_eingangslieferschein_by_id(request):
    els_id = int(request.path_params["els_id"])
    els = lookup_maps['els_by_id'].get(els_id)
    if els:
        return JSONResponse(els)
    return JSONResponse({"error": "Eingangslieferschein nicht gefunden"}, status_code=404)

async def create_eingangslieferschein(request):
    """Erstellt einen neuen Eingangslieferschein und legt automatisch Chargen für die enthaltenen Artikel an"""
    data = await request.json()
    
    # Pflichtfelder prüfen
    required_fields = ["lieferant_id", "positionen"]
    for field in required_fields:
        if field not in data:
            return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
    
    # Prüfen, ob der Lieferant existiert
    lieferant = next((l for l in lieferanten if l["id"] == data["lieferant_id"]), None)
    if not lieferant:
        return JSONResponse({"error": "Lieferant nicht gefunden"}, status_code=404)
    
    # Neue ID und Nummer generieren
    new_id = max([els["id"] for els in eingangslieferscheine], default=0) + 1
    today = datetime.now(UTC)
    date_part = today.strftime("%Y")
    lauf_nr = str(new_id).zfill(3)
    nummer = f"ELS-{date_part}-{lauf_nr}"
    
    # Eingangslieferschein erstellen
    new_eingangslieferschein = {
        "id": new_id,
        "nummer": nummer,
        "bestellung_id": data.get("bestellung_id"),
        "lieferant_id": data["lieferant_id"],
        "lieferdatum": data.get("lieferdatum", today.isoformat()),
        "status": data.get("status", "erfasst"),
        "bemerkung": data.get("bemerkung", ""),
        "positionen": data["positionen"]
    }
    
    # Eingangslieferschein zur Liste hinzufügen
    eingangslieferscheine.append(new_eingangslieferschein)
    
    # Lookup-Map aktualisieren
    lookup_maps['els_by_id'][new_id] = new_eingangslieferschein
    
    # Für jede Position eine Charge anlegen
    created_charges = []
    for position in data["positionen"]:
        artikel_id = position.get("artikel_id")
        menge = position.get("menge", 0)
        lager_id = position.get("lager_id")
        
        if not artikel_id or not menge or not lager_id:
            continue  # Überspringe unvollständige Positionen
        
        # Prüfen, ob der Artikel existiert
        artikel_obj = next((a for a in artikel if a["id"] == artikel_id), None)
        if not artikel_obj:
            continue
        
        # Prüfen, ob das Lager existiert
        lager_obj = next((l for l in lager if l["id"] == lager_id), None)
        if not lager_obj:
            continue
        
        # Neue Chargennummer generieren
        artikel_code = artikel_obj.get("artikelnummer", "").split("-")[1] if "-" in artikel_obj.get("artikelnummer", "") else "XXX"
        date_part = today.strftime("%Y%m%d")
        existing_count = len([c for c in chargen if c.get("chargennummer", "").startswith(f"{date_part}-{artikel_code}")])
        lauf_nr = str(existing_count + 1).zfill(4)
        chargennummer = f"{date_part}-{artikel_code}-{lauf_nr}"
        
        # Neue Charge ID generieren
        new_charge_id = max([c["id"] for c in chargen], default=0) + 1
        
        # Neue Charge erstellen
        new_charge = {
            "id": new_charge_id,
            "artikel_id": artikel_id,
            "chargennummer": chargennummer,
            "lieferant_id": data["lieferant_id"],
            "lieferanten_chargennummer": data.get("lieferanten_chargennummer"),
            "eingang_datum": today.isoformat(),
            "menge": menge,
            "einheit_id": position.get("einheit_id", 1),  # Standardeinheit falls nicht angegeben
            "status": "neu",
            "charge_typ": "eingang",
            "erstellt_am": today.isoformat(),
            "herstelldatum": data.get("herstelldatum"),
            "mindesthaltbarkeitsdatum": data.get("mindesthaltbarkeitsdatum")
        }
        
        # Charge zur Liste hinzufügen
        chargen.append(new_charge)
        
        # Lagerbewegung für die Charge erstellen
        new_bewegung_id = max([clb["id"] for clb in chargen_lager_bewegungen], default=0) + 1
        
        # Neue Lagerbewegung erstellen
        new_bewegung = {
            "id": new_bewegung_id,
            "charge_id": new_charge_id,
            "lager_id": lager_id,
            "lagerort_id": position.get("lagerort_id"),
            "bewegungs_typ": "eingang",
            "menge": menge,
            "einheit_id": position.get("einheit_id", 1),
            "referenz_typ": "wareneingang",
            "referenz_id": new_id,
            "notiz": f"Automatisch erstellt durch Wareneingang {nummer}",
            "erstellt_am": today.isoformat(),
            "erstellt_von": data.get("user_id")
        }
        
        # Lagerbewegung zur Liste hinzufügen
        chargen_lager_bewegungen.append(new_bewegung)
        
        # Charge Referenz erstellen
        new_referenz_id = max([cr["id"] for cr in chargen_referenzen], default=0) + 1
        
        new_referenz = {
            "id": new_referenz_id,
            "charge_id": new_charge_id,
            "referenz_typ": "EINKAUF",  # Statt enum-Wert ReferenzTyp.EINKAUF als String
            "referenz_id": new_id,
            "menge": menge,
            "einheit_id": position.get("einheit_id", 1),
            "erstellt_am": today.isoformat(),
            "erstellt_von": data.get("user_id")
        }
        
        # Referenz zur Liste hinzufügen
        chargen_referenzen.append(new_referenz)
        
        # Erstellte Charge zur Ergebnisliste hinzufügen
        created_charges.append(new_charge)
    
    # Ergebnis zurückgeben
    return JSONResponse({
        "eingangslieferschein": new_eingangslieferschein,
        "erstellte_chargen": created_charges
    }, status_code=201)

# --- Verkaufslieferscheine-Endpunkte ---
@cache.cached(ttl=180)
async def get_verkaufslieferscheine(request):
    return JSONResponse({"verkaufslieferscheine": verkaufslieferscheine})

@cache.cached(ttl=180)
async def get_verkaufslieferschein_by_id(request):
    vls_id = int(request.path_params["vls_id"])
    vls = lookup_maps['vls_by_id'].get(vls_id)
    if vls:
        return JSONResponse(vls)
    return JSONResponse({"error": "Verkaufslieferschein nicht gefunden"}, status_code=404)

# --- Projekt-Endpunkte ---
@cache.cached(ttl=240)
async def get_projekte(request):
    return JSONResponse({"projekte": projekte})

@cache.cached(ttl=240)
async def get_projekt_by_id(request):
    projekt_id = int(request.path_params["projekt_id"])
    p = lookup_maps['projekte_by_id'].get(projekt_id)
    if p:
        return JSONResponse(p)
    return JSONResponse({"error": "Projekt nicht gefunden"}, status_code=404)

# --- Zeiterfassungs-Endpunkte ---
@cache.cached(ttl=120)
async def get_zeiterfassungen(request):
    projekt_id = request.query_params.get("projekt_id")
    mitarbeiter_id = request.query_params.get("mitarbeiter_id")
    
    # Optimierung: Erstelle Indizes nur wenn nötig (Lazy-Loading)
    if not hasattr(get_zeiterfassungen, "indices_created"):
        get_zeiterfassungen.indices_created = True
        get_zeiterfassungen.by_projekt = {}
        get_zeiterfassungen.by_mitarbeiter = {}
        
        for z in zeiterfassungen:
            pid = z["projekt_id"]
            mid = z["mitarbeiter_id"]
            
            if pid not in get_zeiterfassungen.by_projekt:
                get_zeiterfassungen.by_projekt[pid] = []
            get_zeiterfassungen.by_projekt[pid].append(z)
            
            if mid not in get_zeiterfassungen.by_mitarbeiter:
                get_zeiterfassungen.by_mitarbeiter[mid] = []
            get_zeiterfassungen.by_mitarbeiter[mid].append(z)
    
    if projekt_id:
        pid = int(projekt_id)
        projekt_zeiten = get_zeiterfassungen.by_projekt.get(pid, [])
        return JSONResponse({"zeiterfassungen": projekt_zeiten})
    elif mitarbeiter_id:
        mid = int(mitarbeiter_id)
        mitarbeiter_zeiten = get_zeiterfassungen.by_mitarbeiter.get(mid, [])
        return JSONResponse({"zeiterfassungen": mitarbeiter_zeiten})
    else:
        return JSONResponse({"zeiterfassungen": zeiterfassungen})

# --- Dokumente-Endpunkte ---
@cache.cached(ttl=300)
async def get_dokumente(request):
    return JSONResponse({"dokumente": dokumente})

@cache.cached(ttl=300)
async def get_dokument_by_id(request):
    dokument_id = int(request.path_params["dokument_id"])
    d = lookup_maps['dokumente_by_id'].get(dokument_id)
    if d:
        return JSONResponse(d)
    return JSONResponse({"error": "Dokument nicht gefunden"}, status_code=404)

# Dashboard-Daten
@cache.cached(ttl=60)  # Dashboard-Daten für 60 Sekunden cachen
async def get_dashboard_data(request):
    today = datetime.now().date()
    
    # Beispiel-Dashboard-Daten
    return JSONResponse({
        "umsatz_heute": 1245.67,
        "umsatz_monat": 38756.92,
        "offene_auftraege": 3,
        "offene_rechnungen": 5,
        "laufende_projekte": 2,
        "artikel_nachbestellen": [artikel[0]],
        "letzte_aktivitaeten": [
            {
                "typ": "Auftrag",
                "beschreibung": "Neuer Auftrag A-2024-003 erstellt",
                "zeitpunkt": (datetime.now() - timedelta(hours=2)).isoformat()
            },
            {
                "typ": "Rechnung",
                "beschreibung": "Rechnung R-2024-002 bezahlt",
                "zeitpunkt": (datetime.now() - timedelta(hours=4)).isoformat()
            }
        ]
    })

# Authentifizierung
async def login(request):
    try:
        body = await request.json()
        username = body.get("username")
        password = body.get("password")
        
        if username and password:
            # In einer echten Anwendung würde hier die Authentifizierung stattfinden
            token = str(uuid4())
            return JSONResponse({
                "token": token,
                "user": {
                    "id": 1,
                    "username": username,
                    "name": "Max Mustermann",
                    "role": "admin"
                }
            })
        else:
            return JSONResponse({"error": "Benutzername und Passwort erforderlich"}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

# Swagger-UI
async def swagger_ui(request):
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI-Driven ERP API Dokumentation</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" charset="UTF-8"></script>
        <script>
            window.onload = function() {
                const ui = SwaggerUIBundle({
                    url: "/api/v1/openapi.json",
                    dom_id: '#swagger-ui',
                    presets: [
                        SwaggerUIBundle.presets.apis
                    ],
                    layout: "BaseLayout"
                })
            }
        </script>
    </body>
    </html>
    """
    return PlainTextResponse(html, media_type="text/html")

# OpenAPI Spec
async def openapi_spec(request):
    """OpenAPI-Spezifikation für die API"""
    spec = {
        "openapi": "3.0.0",
        "info": {
            "title": "ERP System API",
            "description": "API für das AI-gestützte ERP-System",
            "version": "1.0.0"
        },
        "paths": {
            "/api/v1/dashboard": {
                "get": {
                    "summary": "Dashboard-Daten abrufen",
                    "description": "Liefert aggregierte Daten für das Dashboard",
                    "responses": {
                        "200": {
                            "description": "Erfolgreiche Antwort",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/v1/chargen": {
                "get": {
                    "summary": "Alle Chargen abrufen",
                    "description": "Liefert eine Liste aller Chargen im System",
                    "responses": {
                        "200": {
                            "description": "Erfolgreiche Antwort",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/components/schemas/Charge"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "post": {
                    "summary": "Neue Charge erstellen",
                    "description": "Erstellt eine neue Charge im System",
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ChargeCreate"
                                }
                            }
                        }
                    },
                    "responses": {
                        "201": {
                            "description": "Charge erfolgreich erstellt",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Charge"
                                    }
                                }
                            }
                        },
                        "400": {
                            "description": "Ungültige Eingabe"
                        }
                    }
                }
            },
            "/api/v1/chargen/{id}": {
                "get": {
                    "summary": "Charge abrufen",
                    "description": "Liefert Details zu einer spezifischen Charge",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "schema": {
                                "type": "integer"
                            },
                            "description": "ID der Charge"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Erfolgreiche Antwort",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/ChargeDetail"
                                    }
                                }
                            }
                        },
                        "404": {
                            "description": "Charge nicht gefunden"
                        }
                    }
                },
                "put": {
                    "summary": "Charge aktualisieren",
                    "description": "Aktualisiert eine bestehende Charge",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "schema": {
                                "type": "integer"
                            },
                            "description": "ID der Charge"
                        }
                    ],
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ChargeUpdate"
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Charge erfolgreich aktualisiert",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Charge"
                                    }
                                }
                            }
                        },
                        "404": {
                            "description": "Charge nicht gefunden"
                        }
                    }
                }
            },
            "/api/v1/chargen/suche": {
                "get": {
                    "summary": "Chargen suchen",
                    "description": "Sucht nach Chargen basierend auf verschiedenen Kriterien",
                    "parameters": [
                        {
                            "name": "chargennummer",
                            "in": "query",
                            "schema": {
                                "type": "string"
                            },
                            "description": "Suchbegriff für Chargennummer"
                        },
                        {
                            "name": "artikel_id",
                            "in": "query",
                            "schema": {
                                "type": "integer"
                            },
                            "description": "ID des Artikels"
                        },
                        {
                            "name": "status",
                            "in": "query",
                            "schema": {
                                "type": "string",
                                "enum": ["neu", "freigegeben", "gesperrt", "verbraucht"]
                            },
                            "description": "Status der Charge"
                        },
                        {
                            "name": "datum_von",
                            "in": "query",
                            "schema": {
                                "type": "string",
                                "format": "date-time"
                            },
                            "description": "Startdatum für die Suche (ISO 8601)"
                        },
                        {
                            "name": "datum_bis",
                            "in": "query",
                            "schema": {
                                "type": "string",
                                "format": "date-time"
                            },
                            "description": "Enddatum für die Suche (ISO 8601)"
                        },
                        {
                            "name": "lieferant_id",
                            "in": "query",
                            "schema": {
                                "type": "integer"
                            },
                            "description": "ID des Lieferanten"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Erfolgreiche Antwort",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/components/schemas/Charge"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/v1/chargen/{id}/vorwaerts": {
                "get": {
                    "summary": "Vorwärts-Verfolgung einer Charge",
                    "description": "Liefert die Vorwärts-Verfolgung einer Charge (Wo wurde diese Charge verwendet?)",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "schema": {
                                "type": "integer"
                            },
                            "description": "ID der Charge"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Erfolgreiche Antwort",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/ChargeVerfolgungVorwaerts"
                                    }
                                }
                            }
                        },
                        "404": {
                            "description": "Charge nicht gefunden"
                        }
                    }
                }
            },
            "/api/v1/chargen/{id}/rueckwaerts": {
                "get": {
                    "summary": "Rückwärts-Verfolgung einer Charge",
                    "description": "Liefert die Rückwärts-Verfolgung einer Charge (Woraus wurde diese Charge hergestellt?)",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "schema": {
                                "type": "integer"
                            },
                            "description": "ID der Charge"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Erfolgreiche Antwort",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/ChargeVerfolgungRueckwaerts"
                                    }
                                }
                            }
                        },
                        "404": {
                            "description": "Charge nicht gefunden"
                        }
                    }
                }
            },
            "/api/v1/chargen/verknuepfung": {
                "post": {
                    "summary": "Chargen verknüpfen",
                    "description": "Erstellt eine Verknüpfung zwischen zwei Chargen für die Chargenverfolgung",
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ChargeVerknuepfung"
                                }
                            }
                        }
                    },
                    "responses": {
                        "201": {
                            "description": "Verknüpfung erfolgreich erstellt",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/ChargeVerknuepfung"
                                    }
                                }
                            }
                        },
                        "400": {
                            "description": "Ungültige Eingabe"
                        },
                        "404": {
                            "description": "Eine der Chargen nicht gefunden"
                        }
                    }
                }
            },
            "/api/v1/adresse": {
                "get": {
                    "summary": "Liste aller Adressen (L3-Format)",
                    "responses": {"200": {"description": "Erfolgreiche Anfrage"}}
                }
            },
            "/api/v1/artikel/l3format": {
                "get": {
                    "summary": "Liste aller Artikel (L3-Format)",
                    "responses": {"200": {"description": "Erfolgreiche Anfrage"}}
                }
            },
            "/api/v1/inventur": {
                "get": {
                    "summary": "Liste aller Inventuren",
                    "responses": {"200": {"description": "Erfolgreiche Anfrage"}}
                }
            },
            "/api/v1/artikel": {
                "get": {
                    "summary": "Liste aller Artikel",
                    "responses": {"200": {"description": "Erfolgreiche Anfrage"}}
                }
            }
        }
    }
    return JSONResponse(spec)

# E-Commerce-Routen mit Cache
@cache.cached(ttl=240)  # 4 Minuten Cache
async def get_produkte(request):
    return JSONResponse({"produkte": produkte})

@cache.cached(ttl=240)
async def get_produkt_by_id(request):
    produkt_id = int(request.path_params["id"])
    p = lookup_maps['produkte_by_id'].get(produkt_id)
    if p:
        return JSONResponse(p)
    return JSONResponse({"error": "Produkt nicht gefunden"}, status_code=404)

@cache.cached(ttl=300)  # 5 Minuten Cache für relativ statische Daten
async def get_produkt_kategorien(request):
    return JSONResponse({"kategorien": produkt_kategorien})

@cache.cached(ttl=300)
async def get_produkt_kategorie_by_id(request):
    kategorie_id = int(request.path_params["id"])
    k = lookup_maps['produkt_kategorien_by_id'].get(kategorie_id)
    if k:
        return JSONResponse(k)
    return JSONResponse({"error": "Kategorie nicht gefunden"}, status_code=404)

# Nicht Cachen - dynamische Daten
async def get_warenkorb(request):
    # In einer echten Anwendung würde hier die Session-ID überprüft werden
    return JSONResponse(warenkörbe[0])

@cache.cached(ttl=120)
async def get_bestellungen_ecommerce(request):
    return JSONResponse({"bestellungen": bestellungen_ecommerce})

@cache.cached(ttl=120)
async def get_bestellung_ecommerce_by_id(request):
    bestellung_id = int(request.path_params["id"])
    b = lookup_maps['bestellungen_ecommerce_by_id'].get(bestellung_id)
    if b:
        return JSONResponse(b)
    return JSONResponse({"error": "Bestellung nicht gefunden"}, status_code=404)

@cache.cached(ttl=180)
async def get_adressen_ecommerce(request):
    return JSONResponse({"adressen": adressen_ecommerce})

@cache.cached(ttl=300)
async def get_rabatte(request):
    return JSONResponse({"rabatte": rabatte})

@cache.cached(ttl=180)
async def get_bewertungen(request):
    return JSONResponse({"bewertungen": bewertungen})

# Chargenreferenz-Daten
chargen_referenzen = [
    {
        "id": 1,
        "charge_id": 1,
        "referenz_typ": "EINKAUF",
        "referenz_id": 1,
        "menge": 100,
        "einheit_id": 1,
        "erstellt_am": "2024-05-01T10:00:00+00:00",
        "erstellt_von": 1
    },
    {
        "id": 2,
        "charge_id": 2,
        "referenz_typ": "EINKAUF",
        "referenz_id": 2,
        "menge": 50,
        "einheit_id": 1,
        "erstellt_am": "2024-05-10T11:30:00+00:00",
        "erstellt_von": 1
    }
]

# Lookup-Maps für schnellere ID-basierte Abfragen
def create_lookup_maps():
    """Erstellt Lookup-Maps für alle Datenstrukturen"""
    global lookup_maps
    lookup_maps = {
        'artikel_by_id': {a['id']: a for a in artikel},
        'lager_by_id': {l['id']: l for l in lager},
        'lagerorte_by_id': {lo['id']: lo for lo in lagerorte},
        'kunden_by_id': {k['id']: k for k in kunden},
        'auftraege_by_id': {a['id']: a for a in auftraege},
        'bestellungen_by_id': {b['id']: b for b in bestellungen},
        'lieferanten_by_id': {l['id']: l for l in lieferanten},
        'rechnungen_by_id': {r['id']: r for r in rechnungen},
        'els_by_id': {e['id']: e for e in eingangslieferscheine},
        'vls_by_id': {v['id']: v for v in verkaufslieferscheine},
        'projekte_by_id': {p['id']: p for p in projekte},
        'dokumente_by_id': {d['id']: d for d in dokumente},
        'produkte_by_id': {p['id']: p for p in produkte},
        'produkt_kategorien_by_id': {k['id']: k for k in produkt_kategorien},
        'bestellungen_ecommerce_by_id': {b['id']: b for b in bestellungen_ecommerce},
        'adressen_by_nummer': {a['Nummer']: a for a in adressen},
        'chargen_referenzen_by_id': {cr['id']: cr for cr in chargen_referenzen}
    }
    return lookup_maps

# Initialisierung
lookup_maps = {}

# Optimierte ID-basierte Abfragefunktion
def get_by_id(collection, id_field, id_value):
    map_name = f"{collection}_by_{id_field}"
    if map_name in lookup_maps:
        return lookup_maps[map_name].get(id_value)
    return None

# --------------- Chargenverwaltungs-Endpunkte ---------------

@cache.cached(ttl=180)
async def get_chargen(request):
    """Alle Chargen abrufen"""
    return JSONResponse(chargen)

@cache.cached(ttl=180)
async def get_charge_by_id(request):
    """Eine spezifische Charge abrufen"""
    charge_id = int(request.path_params["id"])
    result = next((c for c in chargen if c["id"] == charge_id), None)
    if result:
        # Artikel- und Lieferanteninformationen hinzufügen
        artikel_info = next((a for a in artikel if a["id"] == result["artikel_id"]), {})
        lieferant_info = next((l for l in lieferanten if l["id"] == result["lieferant_id"]), {})
        
        # Kopie des Ergebnisses erstellen und erweitern
        enhanced_result = result.copy()
        enhanced_result["artikel_name"] = artikel_info.get("bezeichnung", "")
        enhanced_result["lieferant_name"] = lieferant_info.get("firma", "")
        
        return JSONResponse(enhanced_result)
    return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)

async def create_charge(request):
    """Neue Charge erstellen"""
    data = await request.json()
    
    # Automatische Chargennummer generieren, wenn nicht angegeben
    if "chargennummer" not in data:
        artikel_id = data.get("artikel_id")
        if artikel_id:
            artikel_obj = next((a for a in artikel if a["id"] == artikel_id), None)
            if artikel_obj:
                artikel_code = artikel_obj.get("artikelnummer", "").split("-")[1] if "-" in artikel_obj.get("artikelnummer", "") else "XXX"
                today = datetime.now(UTC)
                date_part = today.strftime("%Y%m%d")
                # Einfache Implementierung der fortlaufenden Nummer
                existing_count = len([c for c in chargen if c.get("chargennummer", "").startswith(f"{date_part}-{artikel_code}")])
                lauf_nr = str(existing_count + 1).zfill(4)
                data["chargennummer"] = f"{date_part}-{artikel_code}-{lauf_nr}"
    
    # Pflichtfelder prüfen
    if "artikel_id" not in data or "chargennummer" not in data:
        return JSONResponse({"error": "Pflichtfelder fehlen"}, status_code=400)
    
    # Neue ID generieren
    new_id = max([c["id"] for c in chargen], default=0) + 1
    
    # Neue Charge erstellen
    new_charge = {
        "id": new_id,
        "erstellt_am": datetime.now(UTC).isoformat(),
        "status": data.get("status", "neu"),
        "charge_typ": data.get("charge_typ", "eingang"),
        **data
    }
    
    # Zur Liste hinzufügen
    chargen.append(new_charge)
    
    return JSONResponse(new_charge, status_code=201)

async def update_charge(request):
    """Charge aktualisieren"""
    charge_id = int(request.path_params["id"])
    data = await request.json()
    
    # Charge finden
    charge_index = next((i for i, c in enumerate(chargen) if c["id"] == charge_id), None)
    if charge_index is None:
        return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
    
    # Charge aktualisieren
    chargen[charge_index].update(data)
    chargen[charge_index]["geaendert_am"] = datetime.now(UTC).isoformat()
    
    return JSONResponse(chargen[charge_index])

async def search_chargen(request):
    """Chargen suchen"""
    # Parameter aus Query extrahieren
    params = dict(request.query_params)
    
    results = chargen.copy()
    
    # Nach verschiedenen Kriterien filtern
    if "chargennummer" in params:
        results = [c for c in results if params["chargennummer"].lower() in c.get("chargennummer", "").lower()]
    
    if "artikel_id" in params:
        artikel_id = int(params["artikel_id"])
        results = [c for c in results if c.get("artikel_id") == artikel_id]
    
    if "status" in params:
        results = [c for c in results if c.get("status") == params["status"]]
    
    if "datum_von" in params and "datum_bis" in params:
        try:
            von_datum = datetime.fromisoformat(params["datum_von"].replace('Z', '+00:00'))
            bis_datum = datetime.fromisoformat(params["datum_bis"].replace('Z', '+00:00'))
            
            # Nach Herstelldatum filtern
            results = [c for c in results if c.get("herstelldatum") and 
                      von_datum <= datetime.fromisoformat(c["herstelldatum"].replace('Z', '+00:00')) <= bis_datum]
        except ValueError:
            # Fehler beim Parsen der Datumsangaben
            pass
    
    if "lieferant_id" in params:
        lieferant_id = int(params["lieferant_id"])
        results = [c for c in results if c.get("lieferant_id") == lieferant_id]
    
    return JSONResponse(results)

async def get_charge_vorwaerts(request):
    """Vorwärts-Verfolgung einer Charge"""
    charge_id = int(request.path_params["id"])
    
    # Charge prüfen
    charge = next((c for c in chargen if c["id"] == charge_id), None)
    if not charge:
        return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
    
    # Verfolgungsdaten suchen
    verfolgungen = [v for v in chargen_verfolgung if v["quell_charge_id"] == charge_id]
    
    # Artikel-Information hinzufügen
    artikel_info = next((a for a in artikel if a["id"] == charge["artikel_id"]), {})
    
    # Ergebnis aufbauen
    result = {
        "charge": {
            "id": charge["id"],
            "chargennummer": charge["chargennummer"],
            "artikel_name": artikel_info.get("bezeichnung", "")
        },
        "verwendungen": []
    }
    
    # Verwendungen hinzufügen
    for v in verfolgungen:
        ziel_charge = next((c for c in chargen if c["id"] == v["ziel_charge_id"]), {})
        ziel_artikel_info = next((a for a in artikel if a["id"] == ziel_charge.get("artikel_id", 0)), {})
        
        # Prüfen, ob diese Zielcharge weitere Verwendungen hat
        weitere_verwendungen = any(cv["quell_charge_id"] == v["ziel_charge_id"] for cv in chargen_verfolgung)
        
        verwendung = {
            "id": v["id"],
            "prozess_typ": v["prozess_typ"],
            "prozess_name": f"Prozess {v['prozess_id']}" if v.get("prozess_id") else "Unbekannt",
            "datum": v["erstellt_am"],
            "menge": v["menge"],
            "einheit": "kg",  # In einer echten Anwendung würde hier die richtige Einheit stehen
            "ziel_charge": {
                "id": ziel_charge.get("id"),
                "chargennummer": ziel_charge.get("chargennummer", ""),
                "artikel_name": ziel_artikel_info.get("bezeichnung", ""),
                "weitere_verwendungen": weitere_verwendungen
            }
        }
        
        result["verwendungen"].append(verwendung)
    
    return JSONResponse(result)

async def get_charge_rueckwaerts(request):
    """Rückwärts-Verfolgung einer Charge"""
    charge_id = int(request.path_params["id"])
    
    # Charge prüfen
    charge = next((c for c in chargen if c["id"] == charge_id), None)
    if not charge:
        return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
    
    # Verfolgungsdaten suchen
    verfolgungen = [v for v in chargen_verfolgung if v["ziel_charge_id"] == charge_id]
    
    # Artikel-Information hinzufügen
    artikel_info = next((a for a in artikel if a["id"] == charge["artikel_id"]), {})
    
    # Ergebnis aufbauen
    result = {
        "charge": {
            "id": charge["id"],
            "chargennummer": charge["chargennummer"],
            "artikel_name": artikel_info.get("bezeichnung", "")
        },
        "bestandteile": []
    }
    
    # Bestandteile hinzufügen
    for v in verfolgungen:
        quell_charge = next((c for c in chargen if c["id"] == v["quell_charge_id"]), {})
        quell_artikel_info = next((a for a in artikel if a["id"] == quell_charge.get("artikel_id", 0)), {})
        
        # Prüfen, ob diese Quellcharge weitere Bestandteile hat
        weitere_bestandteile = any(cv["ziel_charge_id"] == v["quell_charge_id"] for cv in chargen_verfolgung)
        
        bestandteil = {
            "id": v["id"],
            "prozess_typ": v["prozess_typ"],
            "prozess_name": f"Prozess {v['prozess_id']}" if v.get("prozess_id") else "Unbekannt",
            "datum": v["erstellt_am"],
            "menge": v["menge"],
            "einheit": "kg",  # In einer echten Anwendung würde hier die richtige Einheit stehen
            "quell_charge": {
                "id": quell_charge.get("id"),
                "chargennummer": quell_charge.get("chargennummer", ""),
                "artikel_name": quell_artikel_info.get("bezeichnung", ""),
                "weitere_bestandteile": weitere_bestandteile
            }
        }
        
        result["bestandteile"].append(bestandteil)
    
    return JSONResponse(result)

async def verknuepfe_chargen(request):
    """Verknüpft eine Quell-Charge mit einer Ziel-Charge."""
    data = await request.json()
    
    # Pflichtfelder prüfen
    required_fields = ["quell_charge_id", "ziel_charge_id", "menge", "einheit_id", "prozess_typ"]
    for field in required_fields:
        if field not in data:
            return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
    
    # Prüfen, ob die Quell-Charge existiert
    quell_charge = next((c for c in chargen if c["id"] == data["quell_charge_id"]), None)
    if not quell_charge:
        return JSONResponse({"error": "Quell-Charge nicht gefunden"}, status_code=404)
    
    # Prüfen, ob die Ziel-Charge existiert
    ziel_charge = next((c for c in chargen if c["id"] == data["ziel_charge_id"]), None)
    if not ziel_charge:
        return JSONResponse({"error": "Ziel-Charge nicht gefunden"}, status_code=404)
    
    # Neue ID generieren
    new_id = max([cv["id"] for cv in chargen_verfolgung], default=0) + 1
    
    # Neue Verknüpfung erstellen
    new_verfolgung = {
        "id": new_id,
        "erstellt_am": datetime.now(UTC).isoformat(),
        "erstellt_von": 1,  # Beispiel-Benutzer
        **data
    }
    
    # Zur Liste hinzufügen
    chargen_verfolgung.append(new_verfolgung)
    
    return JSONResponse(new_verfolgung, status_code=201)

# -- Chargen-Lager-Integration API-Funktionen --

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

# --------------------------------------------------------------------

@cache.cached(ttl=240)
async def get_konten(request):
    """Gibt alle Konten zurück."""
    return JSONResponse(konten)

@cache.cached(ttl=240)
async def get_konto_by_id(request):
    """Gibt ein Konto anhand der ID zurück."""
    id_value = int(request.path_params["id"])
    konto = get_by_id(konten, "id", id_value)
    if konto:
        return JSONResponse(konto)
    return JSONResponse({"message": "Konto nicht gefunden"}, status_code=404)

@cache.cached(ttl=240)
async def get_buchungen(request):
    """Gibt alle Buchungen zurück."""
    return JSONResponse(buchungen)

@cache.cached(ttl=240)
async def get_buchung_by_id(request):
    """Gibt eine Buchung anhand der ID zurück."""
    id_value = int(request.path_params["id"])
    buchung = get_by_id(buchungen, "id", id_value)
    if buchung:
        return JSONResponse(buchung)
    return JSONResponse({"message": "Buchung nicht gefunden"}, status_code=404)

@cache.cached(ttl=240)
async def get_belege(request):
    """Gibt alle Belege zurück."""
    return JSONResponse(belege)

@cache.cached(ttl=240)
async def get_beleg_by_id(request):
    """Gibt einen Beleg anhand der ID zurück."""
    id_value = int(request.path_params["id"])
    beleg = get_by_id(belege, "id", id_value)
    if beleg:
        return JSONResponse(beleg)
    return JSONResponse({"message": "Beleg nicht gefunden"}, status_code=404)

@cache.cached(ttl=240)
async def get_kostenstellen(request):
    """Gibt alle Kostenstellen zurück."""
    return JSONResponse(kostenstellen)

@cache.cached(ttl=240)
async def get_kostenstelle_by_id(request):
    """Gibt eine Kostenstelle anhand der ID zurück."""
    id_value = int(request.path_params["id"])
    kostenstelle = get_by_id(kostenstellen, "id", id_value)
    if kostenstelle:
        return JSONResponse(kostenstelle)
    return JSONResponse({"message": "Kostenstelle nicht gefunden"}, status_code=404)

@cache.cached(ttl=300)
async def get_bilanz(request):
    """Gibt eine einfache Bilanz zurück."""
    aktiva = [k for k in konten if k["typ"] == "Aktiv"]
    passiva = [k for k in konten if k["typ"] == "Passiv"]
    
    summe_aktiva = sum(k["saldo"] for k in aktiva)
    summe_passiva = sum(k["saldo"] for k in passiva)
    
    return JSONResponse({
        "stichtag": datetime.now(UTC).date().isoformat(),
        "aktiva": aktiva,
        "passiva": passiva,
        "summe_aktiva": summe_aktiva,
        "summe_passiva": summe_passiva,
        "differenz": summe_aktiva - summe_passiva
    })

@cache.cached(ttl=300)
async def get_gewinn_verlust(request):
    """Gibt eine einfache Gewinn- und Verlustrechnung zurück."""
    ertragskonten = [k for k in konten if k["typ"] == "Ertrag"]
    aufwandskonten = [k for k in konten if k["typ"] == "Aufwand"]
    
    summe_ertraege = sum(k["saldo"] for k in ertragskonten)
    summe_aufwendungen = sum(k["saldo"] for k in aufwandskonten)
    
    return JSONResponse({
        "von_datum": (datetime.now(UTC) - timedelta(days=30)).date().isoformat(),
        "bis_datum": datetime.now(UTC).date().isoformat(),
        "ertraege": ertragskonten,
        "aufwendungen": aufwandskonten,
        "summe_ertraege": summe_ertraege,
        "summe_aufwendungen": summe_aufwendungen,
        "gewinn_verlust": summe_ertraege - summe_aufwendungen
    })

# Liste der Routen
routes = [
    # Grundlegende Endpunkte
    Route("/", endpoint=root),
    Route("/health", endpoint=health_check),
    Route("/docs", endpoint=swagger_ui),
    Route("/openapi.json", endpoint=openapi_spec),
    
    # Auth-Endpunkte
    Route("/api/login", endpoint=login, methods=["POST"]),
    
    # Dashboard
    Route("/api/v1/dashboard", endpoint=get_dashboard_data),
    
    # L3-Kompatible Endpunkte
    Route("/api/v1/adresse", endpoint=get_adressen),
    Route("/api/v1/artikel/l3format", endpoint=get_artikel_l3_format),
    
    # Inventur-Endpunkte
    Route("/api/v1/inventur", endpoint=get_inventuren),
    Route("/api/v1/inventuren", endpoint=get_inventuren),
    Route("/api/v1/inventur/{inventur_id:int}", endpoint=get_inventur_by_id),
    Route("/api/v1/inventur/create", endpoint=create_inventur, methods=["POST"]),
    Route("/api/v1/inventur/{inventur_id:int}/update", endpoint=update_inventur, methods=["PUT"]),
    Route("/api/v1/inventur/{inventur_id:int}/delete", endpoint=delete_inventur, methods=["DELETE"]),
    Route("/api/v1/inventur/{inventur_id:int}/position/create", endpoint=add_inventur_position, methods=["POST"]),
    
    # Lager-Endpunkte
    Route("/api/v1/lager", endpoint=get_lager),
    Route("/api/v1/lager/{lager_id:int}", endpoint=get_lager_by_id),
    Route("/api/v1/lager/create", endpoint=create_lager, methods=["POST"]),
    Route("/api/v1/lager/{lager_id:int}/update", endpoint=update_lager, methods=["PUT"]),
    Route("/api/v1/lager/{lager_id:int}/delete", endpoint=delete_lager, methods=["DELETE"]),
    
    # Lagerort-Endpunkte
    Route("/api/v1/lagerort", endpoint=get_lagerorte),
    Route("/api/v1/lagerort/{lagerort_id:int}", endpoint=get_lagerort_by_id),
    Route("/api/v1/lagerort/create", endpoint=create_lagerort, methods=["POST"]),
    Route("/api/v1/lagerort/{lagerort_id:int}/update", endpoint=update_lagerort, methods=["PUT"]),
    Route("/api/v1/lagerort/{lagerort_id:int}/delete", endpoint=delete_lagerort, methods=["DELETE"]),
    
    # Lagerplatz-Endpunkte
    Route("/api/v1/lagerplatz", endpoint=get_lagerplaetze),
    Route("/api/v1/lagerplatz/{lagerplatz_id:int}", endpoint=get_lagerplatz_by_id),
    Route("/api/v1/lagerplatz/create", endpoint=create_lagerplatz, methods=["POST"]),
    Route("/api/v1/lagerplatz/{lagerplatz_id:int}/update", endpoint=update_lagerplatz, methods=["PUT"]),
    Route("/api/v1/lagerplatz/{lagerplatz_id:int}/delete", endpoint=delete_lagerplatz, methods=["DELETE"]),
    
    # Chargen-Endpunkte
    Route("/api/v1/charge", endpoint=get_chargen),
    Route("/api/v1/charge/{charge_id:int}", endpoint=get_charge_by_id),
    Route("/api/v1/charge/create", endpoint=create_charge, methods=["POST"]),
    Route("/api/v1/charge/{charge_id:int}/update", endpoint=update_charge, methods=["PUT"]),
    Route("/api/v1/charge/{charge_id:int}/delete", endpoint=delete_charge, methods=["DELETE"]),
    Route("/api/v1/charge/{charge_id:int}/verfolgung", endpoint=get_charge_verfolgung),
    Route("/api/v1/charge/{charge_id:int}/generate-qrcode", endpoint=generate_qrcode_for_charge, methods=["POST"]),
    Route("/api/v1/charge/{charge_id:int}/qrcode", endpoint=get_charge_qrcode),
    
    # Chargen-Referenz-Endpunkte
    Route("/api/v1/chargereferenz/create", endpoint=create_charge_referenz, methods=["POST"]),
    Route("/api/v1/chargereferenz/{referenz_id:int}/update", endpoint=update_charge_referenz, methods=["PUT"]),
    Route("/api/v1/chargereferenz/{referenz_id:int}/delete", endpoint=delete_charge_referenz, methods=["DELETE"]),
    
    # Produktion-Endpunkte
    Route("/api/v1/produktion/auftraege", endpoint=get_produktionsauftraege),
    Route("/api/v1/produktion/auftrag/{auftrag_id:int}", endpoint=get_produktionsauftrag_by_id),
    Route("/api/v1/produktion/auftrag/create", endpoint=create_produktionsauftrag, methods=["POST"]),
    Route("/api/v1/produktion/auftrag/{auftrag_id:int}/start", endpoint=starte_produktion, methods=["POST"]),
    Route("/api/v1/produktion/auftrag/{auftrag_id:int}/abschliessen", endpoint=schliesse_produktion_ab, methods=["POST"]),
    
    # QS-Futtermittel-Endpunkte
    Route("/api/v1/qs/futtermittel/chargen", endpoint=get_qs_futtermittel_chargen),
    Route("/api/v1/qs/futtermittel/charge/{charge_id:int}", endpoint=get_qs_futtermittel_charge_by_id),
    Route("/api/v1/qs/futtermittel/charge/create", endpoint=create_qs_futtermittel_charge, methods=["POST"]),
    Route("/api/v1/qs/futtermittel/charge/{charge_id:int}/update", endpoint=update_qs_futtermittel_charge, methods=["PUT"]),
    Route("/api/v1/qs/futtermittel/charge/{charge_id:int}/delete", endpoint=delete_qs_futtermittel_charge, methods=["DELETE"]),
    Route("/api/v1/qs/futtermittel/charge/{charge_id:int}/monitoring/create", endpoint=add_monitoring, methods=["POST"]),
    Route("/api/v1/qs/futtermittel/charge/{charge_id:int}/ereignis/create", endpoint=add_ereignis, methods=["POST"]),
    Route("/api/v1/qs/ereignis/{ereignis_id:int}/benachrichtigung/create", endpoint=add_benachrichtigung, methods=["POST"]),
    Route("/api/v1/qs/dokument/create", endpoint=add_dokument, methods=["POST"]),
    Route("/api/v1/qs/api/lieferant/{lieferanten_id:int}/status", endpoint=simulate_qs_api_lieferantenstatus),
    Route("/api/v1/qs/api/probe/{monitoring_id:int}/upload", endpoint=simulate_qs_api_probenupload),
    Route("/api/v1/qs/futtermittel/charge/{charge_id:int}/anomalien", endpoint=analyze_charge_anomalies),
    
    # Statische Dateien
    Mount("/static", app=StaticFiles(directory="frontend/static"), name="static"),
    Mount("/", app=StaticFiles(directory="frontend/dist", html=True), name="frontend"),
    
    # Neue Scanner-API-Endpunkte
    Route("/api/v1/scanner/prozess", endpoint=verarbeite_scan, methods=["POST"]),
    Route("/api/v1/picklisten/mitarbeiter/{mitarbeiter_id:int}", endpoint=get_picklisten_fuer_mitarbeiter),
    Route("/api/v1/inventur/auftraege/mitarbeiter/{mitarbeiter_id:int}", endpoint=get_inventur_auftraege_fuer_mitarbeiter),
    Route("/api/v1/inventur/{inventur_id:int}/ergebnis", endpoint=submit_inventur_ergebnis, methods=["POST"]),
    Route("/api/v1/scanner/history", endpoint=get_scan_history),
    
    # Neue Chargen-Berichts-Endpunkte
    Route("/api/chargen/berichte", endpoint=get_charge_bericht_typen),
    Route("/api/chargen/{id:int}/berichte/{typ}", endpoint=generate_charge_bericht),
]

# App mit optimierter Konfiguration erstellen
app = Starlette(
    debug=False,  # Debug-Modus ausschalten für bessere Performance
    routes=routes,
    middleware=middleware,
    on_startup=[create_lookup_maps],  # Lookup-Maps beim Start erstellen
)

# Statische Files für Dokumentation (Kommentiert, da das Verzeichnis nicht existiert)
# app.mount("/docs/static", StaticFiles(directory=str(Path(__file__).parent / "static")), name="static")

# Nur wenn direkt ausgeführt
if __name__ == "__main__":
    import argparse
    
    # Kommandozeilenargumente parsen
    parser = argparse.ArgumentParser(description="Minimaler Server für AI-Driven ERP System")
    parser.add_argument("--port", type=int, default=8005, help="Port für den Server (Standard: 8005)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host-Adresse (Standard: 0.0.0.0)")
    args = parser.parse_args()
    
    print(f"Minimaler Server wird gestartet...")
    print(f"Server läuft auf http://localhost:{args.port}")
    print(f"API-Dokumentation verfügbar unter: http://localhost:{args.port}/docs")
    
    # Uvicorn mit minimaler Konfiguration starten
    uvicorn.run(
        "minimal_server:app",
        host=args.host,
        port=args.port,
        log_level="info"
    ) 