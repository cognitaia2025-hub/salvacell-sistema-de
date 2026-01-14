# SalvaCell - Guía Rápida de Pruebas

## Iniciar Servidores

### Backend

```bash
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
npm run dev
```

## Endpoints Nuevos

### 📸 Fotos

- `POST /photos/orders/{order_id}/photos` - Subir foto
- `GET /photos/orders/{order_id}/photos` - Listar fotos
- `GET /photos/{photo_id}` - Ver foto
- `DELETE /photos/{photo_id}` - Eliminar foto

### 📄 Exportación

- `GET /export/orders/{order_id}/pdf` - Descargar PDF

## Pruebas Rápidas

### 1. Swagger UI
<http://localhost:8000/docs>

### 2. Probar Validación de Estados

**Transiciones VÁLIDAS desde "received":**

- ✅ received → diagnosing
- ✅ received → cancelled
- ❌ received → delivered (ERROR 400)

**Transiciones VÁLIDAS desde "repaired":**

- ✅ repaired → delivered
- ✅ repaired → in_repair
- ❌ repaired → diagnosing (ERROR 400)

### 3. Upload de Foto (cURL)

```bash
curl -X POST http://localhost:8000/photos/orders/ORDER_ID/photos \
  -F "file=@test.jpg" \
  -F "description=Foto de prueba"
```

### 4. Exportar PDF

Abrir en navegador:

```
http://localhost:8000/export/orders/ORDER_ID/pdf
```

## Configuración Opcional

### Email (.env)

```env
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
EMAIL_FROM=noreply@salvacell.com
```

### Celery (Requiere Redis)

```bash
# Terminal 1: Worker
celery -A celery_worker worker --pool=eventlet -l info

# Terminal 2: Beat (tareas programadas)
celery -A celery_worker beat -l info
```

## Archivos Importantes

### Backend

- `backend/routers/photos.py` - Router de fotos
- `backend/routers/export.py` - Exportación PDF
- `backend/services/email.py` - Servicio de email
- `backend/routers/orders.py` - Validaciones (líneas 27-48)

### Frontend

- `src/lib/api/photos.ts` - API de fotos
- `src/lib/api/orders.ts` - exportPDF() (línea 73)

## Estados de Orden

```
received → diagnosing → waiting_parts → in_repair → repaired → delivered
    ↓           ↓             ↓             ↓          ↓
 cancelled   cancelled     cancelled    cancelled  cancelled
```

## Notas

- ✅ Twilio OMITIDO (no se requiere configuración)
- ✅ Email funciona sin configuración (solo imprime advertencia)
- ✅ Fotos se guardan en `backend/uploads/`
- ✅ PDFs se generan al vuelo (no se guardan)
