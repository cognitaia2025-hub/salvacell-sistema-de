from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List, Optional
from database import get_db
from models import Order, OrderStatus, Client, Device, OrderHistory
from schemas import (
    OrderCreate,
    OrderUpdate,
    OrderResponse,
    OrderHistoryCreate,
    OrderHistoryResponse,
)
import uuid
import secrets

router = APIRouter(prefix="/orders", tags=["orders"])


def generate_folio() -> str:
    """Generate unique order folio"""
    return f"ORD-{secrets.token_hex(4).upper()}"


def generate_qr_code() -> str:
    """Generate unique QR code identifier"""
    return str(uuid.uuid4())


# State transition validation matrix
VALID_TRANSITIONS = {
    OrderStatus.RECEIVED: [OrderStatus.DIAGNOSING, OrderStatus.CANCELLED],
    OrderStatus.DIAGNOSING: [
        OrderStatus.WAITING_PARTS,
        OrderStatus.IN_REPAIR,
        OrderStatus.CANCELLED,
    ],
    OrderStatus.WAITING_PARTS: [OrderStatus.IN_REPAIR, OrderStatus.CANCELLED],
    OrderStatus.IN_REPAIR: [
        OrderStatus.REPAIRED,
        OrderStatus.WAITING_PARTS,
        OrderStatus.CANCELLED,
    ],
    OrderStatus.REPAIRED: [OrderStatus.DELIVERED, OrderStatus.IN_REPAIR],
    OrderStatus.DELIVERED: [],  # Final state
    OrderStatus.CANCELLED: [],  # Final state
}


def validate_status_transition(
    current_status: OrderStatus, new_status: OrderStatus
) -> None:
    """
    Validate if a status transition is allowed
    Raises HTTPException if transition is invalid
    """
    if new_status not in VALID_TRANSITIONS.get(current_status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Transición de estado inválida: no se puede cambiar de '{current_status.value}' a '{new_status.value}'",
        )


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Add auth
):
    """Crear nueva orden de reparación"""
    # Verify client exists
    client_result = await db.execute(
        select(Client).where(Client.id == order_data.client_id)
    )
    if not client_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Verify device if provided
    if order_data.device_id:
        device_result = await db.execute(
            select(Device).where(Device.id == order_data.device_id)
        )
        if not device_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Dispositivo no encontrado")

    new_order = Order(
        id=str(uuid.uuid4()),
        folio=generate_folio(),
        qr_code=generate_qr_code(),
        **order_data.model_dump(),
    )

    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)

    # Create initial history entry
    history_entry = OrderHistory(
        id=str(uuid.uuid4()),
        order_id=new_order.id,
        status=OrderStatus.RECEIVED,
        notes="Orden creada",
        # user_id=current_user.id  # TODO: Add auth
    )
    db.add(history_entry)
    await db.commit()

    return new_order


@router.get("/", response_model=List[OrderResponse])
async def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[OrderStatus] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Obtener lista de órdenes con filtros"""
    query = select(Order)

    if status:
        query = query.where(Order.status == status)

    if search:
        search_pattern = f"%{search}%"
        # Join with client to search by name/phone
        query = query.join(Client).where(
            or_(
                Order.folio.ilike(search_pattern),
                Client.name.ilike(search_pattern),
                Client.phone.ilike(search_pattern),
            )
        )

    query = query.offset(skip).limit(limit).order_by(Order.created_at.desc())
    result = await db.execute(query)
    orders = result.scalars().all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, db: AsyncSession = Depends(get_db)):
    """Obtener orden por ID"""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    return order


@router.get("/folio/{folio}", response_model=OrderResponse)
async def get_order_by_folio(folio: str, db: AsyncSession = Depends(get_db)):
    """Obtener orden por folio"""
    result = await db.execute(select(Order).where(Order.folio == folio))
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    return order


@router.get("/qr/{qr_code}", response_model=OrderResponse)
async def get_order_by_qr(qr_code: str, db: AsyncSession = Depends(get_db)):
    """Obtener orden por código QR (para vista pública)"""
    result = await db.execute(select(Order).where(Order.qr_code == qr_code))
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    return order


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: str,
    order_data: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Add auth
):
    """Actualizar orden"""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    update_data = order_data.model_dump(exclude_unset=True)
    old_status = order.status

    # Validate status transition if status is being changed
    if "status" in update_data and update_data["status"] != old_status:
        validate_status_transition(old_status, update_data["status"])

    for field, value in update_data.items():
        setattr(order, field, value)

    # Create history entry if status changed
    if "status" in update_data and update_data["status"] != old_status:
        history_entry = OrderHistory(
            id=str(uuid.uuid4()),
            order_id=order.id,
            status=update_data["status"],
            notes=f"Estado cambiado de {old_status} a {update_data['status']}",
            # user_id=current_user.id  # TODO: Add auth
        )
        db.add(history_entry)

    await db.commit()
    await db.refresh(order)
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(order_id: str, db: AsyncSession = Depends(get_db)):
    """Eliminar orden"""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    await db.delete(order)
    await db.commit()
    return None


@router.get("/{order_id}/history", response_model=List[OrderHistoryResponse])
async def get_order_history(order_id: str, db: AsyncSession = Depends(get_db)):
    """Obtener historial de una orden"""
    result = await db.execute(
        select(OrderHistory)
        .where(OrderHistory.order_id == order_id)
        .order_by(OrderHistory.created_at.desc())
    )
    history = result.scalars().all()
    return history


@router.post(
    "/{order_id}/history",
    response_model=OrderHistoryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_order_history(
    order_id: str, history_data: OrderHistoryCreate, db: AsyncSession = Depends(get_db)
):
    """Agregar entrada al historial de orden"""
    # Verify order exists
    order_result = await db.execute(select(Order).where(Order.id == order_id))
    if not order_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    new_history = OrderHistory(id=str(uuid.uuid4()), **history_data.model_dump())

    db.add(new_history)
    await db.commit()
    await db.refresh(new_history)
    return new_history
