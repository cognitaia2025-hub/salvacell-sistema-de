from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from typing import List, Optional
from datetime import datetime, timedelta
from database import get_db
from models import Appointment, AppointmentStatus, Client, Order
from schemas import AppointmentCreate, AppointmentUpdate, AppointmentResponse
import uuid

router = APIRouter(prefix="/citas", tags=["citas"])


async def check_scheduling_conflict(
    db: AsyncSession,
    scheduled_date: datetime,
    duration_minutes: int,
    exclude_appointment_id: Optional[str] = None
) -> Optional[Appointment]:
    """
    Check if there's a scheduling conflict with existing appointments.
    Returns the conflicting appointment if found, None otherwise.
    
    A conflict exists when:
    - An existing appointment's time range overlaps with the new appointment
    - The existing appointment is not cancelled or no_show
    """
    end_date = scheduled_date + timedelta(minutes=duration_minutes)
    
    # Find appointments that overlap with the requested time slot
    # Overlap occurs when: existing_start < new_end AND existing_end > new_start
    query = select(Appointment).where(
        and_(
            Appointment.status.notin_([AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW]),
            Appointment.scheduled_date < end_date,
            or_(
                # If end_date is set, use it for comparison
                and_(
                    Appointment.end_date.isnot(None),
                    Appointment.end_date > scheduled_date
                ),
                # Otherwise, calculate end from scheduled_date + duration_minutes
                and_(
                    Appointment.end_date.is_(None),
                    (Appointment.scheduled_date + func.make_interval(0, 0, 0, 0, 0, Appointment.duration_minutes, 0)) > scheduled_date
                )
            )
        )
    )
    
    # Exclude the current appointment when updating
    if exclude_appointment_id:
        query = query.where(Appointment.id != exclude_appointment_id)
    
    result = await db.execute(query)
    return result.scalar_one_or_none()


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

    # Check for scheduling conflicts
    conflicting_appointment = await check_scheduling_conflict(
        db,
        appointment_data.scheduled_date,
        appointment_data.duration_minutes
    )
    if conflicting_appointment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Conflicto de horario: ya existe una cita programada para ese horario (ID: {conflicting_appointment.id})"
        )

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

    # Check for scheduling conflicts if date or duration is being updated
    if 'scheduled_date' in update_data or 'duration_minutes' in update_data:
        new_scheduled_date = update_data.get('scheduled_date', appointment.scheduled_date)
        new_duration = update_data.get('duration_minutes', appointment.duration_minutes)
        
        conflicting_appointment = await check_scheduling_conflict(
            db,
            new_scheduled_date,
            new_duration,
            exclude_appointment_id=appointment_id
        )
        if conflicting_appointment:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Conflicto de horario: ya existe una cita programada para ese horario (ID: {conflicting_appointment.id})"
            )

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


@router.get("/availability/check")
async def check_availability(
    scheduled_date: datetime = Query(..., description="Fecha y hora propuesta para la cita"),
    duration_minutes: int = Query(60, ge=15, le=480, description="Duración de la cita en minutos"),
    exclude_id: Optional[str] = Query(None, description="ID de cita a excluir (para ediciones)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Verificar disponibilidad de un horario específico.
    
    Retorna si el horario está disponible y, si no lo está,
    información sobre la cita que genera el conflicto.
    """
    conflicting_appointment = await check_scheduling_conflict(
        db,
        scheduled_date,
        duration_minutes,
        exclude_appointment_id=exclude_id
    )
    
    if conflicting_appointment:
        return {
            "available": False,
            "conflict": {
                "appointment_id": conflicting_appointment.id,
                "title": conflicting_appointment.title,
                "scheduled_date": conflicting_appointment.scheduled_date.isoformat(),
                "duration_minutes": conflicting_appointment.duration_minutes
            }
        }
    
    return {"available": True, "conflict": None}
