import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, SessionLocal

class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def create_tenant(name, description=None, is_active=True):
    """
    Erstellt einen neuen Mandanten in der Datenbank.
    """
    db = SessionLocal()
    try:
        # Prüfen, ob der Mandant bereits existiert
        existing_tenant = db.query(Tenant).filter(Tenant.name == name).first()
        if existing_tenant:
            return existing_tenant
        
        # Neuen Mandanten erstellen
        tenant = Tenant(
            name=name,
            description=description,
            is_active=is_active
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
        return tenant
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def get_tenant_by_name(name):
    """
    Sucht einen Mandanten anhand seines Namens.
    """
    db = SessionLocal()
    try:
        return db.query(Tenant).filter(Tenant.name == name).first()
    finally:
        db.close()

def get_tenant_by_id(tenant_id):
    """
    Sucht einen Mandanten anhand seiner ID.
    """
    db = SessionLocal()
    try:
        return db.query(Tenant).filter(Tenant.id == tenant_id).first()
    finally:
        db.close()

def get_all_tenants(include_inactive=False):
    """
    Gibt alle Mandanten zurück.
    """
    db = SessionLocal()
    try:
        query = db.query(Tenant)
        if not include_inactive:
            query = query.filter(Tenant.is_active == True)
        return query.all()
    finally:
        db.close() 