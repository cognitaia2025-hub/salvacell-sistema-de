from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
import uuid
import logging

from websockets.manager import ws_manager
from websockets.events import WebSocketEvent, EventType

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/connect")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    """
    Endpoint principal de WebSocket
    
    Query params:
    - token: JWT token para autenticación (opcional)
    
    NOTE: Authentication is not currently enforced to allow easy testing.
    In production, you should implement proper authentication by:
    1. Creating a get_current_user_ws function in auth.py
    2. Validating the token parameter
    3. Rejecting connections without valid tokens
    """
    connection_id = str(uuid.uuid4())
    user_id = None
    
    # TODO: Implement authentication
    # Uncomment and implement get_current_user_ws in auth.py for production
    # if token:
    #     try:
    #         user = await get_current_user_ws(token)
    #         user_id = str(user.id)
    #     except Exception as e:
    #         logger.warning(f"Error autenticando WebSocket: {e}")
    #         await websocket.close(code=4001, reason="Authentication failed")
    #         return
    
    try:
        # Conectar cliente
        await ws_manager.connect(websocket, connection_id, user_id)
        
        # Enviar mensaje de bienvenida
        welcome_event = WebSocketEvent(
            type=EventType.NOTIFICATION,
            data={
                "message": "Conectado al servidor WebSocket",
                "connection_id": connection_id
            },
            user_id=user_id
        )
        await ws_manager.send_personal_message(welcome_event, connection_id)
        
        # Loop principal: recibir mensajes
        while True:
            data = await websocket.receive_json()
            
            # Procesar comandos especiales
            if "command" in data:
                await handle_command(data, connection_id, user_id)
            else:
                # Echo del mensaje recibido
                echo_event = WebSocketEvent(
                    type=EventType.NOTIFICATION,
                    data={"echo": data},
                    user_id=user_id
                )
                await ws_manager.send_personal_message(echo_event, connection_id)
                
    except WebSocketDisconnect:
        logger.info(f"Cliente desconectado: {connection_id}")
    except Exception as e:
        logger.error(f"Error en WebSocket {connection_id}: {e}")
    finally:
        ws_manager.disconnect(connection_id)


async def handle_command(data: dict, connection_id: str, user_id: Optional[str]):
    """Manejar comandos especiales del cliente"""
    command = data.get("command")
    
    if command == "join_room":
        room = data.get("room")
        if room:
            ws_manager.join_room(connection_id, room)
            event = WebSocketEvent(
                type=EventType.NOTIFICATION,
                data={"message": f"Unido a room '{room}'"},
                user_id=user_id
            )
            await ws_manager.send_personal_message(event, connection_id)
    
    elif command == "leave_room":
        room = data.get("room")
        if room:
            ws_manager.leave_room(connection_id, room)
            event = WebSocketEvent(
                type=EventType.NOTIFICATION,
                data={"message": f"Saliste de room '{room}'"},
                user_id=user_id
            )
            await ws_manager.send_personal_message(event, connection_id)
    
    elif command == "broadcast":
        message = data.get("message", "")
        event = WebSocketEvent(
            type=EventType.NOTIFICATION,
            data={"message": message, "from": connection_id},
            user_id=user_id
        )
        await ws_manager.broadcast(event, exclude=[connection_id])


@router.get("/stats")
async def get_websocket_stats():
    """Obtener estadísticas de conexiones WebSocket"""
    return ws_manager.get_stats()


# Funciones auxiliares para emitir eventos desde otros routers
async def emit_order_created(order_data: dict):
    """Emitir evento de orden creada"""
    event = WebSocketEvent(
        type=EventType.ORDER_CREATED,
        data=order_data
    )
    await ws_manager.broadcast(event)


async def emit_order_updated(order_data: dict):
    """Emitir evento de orden actualizada"""
    event = WebSocketEvent(
        type=EventType.ORDER_UPDATED,
        data=order_data
    )
    await ws_manager.broadcast(event)


async def emit_order_status_changed(order_data: dict):
    """Emitir evento de cambio de estado de orden"""
    event = WebSocketEvent(
        type=EventType.ORDER_STATUS_CHANGED,
        data=order_data
    )
    await ws_manager.broadcast(event)


async def emit_client_created(client_data: dict):
    """Emitir evento de cliente creado"""
    event = WebSocketEvent(
        type=EventType.CLIENT_CREATED,
        data=client_data
    )
    await ws_manager.broadcast(event)


async def emit_client_updated(client_data: dict):
    """Emitir evento de cliente actualizado"""
    event = WebSocketEvent(
        type=EventType.CLIENT_UPDATED,
        data=client_data
    )
    await ws_manager.broadcast(event)


async def emit_inventory_updated(inventory_data: dict):
    """Emitir evento de inventario actualizado"""
    event = WebSocketEvent(
        type=EventType.INVENTORY_UPDATED,
        data=inventory_data
    )
    await ws_manager.broadcast(event)


async def emit_stock_low(item_data: dict):
    """Emitir evento de stock bajo"""
    event = WebSocketEvent(
        type=EventType.STOCK_LOW,
        data=item_data
    )
    await ws_manager.broadcast(event)


async def emit_notification(message: str, user_id: Optional[str] = None, severity: str = "info"):
    """Emitir notificación genérica"""
    event = WebSocketEvent(
        type=EventType.NOTIFICATION,
        data={"message": message, "severity": severity},
        user_id=user_id
    )
    
    if user_id:
        await ws_manager.send_to_user(event, user_id)
    else:
        await ws_manager.broadcast(event)
