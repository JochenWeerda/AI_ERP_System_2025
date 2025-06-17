"""
Datenmodelle für den minimalen Server.

Dieses Modul enthält die Pydantic-Modelle für Anfragen und Antworten
des minimalen Servers.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, EmailStr, Field
from enum import Enum
import time

class Message(BaseModel):
    """Einfaches Nachrichtenmodell für Echo-Anfragen."""
    content: str

class EchoResponse(BaseModel):
    """Antwortmodell für Echo-Anfragen."""
    status: str
    echo: str
    timestamp: float

class SystemInfoResponse(BaseModel):
    """Antwortmodell für Systeminformationen."""
    platform: str
    platform_version: str
    python_version: str
    processor: str
    hostname: str
    time: float
    timezone: Any

class TaskResponse(BaseModel):
    """Antwortmodell für Task-Erstellung."""
    task_id: str
    status: str
    created_at: float
    message: str

class TaskResult(BaseModel):
    """Modell für Task-Ergebnisse oder -Status."""
    value: Optional[int] = None
    progress: Optional[int] = None
    error: Optional[str] = None
    completed: bool

class TaskStatusResponse(BaseModel):
    """Antwortmodell für Task-Status-Abfragen."""
    task_id: str
    status: str
    result: TaskResult
    checked_at: float

# Authentifizierungsmodelle
class UserRole(str, Enum):
    """Enum für Benutzerrollen."""
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

class Token(BaseModel):
    """Token-Modell für die Authentifizierung."""
    access_token: str
    token_type: str
    expires_at: float

class TokenPayload(BaseModel):
    """Payload des JWT-Tokens."""
    sub: str  # Benutzer-ID
    exp: float  # Ablaufzeit
    role: UserRole  # Rolle des Benutzers

class UserBase(BaseModel):
    """Basismodell für Benutzer."""
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.USER

class UserCreate(UserBase):
    """Modell für die Benutzerregistrierung."""
    password: str

class UserUpdate(BaseModel):
    """Modell für die Benutzeraktualisierung."""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserLogin(BaseModel):
    """Modell für den Login."""
    username: str
    password: str

class UserResponse(UserBase):
    """Antwortmodell für Benutzerinformationen."""
    id: int
    is_active: bool = True
    created_at: float = Field(default_factory=time.time)

    class Config:
        from_attributes = True
        populate_by_name = True

# Kundenmodelle
class CustomerBase(BaseModel):
    """Basismodell für Kunden."""
    customer_number: str
    name: str
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    status: str = "active"
    customer_type: str = "B2B"

class CustomerCreate(CustomerBase):
    """Modell für die Kundenerstellung."""
    pass

class CustomerUpdate(BaseModel):
    """Modell für die Kundenaktualisierung."""
    customer_number: Optional[str] = None
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    status: Optional[str] = None
    customer_type: Optional[str] = None

class CustomerResponse(CustomerBase):
    """Antwortmodell für Kundeninformationen."""
    id: int
    created_at: float
    created_by_id: Optional[int] = None

    class Config:
        from_attributes = True
        populate_by_name = True

# Lieferantenmodelle
class SupplierBase(BaseModel):
    """Basismodell für Lieferanten."""
    supplier_number: str
    name: str
    name2: Optional[str] = None
    email: Optional[EmailStr] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    is_active: bool = True
    is_grain_supplier: bool = False

class SupplierCreate(SupplierBase):
    """Modell für die Lieferantenerstellung."""
    pass

class SupplierUpdate(BaseModel):
    """Modell für die Lieferantenaktualisierung."""
    supplier_number: Optional[str] = None
    name: Optional[str] = None
    name2: Optional[str] = None
    email: Optional[EmailStr] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    is_active: Optional[bool] = None
    is_grain_supplier: Optional[bool] = None

class SupplierResponse(SupplierBase):
    """Antwortmodell für Lieferanteninformationen."""
    id: int
    created_at: float
    created_by_id: Optional[int] = None

    class Config:
        from_attributes = True
        populate_by_name = True

# Produktmodelle
class ProductBase(BaseModel):
    """Basismodell für Produkte."""
    product_number: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    price: float = 0.0
    unit: str = "Stück"
    stock: int = 0

class ProductCreate(ProductBase):
    """Modell für die Produkterstellung."""
    pass

class ProductUpdate(BaseModel):
    """Modell für die Produktaktualisierung."""
    product_number: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    unit: Optional[str] = None
    stock: Optional[int] = None

class ProductResponse(ProductBase):
    """Antwortmodell für Produktinformationen."""
    id: int
    created_at: float
    created_by_id: Optional[int] = None

    class Config:
        from_attributes = True
        populate_by_name = True 