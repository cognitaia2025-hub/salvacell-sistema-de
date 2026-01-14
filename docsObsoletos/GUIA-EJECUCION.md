# 🚀 GUÍA DE INSTALACIÓN Y EJECUCIÓN - SalvaCell

## Preparación del Entorno

### 1. Clonar el Repositorio
```bash
cd /ruta/donde/guardaras/proyecto
git clone <url-del-repositorio> salvacell
cd salvacell
```

### 2. Instalar Dependencias

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### 3. Configurar PostgreSQL

#### Opción A: PostgreSQL Local
1. Asegúrate de tener PostgreSQL instalado (versión 14 o superior)
2. Crea la base de datos:
```sql
CREATE DATABASE salvacell_db;
```

#### Opción B: Docker
```bash
docker run --name salvacell-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=salvacell_db \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 4. Configurar Variables de Entorno

Edita el archivo `backend/.env.local` y guárdalo como `.env`:

```bash
cd backend
cp .env.local .env
```

Edita el archivo `.env` con tus datos:

```env
# Database
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/salvacell_db?schema=public"

# JWT (IMPORTANTE: Cambia esta clave)
JWT_SECRET="SalvaCell-Secret-Key-2024-Genera-Tu-Propia-Clave-Aqui-12345!@#$%"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# Frontend URL
FRONTEND_URL="http://localhost:5173"
```

### 5. Generar Cliente de Prisma

```bash
cd backend
npx prisma generate
```

### 6. Ejecutar Migraciones

```bash
npx prisma migrate dev --name init
```

### 7. Poblar Datos Iniciales (Seed)

```bash
npx tsx prisma/seed.ts
```

### 8. Iniciar los Servidores

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
El servidor backend estará en: `http://localhost:3000`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
La aplicación frontend estará en: `http://localhost:5173`

---

## 🔐 Credenciales de Acceso

Después de ejecutar el seed, puedes iniciar sesión con:

| Rol | Email | Password |
|-----|-------|----------|
| **Admin** | admin@salvacell.com | admin123 |
| **Técnico** | tecnico@salvacell.com | tecnico123 |
| **Recepcionista** | recepcion@salvacell.com | recepcion123 |

---

## 📁 Estructura de Archivos Creados

```
salvacell/
├── README.md                    # Documentación principal
├── GUIA-EJECUCION.md           # Este archivo
├── backend/
│   ├── .env.example            # Ejemplo de variables de entorno
│   ├── .env.local              # Template para configurar
│   ├── prisma/
│   │   ├── schema.prisma       # Schema de la base de datos
│   │   ├── seed.ts             # Script de datos iniciales
│   │   └── migrations/         # Historial de migraciones
│   └── src/
│       ├── index.ts            # Punto de entrada
│       ├── config/             # Configuraciones
│       ├── controllers/        # Controladores de API
│       ├── middlewares/        # Middlewares Express
│       ├── routes/             # Rutas de API
│       ├── utils/              # Utilidades
│       └── validations/        # Validaciones Zod
└── frontend/
    └── src/
        ├── pages/              # Páginas de la app
        ├── components/         # Componentes React
        ├── store/              # Estado global (Zustand)
        ├── services/           # Servicios API
        └── types/              # Tipos TypeScript
```

---

## 🛠️ Comandos Útiles

### Backend
```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar para producción
npm run start        # Ejecutar producción
npx prisma studio    # UI de base de datos
```

### Frontend
```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run preview      # Preview producción
```

### Prisma
```bash
npx prisma generate      # Generar cliente
npx prisma migrate dev   # Crear migraciones
npx prisma migrate deploy # Aplicar migraciones producción
npx prisma studio        # Visualizar base de datos
npx prisma seed          # Ejecutar seed
```

---

## 📝 Notas Importantes

1. **JWT_SECRET**: Genera una clave segura de al menos 32 caracteres
2. **Base de Datos**: Asegúrate de que PostgreSQL esté ejecutándose antes de ejecutar migraciones
3. **Orden de ejecución**: sigue los pasos 1-8 en orden
4. **Puertos**: Los puertos 3000 (backend) y 5173 (frontend) deben estar libres
5. **CORS**: El frontend está configurado para comunicarse con el backend en localhost:3000

---

## ✅ Verificación

Después de ejecutar todo, verifica que:
- [ ] El backend responde en `http://localhost:3000/api/health`
- [ ] El frontend carga en `http://localhost:5173`
- [ ] Puedes iniciar sesión con las credenciales del seed
- [ ] Puedes ver clientes, órdenes y equipos en el dashboard

---

## 📞 Solución de Problemas

### Error de conexión a base de datos
- Verifica que PostgreSQL esté ejecutándose
- Revisa las credenciales en DATABASE_URL
- Asegúrate de que la base de datos `salvacell_db` exista

### Error de puerto en uso
- Cambia el puerto en el archivo `.env`
- Detén el proceso que usa el puerto

### Error de migraciones
- Ejecuta `npx prisma migrate reset` para resetear
- Luego `npx prisma migrate dev --name init`

---

¡Listo! El sistema SalvaCell debería estar funcionando completamente. 🎉
