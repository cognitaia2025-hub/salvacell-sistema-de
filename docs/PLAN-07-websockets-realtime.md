# 📋 PLAN 07: WebSockets para Actualizaciones en Tiempo Real

**Plan ID:** PLAN-07  
**Categoría:** Full-stack - Real-time  
**Prioridad:** 🟢 Baja  
**Tiempo estimado:** 6-7 horas  
**Dependencias:** Ninguna (Integración opcional con PLAN-04)

---

## 🎯 Objetivo

Implementar WebSockets para notificaciones y actualizaciones en tiempo real, permitiendo que múltiples usuarios vean cambios instantáneamente cuando se actualiza una orden, se crea un cliente, o cambia el inventario.

---

## 📦 Archivos a Crear (NUEVOS)

```
backend/
├── websockets/
│   ├── __init__.py
│   ├── manager.py              # Gestor de conexiones WebSocket
│   ├── events.py               # Tipos de eventos
│   └── handlers.py             # Handlers de eventos
└── routers/
    └── websocket.py            # Endpoints WebSocket

src/
├── lib/
│   └── websocket/
│       ├── client.ts           # Cliente WebSocket
│       └── events.ts           # Tipos de eventos (TypeScript)
├── hooks/
│   └── use-websocket.ts        # Hook para WebSocket
└── components/
    └── WebSocket/
        ├── ConnectionStatus.tsx # Indicador de conexión WS
        └── NotificationBadge.tsx # Badge de notificaciones
```

**Total archivos nuevos:** 10

---

## 🔧 Archivos a Modificar (EXISTENTES)

### 1. `backend/main.py`
**Zona de modificación:** Líneas 45-55 (después de incluir routers)

**Cambios:**
```python
# AGREGAR import al inicio:
from routers import websocket
from websockets.manager import manager as ws_manager

# AGREGAR en la sección de routers (línea ~50):
app.include_router(websocket.router, tags=["websocket"])

# AGREGAR evento de shutdown:
@app.on_event("shutdown")
async def shutdown_event():
    await ws_manager.disconnect_all()
```

### 2. `backend/routers/orders.py`
**Zona de modificación:** Líneas donde se crean/actualizan órdenes

**Cambios:**
```python
# AGREGAR import al inicio:
from websockets.manager import manager as ws_manager
from websockets.events import OrderEvent

# MODIFICAR función create_order (después de crear orden):
# Línea ~80 (después de db.commit()):
await ws_manager.broadcast(OrderEvent(
    type="order_created",
    order_id=new_order.id,
    folio=new_order.folio,
    status=new_order.status,
    client_name=client.name
))

# MODIFICAR función update_order (después de actualizar):
# Línea ~120 (después de db.commit()):
await ws_manager.broadcast(OrderEvent(
    type="order_updated",
    order_id=order.id,
    folio=order.folio,
    status=order.status
))
```

### 3. `backend/requirements.txt`
**Zona de modificación:** Al final del archivo

**Cambios:**
```txt
# AGREGAR al final:
python-socketio==5.11.0
websockets==12.0
```

### 4. `src/App.tsx`
**Zona de modificación:** Línea ~10 (dentro de AppContent)

**Cambios:**
```tsx
// AGREGAR imports al inicio:
import { WebSocketProvider } from '@/lib/websocket/client'
import { ConnectionStatus } from '@/components/WebSocket/ConnectionStatus'
import { useWebSocket } from '@/hooks/use-websocket'

// AGREGAR dentro del return principal:
<WebSocketProvider>
  <ConnectionStatus />
  {/* ...resto del contenido existente... */}
</WebSocketProvider>
```

### 5. `package.json`
**Zona de modificación:** Sección dependencies

**Cambios:**
```json
// AGREGAR a dependencies:
"socket.io-client": "^4.6.1"
```

---

## 📝 Contenido Detallado de Archivos Nuevos

