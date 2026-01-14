from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from models import OrderStatus, OrderPriority, PaymentMethod, PaymentStatus, MovementType, UserRole, AppointmentStatus


# ============= Client Schemas =============
class ClientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=10, max_length=20)
    alternate_phone: Optional[str] = Field(None, max_length=20)
    alternate_contact: Optional[str] = Field(None, max_length=200)
    email: Optional[EmailStr] = None
    notes: Optional[str] = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    alternate_phone: Optional[str] = None
    alternate_contact: Optional[str] = None
    email: Optional[EmailStr] = None
    notes: Optional[str] = None


class ClientResponse(ClientBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ClientWithStats(ClientResponse):
    total_orders: int = 0
    total_spent: float = 0.0
    device_count: int = 0


# ============= Device Schemas =============
class DeviceBase(BaseModel):
    brand: str = Field(..., max_length=100)
    model: str = Field(..., max_length=200)
    imei: Optional[str] = Field(None, max_length=50)
    serial: Optional[str] = Field(None, max_length=100)
    password: Optional[str] = Field(None, max_length=100)
    accessories: Optional[str] = None


class DeviceCreate(DeviceBase):
    client_id: str


class DeviceUpdate(BaseModel):
    brand: Optional[str] = Field(None, max_length=100)
    model: Optional[str] = Field(None, max_length=200)
    imei: Optional[str] = None
    serial: Optional[str] = None
    password: Optional[str] = None
    accessories: Optional[str] = None


class DeviceResponse(DeviceBase):
    id: str
    client_id: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============= Order Schemas =============
class OrderBase(BaseModel):
    priority: OrderPriority = OrderPriority.NORMAL
    problem_description: str = Field(..., min_length=10)
    diagnosis: Optional[str] = None
    solution: Optional[str] = None
    estimated_cost: Optional[float] = Field(None, ge=0)
    final_cost: Optional[float] = Field(None, ge=0)
    estimated_delivery_date: Optional[datetime] = None


class OrderCreate(OrderBase):
    client_id: str
    device_id: Optional[str] = None
    technician_id: Optional[str] = None


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    priority: Optional[OrderPriority] = None
    problem_description: Optional[str] = None
    diagnosis: Optional[str] = None
    solution: Optional[str] = None
    estimated_cost: Optional[float] = Field(None, ge=0)
    final_cost: Optional[float] = Field(None, ge=0)
    estimated_delivery_date: Optional[datetime] = None
    actual_delivery_date: Optional[datetime] = None
    technician_id: Optional[str] = None


class OrderResponse(OrderBase):
    id: str
    folio: str
    qr_code: str
    client_id: str
    device_id: Optional[str]
    technician_id: Optional[str]
    status: OrderStatus
    actual_delivery_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============= Order History Schemas =============
class OrderHistoryCreate(BaseModel):
    order_id: str
    status: OrderStatus
    notes: Optional[str] = None
    user_id: Optional[str] = None


class OrderHistoryResponse(BaseModel):
    id: str
    order_id: str
    user_id: Optional[str]
    status: OrderStatus
    notes: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============= Order Photo Schemas =============
class OrderPhotoCreate(BaseModel):
    order_id: str
    description: Optional[str] = None


class OrderPhotoResponse(BaseModel):
    id: str
    order_id: str
    uploaded_by: Optional[str]
    file_path: str
    file_url: Optional[str]
    description: Optional[str]
    file_size: Optional[int]
    mime_type: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============= Payment Schemas =============
class PaymentBase(BaseModel):
    amount: float = Field(..., gt=0)
    method: PaymentMethod
    reference: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = None


class PaymentCreate(PaymentBase):
    order_id: str


class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    notes: Optional[str] = None


class PaymentResponse(PaymentBase):
    id: str
    order_id: str
    status: PaymentStatus
    created_at: datetime
    created_by: Optional[str]
    
    model_config = ConfigDict(from_attributes=True)


# ============= Inventory Schemas =============
class InventoryItemBase(BaseModel):
    sku: str = Field(..., max_length=100)
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    purchase_price: Optional[float] = Field(None, ge=0)
    sale_price: Optional[float] = Field(None, ge=0)
    stock: int = Field(default=0, ge=0)
    min_stock: int = Field(default=0, ge=0)
    location: Optional[str] = Field(None, max_length=200)


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    sku: Optional[str] = Field(None, max_length=100)
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    purchase_price: Optional[float] = Field(None, ge=0)
    sale_price: Optional[float] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)
    min_stock: Optional[int] = Field(None, ge=0)
    location: Optional[str] = None


class InventoryItemResponse(InventoryItemBase):
    id: str
    is_low_stock: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============= Inventory Movement Schemas =============
class InventoryMovementBase(BaseModel):
    type: MovementType
    quantity: int = Field(..., ne=0)
    reason: Optional[str] = None
    reference: Optional[str] = Field(None, max_length=200)


class InventoryMovementCreate(InventoryMovementBase):
    item_id: str
    order_id: Optional[str] = None


class InventoryMovementResponse(InventoryMovementBase):
    id: str
    item_id: str
    user_id: Optional[str]
    order_id: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============= User Schemas =============
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=200)
    role: UserRole


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)


# ============= Auth Schemas =============
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: str
    username: str
    role: UserRole


class LoginRequest(BaseModel):
    username: str
    password: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


# ============= Public Order View =============
class PublicOrderView(BaseModel):
    folio: str
    status: OrderStatus
    problem_description: str
    estimated_delivery_date: Optional[datetime]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============= Appointment Schemas =============
class AppointmentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    scheduled_date: datetime
    end_date: Optional[datetime] = None
    duration_minutes: int = Field(default=60, ge=15, le=480)
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    client_id: str
    order_id: Optional[str] = None


class AppointmentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=480)
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    id: str
    client_id: str
    order_id: Optional[str]
    status: AppointmentStatus
    reminder_sent: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
