from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer, Numeric, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum
from datetime import datetime
import uuid


def generate_uuid():
    return str(uuid.uuid4())


class Client(Base):
    __tablename__ = "clients"
    
    id = Column(String(50), primary_key=True, default=generate_uuid)
    name = Column(String(200), nullable=False, index=True)
    phone = Column(String(20), nullable=False, index=True)
    alternate_phone = Column(String(20))
    alternate_contact = Column(String(200))
    email = Column(String(200), index=True)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    devices = relationship("Device", back_populates="client", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="client", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Client {self.name} ({self.phone})>"


class Device(Base):
    __tablename__ = "devices"
    
    id = Column(String(50), primary_key=True, default=generate_uuid)
    client_id = Column(String(50), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    brand = Column(String(100), nullable=False)
    model = Column(String(200), nullable=False)
    imei = Column(String(50), index=True)
    serial = Column(String(100))
    password = Column(String(100))
    accessories = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    client = relationship("Client", back_populates="devices")
    orders = relationship("Order", back_populates="device")
    
    def __repr__(self):
        return f"<Device {self.brand} {self.model} - {self.imei}>"


class OrderStatus(str, enum.Enum):
    RECEIVED = "received"
    DIAGNOSING = "diagnosing"
    WAITING_PARTS = "waiting_parts"
    IN_REPAIR = "in_repair"
    REPAIRED = "repaired"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class OrderPriority(str, enum.Enum):
    NORMAL = "normal"
    URGENT = "urgent"


class Order(Base):
    __tablename__ = "orders"
    
    id = Column(String(50), primary_key=True, default=generate_uuid)
    folio = Column(String(20), unique=True, nullable=False, index=True)
    qr_code = Column(String(100), unique=True, nullable=False)
    
    # Foreign Keys
    client_id = Column(String(50), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    device_id = Column(String(50), ForeignKey("devices.id", ondelete="SET NULL"), index=True)
    technician_id = Column(String(50), ForeignKey("users.id", ondelete="SET NULL"), index=True)
    
    # Order Details
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.RECEIVED, nullable=False, index=True)
    priority = Column(SQLEnum(OrderPriority), default=OrderPriority.NORMAL, nullable=False)
    
    problem_description = Column(Text, nullable=False)
    diagnosis = Column(Text)
    solution = Column(Text)
    
    # Pricing
    estimated_cost = Column(Numeric(10, 2))
    final_cost = Column(Numeric(10, 2))
    
    # Dates
    estimated_delivery_date = Column(DateTime(timezone=True))
    actual_delivery_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    client = relationship("Client", back_populates="orders")
    device = relationship("Device", back_populates="orders")
    technician = relationship("User", back_populates="orders")
    history = relationship("OrderHistory", back_populates="order", cascade="all, delete-orphan", order_by="OrderHistory.created_at.desc()")
    photos = relationship("OrderPhoto", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Order {self.folio} - {self.status}>"


class OrderHistory(Base):
    __tablename__ = "order_history"
    
    id = Column(String(50), primary_key=True, default=generate_uuid)
    order_id = Column(String(50), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="SET NULL"), index=True)
    
    status = Column(SQLEnum(OrderStatus), nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Relationships
    order = relationship("Order", back_populates="history")
    user = relationship("User")
    
    def __repr__(self):
        return f"<OrderHistory {self.order_id} -> {self.status}>"


class OrderPhoto(Base):
    __tablename__ = "order_photos"
    
    id = Column(String(50), primary_key=True, default=generate_uuid)
    order_id = Column(String(50), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by = Column(String(50), ForeignKey("users.id", ondelete="SET NULL"))
    
    file_path = Column(String(500), nullable=False)
    file_url = Column(String(500))
    description = Column(Text)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    order = relationship("Order", back_populates="photos")
    uploader = relationship("User")
    
    def __repr__(self):
        return f"<OrderPhoto {self.id} for Order {self.order_id}>"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    TRANSFER = "transfer"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PARTIAL = "partial"
    PAID = "paid"


class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(String(50), primary_key=True, default=generate_uuid)
    order_id = Column(String(50), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    
    amount = Column(Numeric(10, 2), nullable=False)
    method = Column(SQLEnum(PaymentMethod), nullable=False)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    
    reference = Column(String(200))
    notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    created_by = Column(String(50), ForeignKey("users.id", ondelete="SET NULL"))
    
    # Relationships
    order = relationship("Order", back_populates="payments")
    user = relationship("User")
    
    def __repr__(self):
        return f"<Payment ${self.amount} - {self.method} for Order {self.order_id}>"


class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(String(50), primary_key=True, default=generate_uuid)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    category = Column(String(100), index=True)
    
    # Pricing
    purchase_price = Column(Numeric(10, 2))
    sale_price = Column(Numeric(10, 2))
    
    # Stock
    stock = Column(Integer, default=0, nullable=False)
    min_stock = Column(Integer, default=0)
    location = Column(String(200))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    movements = relationship("InventoryMovement", back_populates="item", cascade="all, delete-orphan")
    
    @property
    def is_low_stock(self):
        return self.stock <= self.min_stock
    
    def __repr__(self):
        return f"<InventoryItem {self.sku} - {self.name} (Stock: {self.stock})>"


class MovementType(str, enum.Enum):
    ENTRY = "entry"
    EXIT = "exit"
    ADJUSTMENT = "adjustment"
    RETURN = "return"


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    
    id = Column(String(50), primary_key=True, default=generate_uuid)
    item_id = Column(String(50), ForeignKey("inventory_items.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="SET NULL"), index=True)
    order_id = Column(String(50), ForeignKey("orders.id", ondelete="SET NULL"), index=True)
    
    type = Column(SQLEnum(MovementType), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    reason = Column(Text)
    reference = Column(String(200))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Relationships
    item = relationship("InventoryItem", back_populates="movements")
    user = relationship("User")
    order = relationship("Order")
    
    def __repr__(self):
        return f"<InventoryMovement {self.type} - {self.quantity} of {self.item_id}>"


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    TECHNICIAN = "technician"
    RECEPTIONIST = "receptionist"
    WAREHOUSE = "warehouse"


class User(Base):
    __tablename__ = "users"
    
    id = Column(String(50), primary_key=True, default=generate_uuid)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(200), unique=True, nullable=False, index=True)
    password_hash = Column(String(200), nullable=False)
    
    full_name = Column(String(200))
    role = Column(SQLEnum(UserRole), nullable=False, index=True)
    is_active = Column(Integer, default=1, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    orders = relationship("Order", back_populates="technician")
    
    def __repr__(self):
        return f"<User {self.username} - {self.role}>"
