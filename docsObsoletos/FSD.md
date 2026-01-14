# FSD - Functional Specification Document
## SalvaCell - Sistema de Gestión de Reparaciones

**Versión:** 1.0  
**Fecha:** 2026-01-01  
**Basado en:** BRD v1.0, PRD v1.1

---

## 1. OBJETIVO DEL DOCUMENTO

Este documento detalla las especificaciones funcionales técnicas que los desarrolladores deben implementar para cumplir con los requerimientos definidos en el BRD y PRD.

---

## 2. ADR (ARCHITECTURE DECISION RECORDS)

Las decisiones arquitectónicas se mantienen en archivos individuales para facilitar su seguimiento y actualización:

*   [ADR-001: Uso de FastAPI](docs/adr/0001-fastapi-backend.md)
*   [ADR-002: SQLAlchemy 2.0](docs/adr/0002-sqlalchemy-orm.md)
*   [ADR-003: Autenticación JWT](docs/adr/0003-jwt-auth.md)
*   [ADR-004: Offline-First con Dexie.js](docs/adr/0004-offline-dexie.md)

---

## 3. ARQUITECTURA DEL SISTEMA

### 3.1 Stack Tecnológico

**Frontend:**
- Framework: React 18+ con Vite
- UI Components: Tailwind CSS + shadcn/ui
- State Management: Zustand
- Routing: React Router v6
- Forms: React Hook Form + Zod validation
- API Calls: Axios con interceptors
- PWA: Workbox para Service Workers
- Offline DB: Dexie.js (IndexedDB wrapper)

**Backend:**
- Runtime: Python 3.11+
- Framework: FastAPI
- ORM: SQLAlchemy 2.0 + Alembic (migraciones)
- Authentication: JWT (python-jose[cryptography])
- Validation: Pydantic (integrado con FastAPI)
- File Upload: FastAPI UploadFile (integrado)
- CORS: FastAPI CORSMiddleware
- Password Hashing: passlib[bcrypt]
- Logging: loguru

**Base de Datos:**
- PostgreSQL 15+
- Hosted: Railway o Supabase (free tier)

**Deployment:**
- Frontend: Vercel
- Backend: Railway (Python runtime) o Render
- CI/CD: GitHub Actions

### 3.2 Diagramas Técnicos
Para una visión detallada de la interacción de componentes y flujos de datos, consulte:
*   [Diagrama de Componentes y Secuencia](docs/flows/user-flows.md)

---

## 4. API SPECIFICATION (OPENAPI)

La especificación detallada de los endpoints, incluyendo modelos de petición y respuesta, se encuentra en:
*   [Especificación API Detallada](docs/api/openapi.md)

---

## 5. USER FLOW DIAGRAMS

Los diagramas de flujo de procesos de negocio (Recepción, Reparación, Entrega) se encuentran en:
*   [Diagramas de Flujo de Usuario](docs/flows/user-flows.md)

---

## 6. DATABASE DESIGN (ERD & SCHEMA)

### 6.1 Modelo de Datos
Para el diagrama Entidad-Relación y el diccionario de datos detallado:
*   [Diagrama ERD](docs/database/erd.md)
*   [Diccionario de Datos](docs/database/dictionary.md)

### 6.2 Esquema de Base de Datos (SQLAlchemy)

```python
# models.py (SQLAlchemy)
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Decimal, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid
import enum

Base = declarative_base()

class RoleEnum(enum.Enum):
    ADMIN = "ADMIN"
    TECNICO = "TECNICO"
    RECEPCIONISTA = "RECEPCIONISTA"


```
backend/
├── alembic/              # Migraciones de base de datos
├── app/
│   ├── main.py           # Punto de entrada FastAPI
│   ├── config.py         # Configuración y variables de entorno
│   ├── database.py       # Conexión a base de datos
│   ├── models/           # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   ├── cliente.py
│   │   ├── orden.py
│   │   └── ...
│   ├── schemas/          # Esquemas Pydantic
│   │   ├── __init__.py
│   │   ├── cliente.py
│   │   ├── orden.py
│   │   └── ...
│   ├── api/              # Endpoints
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── clientes.py
│   │   ├── ordenes.py
│   │   └── ...
│   ├── core/             # Lógica de negocio
│   │   ├── security.py   # JWT, hashing
│   │   ├── config.py
│   │   └── ...
│   ├── crud/             # Operaciones CRUD
│   │   ├── __init__.py
│   │   ├── orden.py
│   │   └── ...
│   └── utils/            # Utilidades
│       ├── __init__.py
│       ├── folio_generator.py
├── tests/
├── alembic.ini
├── requirements.txt
└── .env

### 4.2 Ejemplo de Endpoints

