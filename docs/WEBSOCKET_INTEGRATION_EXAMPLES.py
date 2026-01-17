"""
WebSocket Integration Example
Demonstrates how to integrate WebSocket events with existing routers
"""

# Example 1: Emit events from Orders router
# File: backend/routers/orders.py

from routers.websocket import (
    emit_order_created,
    emit_order_updated,
    emit_order_status_changed,
    emit_notification
)

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new order and notify all clients"""
    
    # Create order in database
    new_order = Order(**order_data.dict())
    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)
    
    # Emit WebSocket event to all connected clients
    await emit_order_created({
        "id": new_order.id,
        "folio": new_order.folio,
        "status": new_order.status,
        "cliente_nombre": new_order.cliente_nombre,
        "created_at": new_order.created_at.isoformat()
    })
    
    # Also send a notification
    await emit_notification(
        f"Nueva orden creada: {new_order.folio}",
        severity="success"
    )
    
    return new_order


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update order status and notify clients"""
    
    # Get and update order
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    old_status = order.status
    order.status = status_update.status
    await db.commit()
    await db.refresh(order)
    
    # Emit status change event
    await emit_order_status_changed({
        "id": order.id,
        "folio": order.folio,
        "old_status": old_status,
        "new_status": order.status,
        "updated_at": order.updated_at.isoformat()
    })
    
    return order


# Example 2: Monitor inventory and send low stock alerts
# File: backend/routers/inventory.py

from routers.websocket import emit_inventory_updated, emit_stock_low

@router.put("/{item_id}", response_model=InventoryItemResponse)
async def update_inventory_item(
    item_id: int,
    item_update: InventoryItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update inventory and check for low stock"""
    
    # Update item
    item = await db.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Update fields
    for field, value in item_update.dict(exclude_unset=True).items():
        setattr(item, field, value)
    
    await db.commit()
    await db.refresh(item)
    
    # Emit inventory updated event
    await emit_inventory_updated({
        "id": item.id,
        "nombre": item.nombre,
        "cantidad": item.cantidad,
        "updated_at": item.updated_at.isoformat()
    })
    
    # Check for low stock and emit alert
    if item.cantidad <= item.stock_minimo:
        await emit_stock_low({
            "id": item.id,
            "nombre": item.nombre,
            "cantidad": item.cantidad,
            "stock_minimo": item.stock_minimo
        })
    
    return item


# Example 3: Client management events
# File: backend/routers/clients.py

from routers.websocket import emit_client_created, emit_client_updated

@router.post("/", response_model=ClientResponse)
async def create_client(
    client_data: ClientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create client and notify"""
    
    new_client = Client(**client_data.dict())
    db.add(new_client)
    await db.commit()
    await db.refresh(new_client)
    
    # Notify all users about new client
    await emit_client_created({
        "id": new_client.id,
        "nombre": new_client.nombre,
        "telefono": new_client.telefono,
        "email": new_client.email
    })
    
    return new_client


# Example 4: Background task integration
# File: backend/celery_worker.py

from websockets.manager import ws_manager
from websockets.events import WebSocketEvent, EventType
import asyncio

def send_websocket_notification(message: str, severity: str = "info"):
    """Send WebSocket notification from Celery task"""
    
    async def _send():
        event = WebSocketEvent(
            type=EventType.NOTIFICATION,
            data={"message": message, "severity": severity}
        )
        await ws_manager.broadcast(event)
    
    # Run in asyncio event loop
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(_send())
    loop.close()


@celery_app.task
def process_order_payment(order_id: int):
    """Process payment and notify via WebSocket"""
    
    # Process payment logic here
    success = process_payment(order_id)
    
    if success:
        send_websocket_notification(
            f"Pago procesado exitosamente para orden #{order_id}",
            severity="success"
        )
    else:
        send_websocket_notification(
            f"Error procesando pago para orden #{order_id}",
            severity="error"
        )
