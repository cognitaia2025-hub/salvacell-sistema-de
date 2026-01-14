# 🚀 SalvaCell - Sistema de Gestión para Taller de Reparación de Celulares

## 📋 Descripción

SalvaCell es un sistema integral de gestión diseñado específicamente para talleres de reparación de celulares. Administra clientes, órdenes de trabajo, inventario, ventas y más.

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v18 o superior
- **PostgreSQL** v14 o superior
- **npm** o **yarn**

## 📦 Instalación y Configuración

### 1. Clonar e Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurar Base de Datos PostgreSQL

```sql
-- Crear la base de datos (ejecutar en pgAdmin o psql)
CREATE DATABASE salvacell_db;
```

### 3. Configurar Variables de Entorno

```bash
# En la carpeta backend/
cp .env.local .env

# Edita el archivo .env con tus datos:
# - DATABASE_URL: Tu conexión a PostgreSQL
# - JWT_SECRET: Una clave segura (mínimo 32 caracteres)
```

### 4. Ejecutar Migraciones de Prisma

```bash
cd backend

# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones (crea las tablas)
npx prisma migrate dev --name init

# (Opcional) Ver la base de datos con Prisma Studio
npx prisma studio
```

### 5. Iniciar el Servidor

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🔐 Credenciales de Acceso (Después del Seed)

El sistema incluye un script para crear datos iniciales:

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@salvacell.com | admin123 |
| Técnico | tecnico@salvacell.com | tecnico123 |
| Recepcionista | recepcion@salvacell.com | recepcion123 |

## 📁 Estructura del Proyecto

```
salvacell/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Definición de la base de datos
│   │   └── migrations/      # Historial de migraciones
│   ├── src/
│   │   ├── config/          # Configuraciones
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── middlewares/     # Middlewares de Express
│   │   ├── routes/          # Rutas de la API
│   │   ├── utils/           # Utilidades
│   │   └── validations/     # Validaciones con Zod
│   └── .env                 # Variables de entorno
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── store/           # Estado global (Zustand)
│   │   ├── services/        # Servicios API
│   │   └── types/           # Tipos TypeScript
│   └── .env                 # Variables de entorno
│
└── README.md
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes/:id` - Obtener cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Órdenes
- `GET /api/ordenes` - Listar órdenes
- `POST /api/ordenes` - Crear orden
- `GET /api/ordenes/:id` - Obtener orden
- `PUT /api/ordenes/:id` - Actualizar orden
- `PATCH /api/ordenes/:id/estado` - Cambiar estado

### Equipos
- `GET /api/equipos` - Listar equipos
- `POST /api/equipos` - Registrar equipo
- `GET /api/equipos/:id` - Obtener equipo

### Inventario
- `GET /api/refacciones` - Listar refacciones
- `POST /api/refacciones` - Crear refacción
- `GET /api/accesorios` - Listar accesorios

### Ventas
- `GET /api/ventas` - Listar ventas
- `POST /api/ventas` - Crear venta

### Reportes
- `GET /api/reportes/ordenes` - Reporte de órdenes
- `GET /api/reportes/ventas` - Reporte de ventas
- `GET /api/reportes/inventario` - Reporte de inventario

## 🔧 Comandos Útiles

```bash
# Backend
cd backend
npm run dev          # Desarrollo
npm run build        # Producción
npm run start        # Iniciar producción
npm run lint         # Verificar código

# Frontend  
cd frontend
npm run dev          # Desarrollo
npm run build        # Producción
npm run preview      # Vista previa de producción

# Prisma
npx prisma generate  # Generar cliente
npx prisma migrate dev --name init  # Migraciones
npx prisma studio    # UI de base de datos
npx prisma migrate deploy  # Deploy migraciones
```

## 🚀 Deployment

### Backend
1. Configurar `NODE_ENV=production`
2. Generar build: `npm run build`
3. Ejecutar migraciones: `npx prisma migrate deploy`
4. Iniciar: `npm start`

### Frontend
1. Generar build: `npm run build`
2. Servir carpeta `dist/`

## 📝 Notas

- El sistema usa JWT para autenticación
- Los tokens expiran según `JWT_EXPIRES_IN`
- Los roles disponibles: ADMIN, TECNICO, RECEPCIONISTA
- La API sigue el estándar REST
- Todas las respuestas incluyen manejo de errores

## 📄 Licencia

Este proyecto es de uso libre para fines educativos y comerciales.
