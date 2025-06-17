"""
Datenbankmodelle für den minimalen Server.

Dieses Modul enthält die SQLAlchemy-ORM-Modelle für die Datenbanktabellen
des minimalen Servers.
"""

import time
from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship

from backend.minimal.db.session import Base
from backend.minimal.models import UserRole

class User(Base):
    """
    Benutzermodell für die Authentifizierung und Autorisierung.
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.USER.value)
    is_active = Column(Boolean, default=True)
    created_at = Column(Float, default=time.time)
    
    # Beziehungen
    customers = relationship("Customer", back_populates="created_by")
    suppliers = relationship("Supplier", back_populates="created_by")
    products = relationship("Product", back_populates="created_by")
    orders = relationship("Order", back_populates="created_by")
    payments = relationship("Payment", back_populates="created_by")
    shipments = relationship("Shipment", back_populates="created_by")
    inventory_movements = relationship("InventoryMovement", back_populates="created_by")

class Customer(Base):
    """
    Kundenmodell für Kundenstammdaten.
    """
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_number = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    contact_person = Column(String, nullable=True)
    email = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    city = Column(String, nullable=True)
    status = Column(String, default="active")
    customer_type = Column(String, default="B2B")
    created_at = Column(Float, default=time.time)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Beziehungen
    created_by = relationship("User", back_populates="customers")
    orders = relationship("Order", back_populates="customer")

class Supplier(Base):
    """
    Lieferantenmodell für Lieferantenstammdaten.
    """
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_number = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    name2 = Column(String, nullable=True)
    email = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    city = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_grain_supplier = Column(Boolean, default=False)
    created_at = Column(Float, default=time.time)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Beziehungen
    created_by = relationship("User", back_populates="suppliers")
    orders = relationship("Order", back_populates="supplier")

class Product(Base):
    """
    Produktmodell für Produktstammdaten.
    """
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    product_number = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    price = Column(Float, default=0.0)
    unit = Column(String, default="Stück")
    stock = Column(Integer, default=0)
    created_at = Column(Float, default=time.time)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Beziehungen
    created_by = relationship("User", back_populates="products")
    order_lines = relationship("OrderLine", back_populates="product")
    shipment_lines = relationship("ShipmentLine", back_populates="product")
    inventory_movements = relationship("InventoryMovement", back_populates="product")

# Importiere Transaktionsmodelle
from backend.minimal.db.models.transaction import (
    Order, OrderLine, Payment, Shipment, ShipmentLine, InventoryMovement,
    OrderStatus, OrderType, PaymentStatus, PaymentMethod
) 