**main.py:**
```python
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, clientes, ordenes, reportes
from app.core.config import settings

app = FastAPI(
    description="Sistema de Gestión de Reparaciones",
    version="1.0.0"
)

# CORS
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(clientes.router, prefix="/api/clientes", tags=["clientes"])
app.include_router(ordenes.router, prefix="/api/ordenes", tags=["ordenes"])

@app.get("/")
def root():
    return {"message": "SalvaCell API v1.0"}

    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 4.3 Autenticación (FastAPI + JWT)
**POST /api/auth/login**

```python
# app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import Token, UserResponse
from app.core.security import verify_password, create_access_token
from app.crud.user import get_user_by_email
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db)
):
    user
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      Role     @default(TECNICO)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
## SalvaCell - Sistema de Gestión de Reparaciones

**Versión:** 1.0  
**Fecha:** 2026-01-01  
**Basado en:** BRD v1.0, PRD v1.1

---

## Stack Tecnológico Adaptado

**Frontend:**
- React 18+ (PWA, Vite, Tailwind CSS, Zustand, React Router, Zod, Axios, Dexie.js)

**Backend:**
- Python 3.11+ (FastAPI, SQLAlchemy, Alembic, Pydantic, JWT, passlib, loguru)

**Base de Datos:**
- PostgreSQL 15+

**Deployment:**
- Frontend: Vercel
- Backend: Railway/Render
- CI/CD: GitHub Actions

---

## Especificaciones Funcionales Clave

- El frontend será una PWA en React, adaptable a cualquier dispositivo y con modo offline.
- El backend será una API RESTful en Python/FastAPI, preparada para integrar LLMs.
- Seguridad: Autenticación JWT, roles RBAC, protección CSRF/XSS.
- Sincronización offline: Dexie.js en frontend, endpoints batch en FastAPI.
- Notificaciones automáticas vía WhatsApp (Twilio/WAHA).
- Validaciones estrictas en frontend (Zod) y backend (Pydantic).
- Documentación automática de endpoints con OpenAPI.

---

## Criterios de Aceptación Técnica

- APIs responden en < 500ms
- PWA funciona offline y sincroniza datos
- Tests unitarios y de integración (pytest)
- Lighthouse score > 90
- Cobertura de tests > 80%
- CI/CD automatizado

---

## Entregables

1. Backend API (Python/FastAPI)
2. Frontend React PWA
3. Base de datos PostgreSQL con migraciones
4. Sistema de notificaciones WhatsApp
5. Documentación técnica y de setup
6. Scripts de seed y tests automatizados
7. Configuración de deployment (Dockerfile, .env, GitHub Actions)

---

**Fin del FSD adaptado a React PWA y Python FastAPI**
**GET /api/pagos/orden/:ordenId**

**GET /api/pagos/cliente/:clienteId**

**GET /api/pagos/arqueo**
- Query: `fecha`
- Response: Resumen de caja del día

---

### 4.8 Reportes

**GET /api/reportes/dashboard**
- Response: KPIs principales

**GET /api/reportes/ventas**
- Query: `fechaDesde`, `fechaHasta`

**GET /api/reportes/clientes-recurrentes**
- Response: Análisis de clientes VIP, frecuentes, tasa retención, CLV

**GET /api/reportes/reparaciones-comunes**

---

### 4.9 QR y Seguimiento Público

**GET /public/orden/:token**
- Response: Estado de la orden (sin datos sensibles)

---

### 4.10 Notificaciones

**POST /api/notificaciones/enviar**
- Body: { ordenId, tipo: "whatsapp" | "email" | "sms", plantilla }

---

## 5. REGLAS DE NEGOCIO

### 5.1 Gestión de Clientes

**RN-CLI-001:** Al buscar cliente por teléfono, normalizar formato (quitar espacios, guiones)

**RN-CLI-002:** Badges de cliente:
- VIP: > 10 órdenes O ticket promedio > $500
- Frecuente: 5-10 órdenes
- Nuevo: < 5 órdenes

**RN-CLI-003:** Al crear orden, SIEMPRE verificar si cliente existe por teléfono

**RN-CLI-004:** Permitir fusionar clientes solo si ambos IDs existen y son diferentes

---

### 5.2 Gestión de Órdenes

**RN-ORD-001:** Folio auto-generado: ORD-{YYYY}{MM}{sequential}
Ejemplo: ORD-202601001

**RN-ORD-002:** Cálculo de adeudo: `costoTotal - anticipo`

**RN-ORD-003:** Garantía automática según tipo de refacción:
- Original: 30 días
- Genérica: 15 días
- Reparación local: 15 días

**RN-ORD-004:** Al cambiar estado, registrar en HistorialEstadoOrden

**RN-ORD-005:** No permitir cambiar a ENTREGADO si adeudo > 0

**RN-ORD-006:** Al marcar como TERMINADO, enviar notificación automática al cliente

