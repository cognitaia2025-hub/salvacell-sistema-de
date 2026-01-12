# SalvaCell - Sistema de Gestión de Reparaciones

Sistema integral de gestión para talleres de reparación de dispositivos móviles con arquitectura **frontend React + backend Python FastAPI**.

## 🏗️ Arquitectura

```
┌─────────────────────────────────┐
│   Frontend (React + TypeScript) │
│   - PWA instalable              │
│   - UI con shadcn/ui            │
│   - Estado con React Query      │
└──────────────┬──────────────────┘
               │ REST API
┌──────────────▼──────────────────┐
│   Backend (Python + FastAPI)    │
│   - JWT Authentication          │
│   - SQLAlchemy ORM              │
│   - Celery para tareas async    │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│     PostgreSQL + Redis          │
│   - Datos relacionales          │
│   - Caché y cola de tareas      │
└─────────────────────────────────┘
```

## 🎯 Características Principales

### ✅ Gestión de Órdenes
- Creación de órdenes multi-paso con validaciones
- Búsqueda por folio, cliente, teléfono, IMEI
- Generación automática de QR único
- 7 estados del ciclo de vida
- Historial completo con timeline visual
- Sistema de carga de fotografías de evidencia
- Prioridad normal/urgente

### ✅ Base de Datos de Clientes
- Registro unificado con historial completo
- Búsqueda por nombre, teléfono, email
- Badges de cliente: VIP (>5 órdenes), Frecuente (3-5), Primera visita
- Estadísticas: total de visitas, total gastado, promedio
- Vista de equipos registrados por cliente

### ✅ Gestión de Inventario
- Catálogo completo con SKU, precios, stock
- Sistema de movimientos (entrada, salida, ajuste)
- Alertas de stock bajo/sin stock
- Estadísticas en tiempo real
- Historial completo de movimientos

### ✅ Sistema de Autenticación
- Login con JWT tokens
- 4 roles: Administrador, Técnico, Recepcionista, Bodeguero
- Control de acceso por endpoints
- Sesiones persistentes

### ✅ Consulta Pública QR
- Página sin autenticación para clientes
- Barra de progreso visual
- Estado actualizado en tiempo real
- Diseño responsive mobile-first

## 🚀 Inicio Rápido

### **Opción 1: Docker Compose (Recomendado)**

```bash
# 1. Clonar repositorio y configurar
git clone <repo>
cd spark-template
cp .env.example .env

# 2. Iniciar todos los servicios
docker-compose up -d

# 3. Crear usuario administrador
docker-compose exec backend python create_admin.py

# 4. Acceder a la aplicación
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/docs
```

Credenciales iniciales: `admin` / `password`

### **Opción 2: Desarrollo Local**

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar PostgreSQL y Redis
docker-compose up -d db redis

# Crear usuario admin
python create_admin.py

