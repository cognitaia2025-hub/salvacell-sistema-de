from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List, Optional
from database import get_db
from models import InventoryItem, InventoryMovement, MovementType
from schemas import (
    InventoryItemCreate, InventoryItemUpdate, InventoryItemResponse,
    InventoryMovementCreate, InventoryMovementResponse
)
import uuid

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.post("/items", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_item(
    item_data: InventoryItemCreate,
    db: AsyncSession = Depends(get_db)
):
    """Crear nuevo item de inventario"""
    # Check if SKU already exists
    result = await db.execute(select(InventoryItem).where(InventoryItem.sku == item_data.sku))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="SKU ya existe")
    
    new_item = InventoryItem(
        id=str(uuid.uuid4()),
        **item_data.model_dump()
    )
    
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item


@router.get("/items", response_model=List[InventoryItemResponse])
async def get_inventory_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    category: Optional[str] = None,
    low_stock: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Obtener lista de items de inventario"""
    query = select(InventoryItem)
    
    if category:
        query = query.where(InventoryItem.category == category)
    
    if low_stock:
        query = query.where(InventoryItem.stock <= InventoryItem.min_stock)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                InventoryItem.sku.ilike(search_pattern),
                InventoryItem.name.ilike(search_pattern),
                InventoryItem.description.ilike(search_pattern)
            )
        )
    
    query = query.offset(skip).limit(limit).order_by(InventoryItem.name)
    result = await db.execute(query)
    items = result.scalars().all()
    return items


@router.get("/items/{item_id}", response_model=InventoryItemResponse)
async def get_inventory_item(
    item_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtener item de inventario por ID"""
    result = await db.execute(select(InventoryItem).where(InventoryItem.id == item_id))
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    return item


@router.put("/items/{item_id}", response_model=InventoryItemResponse)
async def update_inventory_item(
    item_id: str,
    item_data: InventoryItemUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Actualizar item de inventario"""
    result = await db.execute(select(InventoryItem).where(InventoryItem.id == item_id))
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    update_data = item_data.model_dump(exclude_unset=True)
    
    # Check SKU uniqueness if updating
    if "sku" in update_data:
        sku_check = await db.execute(
            select(InventoryItem).where(
                InventoryItem.sku == update_data["sku"],
                InventoryItem.id != item_id
            )
        )
        if sku_check.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="SKU ya existe")
    
    for field, value in update_data.items():
        setattr(item, field, value)
    
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inventory_item(
    item_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Eliminar item de inventario"""
    result = await db.execute(select(InventoryItem).where(InventoryItem.id == item_id))
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    await db.delete(item)
    await db.commit()
    return None


# ============= Inventory Movements =============

@router.post("/movements", response_model=InventoryMovementResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_movement(
    movement_data: InventoryMovementCreate,
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Add auth
):
    """Crear movimiento de inventario y actualizar stock"""
    # Verify item exists
    item_result = await db.execute(select(InventoryItem).where(InventoryItem.id == movement_data.item_id))
    item = item_result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    # Update stock based on movement type
    if movement_data.type in [MovementType.ENTRY, MovementType.RETURN]:
        item.stock += abs(movement_data.quantity)
    elif movement_data.type == MovementType.EXIT:
        if item.stock < abs(movement_data.quantity):
            raise HTTPException(status_code=400, detail="Stock insuficiente")
        item.stock -= abs(movement_data.quantity)
    elif movement_data.type == MovementType.ADJUSTMENT:
        item.stock = movement_data.quantity
    
    new_movement = InventoryMovement(
        id=str(uuid.uuid4()),
        **movement_data.model_dump(),
        # user_id=current_user.id  # TODO: Add auth
    )
    
    db.add(new_movement)
    await db.commit()
    await db.refresh(new_movement)
    return new_movement


@router.get("/movements", response_model=List[InventoryMovementResponse])
async def get_inventory_movements(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    item_id: Optional[str] = None,
    movement_type: Optional[MovementType] = None,
    db: AsyncSession = Depends(get_db)
):
    """Obtener historial de movimientos de inventario"""
    query = select(InventoryMovement)
    
    if item_id:
        query = query.where(InventoryMovement.item_id == item_id)
    
    if movement_type:
        query = query.where(InventoryMovement.type == movement_type)
    
    query = query.offset(skip).limit(limit).order_by(InventoryMovement.created_at.desc())
    result = await db.execute(query)
    movements = result.scalars().all()
    return movements