### 1. `backend/websockets/manager.py`
```python
from typing import Dict, Set, Any
from fastapi import WebSocket
import json
import asyncio
from datetime import datetime


class ConnectionManager:
    """Gestor de conexiones WebSocket"""
    
    def __init__(self):
        # Conexiones activas: {connection_id: WebSocket}
        self.active_connections: Dict[str, WebSocket] = {}
        # Usuarios suscritos a eventos: {user_id: Set[connection_id]}
        self.user_subscriptions: Dict[str, Set[str]] = {}
        # Rooms (para broadcast selectivo): {room_name: Set[connection_id]}
        self.rooms: Dict[str, Set[str]] = {}
        
    async def connect(self, websocket: WebSocket, connection_id: str, user_id: str = None):
        """Conectar un nuevo cliente WebSocket"""
        await websocket.accept()
        self.active_connections[connection_id] = websocket
        
        if user_id:
            if user_id not in self.user_subscriptions:
                self.user_subscriptions[user_id] = set()
            self.user_subscriptions[user_id].add(connection_id)
        
        print(f"✅ WebSocket conectado: {connection_id} (Total: {len(self.active_connections)})")
        
        # Enviar mensaje de bienvenida
        await self.send_personal_message(
            connection_id,
            {
                "type": "connected",
                "message": "Conectado al servidor WebSocket",
                "timestamp": datetime.now().isoformat()
            }
        )
    
    async def disconnect(self, connection_id: str):
        """Desconectar un cliente"""
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        
        # Eliminar de suscripciones de usuario
        for user_id, connections in self.user_subscriptions.items():
            connections.discard(connection_id)
        
        # Eliminar de rooms
        for room, connections in self.rooms.items():
            connections.discard(connection_id)
        
        print(f"❌ WebSocket desconectado: {connection_id} (Total: {len(self.active_connections)})")
    
    async def disconnect_all(self):
        """Desconectar todos los clientes"""
        for connection_id in list(self.active_connections.keys()):
            try:
                websocket = self.active_connections[connection_id]
                await websocket.close()
            except:
                pass
        self.active_connections.clear()
        self.user_subscriptions.clear()
        self.rooms.clear()
    
    async def send_personal_message(self, connection_id: str, message: dict):
        """Enviar mensaje a una conexión específica"""
        if connection_id in self.active_connections:
            try:
                websocket = self.active_connections[connection_id]
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error enviando mensaje a {connection_id}: {e}")
                await self.disconnect(connection_id)
    
    async def send_to_user(self, user_id: str, message: dict):
        """Enviar mensaje a todas las conexiones de un usuario"""
        if user_id in self.user_subscriptions:
            for connection_id in self.user_subscriptions[user_id]:
                await self.send_personal_message(connection_id, message)
    
    async def broadcast(self, message: dict, exclude: Set[str] = None):
        """Enviar mensaje a todos los clientes conectados"""
        exclude = exclude or set()
        
        disconnected = []
        for connection_id, websocket in self.active_connections.items():
            if connection_id not in exclude:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    print(f"Error en broadcast a {connection_id}: {e}")
                    disconnected.append(connection_id)
        
        # Limpiar conexiones muertas
        for connection_id in disconnected:
            await self.disconnect(connection_id)
    
    async def join_room(self, connection_id: str, room: str):
        """Unir conexión a un room"""
        if room not in self.rooms:
            self.rooms[room] = set()
        self.rooms[room].add(connection_id)
    
    async def leave_room(self, connection_id: str, room: str):
        """Salir de un room"""
        if room in self.rooms:
            self.rooms[room].discard(connection_id)
    
    async def broadcast_to_room(self, room: str, message: dict):
        """Enviar mensaje a todos los miembros de un room"""
        if room in self.rooms:
            for connection_id in self.rooms[room]:
                await self.send_personal_message(connection_id, message)
    
    def get_stats(self) -> dict:
        """Obtener estadísticas de conexiones"""
        return {
            "total_connections": len(self.active_connections),
            "total_users": len(self.user_subscriptions),
            "total_rooms": len(self.rooms),
            "active_rooms": [
                {"name": room, "members": len(members)}
                for room, members in self.rooms.items()
            ]
        }


# Singleton instance
manager = ConnectionManager()
```

### 2. `backend/websockets/events.py`
```python
from pydantic import BaseModel
from typing import Literal, Optional, Any
from datetime import datetime


class BaseEvent(BaseModel):
    """Evento base de WebSocket"""
    type: str
    timestamp: str = datetime.now().isoformat()
    data: Optional[Any] = None


class OrderEvent(BaseEvent):
    """Evento relacionado con órdenes"""
    type: Literal[
        "order_created",
        "order_updated",
        "order_status_changed",
        "order_deleted"
    ]
    order_id: str
    folio: str
    status: Optional[str] = None
    client_name: Optional[str] = None
    timestamp: str = datetime.now().isoformat()


class ClientEvent(BaseEvent):
    """Evento relacionado con clientes"""
    type: Literal["client_created", "client_updated", "client_deleted"]
    client_id: str
    client_name: str
    timestamp: str = datetime.now().isoformat()


class InventoryEvent(BaseEvent):
    """Evento relacionado con inventario"""
    type: Literal["inventory_updated", "stock_low", "stock_out"]
    item_id: str
    item_name: str
    current_stock: int
    min_stock: Optional[int] = None
    timestamp: str = datetime.now().isoformat()


class NotificationEvent(BaseEvent):
    """Evento de notificación general"""
    type: Literal["notification"]
    title: str
    message: str
    severity: Literal["info", "success", "warning", "error"]
    timestamp: str = datetime.now().isoformat()
```

