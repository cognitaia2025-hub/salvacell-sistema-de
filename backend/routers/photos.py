from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from database import get_db
from models import OrderPhoto, Order
from schemas import OrderPhotoResponse
from config import settings
from services.s3_service import s3_service
import uuid
import os
import shutil
from pathlib import Path

router = APIRouter(prefix="/photos", tags=["photos"])


def get_file_extension(filename: str) -> str:
    """Extract file extension from filename"""
    return Path(filename).suffix.lower()


def validate_image_file(filename: str) -> bool:
    """Validate if file is an allowed image type"""
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'}
    return get_file_extension(filename) in allowed_extensions


async def save_upload_file(upload_file: UploadFile, order_id: str) -> tuple[str, str, int]:
    """
    Save uploaded file to disk or S3 based on STORAGE_TYPE
    Returns: (file_path, file_url, file_size)
    """
    # Validate file type
    if not validate_image_file(upload_file.filename):
        raise HTTPException(
            status_code=400,
            detail="Tipo de archivo no permitido. Solo se aceptan imágenes (jpg, png, gif, webp, heic)"
        )
    
    # Generate unique filename
    file_ext = get_file_extension(upload_file.filename)
    unique_filename = f"{order_id}_{uuid.uuid4().hex}{file_ext}"
    
    # Reset file pointer to the beginning
    await upload_file.seek(0)
    
    if settings.STORAGE_TYPE == "s3":
        # Upload to S3
        if not s3_service.is_configured():
            raise HTTPException(
                status_code=500,
                detail="S3 storage is not properly configured"
            )
        
        try:
            # Get file size before upload
            await upload_file.seek(0, 2)  # Seek to end
            file_size = await upload_file.tell()
            await upload_file.seek(0)  # Reset to beginning
            
            # Generate S3 key
            s3_key = f"order-photos/{order_id}/{unique_filename}"
            
            # Upload to S3
            file_url = s3_service.upload_file(
                upload_file.file,
                s3_key,
                content_type=upload_file.content_type
            )
            
            # For S3, file_path stores the S3 key
            file_path = s3_key
            
            return file_path, file_url, file_size
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al subir archivo a S3: {str(e)}"
            )
    else:
        # Save to local disk (original behavior)
        # Create uploads directory if it doesn't exist
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Save file
        file_path = upload_dir / unique_filename
        file_size = 0
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
            file_size = file_path.stat().st_size
        
        # Generate URL
        file_url = f"/uploads/{unique_filename}"
        
        return str(file_path), file_url, file_size


@router.post("/orders/{order_id}/photos", response_model=OrderPhotoResponse, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    order_id: str,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Add auth
):
    """Subir foto de evidencia para una orden"""
    # Verify order exists
    order_result = await db.execute(select(Order).where(Order.id == order_id))
    order = order_result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    # Save file to disk
    file_path, file_url, file_size = await save_upload_file(file, order_id)
    
    # Create database record
    new_photo = OrderPhoto(
        id=str(uuid.uuid4()),
        order_id=order_id,
        file_path=file_path,
        file_url=file_url,
        description=description,
        file_size=file_size,
        mime_type=file.content_type,
        # uploaded_by=current_user.id  # TODO: Add auth
    )
    
    db.add(new_photo)
    await db.commit()
    await db.refresh(new_photo)
    
    return new_photo


@router.get("/orders/{order_id}/photos", response_model=List[OrderPhotoResponse])
async def get_order_photos(
    order_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtener todas las fotos de una orden"""
    # Verify order exists
    order_result = await db.execute(select(Order).where(Order.id == order_id))
    if not order_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    # Get photos
    result = await db.execute(
        select(OrderPhoto)
        .where(OrderPhoto.order_id == order_id)
        .order_by(OrderPhoto.created_at.desc())
    )
    photos = result.scalars().all()
    
    return photos


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
    photo_id: str,
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Add auth
):
    """Eliminar una foto"""
    result = await db.execute(select(OrderPhoto).where(OrderPhoto.id == photo_id))
    photo = result.scalar_one_or_none()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Foto no encontrada")
    
    # Delete file from storage
    try:
        # Detect storage type based on file_path pattern
        # S3 keys start with "order-photos/" while local paths are absolute
        is_s3_file = photo.file_path.startswith("order-photos/")
        
        if is_s3_file:
            # Delete from S3
            if s3_service.is_configured():
                s3_service.delete_file(photo.file_path)
        else:
            # Delete from local disk
            file_path = Path(photo.file_path)
            if file_path.exists():
                file_path.unlink()
    except Exception as e:
        # Log error but continue with database deletion
        print(f"Error deleting file: {e}")
    
    # Delete from database
    await db.delete(photo)
    await db.commit()
    
    return None


@router.get("/{photo_id}", response_model=OrderPhotoResponse)
async def get_photo(
    photo_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtener información de una foto específica"""
    result = await db.execute(select(OrderPhoto).where(OrderPhoto.id == photo_id))
    photo = result.scalar_one_or_none()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Foto no encontrada")
    
    return photo


@router.get("/orders/{order_id}/presigned-url")
async def generate_presigned_url(
    order_id: str,
    file_name: str = Query(..., description="Nombre del archivo a subir"),
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Add auth
):
    """
    Generar una URL prefirmada para subir archivos directamente a S3
    Solo disponible cuando STORAGE_TYPE=s3
    """
    # Verify storage type
    if settings.STORAGE_TYPE != "s3":
        raise HTTPException(
            status_code=400,
            detail="Las URLs prefirmadas solo están disponibles con almacenamiento S3"
        )
    
    # Verify S3 is configured
    if not s3_service.is_configured():
        raise HTTPException(
            status_code=500,
            detail="S3 no está configurado correctamente"
        )
    
    # Verify order exists
    order_result = await db.execute(select(Order).where(Order.id == order_id))
    if not order_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    # Validate file type
    if not validate_image_file(file_name):
        raise HTTPException(
            status_code=400,
            detail="Tipo de archivo no permitido. Solo se aceptan imágenes (jpg, png, gif, webp, heic)"
        )
    
    # Generate unique filename
    file_ext = get_file_extension(file_name)
    unique_filename = f"{order_id}_{uuid.uuid4().hex}{file_ext}"
    s3_key = f"order-photos/{order_id}/{unique_filename}"
    
    try:
        # Generate presigned URL
        presigned_url = s3_service.generate_presigned_url(s3_key, expires_in=3600)
        
        return {
            "presigned_url": presigned_url,
            "s3_key": s3_key,
            "expires_in": 3600,
            "file_name": unique_filename
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar URL prefirmada: {str(e)}"
        )
