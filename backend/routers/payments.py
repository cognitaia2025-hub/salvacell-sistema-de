from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from database import get_db
from models import Payment, PaymentStatus, PaymentMethod, Order
from schemas import PaymentCreate, PaymentUpdate, PaymentResponse
import uuid

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: PaymentCreate,
    db: AsyncSession = Depends(get_db)
):
    """Registrar un nuevo pago"""
    # Verify order exists
    order_result = await db.execute(select(Order).where(Order.id == payment_data.order_id))
    order = order_result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    # Create payment
    new_payment = Payment(
        id=str(uuid.uuid4()),
        order_id=payment_data.order_id,
        amount=payment_data.amount,
        method=payment_data.method,
        status=PaymentStatus.PAID,
        reference=payment_data.reference,
        notes=payment_data.notes
    )

    db.add(new_payment)
    await db.commit()
    await db.refresh(new_payment)

    return new_payment


@router.get("/", response_model=List[PaymentResponse])
async def get_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    order_id: Optional[str] = None,
    method: Optional[PaymentMethod] = None,
    db: AsyncSession = Depends(get_db)
):
    """Obtener lista de pagos"""
    query = select(Payment)

    if order_id:
        query = query.where(Payment.order_id == order_id)

    if method:
        query = query.where(Payment.method == method)

    query = query.offset(skip).limit(limit).order_by(Payment.created_at.desc())
    result = await db.execute(query)
    payments = result.scalars().all()
    return payments


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtener pago por ID"""
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()

    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

    return payment


@router.get("/order/{order_id}", response_model=List[PaymentResponse])
async def get_order_payments(
    order_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtener todos los pagos de una orden"""
    # Verify order exists
    order_result = await db.execute(select(Order).where(Order.id == order_id))
    if not order_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    result = await db.execute(
        select(Payment)
        .where(Payment.order_id == order_id)
        .order_by(Payment.created_at.desc())
    )
    payments = result.scalars().all()
    return payments


@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: str,
    payment_data: PaymentUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Actualizar pago"""
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()

    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

    update_data = payment_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(payment, field, value)

    await db.commit()
    await db.refresh(payment)
    return payment


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment(
    payment_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Eliminar pago"""
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()

    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

    await db.delete(payment)
    await db.commit()
    return None


@router.get("/order/{order_id}/summary")
async def get_order_payment_summary(
    order_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtener resumen de pagos de una orden"""
    # Get order
    order_result = await db.execute(select(Order).where(Order.id == order_id))
    order = order_result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    # Get payments
    payments_result = await db.execute(
        select(Payment).where(Payment.order_id == order_id)
    )
    payments = payments_result.scalars().all()

    total_paid = float(sum(p.amount for p in payments))
    estimated = float(order.estimated_cost or 0)
    final = float(order.final_cost or estimated)
    pending = max(0, final - total_paid)

    # Determine status
    if total_paid >= final and final > 0:
        payment_status = "paid"
    elif total_paid > 0:
        payment_status = "partial"
    else:
        payment_status = "pending"

    return {
        "order_id": order_id,
        "estimated_cost": estimated,
        "final_cost": final,
        "total_paid": total_paid,
        "pending": pending,
        "payment_status": payment_status,
        "payment_count": len(payments)
    }
