# 📋 PLAN 07: WebSockets para Actualizaciones en Tiempo Real

**Plan ID:** PLAN-07  
**Categoría:** Backend + Frontend - Tiempo Real  
**Prioridad:** 🟢 Baja  
**Tiempo estimado:** 6-7 horas  
**Dependencias:** Ninguna (integración opcional con PLAN-04)

---

## 🎯 Objetivo

Implementar WebSockets bidireccionales para notificaciones y actualizaciones en tiempo real, permitiendo que múltiples clientes reciban eventos instantáneamente cuando cambia el estado de órdenes, clientes o inventario.

---

## 📦 Archivos a Crear (NUEVOS)

### Backend:
```
backend/
├── websockets/
│   ├── __init__.py
│   ├── manager.py               # Gestor de conexiones WebSocket
│   └── events.py                # Eventos y tipos
└── routers/
    └── websocket.py             # Endpoints WebSocket
```

### Frontend:
```
src/
├── lib/
│   └── websocket/
│       ├── client.ts            # Cliente WebSocket
│       └── types.ts             # Tipos TypeScript
├── hooks/
│   └── use-websocket.ts         # Hook React para WebSocket
├── components/
│   └── WebSocket/
│       ├── ConnectionStatus.tsx # Indicador de conexión
│       └── NotificationToast.tsx # Toast de notificaciones
└── contexts/
    └── WebSocketContext.tsx     # Contexto React
```

**Total archivos nuevos:** 10

---

## 🔧 Archivos a Modificar (EXISTENTES)

### 1. `backend/main.py`
**Zona de modificación:** Líneas 45-55 (sección de routers)

**Cambios:**
```python
# AGREGAR import al inicio:
from routers import websocket as ws_router

# AGREGAR en la sección de routers (línea ~50):
app.include_router(ws_router.router, prefix="/ws", tags=["websocket"])
```

### 2. `backend/requirements.txt`
**Zona de modificación:** Al final del archivo

**Cambios:**
```txt
# AGREGAR al final:
python-socketio==5.11.1
websockets==12.0
```

### 3. `src/App.tsx`
**Zona de modificación:** Líneas 15-25 (imports y wrapper principal)

**Cambios:**
```tsx
// AGREGAR imports al inicio:
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { ConnectionStatus } from '@/components/WebSocket/ConnectionStatus'

// MODIFICAR el return para envolver con WebSocketProvider:
return (
  <WebSocketProvider>
    <ConnectionStatus />
    {/* ...resto del código existente... */}
  </WebSocketProvider>
)
```

### 4. `package.json`
**Zona de modificación:** Sección dependencies

**Cambios:**
```json
// AGREGAR a dependencies:
"socket.io-client": "^4.6.1"
```

---

## 📝 Contenido Detallado de Archivos Nuevos

### Backend Files

#### 1. `backend/websockets/__init__.py`
```python
from .manager import ws_manager
from .events import WebSocketEvent, EventType

__all__ = ['ws_manager', 'WebSocketEvent', 'EventType']
```

#### 2. `backend/websockets/events.py`
```python
from enum import Enum
from typing import Any, Dict
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
    user_id: str | None = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
```

