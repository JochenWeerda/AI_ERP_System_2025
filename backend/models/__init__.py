"""
Modellpaket für das ERP-System.

Dieses Paket enthält alle Datenbankmodelle, die die Grundlage für das ERP-System bilden.
"""

# Base aus database importieren
from backend.db.database import Base

# Importiere Modelle
from .ecommerce import (
    Product, ProductCategory, CartItem, ShoppingCart, 
    Order, OrderItem, Address, Discount, Review
)

from .document import (
    DocumentType, DocumentStatus, Document, Folder, Tag
)

# Importiere neue Stammdatenmodelle
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
    Lagerbewegung, Charge, Seriennummer, Inventur, InventurPosition,
    # Neue Chargenverwaltungs-Modelle
    ChargeStatus, ChargeTyp, ChargeReferenz, ReferenzTyp, 
    ChargenVerfolgung, ProzessTyp, ChargenQualitaet, QualitaetsStatus,
    ChargeDokument, DokumentTyp
)

# Importiere Chargen-Lager-Integration
from .chargen_lager import (
    LagerChargenReservierung, ChargenLagerBewegung
)

from .finanzen import (
    KontoArt, Kontenplan, Konto, Waehrung, Wechselkurs, SteuerArt,
    Steuersatz, Steuerkategorie, SteuerkategorieZuordnung, Geschaeftsjahr,
    Buchungsperiode, Buchung, Journal, Kostenstelle, Kostentraeger,
    Zahlungsbedingung
)

from .artikel_stammdaten import (
    ArtikelStammdaten,
    AlternativArtikel,
    AlternativeEinheit,
    VerkaufsPreis,
    ArtikelDokument,
    ArtikelUnterlage,
    ArtikelKonto,
    ArtikelLagerbestand,
    KIErweiterung,
    KIAlternative,
    SEOKeyword
)

# Importiere weitere Modelle
try:
    from .qs_futtermittel import QSFuttermittelCharge, QSRohstoff, QSMonitoring, QSEreignis, QSBenachrichtigung, QSDokument
except ImportError as e:
    print(f"Fehler beim Import von QS-Futtermittel-Modellen: {e}")

try:
    from .lager import Lager, LagerOrt, LagerBewegung, LagerBestand
except ImportError as e:
    print(f"Fehler beim Import von Lager-Modellen: {e}")

try:
    from .partner import KundenGruppe, LieferantenBewertung, Zahlungsbedingungen
except ImportError as e:
    print(f"Fehler beim Import von Partner-Modellen: {e}")

try:
    from .produktion import ProduktionsAuftrag, ProduktionsSchritt, ProduktionsProtokoll, RezepturPosition
except ImportError as e:
    print(f"Fehler beim Import von Produktions-Modellen: {e}")

try:
    from .user import User, Role, Permission
except ImportError as e:
    print(f"Fehler beim Import von Benutzer-Modellen: {e}")

try:
    from .notfall import NotfallPlan, NotfallKontakt, NotfallRessource, NotfallAktion, Notfall
except ImportError as e:
    print(f"Fehler beim Import von Notfall-Modellen: {e}")

# Exportieren aller Modelle für den Import von anderen Modulen
__all__ = [
    'Base',
    
    # ecommerce.py
    'Product', 'ProductCategory', 'CartItem', 'ShoppingCart',
    'Order', 'OrderItem', 'Address', 'Discount', 'Review',
    
    # document.py
    'DocumentType', 'DocumentStatus', 'Document', 'Folder', 'Tag',
    
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
    # Neue Chargenverwaltungs-Modelle
    'ChargeStatus', 'ChargeTyp', 'ChargeReferenz', 'ReferenzTyp',
    'ChargenVerfolgung', 'ProzessTyp', 'ChargenQualitaet', 'QualitaetsStatus',
    'ChargeDokument', 'DokumentTyp',
    
    # chargen_lager.py
    'LagerChargenReservierung', 'ChargenLagerBewegung',
    
    # finanzen.py
    'KontoArt', 'Kontenplan', 'Konto', 'Waehrung', 'Wechselkurs', 'SteuerArt',
    'Steuersatz', 'Steuerkategorie', 'SteuerkategorieZuordnung', 'Geschaeftsjahr',
    'Buchungsperiode', 'Buchung', 'Journal', 'Kostenstelle', 'Kostentraeger',
    'Zahlungsbedingung',

    # artikel_stammdaten.py
    'ArtikelStammdaten',
    'AlternativArtikel',
    'AlternativeEinheit',
    'VerkaufsPreis',
    'ArtikelDokument',
    'ArtikelUnterlage',
    'ArtikelKonto',
    'ArtikelLagerbestand',
    'KIErweiterung',
    'KIAlternative',
    'SEOKeyword',

    # qs_futtermittel.py
    'QSFuttermittelCharge', 'QSRohstoff', 'QSMonitoring', 'QSEreignis', 'QSBenachrichtigung', 'QSDokument',

    # lager.py
    'Lager', 'LagerOrt', 'LagerBewegung', 'LagerBestand',

    # partner.py
    'KundenGruppe', 'LieferantenBewertung', 'Zahlungsbedingungen',

    # produktion.py
    'ProduktionsAuftrag', 'ProduktionsSchritt', 'ProduktionsProtokoll', 'RezepturPosition',

    # user.py
    'User', 'Role', 'Permission',

    # notfall.py
    'NotfallPlan', 'NotfallKontakt', 'NotfallRessource', 'NotfallAktion', 'Notfall'
]