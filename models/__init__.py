"""
Modelle für das AI-gestützte ERP-System.

Dieses Paket enthält alle SQLAlchemy-Datenbankmodelle für das ERP-System.
"""

# Versuche verschiedene Import-Pfade
try:
    from backend.db.base import Base
except ImportError:
    try:
        from backend.app.db.base import Base
    except ImportError:
        try:
            from app.db.base import Base
        except ImportError:
            try:
                from db.base import Base
            except ImportError:
                Base = None

# Importiere Stammdatenmodelle
from .partner import (
    PartnerTyp, Partner, AdressTyp, Adresse, Kontakt, Bankverbindung, Tag
)

from .artikel import (
    ArtikelTyp, Artikel, ArtikelVariante, ArtikelKategorie, Einheit,
    ArtikelBild, ArtikelTag, ArtikelPreis, Preisliste, ArtikelLieferant,
    Attribut, AttributWert, ArtikelAttributWert, VariantenAttributWert,
    Stueckliste, StuecklistePosition, Operation, Arbeitsplatz,
    Gebinde, GebindePosition
)

from .lager import (
    LagerTyp, Lager, LagerortTyp, Lagerort, ArtikelBestand, BewegungsTyp,
    Lagerbewegung, Charge, Seriennummer, Inventur, InventurPosition
)

from .finanzen import (
    KontoArt, Kontenplan, Konto, Waehrung, Wechselkurs, SteuerArt,
    Steuersatz, Steuerkategorie, SteuerkategorieZuordnung, Geschaeftsjahr,
    Buchungsperiode, Buchung, Journal, Kostenstelle, Kostentraeger,
    Zahlungsbedingung
)

# Exportiere alle wichtigen Klassen
__all__ = [
    'Base',
    
    # partner.py
    'PartnerTyp', 'Partner', 'AdressTyp', 'Adresse', 'Kontakt', 'Bankverbindung', 'Tag',
    
    # artikel.py
    'ArtikelTyp', 'Artikel', 'ArtikelVariante', 'ArtikelKategorie', 'Einheit',
    'ArtikelBild', 'ArtikelTag', 'ArtikelPreis', 'Preisliste', 'ArtikelLieferant',
    'Attribut', 'AttributWert', 'ArtikelAttributWert', 'VariantenAttributWert',
    'Stueckliste', 'StuecklistePosition', 'Operation', 'Arbeitsplatz',
    'Gebinde', 'GebindePosition',
    
    # lager.py
    'LagerTyp', 'Lager', 'LagerortTyp', 'Lagerort', 'ArtikelBestand', 'BewegungsTyp',
    'Lagerbewegung', 'Charge', 'Seriennummer', 'Inventur', 'InventurPosition',
    
    # finanzen.py
    'KontoArt', 'Kontenplan', 'Konto', 'Waehrung', 'Wechselkurs', 'SteuerArt',
    'Steuersatz', 'Steuerkategorie', 'SteuerkategorieZuordnung', 'Geschaeftsjahr',
    'Buchungsperiode', 'Buchung', 'Journal', 'Kostenstelle', 'Kostentraeger',
    'Zahlungsbedingung'
] 