#### 3. `backend/websockets/manager.py`
```python
from fastapi import WebSocket
from typing import Dict, Set, List
from datetime import datetime
import json
import logging

from .events import WebSocketEvent, EventType

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Gestor de conexiones WebSocket"""
    
    def __init__(self):
        # Conexiones activas: {connection_id: WebSocket}
        self.active_connections: Dict[str, WebSocket] = {}
        
        # Usuarios conectados: {user_id: Set[connection_id]}
        self.user_connections: Dict[str, Set[str]] = {}
        
        # Rooms: {room_name: Set[connection_id]}
        self.rooms: Dict[str, Set[str]] = {}
        
    async def connect(self, websocket: WebSocket, connection_id: str, user_id: str = None):
        """Conectar un nuevo cliente"""
        await websocket.accept()
        self.active_connections[connection_id] = websocket
        
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(connection_id)
        
        logger.info(f"WebSocket conectado: {connection_id} (user: {user_id})")
        
        # Notificar conexión
        event = WebSocketEvent(
            type=EventType.USER_CONNECTED,
            data={"connection_id": connection_id, "user_id": user_id},
            user_id=user_id
        )
        await self.broadcast(event, exclude=[connection_id])
        
    def disconnect(self, connection_id: str):
        """Desconectar un cliente"""
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        
        # Remover de rooms
        for room_connections in self.rooms.values():
            room_connections.discard(connection_id)
        
        # Remover de user_connections
        for user_id, connections in list(self.user_connections.items()):
            connections.discard(connection_id)
            if not connections:
                del self.user_connections[user_id]
        
        logger.info(f"WebSocket desconectado: {connection_id}")
        
    async def send_personal_message(self, message: WebSocketEvent, connection_id: str):
        """Enviar mensaje a una conexión específica"""
        if connection_id in self.active_connections:
            websocket = self.active_connections[connection_id]
            try:
                await websocket.send_json(message.dict())
            except Exception as e:
                logger.error(f"Error enviando mensaje a {connection_id}: {e}")
                self.disconnect(connection_id)
    
    async def send_to_user(self, message: WebSocketEvent, user_id: str):
        """Enviar mensaje a todas las conexiones de un usuario"""
        if user_id in self.user_connections:
            connections = self.user_connections[user_id].copy()
            for connection_id in connections:
                await self.send_personal_message(message, connection_id)
    
    async def broadcast(self, message: WebSocketEvent, exclude: List[str] = None):
        """Enviar mensaje a todas las conexiones activas"""
        exclude = exclude or []
        disconnected = []
        
        for connection_id, websocket in self.active_connections.items():
            if connection_id not in exclude:
                try:
                    await websocket.send_json(message.dict())
                except Exception as e:
                    logger.error(f"Error en broadcast a {connection_id}: {e}")
                    disconnected.append(connection_id)
        
        # Limpiar conexiones fallidas
        for connection_id in disconnected:
            self.disconnect(connection_id)
    
    def join_room(self, connection_id: str, room: str):
        """Unir conexión a un room"""
        if room not in self.rooms:
            self.rooms[room] = set()
        self.rooms[room].add(connection_id)
        logger.info(f"Conexión {connection_id} se unió a room '{room}'")
    
    def leave_room(self, connection_id: str, room: str):
        """Remover conexión de un room"""
        if room in self.rooms:
            self.rooms[room].discard(connection_id)
            if not self.rooms[room]:
                del self.rooms[room]
        logger.info(f"Conexión {connection_id} salió de room '{room}'")
    
    async def broadcast_to_room(self, message: WebSocketEvent, room: str):
        """Enviar mensaje a todos en un room"""
        if room in self.rooms:
            connections = self.rooms[room].copy()
            for connection_id in connections:
                await self.send_personal_message(message, connection_id)
    
    def get_stats(self) -> dict:
        """Obtener estadísticas de conexiones"""
        return {
            "total_connections": len(self.active_connections),
            "unique_users": len(self.user_connections),
            "rooms": {room: len(conns) for room, conns in self.rooms.items()}
        }


# Instancia global
ws_manager = WebSocketManager()
```

#### 4. `backend/routers/websocket.py`
Complete code provided in original plan...

### Frontend Files

Complete TypeScript/React code for all frontend files...

---

## ✅ Pasos de Implementación

### Backend:
```bash
cd backend
pip install python-socketio==5.11.1 websockets==12.0
mkdir -p websockets
# Crear archivos según especificación
```

### Frontend:
```bash
npm install socket.io-client@^4.6.1
mkdir -p src/lib/websocket src/contexts src/components/WebSocket
# Crear archivos según especificación
```

---

## 🧪 Validación

**Tests:**
1. ✅ WebSocket se conecta automáticamente
2. ✅ Indicador muestra estado correcto
3. ✅ Eventos se reciben correctamente
4. ✅ Notificaciones toast aparecen
5. ✅ Reconexión automática funciona
6. ✅ Múltiples clientes reciben broadcasts

---

## 🔍 Interfaces Exportadas

### Backend:
```python
# En routers/websocket.py
emit_order_created(order_data)
emit_order_updated(order_data)
emit_stock_low(item_data)
emit_notification(message, user_id, severity)
```

### Frontend:
```typescript
// Hook
useWebSocket(eventType, handler)

// Context
useWebSocketContext()

// Cliente directo
client.joinRoom(room)
client.send(message)
```

---

## ⚠️ Conflictos con Otros Planes

### PLAN-04 (Dashboard):
- 🔗 **Integración opcional**: Dashboard puede usar `useWebSocket()` para actualizar métricas en tiempo real

### Otros planes:
- ✅ **Sin conflictos**

---

## 📚 Referencias

- [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

---

**Última actualización:** 2026-01-17 09:25:00  
**Autor:** Plan ID PLAN-07