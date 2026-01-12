# Guía de Integración Frontend con Backend

## ✅ **Cambios Implementados**

### **1. Cliente API REST**
Creados módulos en `src/lib/api/`:
- `client.ts` - Cliente HTTP base con manejo de tokens JWT
- `auth.ts` - Autenticación (login, logout, getCurrentUser)
- `clients.ts` - API de clientes
- `orders.ts` - API de órdenes
- `inventory.ts` - API de inventario

### **2. Hooks Actualizados**
`src/hooks/use-relational-db.ts` ahora usa la API REST:
- `useOrders()` - Órdenes desde API
- `useClients()` - Clientes desde API
- `useInventory()` - Inventario desde API
- `usePayments()` - Pagos (pending backend endpoint)
- `useOrderHistory()` - Historial de órdenes

### **3. Autenticación**
- `src/hooks/use-auth.ts` - Hook de autenticación con contexto
- `src/components/LoginForm.tsx` - Formulario de login
- `src/App.tsx` - Integrado con AuthProvider

## 🚀 **Cómo Ejecutar**

### **Paso 1: Iniciar Backend**
```bash
# Opción A: Con Docker Compose (recomendado)
docker-compose up -d

# Opción B: Local
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend disponible en: http://localhost:8000
Documentación API: http://localhost:8000/docs

### **Paso 2: Configurar Frontend**
```bash
# Crear archivo .env en la raíz
echo "VITE_API_URL=http://localhost:8000" > .env

# Instalar dependencias si es necesario
npm install
```

### **Paso 3: Iniciar Frontend**
```bash
npm run dev
```

Frontend disponible en: http://localhost:5173

## 🔑 **Credenciales Iniciales**

Para crear el primer usuario administrador, ejecuta en el backend:

```python
# backend/create_admin.py
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from models import User, UserRole
from auth import get_password_hash
from config import settings
import uuid

async def create_admin():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        admin = User(
            id=str(uuid.uuid4()),
            username="admin",
            email="admin@salvacell.com",
            password_hash=get_password_hash("password"),
            full_name="Administrador",
            role=UserRole.ADMIN,
            is_active=1
        )
        session.add(admin)
        await session.commit()
        print("✅ Usuario admin creado: admin / password")

if __name__ == "__main__":
    asyncio.run(create_admin())
```

Ejecutar:
```bash
cd backend
python create_admin.py
```

O usar directamente desde Swagger UI (http://localhost:8000/docs):
1. Ir a `POST /auth/register`
2. Usar cualquier token (no hay validación inicial)
3. Crear usuario admin

## 📋 **Flujo de Autenticación**

1. **Login**: Usuario ingresa credenciales → Backend valida → Devuelve JWT tokens
2. **Almacenamiento**: Tokens se guardan en `localStorage`
3. **Requests**: Todas las peticiones incluyen `Authorization: Bearer <token>`
4. **Refresh**: Frontend verifica autenticación al cargar
5. **Logout**: Limpia tokens de `localStorage`

## 🔧 **Componentes que Necesitan Ajustes**

Los siguientes componentes aún pueden referenciar la DB local. Revisar y actualizar si es necesario:

- `DatabaseDemo.tsx` - Usa `db` directamente
- Cualquier componente que importe `@/lib/database/db`

## 🐛 **Troubleshooting**

### Error: "Failed to fetch"
- Verificar que el backend esté corriendo en http://localhost:8000
- Verificar variable `VITE_API_URL` en `.env`
- Revisar CORS en `backend/config.py`

### Error: "401 Unauthorized"
- Token expirado → Hacer logout y login nuevamente
- Backend reiniciado → Los tokens viejos no son válidos

### Error: "Network Error"
- Backend no está corriendo
- Puerto 8000 ocupado
- Firewall bloqueando conexión

## 📦 **Próximos Pasos**

### Pendientes en Backend:
- [ ] Crear endpoint para crear usuarios inicial (bootstrap)
- [ ] Implementar endpoints de pagos
- [ ] Agregar endpoint de estadísticas de inventario
- [ ] Implementar upload de fotos
- [ ] Integración WhatsApp/Email (Celery tasks)

### Pendientes en Frontend:
- [ ] Agregar manejo de errores global
- [ ] Implementar retry logic para requests fallidos
- [ ] Agregar loading states globales
- [ ] Implementar refresh de token automático
- [ ] Agregar indicador de conexión al backend

## 🎨 **Nuevas Features Disponibles**

Con el backend ahora puedes:

✅ **Multi-usuario**: Diferentes roles (admin, técnico, recepcionista, bodeguero)
✅ **Búsqueda avanzada**: Búsqueda por nombre, teléfono, folio, IMEI
✅ **Persistencia real**: Datos en PostgreSQL (no se pierden al recargar)
✅ **Estadísticas**: Clientes con stats (total gastado, número de órdenes)
✅ **Vista pública QR**: Sin autenticación para clientes
✅ **Historial completo**: Cambios de estado con timestamps y usuarios
✅ **API REST**: Puedes crear apps móviles o integraciones

## 📖 **Documentación Adicional**

- Backend: Ver `backend/README.md`
- API: http://localhost:8000/docs (Swagger UI)
- Schemas: Revisar `backend/schemas/__init__.py`
- Modelos: Revisar `backend/models/__init__.py`

---

**Última actualización**: 12 de enero de 2026
