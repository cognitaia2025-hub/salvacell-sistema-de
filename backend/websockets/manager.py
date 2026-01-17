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
