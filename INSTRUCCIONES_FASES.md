# Instrucciones para Continuar Desarrollo - SalvaCell

## Contexto del Proyecto

SalvaCell es un sistema de gestión para taller de reparación de celulares.
- **Frontend**: React 19 + TypeScript + Vite + Tailwind + shadcn/ui
- **Backend**: Python FastAPI + SQLAlchemy async + PostgreSQL
- **Ubicación frontend**: `src/`
- **Ubicación backend**: `backend/`

## Estado Actual (Completado)

### Backend - Routers existentes:
- `/auth` - Autenticación JWT
- `/clients` - CRUD clientes
- `/orders` - CRUD órdenes
- `/inventory` - CRUD inventario
- `/citas` - CRUD citas/appointments
- `/reports` - Estadísticas y reportes
- `/payments` - Gestión de pagos

### Frontend - Servicios API:
- `src/lib/api/` contiene: auth.ts, clients.ts, orders.ts, inventory.ts, reports.ts, payments.ts

---

## FASE 2: Upload de Fotos, Validaciones, PDF

### Tarea 2.1: Upload de Fotos para Órdenes

**Objetivo**: Permitir subir fotos de evidencia a las órdenes de reparación.

**Backend - Crear `backend/routers/photos.py`:**
```python
# Endpoints necesarios:
# POST /orders/{order_id}/photos - Subir foto (multipart/form-data)
# GET /orders/{order_id}/photos - Listar fotos de una orden
# DELETE /photos/{photo_id} - Eliminar foto

# Usar el modelo existente OrderPhoto en backend/models/__init__.py (líneas 133-153)
# Guardar archivos en backend/uploads/
# Generar URL pública: /uploads/{filename}
```

**Modelo OrderPhoto ya existe** en `backend/models/__init__.py`:
- id, order_id, uploaded_by, file_path, file_url, description, file_size, mime_type, created_at

**Schemas ya existen** en `backend/schemas/__init__.py`:
- OrderPhotoCreate, OrderPhotoResponse (líneas 140-157)

**Registrar router** en `backend/main.py`:
```python
from routers import photos
app.include_router(photos.router)
```

**Frontend - Crear `src/lib/api/photos.ts`:**
```typescript
// Funciones: uploadPhoto(orderId, file, description), getPhotos(orderId), deletePhoto(photoId)
// Usar api.upload() del client.ts existente para multipart/form-data
```

---

### Tarea 2.2: Validaciones de Estado en Órdenes

**Objetivo**: Evitar transiciones de estado inválidas (ej: no permitir ir de "delivered" a "diagnosing").

**Archivo a modificar**: `backend/routers/orders.py`

**Agregar validación en `update_order()` (línea ~146):**
```python
# Matriz de transiciones válidas:
VALID_TRANSITIONS = {
    "received": ["diagnosing", "cancelled"],
    "diagnosing": ["waiting_parts", "in_repair", "cancelled"],
    "waiting_parts": ["in_repair", "cancelled"],
    "in_repair": ["repaired", "waiting_parts", "cancelled"],
    "repaired": ["delivered", "in_repair"],
    "delivered": [],  # Estado final
    "cancelled": [],  # Estado final
}

# Antes de cambiar estado, verificar:
if "status" in update_data:
    current = order.status.value
    new = update_data["status"]
    if new not in VALID_TRANSITIONS.get(current, []):
        raise HTTPException(400, f"No se puede cambiar de '{current}' a '{new}'")
```

---

### Tarea 2.3: Exportación PDF de Órdenes

**Objetivo**: Generar PDF con detalles de orden (comprobante/ticket).