---

### 5.3 Gestión de Inventario

**RN-INV-001:** Al agregar refacción a orden, descontar de stockActual

**RN-INV-002:** No permitir usar refacción si stockActual < cantidad solicitada

**RN-INV-003:** Generar alerta si stockActual < stockMinimo

---

### 5.4 Pagos

**RN-PAG-001:** Métodos de pago válidos: EFECTIVO, TARJETA, TRANSFERENCIA

**RN-PAG-002:** Permitir pagos parciales (anticipos)

**RN-PAG-003:** Registro de pago debe actualizar campo `adeudo` en Orden

---

### 5.5 Presupuestos

**RN-PRE-001:** Folio: PRE-{YYYY}{MM}{sequential}

**RN-PRE-002:** Estado VENCIDO si fecha actual > fechaVencimiento

**RN-PRE-003:** Al convertir a orden, marcar presupuesto como ACEPTADO

---

## 6. VALIDACIONES

### 6.1 Validaciones de Entrada

**Cliente:**
- nombre: string, min 2 caracteres, max 100
- telefono: string, formato numérico, 10 dígitos, único
- email: válido (regex), opcional

**Orden:**
- problemaReportado: string, min 10 caracteres
- costoTotal: decimal > 0
- anticipo: decimal >= 0 y <= costoTotal
- fechaEstimadaEntrega: >= fecha actual

**Refacción:**
- codigo: único
- precioVenta: >= costoCompra
- stockActual: >= 0

---

## 7. SEGURIDAD

### 7.1 Autenticación (Python + FastAPI)

```python
# app/core/security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 8

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar password con bcrypt"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashear password con bcrypt"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crear JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """Decodificar y validar JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

```python
# app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_access_token
from app.crud.user import get_user_by_email
from app.models.user import User, RoleEnum

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Obtener usuario actual desde JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    user = get_user_by_email(db, email)
    if user is None or not user.active:
        raise credentials_exception
    
    return user

def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Verificar que el usuario actual sea ADMIN"""
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos suficientes"
        )
    return current_user
```

**Configuración:**
- JWT con expiración de 8 horas
- Refresh token (opcional para v2)
- Password hasheado con bcrypt (usando passlib)
- SECRET_KEY debe ser una cadena segura de al menos 256 bits

### 7.2 Autorización (RBAC)

**ADMIN:**
- Full access

**TECNICO:**
- CRUD Órdenes
- Read Clientes
- Update Inventario (solo salidas)
- Create Pagos

**RECEPCIONISTA:**
- CRUD Presupuestos
- Create Órdenes
- CRUD Clientes
- Create Ventas
- Create Pagos

### 7.3 Endpoint Público

- `/public/orden/:token` NO requiere autenticación
- Token es UUID único de la orden
- Exponer solo: folio, estado, fechaEstimadaEntrega, historial de estados

---

## 8. MODO OFFLINE (PWA)

### 8.1 Service Worker Strategy (Frontend - Sin cambios)

**Páginas estáticas:** Cache First
**API Calls:** Network First con fallback a cache

### 8.2 IndexedDB (Dexie.js) - Frontend

Tablas locales:
- clientes
- ordenes
- refacciones
- accesorios

### 8.3 Sincronización

- Al reconectar internet, sincronizar cambios en orden FIFO
- Manejo de conflictos: último cambio gana (timestamp)

**Backend (FastAPI) debe soportar:**

```python
# Endpoint para sincronización batch
@router.post("/sync/batch")
def sync_batch(
    operations: List[SyncOperation],
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Sincronizar múltiples operaciones offline"""
    results = []
    
    for op in operations:
        try:
            if op.entity == "orden":
                result = process_orden_sync(db, op)
            elif op.entity == "cliente":
                result = process_cliente_sync(db, op)
            # ...
            results.append({"id": op.id, "status": "success", "data": result})
        except Exception as e:
            results.append({"id": op.id, "status": "error", "message": str(e)})
    
    return {"results": results}
```

---

## 9. NOTIFICACIONES (Python)

### 9.1 WhatsApp (Integración con WAHA o Twilio)

```python
# app/services/notificaciones.py
import httpx
from typing import Optional
from app.core.config import settings
from app.models.orden import Orden
from app.models.cliente import Cliente

