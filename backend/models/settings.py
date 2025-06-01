import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, SessionLocal

class SystemSettings(Base):
    __tablename__ = "system_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    system_name = Column(String, nullable=False, default="AI-getriebenes ERP-System")
    version = Column(String, nullable=False)
    is_initialized = Column(Boolean, default=False)
    multi_tenant_enabled = Column(Boolean, default=True)
    roles_enabled = Column(Boolean, default=True)
    maintenance_mode = Column(Boolean, default=False)
    custom_settings = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def get_system_settings():
    """
    Gibt die aktuellen Systemeinstellungen zurück.
    """
    db = SessionLocal()
    try:
        settings = db.query(SystemSettings).first()
        if not settings:
            # Standardeinstellungen erstellen, wenn keine vorhanden sind
            settings = SystemSettings(
                system_name="AI-getriebenes ERP-System",
                version="1.0.0",
                is_initialized=False,
                multi_tenant_enabled=True,
                roles_enabled=True,
                maintenance_mode=False
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        return settings
    finally:
        db.close()

def update_system_settings(settings_data):
    """
    Aktualisiert die Systemeinstellungen.
    """
    db = SessionLocal()
    try:
        settings = db.query(SystemSettings).first()
        if not settings:
            settings = SystemSettings(**settings_data)
            db.add(settings)
        else:
            for key, value in settings_data.items():
                if hasattr(settings, key):
                    setattr(settings, key, value)
        db.commit()
        db.refresh(settings)
        return settings
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def is_system_initialized():
    """
    Prüft, ob das System bereits initialisiert wurde.
    """
    db = SessionLocal()
    try:
        settings = db.query(SystemSettings).first()
        return settings and settings.is_initialized
    finally:
        db.close() 