### 3. `backend/routers/websocket.py`
```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Optional
import uuid
import json

from websockets.manager import manager
from auth import get_current_user
from models import User

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Endpoint principal de WebSocket
    """
    connection_id = str(uuid.uuid4())
    
    try:
        # Conectar
        await manager.connect(websocket, connection_id)
        
        # Loop de mensajes
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                await handle_client_message(connection_id, message)
            except json.JSONDecodeError:
                await manager.send_personal_message(
                    connection_id,
                    {"type": "error", "message": "Mensaje JSON inválido"}
                )
    
    except WebSocketDisconnect:
        await manager.disconnect(connection_id)
    except Exception as e:
        print(f"Error en WebSocket {connection_id}: {e}")
        await manager.disconnect(connection_id)


async def handle_client_message(connection_id: str, message: dict):
    """Manejar mensajes del cliente"""
    msg_type = message.get("type")
    
    if msg_type == "ping":
        await manager.send_personal_message(
            connection_id,
            {"type": "pong", "timestamp": message.get("timestamp")}
        )
    
    elif msg_type == "join_room":
        room = message.get("room")
        if room:
            await manager.join_room(connection_id, room)
            await manager.send_personal_message(
                connection_id,
                {"type": "joined_room", "room": room}
            )
    
    elif msg_type == "leave_room":
        room = message.get("room")
        if room:
            await manager.leave_room(connection_id, room)
            await manager.send_personal_message(
                connection_id,
                {"type": "left_room", "room": room}
            )
    
    else:
        await manager.send_personal_message(
            connection_id,
            {"type": "error", "message": f"Tipo de mensaje desconocido: {msg_type}"}
        )


@router.get("/ws/stats")
async def get_websocket_stats():
    """Obtener estadísticas de conexiones WebSocket"""
    return manager.get_stats()
```

### 4. `src/lib/websocket/client.ts`
```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  subscribe: (event: string, callback: (data: any) => void) => () => void
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  subscribe: () => () => {},
})

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Conectar al WebSocket
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
    const newSocket = io(wsUrl, {
      path: '/ws',
      transports: ['websocket'],
    })

    newSocket.on('connect', () => {
      console.log('✅ WebSocket conectado')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado')
      setIsConnected(false)
    })

    newSocket.on('error', (error) => {
      console.error('Error WebSocket:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (!socket) return () => {}

    socket.on(event, callback)

    return () => {
      socket.off(event, callback)
    }
  }

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocketContext() {
  return useContext(WebSocketContext)
}
```

### 5. `src/lib/websocket/events.ts`
```typescript
export type OrderEventType =
  | 'order_created'
  | 'order_updated'
  | 'order_status_changed'
  | 'order_deleted'

export type ClientEventType = 'client_created' | 'client_updated' | 'client_deleted'

export type InventoryEventType = 'inventory_updated' | 'stock_low' | 'stock_out'

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error'

export interface OrderEvent {
  type: OrderEventType
  order_id: string
  folio: string
  status?: string
  client_name?: string
  timestamp: string
}

export interface ClientEvent {
  type: ClientEventType
  client_id: string
  client_name: string
  timestamp: string
}

export interface InventoryEvent {
  type: InventoryEventType
  item_id: string
  item_name: string
  current_stock: number
  min_stock?: number
  timestamp: string
}

export interface NotificationEvent {
  type: 'notification'
  title: string
  message: string
  severity: NotificationSeverity
  timestamp: string
}

export type WebSocketEvent =
  | OrderEvent
  | ClientEvent
  | InventoryEvent
  | NotificationEvent
```

