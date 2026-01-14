from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import List, Optional
from database import get_db
from models import Client, Order, Device
from schemas import (
    ClientCreate, ClientUpdate, ClientResponse, ClientWithStats
)
import uuid

router = APIRouter(prefix="/clients", tags=["clients"])


@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    client_data: ClientCreate,
    db: AsyncSession = Depends(get_db)
):
    """Crear un nuevo cliente"""
    new_client = Client(
        id=str(uuid.uuid4()),
        **client_data.model_dump()
    )
    db.add(new_client)
    await db.commit()
    await db.refresh(new_client)
    return new_client


@router.get("/", response_model=List[ClientResponse])
async def get_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Obtener lista de clientes con búsqueda opcional"""
    query = select(Client)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Client.name.ilike(search_pattern),
                Client.phone.ilike(search_pattern),
                Client.email.ilike(search_pattern)
            )
        )
    
    query = query.offset(skip).limit(limit).order_by(Client.created_at.desc())
    result = await db.execute(query)
    clients = result.scalars().all()
    return clients


@router.get("/{client_id}", response_model=ClientWithStats)
async def get_client(
    client_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtener cliente por ID con estadísticas"""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Get stats
    orders_result = await db.execute(
        select(func.count(Order.id), func.sum(Order.final_cost))
        .where(Order.client_id == client_id)
    )
    total_orders, total_spent = orders_result.one()
    
    devices_result = await db.execute(
        select(func.count(Device.id)).where(Device.client_id == client_id)
    )
    device_count = devices_result.scalar()
    
    client_dict = {
        **{c.name: getattr(client, c.name) for c in client.__table__.columns},
        "total_orders": total_orders or 0,
        "total_spent": float(total_spent or 0),
        "device_count": device_count or 0
    }
    
    return client_dict


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    client_data: ClientUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Actualizar cliente"""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    update_data = client_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    await db.commit()
    await db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Eliminar cliente"""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    await db.delete(client)
    await db.commit()
    return None