# Iniciar servidor
uvicorn main:app --reload
```

Backend disponible en http://localhost:8000

#### Frontend
```bash
# En la raíz del proyecto
npm install
cp .env.example .env
npm run dev
```

Frontend disponible en http://localhost:5173

## 📁 Estructura del Proyecto

```
spark-template/
├── backend/                    # Backend Python FastAPI
│   ├── models/                # Modelos SQLAlchemy (8 tablas)
│   ├── schemas/               # Schemas Pydantic
│   ├── routers/               # Endpoints API
│   │   ├── auth.py           # Autenticación
│   │   ├── clients.py        # Clientes
│   │   ├── orders.py         # Órdenes
│   │   └── inventory.py      # Inventario
│   ├── main.py               # FastAPI app
│   ├── database.py           # Conexión DB
│   ├── auth.py               # JWT & seguridad
│   ├── celery_worker.py      # Tareas asíncronas
│   └── create_admin.py       # Script inicial
├── src/                       # Frontend React
│   ├── components/           # Componentes UI
│   ├── hooks/                # React hooks
│   │   ├── use-auth.ts      # Hook de autenticación
│   │   └── use-relational-db.ts  # Hooks de datos
│   ├── lib/
│   │   ├── api/             # Cliente API REST
│   │   │   ├── client.ts   # HTTP client
│   │   │   ├── auth.ts     # API auth
│   │   │   ├── clients.ts  # API clientes
│   │   │   ├── orders.ts   # API órdenes
│   │   │   └── inventory.ts # API inventario
│   │   └── database/        # (Legacy - tipos)
│   └── App.tsx              # App principal
├── docker-compose.yml        # Stack completo
├── BRD.md                    # Requisitos de negocio
└── README.md                 # Este archivo
```

## 🔧 Stack Tecnológico

### Backend
- **Framework:** Python 3.11 + FastAPI 0.110
- **Base de Datos:** PostgreSQL 15 con SQLAlchemy async
- **Cache/Queue:** Redis 7
- **Auth:** JWT (python-jose)
- **Tasks:** Celery + Celery Beat
- **Validación:** Pydantic v2

### Frontend
- **Framework:** React 19 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui v4
- **State:** React Query (TanStack Query)
- **Forms:** React Hook Form + Zod
- **Icons:** Phosphor Icons

## 📖 Documentación

- [Backend README](backend/README.md) - Guía completa del backend
- [Frontend Integration](FRONTEND_INTEGRATION.md) - Guía de integración
- [BRD](BRD.md) - Documento de requisitos de negocio
- [API Docs](http://localhost:8000/docs) - Swagger UI (cuando esté corriendo)

## 🔑 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario (admin only)
- `GET /auth/me` - Obtener usuario actual

### Clientes
- `GET /clients` - Listar clientes
- `POST /clients` - Crear cliente
- `GET /clients/{id}` - Obtener cliente con estadísticas
- `PUT /clients/{id}` - Actualizar cliente

### Órdenes
- `GET /orders` - Listar órdenes
- `POST /orders` - Crear orden
- `GET /orders/{id}` - Obtener orden
- `GET /orders/qr/{qr_code}` - Vista pública (no auth)
- `PUT /orders/{id}` - Actualizar orden

### Inventario
- `GET /inventory/items` - Listar items
- `POST /inventory/items` - Crear item
- `POST /inventory/movements` - Registrar movimiento

Ver documentación completa en http://localhost:8000/docs

## 🗃️ Base de Datos

### Esquema (8 tablas relacionales)

```sql
clients (id, name, phone, email, ...)
  └─→ devices (id, client_id, brand, model, imei, ...)
       └─→ orders (id, client_id, device_id, folio, qr_code, status, ...)
            ├─→ order_history (id, order_id, status, notes, ...)
            ├─→ order_photos (id, order_id, file_path, ...)
            └─→ payments (id, order_id, amount, method, ...)

inventory_items (id, sku, name, stock, ...)
  └─→ inventory_movements (id, item_id, type, quantity, ...)

users (id, username, email, role, ...)
```

## 🔐 Roles y Permisos

- **Administrador**: Acceso completo al sistema
- **Técnico**: Gestión de órdenes e inventario
- **Recepcionista**: Recepción y entrega de órdenes, gestión de clientes
- **Bodeguero**: Solo gestión de inventario

## 🚢 Deployment

### Desarrollo
```bash
docker-compose up -d
```

### Producción

**Backend:**
- Railway / DigitalOcean / AWS
- Configurar variables de entorno
- Usar PostgreSQL managed (Neon/Supabase)

**Frontend:**
- Vercel / Netlify
- Build: `npm run build`
- Configurar `VITE_API_URL` apuntando a producción

Ver [backend/README.md](backend/README.md) para más detalles.

## 🐛 Troubleshooting

### "Failed to fetch" en frontend
- Verificar que backend esté corriendo en puerto 8000
- Revisar `VITE_API_URL` en `.env`
- Verificar CORS en `backend/config.py`

### "401 Unauthorized"
- Token expirado → Hacer logout y login
- Verificar que las credenciales sean correctas

### "Connection refused"
- PostgreSQL no está corriendo
- Redis no está corriendo
- Verificar puertos (5432, 6379, 8000)

## 📝 TODO

### Backend
- [ ] Implementar Alembic para migraciones
- [ ] Agregar tests unitarios
- [ ] Integración con Twilio (WhatsApp/SMS)
- [ ] Generación de PDFs con ReportLab
- [ ] Upload de imágenes a S3
- [ ] WebSockets para actualizaciones en tiempo real

### Frontend
- [ ] Implementar offline mode (PWA)
- [ ] Agregar modo oscuro
- [ ] Crear dashboard de métricas
- [ ] Implementar búsqueda avanzada con filtros
- [ ] Agregar exportación a Excel/PDF

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Ver archivo [LICENSE](LICENSE)

## 📞 Soporte

Para preguntas o reportar bugs, abre un issue en el repositorio.

---

**Versión**: 1.0.0  
**Última actualización**: Enero 12, 2026
