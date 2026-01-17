from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel
from datetime import datetime


class EventType(str, Enum):
    """Tipos de eventos WebSocket"""
    # Orders
    ORDER_CREATED = "order_created"
    ORDER_UPDATED = "order_updated"
    ORDER_STATUS_CHANGED = "order_status_changed"
    
    # Clients
    CLIENT_CREATED = "client_created"
    CLIENT_UPDATED = "client_updated"
    
    # Inventory
    INVENTORY_UPDATED = "inventory_updated"
    STOCK_LOW = "stock_low"
    
    # Notifications
    NOTIFICATION = "notification"
    
    # System
    USER_CONNECTED = "user_connected"
    USER_DISCONNECTED = "user_disconnected"


class WebSocketEvent(BaseModel):
    """Modelo de evento WebSocket"""
    type: EventType
    data: Dict[str, Any]
    timestamp: datetime = datetime.now()
    user_id: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