class WhatsAppService:
    def __init__(self):
        self.api_url = settings.WHATSAPP_API_URL
        self.api_key = settings.WHATSAPP_API_KEY
    
    async def enviar_orden_lista(self, orden: Orden, cliente: Cliente) -> dict:
        """Enviar notificación cuando orden está lista"""
        
        # Verificar si es cliente recurrente
        es_recurrente = len(cliente.ordenes) > 3
        
        if es_recurrente:
            mensaje = f"""Hola {cliente.nombre}, tu {orden.equipo.marca} {orden.equipo.modelo} está listo nuevamente.
¡Gracias por seguir confiando en nosotros!
Folio: {orden.folio}
Adeudo: ${orden.adeudo}"""
        else:
            mensaje = f"""Hola {cliente.nombre}, tu {orden.equipo.marca} {orden.equipo.modelo} está listo para recoger.
Adeudo: ${orden.adeudo}
Folio: {orden.folio}
Gracias por confiar en SalvaCell."""
        
        # Enviar a través de la API (ejemplo con Twilio)
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/messages",
                json={
                    "to": f"whatsapp:+52{cliente.telefono}",
                    "from": settings.WHATSAPP_FROM_NUMBER,
                    "body": mensaje
                },
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
        
        return response.json()
    
    async def enviar_recordatorio(self, orden: Orden, cliente: Cliente) -> dict:
        """Enviar recordatorio de recolección"""
        mensaje = f"""Hola {cliente.nombre}, tu {orden.equipo.marca} {orden.equipo.modelo} está listo desde hace 48 horas.
Te esperamos para entregártelo.
Folio: {orden.folio}"""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/messages",
                json={
                    "to": f"whatsapp:+52{cliente.telefono}",
                    "from": settings.WHATSAPP_FROM_NUMBER,
                    "body": mensaje
                },
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
        
        return response.json()

# Uso en el endpoint de cambio de estado
@router.patch("/{orden_id}/estado")
async def cambiar_estado_orden(
    orden_id: str,
    estado_nuevo: EstadoOrdenEnum,
    notas: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    orden = get_orden_by_id(db, orden_id)
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    # Actualizar estado
    orden.estado = estado_nuevo
    
    # Registrar en historial
    historial = HistorialEstadoOrden(
        orden_id=orden.id,
        estado_anterior=orden.estado,
        estado_nuevo=estado_nuevo,
        usuario_id=current_user.id,
        notas=notas
    )
    db.add(historial)
    db.commit()
    
    # Enviar notificación si está TERMINADO
    if estado_nuevo == EstadoOrdenEnum.TERMINADO:
        whatsapp = WhatsAppService()
        await whatsapp.enviar_orden_lista(orden, orden.cliente)
    
    return orden
```

**Trigger:** Orden cambia a TERMINADO

**Plantillas de mensajes:**
```
Hola {nombreCliente}, tu {marca} {modelo} está listo para recoger. 
Adeudo: ${adeudo}
Folio: {folio}
Gracias por confiar en SalvaCell.
```

**Personalización para cliente recurrente:**
```
Hola {nombreCliente}, tu {marca} {modelo} está listo nuevamente. 
¡Gracias por seguir confiando en nosotros!
Folio: {folio}
```

---

## 10. LIMPIEZA DE DATOS

### 10.1 Estrategia de Archivado

**Trigger:** 
- > 2000 órdenes en estado ENTREGADO
- O > 2 años desde fechaRealEntrega

**Proceso:**
1. Mostrar alerta en dashboard
2. Admin puede exportar a JSON/CSV
3. Mover órdenes antiguas a tabla `OrdenesArchivadas`
4. Mantener relación con cliente para historial

---

## 11. CRITERIOS DE ACEPTACIÓN TÉCNICA

- ✅ Todas las APIs responden en < 500ms
- ✅ Frontend carga en < 2 segundos
- ✅ PWA funciona offline para crear órdenes
- ✅ Tests unitarios para reglas de negocio críticas (pytest)
- ✅ Tests de integración para flujo completo de orden (pytest + TestClient)
- ✅ Lighthouse score > 90
- ✅ 100% de endpoints documentados automáticamente con FastAPI/OpenAPI
- ✅ Cobertura de tests > 80%

---

## 12. ENTREGABLES

1. **Backend API (Python/FastAPI)** con todos los endpoints
2. **Frontend React** con todas las vistas
3. **Base de datos PostgreSQL** con migraciones Alembic
4. **PWA funcional** con modo offline
5. **Sistema de notificaciones WhatsApp**
6. **Documentación técnica completa:**
   - README con instrucciones de setup
   - Documentación OpenAPI automática (FastAPI docs)
   - Guía de desarrollo
7. **Scripts de seed** para datos de prueba (Python)
8. **Tests automatizados** (pytest):
   - Tests unitarios
   - Tests de integración
   - Tests de API endpoints
9. **Configuración de deployment:**
   - Dockerfile (Python 3.11-slim)
   - requirements.txt
   - alembic.ini
   - .env.example
10. **CI/CD Pipeline** (GitHub Actions)

### 12.1 Archivos de Configuración Python

**requirements.txt:**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.13.0
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
httpx==0.25.2
loguru==0.7.2
pytest==7.4.3
pytest-asyncio==0.21.1
```

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

**Fin del FSD**