### 6. `src/hooks/use-websocket.ts`
```typescript
import { useEffect, useState } from 'react'
import { useWebSocketContext } from '@/lib/websocket/client'
import { WebSocketEvent, OrderEvent, NotificationEvent } from '@/lib/websocket/events'
import { toast } from 'sonner'

export function useWebSocket() {
  const { socket, isConnected, subscribe } = useWebSocketContext()
  const [notifications, setNotifications] = useState<NotificationEvent[]>([])

  useEffect(() => {
    if (!socket) return

    // Suscribirse a eventos de órdenes
    const unsubscribeOrders = subscribe('order_created', (event: OrderEvent) => {
      toast.success(`Nueva orden creada: ${event.folio}`)
    })

    const unsubscribeOrderUpdate = subscribe('order_updated', (event: OrderEvent) => {
      toast.info(`Orden actualizada: ${event.folio}`)
    })

    // Suscribirse a notificaciones
    const unsubscribeNotifications = subscribe('notification', (event: NotificationEvent) => {
      setNotifications((prev) => [...prev, event])
      
      switch (event.severity) {
        case 'success':
          toast.success(event.title, { description: event.message })
          break
        case 'error':
          toast.error(event.title, { description: event.message })
          break
        case 'warning':
          toast.warning(event.title, { description: event.message })
          break
        default:
          toast.info(event.title, { description: event.message })
      }
    })

    return () => {
      unsubscribeOrders()
      unsubscribeOrderUpdate()
      unsubscribeNotifications()
    }
  }, [socket, subscribe])

  const clearNotifications = () => {
    setNotifications([])
  }

  return {
    isConnected,
    notifications,
    clearNotifications,
    socket,
  }
}
```

### 7. `src/components/WebSocket/ConnectionStatus.tsx`
```tsx
import { useWebSocket } from '@/hooks/use-websocket'
import { Wifi, WifiSlash } from 'phosphor-react'

export function ConnectionStatus() {
  const { isConnected } = useWebSocket()

  if (isConnected) return null

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
      <WifiSlash size={20} weight="bold" />
      <span className="text-sm font-medium">Desconectado del servidor</span>
    </div>
  )
}
```

### 8. `src/components/WebSocket/NotificationBadge.tsx`
```tsx
import { useWebSocket } from '@/hooks/use-websocket'
import { Bell } from 'phosphor-react'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

export function NotificationBadge() {
  const { notifications, clearNotifications } = useWebSocket()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative">
          <Bell size={24} />
          {notifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5">
              {notifications.length}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notificaciones</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
            >
              Limpiar
            </Button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay notificaciones</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.map((notif, idx) => (
                <div key={idx} className="border-b pb-2">
                  <p className="font-medium text-sm">{notif.title}</p>
                  <p className="text-xs text-muted-foreground">{notif.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

---

## ✅ Pasos de Implementación

### Backend:
```bash
cd backend
pip install python-socketio==5.11.0 websockets==12.0
mkdir -p websockets
# Crear archivos según especificación
```

### Frontend:
```bash
npm install socket.io-client@^4.6.1
mkdir -p src/lib/websocket src/components/WebSocket
# Crear archivos según especificación
```

### Probar:
```bash
# Terminal 1: Backend
cd backend && uvicorn main:app --reload

# Terminal 2: Frontend
npm run dev

# Abrir múltiples pestañas del navegador
# Crear una orden en una pestaña
# Ver notificación en tiempo real en otras pestañas
```

---

## 🧪 Validación

**Criterios de éxito:**
- ✅ WebSocket se conecta al backend
- ✅ Múltiples clientes reciben eventos
- ✅ Notificaciones toast aparecen en tiempo real
- ✅ Indicador de conexión funciona
- ✅ Reconexión automática funciona

---

## 🔍 Interfaces Exportadas

### Backend:
```python
manager.broadcast(message)              # Broadcast a todos
manager.send_to_user(user_id, message)  # Enviar a usuario
manager.broadcast_to_room(room, message) # Enviar a room
```

### Frontend:
```typescript
useWebSocket()                  # Hook principal
socket.emit(event, data)        # Enviar evento
subscribe(event, callback)      # Suscribirse
```

---

## ⚠️ Conflictos con Otros Planes

### PLAN-04 (Dashboard):
- 🔶 **Integración opcional**: Dashboard puede usar WebSocket para actualizar métricas en tiempo real
- Agregar `subscribe('order_created', ...)` en Dashboard

### Todos los otros planes:
- ✅ **Sin conflictos**: Independiente

---

## 📚 Referencias

- [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Python SocketIO](https://python-socketio.readthedocs.io/)

---

**Última actualización:** 2026-01-17 06:35:00  
**Autor:** Plan ID PLAN-07