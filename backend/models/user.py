from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base

# Vielen-zu-vielen-Beziehungen
user_role_association = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('role_id', Integer, ForeignKey('roles.id'))
)

# Tabelle für Beziehung zwischen Benutzern und absolvierten Arbeitsschutzunterweisungen
user_safety_training_association = Table(
    'user_safety_trainings',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('safety_training_id', Integer, ForeignKey('safety_trainings.id')),
    Column('completion_date', DateTime, default=datetime.utcnow),
    Column('certificate_id', String(50), nullable=True)
)

class User(Base):
    """User-Modell für die Authentifizierung und Benutzerinformationen"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(20), nullable=True)
    full_name = Column(String(100))
    hashed_password = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    department = Column(String(100), nullable=True)
    position = Column(String(100), nullable=True)
    
    # Vertriebsberater Felder
    is_sales_rep = Column(Boolean, default=False, comment="Gibt an, ob der Benutzer ein Vertriebsberater ist")
    sales_rep_code = Column(String(10), nullable=True, unique=True, index=True, comment="Kürzel für Vertriebsberater (aus Initialen)")
    
    # Arbeitsschutz-relevante Felder
    sachkundenachweis_pflanzenschutz = Column(Boolean, default=False, comment="Hat Sachkundenachweis Pflanzenschutz")
    sachkundenachweis_pflanzenschutz_gueltig_bis = Column(DateTime, nullable=True, comment="Gültigkeitsdatum des Sachkundenachweises Pflanzenschutz")
    gabelstapler_schein = Column(Boolean, default=False, comment="Hat Staplerschein/Flurförderfahrzeug-Schein")
    gabelstapler_schein_gueltig_bis = Column(DateTime, nullable=True, comment="Gültigkeitsdatum des Staplerscheins")
    adr_schein = Column(Boolean, default=False, comment="Hat ADR-Schein für Gefahrgut")
    adr_schein_gueltig_bis = Column(DateTime, nullable=True, comment="Gültigkeitsdatum des ADR-Scheins")
    berufskraftfahrer_weiterbildung = Column(Boolean, default=False, comment="Hat Berufskraftfahrer-Weiterbildung")
    berufskraftfahrer_weiterbildung_gueltig_bis = Column(DateTime, nullable=True, comment="Gültigkeitsdatum der Berufskraftfahrer-Weiterbildung")
    
    # Beziehungen
    roles = relationship("Role", secondary=user_role_association, back_populates="users")
    reported_emergencies = relationship("EmergencyCase", foreign_keys="EmergencyCase.reported_by_id", back_populates="reported_by")
    assigned_emergencies = relationship("EmergencyCase", foreign_keys="EmergencyCase.assigned_to_id", back_populates="assigned_to")
    emergency_updates = relationship("EmergencyUpdate", back_populates="created_by")
    escalated_emergencies = relationship("EmergencyEscalation", foreign_keys="EmergencyEscalation.escalated_by_id", back_populates="escalated_by")
    acknowledged_escalations = relationship("EmergencyEscalation", foreign_keys="EmergencyEscalation.acknowledged_by_id", back_populates="acknowledged_by")
    notification_settings = relationship("NotificationSetting", back_populates="user", cascade="all, delete-orphan")
    notification_logs = relationship("NotificationLog", back_populates="user")
    # Beziehung zu Kunden (Vertriebsberater)
    customers = relationship("Customer", back_populates="sales_rep", foreign_keys="Customer.sales_rep_id")
    # Beziehung zu Arbeitsschutzunterweisungen
    safety_trainings = relationship("SafetyTraining", secondary=user_safety_training_association, back_populates="participants")
    safety_documents = relationship("SafetyDocument", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"

class Role(Base):
    """Rolle für die Benutzerautorisierung"""
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)
    description = Column(String(255))
    
    # Beziehungen
    users = relationship("User", secondary=user_role_association, back_populates="roles")
    
    def __repr__(self):
        return f"<Role(id={self.id}, name={self.name})>" 