from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import Appointment, AppointmentStatus, Client, Order
from schemas import AppointmentCreate, AppointmentUpdate, AppointmentResponse
import uuid

router = APIRouter(prefix="/citas", tags=["citas"])


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_data: AppointmentCreate,
    db: AsyncSession = Depends(get_db)
):
    """Crear nueva cita"""
    # Verify client exists
    client_result = await db.execute(select(Client).where(Client.id == appointment_data.client_id))
    if not client_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Verify order if provided
    if appointment_data.order_id:
        order_result = await db.execute(select(Order).where(Order.id == appointment_data.order_id))
        if not order_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Orden no encontrada")

    new_appointment = Appointment(
        id=str(uuid.uuid4()),
        **appointment_data.model_dump()
    )

    db.add(new_appointment)
    await db.commit()
    await db.refresh(new_appointment)

    return new_appointment


@router.get("/", response_model=List[AppointmentResponse])
async def get_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[AppointmentStatus] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    client_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Obtener lista de citas con filtros"""
    query = select(Appointment)

    filters = []

    if status:
        filters.append(Appointment.status == status)

    if start_date:
        filters.append(Appointment.scheduled_date >= start_date)

    if end_date:
        filters.append(Appointment.scheduled_date <= end_date)

    if client_id:
        filters.append(Appointment.client_id == client_id)

    if filters:
        query = query.where(and_(*filters))

    query = query.offset(skip).limit(limit).order_by(Appointment.scheduled_date.asc())
    result = await db.execute(query)
    appointments = result.scalars().all()
    return appointments


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtener cita por ID"""
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalar_one_or_none()

    if not appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    return appointment


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: str,
    appointment_data: AppointmentUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Actualizar cita"""
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalar_one_or_none()

    if not appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    update_data = appointment_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(appointment, field, value)

    await db.commit()
    await db.refresh(appointment)
    return appointment


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(
    appointment_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Eliminar cita"""
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalar_one_or_none()

    if not appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    await db.delete(appointment)
    await db.commit()
    return None


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
async def update_appointment_status(
    appointment_id: str,
    new_status: AppointmentStatus,
    db: AsyncSession = Depends(get_db)
):
    """Actualizar estado de cita"""
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalar_one_or_none()

    if not appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    appointment.status = new_status
    await db.commit()
    await db.refresh(appointment)
    return appointment


@router.get("/client/{client_id}", response_model=List[AppointmentResponse])
async def get_client_appointments(
    client_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtener citas de un cliente"""
    result = await db.execute(
        select(Appointment)
        .where(Appointment.client_id == client_id)
        .order_by(Appointment.scheduled_date.desc())
    )
    appointments = result.scalars().all()
    return appointments
