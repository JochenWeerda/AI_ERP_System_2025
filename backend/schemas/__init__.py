"""
Pydantic-Schemas für das AI-gestützte ERP-System.

Dieses Paket enthält die Pydantic-Modelle für API-Validierung und Dokumentation.
"""

# Import der Schemas
from .partner import (
    Partner, PartnerCreate, PartnerUpdate, Tag, TagCreate,
    Adresse, AdresseCreate, Kontakt, KontaktCreate, Bankverbindung, BankverbindungCreate
)

# Exportiere alle wichtigen Schemas
__all__ = [
    # Partner-Schemas
    'Partner', 'PartnerCreate', 'PartnerUpdate', 'Tag', 'TagCreate',
    'Adresse', 'AdresseCreate', 'Kontakt', 'KontaktCreate', 'Bankverbindung', 'BankverbindungCreate'
] 