**Backend - Crear `backend/routers/export.py`:**
```python
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/orders/{order_id}/pdf")
async def export_order_pdf(order_id: str, db: AsyncSession = Depends(get_db)):
    # 1. Obtener orden con cliente y dispositivo
    # 2. Crear PDF con reportlab:
    #    - Logo/nombre del taller
    #    - Folio y QR
    #    - Datos del cliente
    #    - Datos del dispositivo
    #    - Problema reportado
    #    - Estado actual
    #    - Costos
    #    - Fecha estimada de entrega
    # 3. Retornar StreamingResponse con content_type="application/pdf"

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    # ... generar contenido ...
    p.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=orden_{order.folio}.pdf"}
    )
```

**Registrar** en main.py: `from routers import export`

**Frontend - Agregar función en `src/lib/api/orders.ts`:**
```typescript
exportPDF: (orderId: string) => {
  window.open(`${API_BASE_URL}/export/orders/${orderId}/pdf`, '_blank')
}
```

---

## FASE 3: Integraciones Externas

### Tarea 3.1: Notificaciones WhatsApp/SMS (Twilio)

**Archivo**: `backend/services/notifications.py` (crear)

```python
from twilio.rest import Client
from config import settings

def send_whatsapp(phone: str, message: str):
    if not settings.TWILIO_ACCOUNT_SID:
        return  # Skip si no está configurado

    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=message,
        from_=f"whatsapp:{settings.TWILIO_PHONE_NUMBER}",
        to=f"whatsapp:{phone}"
    )

# Llamar desde orders.py cuando cambie el estado:
# - "in_repair" -> "Tu dispositivo está siendo reparado"
# - "repaired" -> "Tu dispositivo está listo para recoger"
# - "delivered" -> "Gracias por tu preferencia"
```

**Instalar**: `pip install twilio` (agregar a requirements.txt)

---

### Tarea 3.2: Envío de Emails

**Archivo**: `backend/services/email.py` (crear)

```python
import smtplib
from email.mime.text import MIMEText
from config import settings

async def send_email(to: str, subject: str, body: str):
    if not settings.SMTP_USER:
        return

    msg = MIMEText(body, "html")
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.EMAIL_FROM, to, msg.as_string())
```

---

### Tarea 3.3: Tareas Celery (Background Jobs)

**Archivo existente**: `backend/celery_worker.py`

**Agregar tareas**:
```python
@celery_app.task
def send_reminder_notifications():
    """Enviar recordatorios de citas del día siguiente"""
    # Consultar citas para mañana
    # Enviar WhatsApp/email a cada cliente
    pass

@celery_app.task
def generate_daily_report():
    """Generar reporte diario automático"""
    pass

# Programar en celery beat:
celery_app.conf.beat_schedule = {
    'daily-reminders': {
        'task': 'celery_worker.send_reminder_notifications',
        'schedule': crontab(hour=9, minute=0),  # 9 AM diario
    },
}
```

---

## Archivos Clave de Referencia

| Archivo | Contenido |
|---------|-----------|
| `backend/models/__init__.py` | Todos los modelos SQLAlchemy |
| `backend/schemas/__init__.py` | Todos los schemas Pydantic |
| `backend/config.py` | Variables de entorno |
| `backend/database.py` | Conexión a BD |
| `backend/auth.py` | Funciones de autenticación |
| `src/lib/api/client.ts` | Cliente HTTP base |
| `src/lib/api/index.ts` | Exports de todos los servicios |

---

## Comandos Útiles

```bash
# Backend
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload --port 8000

# Frontend
npm run dev

# Ver docs API
http://localhost:8000/docs

# Crear tablas nuevas
python create_admin.py
```

---

## Notas Importantes

1. **Imports en main.py**: Cada router nuevo debe importarse y registrarse
2. **Schemas**: Si creas modelos nuevos, crea también sus schemas en `schemas/__init__.py`
3. **Frontend exports**: Actualiza `src/lib/api/index.ts` al crear nuevos servicios
4. **Probar endpoints**: Usa Swagger UI en `/docs` antes de conectar frontend
5. **Windows**: Celery necesita `--pool=eventlet` para funcionar
