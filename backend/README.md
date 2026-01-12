# SalvaCell Backend

Backend API construido con FastAPI para el sistema de gestión de reparaciones SalvaCell.

## 🚀 Inicio Rápido

### Opción 1: Docker Compose (Recomendado)

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# La API estará disponible en http://localhost:8000
# Documentación Swagger: http://localhost:8000/docs
```

### Opción 2: Instalación Local

1. **Crear entorno virtual**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Iniciar PostgreSQL y Redis**
```bash
# Con Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=salvacell123 -e POSTGRES_USER=salvacell -e POSTGRES_DB=salvacell_db postgres:15-alpine
docker run -d -p 6379:6379 redis:7-alpine
```

5. **Ejecutar migraciones** (crear tablas)
```bash
# TODO: Usar Alembic para migraciones
# Por ahora, las tablas se crean automáticamente
```

6. **Iniciar servidor**
```bash
uvicorn main:app --reload
```

## 📁 Estructura del Proyecto

```
backend/
├── main.py                 # FastAPI app y configuración principal
├── config.py              # Configuración desde variables de entorno
├── database.py            # Conexión a PostgreSQL con SQLAlchemy
├── auth.py                # Autenticación JWT y middleware
├── models/                # Modelos SQLAlchemy (8 tablas)
│   └── __init__.py
├── schemas/               # Schemas Pydantic para validación
│   └── __init__.py
├── routers/               # Endpoints API
│   ├── auth.py           # Autenticación y usuarios
│   ├── clients.py        # Gestión de clientes
│   ├── orders.py         # Órdenes de reparación
│   └── inventory.py      # Inventario y movimientos
├── celery_worker.py       # Tareas asíncronas (notificaciones, PDFs)
├── migrate_from_spark_kv.py  # Script de migración desde frontend
├── requirements.txt
├── .env.example
└── Dockerfile
```

## 🔑 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario (admin only)
- `GET /auth/me` - Obtener info del usuario actual
- `PUT /auth/me` - Actualizar perfil
- `POST /auth/change-password` - Cambiar contraseña

### Clientes
- `GET /clients` - Listar clientes (con búsqueda)
- `POST /clients` - Crear cliente
- `GET /clients/{id}` - Obtener cliente con estadísticas
- `PUT /clients/{id}` - Actualizar cliente
- `DELETE /clients/{id}` - Eliminar cliente

### Órdenes
- `GET /orders` - Listar órdenes (con filtros)
- `POST /orders` - Crear orden
- `GET /orders/{id}` - Obtener orden
- `GET /orders/folio/{folio}` - Buscar por folio
- `GET /orders/qr/{qr_code}` - Vista pública por QR
- `PUT /orders/{id}` - Actualizar orden
- `DELETE /orders/{id}` - Eliminar orden
- `GET /orders/{id}/history` - Historial de orden
- `POST /orders/{id}/history` - Agregar entrada al historial

### Inventario
- `GET /inventory/items` - Listar items (con filtros)
- `POST /inventory/items` - Crear item
- `GET /inventory/items/{id}` - Obtener item
- `PUT /inventory/items/{id}` - Actualizar item
- `DELETE /inventory/items/{id}` - Eliminar item
- `GET /inventory/movements` - Historial de movimientos
- `POST /inventory/movements` - Crear movimiento (actualiza stock)

### Documentación
- `GET /docs` - Swagger UI interactivo
- `GET /redoc` - ReDoc documentación
- `GET /openapi.json` - Especificación OpenAPI

## 🔐 Autenticación

El sistema usa **JWT (JSON Web Tokens)** con los siguientes headers:

```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Respuesta:
# {
#   "access_token": "eyJ...",
#   "refresh_token": "eyJ...",
#   "token_type": "bearer"
# }

# Usar token en requests
curl http://localhost:8000/orders \
  -H "Authorization: Bearer eyJ..."
```

### Roles de Usuario
- **admin**: Acceso completo
- **technician**: Gestión de órdenes e inventario
- **receptionist**: Recepción y entrega de órdenes
- **warehouse**: Solo gestión de inventario

## 🗃️ Base de Datos

### Esquema (8 tablas relacionales)

```
clients → devices → orders
                      ├→ order_history
                      ├→ order_photos
                      └→ payments

inventory_items → inventory_movements

users (para autenticación)
```

### Migración desde Spark KV

Si tienes datos en el frontend actual (Spark KV):

1. **Exportar desde el navegador:**
```javascript
// En DevTools Console
const data = await window.spark.kv.get('relational_db');
const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'spark_kv_export.json';
a.click();
```

2. **Importar al backend:**
```bash
python migrate_from_spark_kv.py spark_kv_export.json
```

## 🔧 Tareas Asíncronas (Celery)

El sistema incluye Celery para tareas en background:

```python
# Iniciar workers
celery -A celery_worker worker --loglevel=info

# Iniciar scheduler (Beat)
celery -A celery_worker beat --loglevel=info
```

### Tareas Disponibles
- `send_whatsapp_notification` - Enviar notificación WhatsApp
- `send_email_notification` - Enviar email
- `generate_order_pdf` - Generar PDF de orden
- `check_low_stock_items` - Verificar inventario bajo (diario)
- `backup_database` - Backup de BD (diario)

## 🧪 Testing

```bash
# Instalar pytest
pip install pytest pytest-asyncio

# Ejecutar tests
pytest tests/ -v

# Con coverage
pytest --cov=. tests/
```

## 📦 Deployment

### Variables de Entorno Requeridas

```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
SECRET_KEY=your-secret-key-minimum-32-characters
REDIS_URL=redis://localhost:6379/0
CORS_ORIGINS=https://yourdomain.com
```

### Producción con Docker

```bash
# Build
docker build -t salvacell-backend .

# Run
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  salvacell-backend
```

### Plataformas Recomendadas
- **Railway**: Deploy automático desde Git
- **DigitalOcean App Platform**: $5/mes
- **AWS ECS/Fargate**: Escalable
- **Render**: Free tier disponible

## 📊 Monitoreo

```bash
# Health check
curl http://localhost:8000/health

# Logs
docker-compose logs -f backend

# Métricas (TODO: Prometheus)
# http://localhost:8000/metrics
```

## 🤝 Desarrollo

### Agregar nuevo endpoint

1. Crear schema en `schemas/__init__.py`
2. Agregar endpoint en el router correspondiente
3. Documentar con docstrings (aparece en Swagger)

```python
@router.get("/example", response_model=ExampleResponse)
async def get_example(db: AsyncSession = Depends(get_db)):
    """
    Descripción del endpoint (aparece en Swagger)
    """
    # Tu código aquí
    pass
```

### Formato de código

```bash
# Black para formato
black .

# Ruff para linting
ruff check .
```

## 📝 TODO

- [ ] Implementar Alembic para migraciones
- [ ] Agregar tests unitarios
- [ ] Integración con Twilio (WhatsApp)
- [ ] Generación de PDFs con ReportLab
- [ ] Upload de imágenes a S3
- [ ] Endpoints de reportes y estadísticas
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Rate limiting con Redis
- [ ] Logging estructurado

## 📄 Licencia

Ver LICENSE en la raíz del proyecto.
