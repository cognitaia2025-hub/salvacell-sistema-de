# Business Requirements Document (BRD)
## Sistema de Gestión de Reparaciones - SalvaCell

**Versión:** 1.0  
**Fecha:** 2024-12-31  
**Preparado para:** SalvaCell - Taller de Reparación de Celulares

---

## 1. Resumen Ejecutivo

### 1.1 Propósito del Documento
Este documento define los requisitos de negocio para el desarrollo de un sistema de gestión integral para SalvaCell, un taller de reparación de dispositivos móviles. El sistema permitirá automatizar y optimizar los procesos de recepción, seguimiento y entrega de reparaciones.

### 1.2 Alcance del Proyecto
El sistema abarcará:
- Gestión completa de órdenes de reparación
- Control de inventario de repuestos
- Administración de clientes
- Seguimiento de estado de reparaciones
- Generación de reportes y estadísticas
- Gestión de usuarios y permisos

---

## 2. Contexto del Negocio

### 2.1 Descripción del Negocio
SalvaCell es un taller especializado en reparación de dispositivos móviles que ofrece:
- Reparación de pantallas
- Cambio de baterías
- Reparaciones de software
- Reparación de componentes internos
- Servicio de diagnóstico

### 2.2 Problemas Actuales
1. Gestión manual de órdenes mediante hojas de papel
2. Dificultad para rastrear el estado de las reparaciones
3. Pérdida de información de clientes
4. Control inadecuado de inventario
5. Sin historial de clientes recurrentes ni seguimiento de múltiples reparaciones por cliente
6. Falta de reportes para toma de decisiones

### 2.3 Objetivos del Negocio
- Reducir tiempo de procesamiento de órdenes en 50%
- Mejorar satisfacción del cliente mediante mejor comunicación
- Optimizar control de inventario
- Aumentar capacidad de atención sin contratar más personal
- Generar insights para mejora continua del negocio

---

## 3. Requisitos Funcionales

### 3.1 Módulo de Órdenes de Reparación

#### 3.1.1 Creación de Órdenes
- **Información del Cliente:**
  - Nombre completo
  - Teléfono principal
  - Teléfono alternativo (opcional)
  - Contacto alterno (número adicional obligatorio cuando el teléfono del cliente esté inoperable)
  - Email (opcional)

- **Información del Dispositivo:**
  - Marca
  - Modelo
  - IMEI/Serial
  - Contraseña/PIN (si aplica)
  - Accesorios incluidos
  - Etiqueta/folio automático y código QR único para ticket impreso. La etiqueta impresa deberá incluir de forma legible: nombre del cliente, teléfono visible, y datos esenciales del equipo (marca/modelo/IMEI) para identificación manual sin escaneo.

- **Detalles de la Reparación:**
  - Descripción del problema reportado
  - Diagnóstico técnico
  - Servicios/reparaciones a realizar
  - Costo estimado
  - Fecha estimada de entrega
  - Prioridad (Normal, Urgente)
  - Registro opcional de fotografías de diagnóstico y evidencia (subidas por técnico) vinculadas a la orden
  - Flujo para registrar un "número verdadero del cliente" al momento de la entrega si inicialmente se utilizó un contacto alterno

#### 3.1.2 Seguimiento de Órdenes
- Estados del servicio:
  - Recibido
  - En diagnóstico
  - Esperando repuestos
  - En reparación
  - Reparado - Pendiente de entrega
  - Entregado
  - Cancelado

- Historial de cambios de estado con:
  - Usuario que realizó el cambio
  - Fecha y hora
  - Notas/comentarios
 - Posibilidad de adjuntar fotografías como evidencia técnica en cada entrada del historial
 - Generación automática de un folio y `QR` público que permite al cliente consultar el estado desde una página web ligera sin necesidad de iniciar sesión. La vista pública mostrará una barra de progreso, el reglamento configurado por el taller y la información mínima de la orden.
 - Proceso de escaneo inteligente: al escanear el `QR` desde dispositivos del personal, si la orden está marcada como finalizada el sistema redirige directamente a la interfaz de entrega para confirmar la devolución del equipo.

#### 3.1.3 Gestión de Clientes
- Base de datos centralizada de clientes (un cliente puede tener múltiples órdenes)
- **Historial completo de reparaciones por cliente:**
  - Todas las órdenes asociadas al mismo cliente
  - Visualización cronológica de servicios prestados
  - Equipos diferentes del mismo cliente (pueden traer varios dispositivos)
  - Totales acumulados: número de visitas, monto gastado total
- Teléfonos de contacto (principal y alterno)
- **Identificación de clientes recurrentes:**
  - Badge visual "Cliente VIP" (>5 órdenes)
  - Badge "Cliente Frecuente" (3-5 órdenes)
  - Primera visita claramente identificada
- **Relación cliente-equipos:** Un cliente puede tener múltiples equipos registrados
- **Relación cliente-órdenes:** Una orden siempre está vinculada a un cliente específico
- Búsqueda rápida por nombre, teléfono o equipo asociado
 - Soporte para registrar dos números telefónicos (cliente y contacto alterno) y actualizar el número principal al momento de entrega.

#### 3.1.4 Búsqueda y Filtros
- Búsqueda por:
  - Número de orden
  - Nombre del cliente
  - Teléfono
  - IMEI/Serial
  - Estado

- Filtros por:
  - Rango de fechas
  - Estado
  - Técnico asignado
  - Prioridad

### 3.2 Módulo de Inventario

#### 3.2.1 Gestión de Repuestos
- Catálogo de repuestos:
  - Código/SKU
  - Nombre/descripción
  - Categoría
  - Precio de compra
  - Precio de venta
  - Stock mínimo
  - Stock actual
  - Ubicación en bodega

#### 3.2.2 Control de Movimientos
- Registro de:
  - Entradas (compras)
  - Salidas (uso en reparaciones)
  - Ajustes de inventario
  - Devoluciones

- Para cada movimiento:
  - Fecha y hora
  - Usuario responsable
  - Cantidad
  - Motivo/referencia

#### 3.2.3 Alertas
- Notificación cuando stock alcanza nivel mínimo
- Reporte de productos sin movimiento
- Análisis de rotación de inventario
 - Notificaciones activas para piezas no disponibles: posibilidad de crear y visualizar solicitudes de compra a proveedor directamente desde la orden cuando falte una refacción (por ejemplo: pantalla no en stock -> crear solicitud al proveedor)
 - Panel de notificaciones siempre visible en la aplicación para pendientes de reabastecimiento y movimientos críticos del taller

### 3.3 Módulo de Facturación

#### 3.3.1 Generación de Comprobantes
- Emisión de:
  - Recibos de recepción
  - Cotizaciones
  - Facturas/Tickets de venta

- Información incluida:
  - Datos del taller
  - Datos del cliente
  - Detalle de servicios y repuestos
  - Subtotal, impuestos, total
  - Método de pago
  - Garantía aplicable

#### 3.3.2 Métodos de Pago
- Soporte para:
  - Efectivo
  - Tarjeta
  - Transferencia
  - Pagos parciales (anticipos)

#### 3.3.3 Control de Caja
- Registro de ingresos y egresos
- Arqueo de caja
- Cierre diario

### 3.4 Módulo de Reportes

#### 3.4.1 Reportes Operativos
- Órdenes por período
- Servicios más solicitados
- Tiempo promedio de reparación
- Órdenes pendientes por técnico

#### 3.4.2 Reportes Financieros
- Ventas por período
- Ingresos por tipo de servicio
- Margen de utilidad
- Cuentas por cobrar

#### 3.4.3 Reportes de Inventario
- Valor del inventario
- Productos más utilizados
- Necesidades de reabastecimiento

#### 3.4.4 Reportes de Clientes
- Clientes más frecuentes
- Clientes nuevos vs recurrentes
- Satisfacción del cliente

### 3.5 Módulo de Administración

#### 3.5.1 Gestión de Usuarios
- Roles definidos:
  - Administrador (acceso completo)
  - Técnico (gestión de órdenes y reparaciones)
  - Recepcionista (recepción y entrega)
  - Bodeguero (gestión de inventario)

- Control de acceso por rol
- Registro de actividad de usuarios

#### 3.5.2 Configuración del Sistema
- Datos del negocio
- Parámetros de operación
- Plantillas de documentos
- Configuración de notificaciones

### 3.6 Experiencia móvil, PWA, QR y notificaciones (nuevas ideas)

- Aplicación web progresiva (PWA) instalable: la interfaz cliente/taller podrá instalarse en móviles y tablets y ofrecer soporte offline básico con sincronización cuando vuelva la conectividad.
- Página pública ligera para seguimiento por `QR`: cualquier persona con el ticket podrá ver el estado en tiempo real, la barra de progreso y el reglamento configurado desde la aplicación, sin iniciar sesión.
- Envío automático de notificaciones y mensajes personalizados (por ejemplo, WhatsApp) al actualizar el estado de la orden; los mensajes pueden variar si el cliente es recurrente (VIP/frecuente).
- Etiquetas impresas: además del `QR`, las calcomanías impresas deben mostrar nombre del cliente, teléfono y datos del equipo de forma legible para identificación manual.
- Flujo de entrega por escaneo: escanear el `QR` en cualquier dispositivo del personal que realice la entrega redirige a la pantalla de confirmación de entrega si la orden está lista.
- Registro y management de dos números telefónicos: número alterno para notificaciones si el teléfono del cliente está inoperable y actualización del número principal al momento de la entrega para mantener contacto real del cliente.
- Panel visible de notificaciones en la UI para reabastecimiento, órdenes pendientes y solicitudes abiertas a proveedores.

Nota adicional — Interfaz web pública para consultas por `QR`:

- La página pública vinculada al `QR` será una interfaz web ligera, responsive y accesible sin autenticación. Mostrará:
  - Barra de progreso del estado de la orden (vista simplificada)
  - Reglamento configurable por el taller
  - Información mínima de la orden (folio, marca/modelo, fecha de recepción)
  - Fotografías reducidas de diagnóstico (si el taller las publica)
  - Historial resumido de cambios de estado
  - Opciones para contactar al taller o confirmar recepción del equipo (mediante un formulario simple o enlace de contacto)

Esta interfaz estará diseñada para carga rápida en móviles y para compartir en redes o por WhatsApp al cliente.


---

## 4. Requisitos No Funcionales

### 4.1 Usabilidad
- Interfaz intuitiva y fácil de usar
- Capacitación mínima requerida (< 2 horas)
- Soporte para dispositivos táctiles
- Responsive design (adaptable a tablets)

### 4.2 Rendimiento
- Tiempo de respuesta < 2 segundos para operaciones comunes
- Soporte para al menos 50 usuarios concurrentes
- Capacidad para almacenar historial de 5 años

### 4.3 Seguridad
- Autenticación de usuarios
- Encriptación de datos sensibles
- Respaldos automáticos diarios
- Registro de auditoría de acciones críticas

### 4.4 Disponibilidad
- Sistema disponible 99% del tiempo
- Modo offline básico para registro de órdenes
- Recuperación ante fallas < 1 hora

### 4.5 Compatibilidad
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Compatible con Windows 10+
- Acceso remoto seguro

---

## 5. Restricciones

### 5.1 Técnicas
- Desarrollo en tecnologías web modernas
- Base de datos relacional
 - Base de datos relacional

### 5.2 Presupuestarias
- Inversión inicial limitada
- Preferencia por soluciones de código abierto
- Modelo de pago por suscripción si es cloud

### 5.3 Temporales
- Implementación fase 1: 3 meses
- Capacitación y puesta en marcha: 2 semanas

---

## 6. Supuestos

1. SalvaCell cuenta con:
   - Computadora con acceso a internet
   - Impresora para tickets/facturas
   - Personal básico capacitado en uso de computadoras

2. El negocio opera de lunes a sábado
3. Promedio de 15-25 órdenes diarias
4. Equipo de 2-3 técnicos

---

## 7. Dependencias

- Proveedor de hosting (si es solución cloud)
- Soporte técnico para implementación
- Capacitación del personal
- Migración de datos existentes (si aplica)

---

## 8. Criterios de Aceptación

### 8.1 Funcionalidad
- ✓ Todas las funcionalidades descritas operan correctamente
- ✓ Flujo completo de orden (creación → seguimiento → entrega) funcional
- ✓ Reportes generan información correcta

### 8.2 Rendimiento
- ✓ Sistema responde en tiempos establecidos
- ✓ Soporta carga de usuarios definida

### 8.3 Capacitación
- ✓ Personal puede operar sistema con supervisión mínima
- ✓ Documentación de usuario disponible

### 8.4 Migración
- ✓ Datos históricos migrados correctamente (si aplica)
- ✓ Operación en paralelo exitosa durante período de transición

---

## 9. Plan de Implementación

### Fase 1: Módulos Core (Mes 1-2)
- Órdenes de reparación
- Gestión básica de clientes
- Estados y seguimiento

### Fase 2: Inventario y Facturación (Mes 3)
- Control de inventario
- Generación de comprobantes
- Integración con órdenes

### Fase 3: Reportes y Optimización (Mes 4)
- Módulo de reportes
- Ajustes basados en feedback
- Capacitación final

---

## 10. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Resistencia al cambio del personal | Media | Alto | Capacitación continua, involucrar al equipo desde el inicio |
| Pérdida de datos durante migración | Baja | Alto | Respaldos múltiples, pruebas exhaustivas |
| Fallas de internet/sistema | Media | Medio | Modo offline, respaldos automáticos |
| Costo mayor al presupuestado | Media | Medio | Desarrollo por fases, priorizar funcionalidades core |

---

## 11. Aprobaciones

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Dueño/Gerente SalvaCell | | | |
| Líder de Proyecto | | | |
| Representante Técnico | | | |

---

## 12. Anexos

### 12.1 Glosario
- **Orden:** Registro de servicio de reparación
- **IMEI:** Identificador único de dispositivo móvil
- **SKU:** Código de identificación de producto
- **Arqueo:** Conteo físico de efectivo en caja

### 12.2 Referencias
- Flujos de proceso actuales de SalvaCell
- Benchmarking de sistemas similares
- Normativa fiscal aplicable

---

**Fin del Documento**

---

## 13. Requisitos Técnicos y Arquitectura Propuesta

### 13.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React PWA)                     │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐  │
│  │  Dashboard │  │   Módulos  │  │  Vista Pública QR   │  │
│  │   Admin    │  │  Operación │  │  (sin autenticación)│  │
│  └────────────┘  └────────────┘  └─────────────────────┘  │
│         │               │                    │              │
│         └───────────────┴────────────────────┘              │
│                         │                                    │
│                    API REST/WS                               │
└─────────────────────────┼────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│              BACKEND (Python + FastAPI)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Auth & RBAC  │  │  API REST    │  │  WebSockets      │  │
│  │   (JWT)      │  │  Endpoints   │  │  (tiempo real)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Business     │  │  Celery      │  │  Integrations    │  │
│  │ Logic        │  │  Tasks       │  │  (WhatsApp/SMS)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│         │               │                    │              │
│         └───────────────┴────────────────────┘              │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                   CAPA DE DATOS                              │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   PostgreSQL     │  │    Redis     │  │   S3/Local   │  │
│  │  (datos principal│  │  (cache/cola)│  │   (archivos) │  │
│  └──────────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 13.2 Stack Tecnológico Detallado

#### **Frontend (Interfaz de Usuario)**
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Componentes UI:** shadcn/ui v4 + Radix UI
- **State Management:** React Query (TanStack Query) para sincronización con backend
- **Forms:** React Hook Form + Zod para validación
- **PWA:**
  - Service Worker para caché offline
  - IndexedDB para almacenamiento local temporal
  - Web Push API para notificaciones
  - Instalable en móviles y tablets
- **Routing:** React Router v6
  - `/admin` - Dashboard administrativo
  - `/orders` - Gestión de órdenes
  - `/clients` - Base de datos de clientes
  - `/inventory` - Control de inventario
  - `/public/:qr` - Vista pública sin auth
- **Roles soportados:**
  - Administrador (acceso completo)
  - Técnico (órdenes + inventario)
  - Recepcionista (órdenes + clientes)
  - Bodeguero (inventario)
  - Público (solo lectura por QR)

#### **Backend (API y Lógica de Negocio)**
- **Lenguaje:** Python 3.11+
- **Framework Web:** FastAPI 0.110+
  - OpenAPI/Swagger automático
  - Validación con Pydantic v2
  - Async/await nativo
  - Dependencias inyectables
- **API Patterns:**
  - REST endpoints para CRUD
  - WebSockets para actualizaciones en tiempo real
  - Server-Sent Events (SSE) para notificaciones
- **Autenticación & Autorización:**
  - JWT (JSON Web Tokens) con refresh tokens
  - PassLib + bcrypt para hashing de contraseñas
  - Middleware de roles (RBAC)
  - Sessions con Redis para tokens blacklist
- **Tareas Asíncronas:**
  - Celery + Redis como message broker
  - Tareas programadas (Celery Beat):
    - Backups automáticos diarios
    - Recordatorios de entregas
    - Alertas de inventario bajo
  - Tareas en cola:
    - Envío de notificaciones WhatsApp/SMS
    - Generación de PDFs
    - Procesamiento de imágenes
    - Sincronización de datos offline

#### **Persistencia y Almacenamiento**
- **Base de Datos Principal:** PostgreSQL 15+
  - Extensiones: uuid-ossp, pg_trgm (búsqueda full-text)
  - Índices optimizados para búsquedas frecuentes
  - Particionamiento por fecha para historial
  - Connection pooling con PgBouncer
- **ORM:** SQLAlchemy 2.0+ (async)
  - Modelos declarativos
  - Relationships con lazy loading
  - Migrations con Alembic
- **Caché & Cola:** Redis 7+
  - Caché de sesiones
  - Broker para Celery
  - Rate limiting
  - Real-time pub/sub
- **Almacenamiento de Archivos:**
  - Fotos de órdenes
  - PDFs generados
  - Backups
  - Opciones:
    - Local filesystem (para desarrollo/instalaciones locales)
    - MinIO (S3-compatible, self-hosted)
    - AWS S3 / DigitalOcean Spaces (cloud)

#### **Esquema de Base de Datos**
```sql
-- 8 tablas principales con integridad referencial

clients (id, name, phone, alternate_phone, email, created_at, updated_at)
  ↓ 1:N
devices (id, client_id FK, brand, model, imei, password, created_at)
  ↓ N:1
orders (id, client_id FK, device_id FK, folio, qr_code, status, 
        priority, problem, diagnosis, cost, delivery_date, 
        technician_id FK, created_at, updated_at)
  ↓ 1:N
  ├── order_history (id, order_id FK, status, notes, user_id FK, created_at)
  ├── order_photos (id, order_id FK, url, description, uploaded_by FK, created_at)
  └── payments (id, order_id FK, amount, method, status, created_at)

inventory_items (id, sku, name, category, purchase_price, sale_price, 
                 stock, min_stock, location, created_at)
  ↓ 1:N
inventory_movements (id, item_id FK, type, quantity, reason, 
                     user_id FK, order_id FK, created_at)

users (id, username, email, password_hash, role, created_at)
```

#### **Integraciones y Servicios Externos**
1. **Mensajería:**
   - **WhatsApp Business API** (Meta/Twilio)
     - Mensajes personalizados por estado de orden
     - Diferentes plantillas para clientes VIP/frecuentes
     - Confirmaciones de entrega
   - **SMS Gateway** (Twilio/Nexmo) como fallback
   
2. **Generación de Documentos:**
   - **PDFs:** ReportLab o WeasyPrint
     - Tickets de recepción
     - Comprobantes de pago
     - Facturas
   - **QR Codes:** python-qrcode
     - QR único por orden con URL pública

3. **Email:**
   - SMTP para notificaciones (Gmail/SendGrid)
   - Confirmaciones por email
   - Reportes programados

4. **Backups:**
   - pg_dump automatizado con Celery Beat
   - Rotación de backups (7 días, 4 semanas, 12 meses)
   - Exportación a S3/local encrypted storage

#### **Seguridad**
- **En tránsito:**
  - HTTPS/TLS 1.3 obligatorio en producción
  - WSS para WebSockets seguros
  - CORS configurado restrictivamente
  
- **En reposo:**
  - Contraseñas hasheadas con bcrypt (cost factor 12)
  - Datos sensibles cifrados (PINs de dispositivos, números de tarjeta)
  - Archivos en S3 con server-side encryption

- **Control de acceso:**
  - JWT con expiración corta (15 min access, 7 días refresh)
  - RBAC granular por endpoint
  - Rate limiting por IP (100 req/min)
  - Registro de auditoría en tabla `audit_log`

- **Protecciones:**
  - SQL injection: parametrización con SQLAlchemy
  - XSS: sanitización en frontend + CSP headers
  - CSRF: tokens en formularios críticos
  - File upload: validación de tipos, tamaño máximo, virus scan

### 13.3 Despliegue y DevOps

#### **Entornos**
- **Development:** Vite dev server + Uvicorn reload
- **Staging:** Docker Compose (frontend + backend + DB)
- **Production:** 
  - Frontend: Vercel/Netlify o servidor estático con Nginx
  - Backend: Railway/DigitalOcean/AWS con Docker
  - DB: PostgreSQL managed (Neon/Supabase/RDS)

#### **Containerización**
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### **CI/CD**
- GitHub Actions:
  - Tests automáticos en PR
  - Build y deploy en merge a main
  - Migraciones automáticas de DB
  - Rollback con un click

### 13.4 Monitoreo y Observabilidad

- **Logs:** Structured logging (JSON) con Python logging
- **Métricas:** Prometheus + Grafana
  - Latencia de endpoints
  - Tasa de errores
  - Uso de memoria/CPU
  - Tamaño de colas Celery
- **Alertas:** 
  - Downtime > 5 min
  - Error rate > 5%
  - Disk space < 10%
  - Celery workers caídos
- **APM:** Sentry para error tracking

### 13.5 Plan de Migración (Spark KV → PostgreSQL)

#### **Fase 1: Preparación**
1. Crear backend FastAPI con estructura base
2. Definir modelos SQLAlchemy según esquema actual
3. Configurar PostgreSQL y migraciones Alembic
4. Implementar endpoints API (1:1 con métodos actuales de `db.ts`)

#### **Fase 2: Migración de Datos**
```python
# Script de migración
async def migrate_from_spark_kv():
    # Leer datos de Spark KV (export a JSON)
    spark_data = await window.spark.kv.get('relational_db')
    
    # Insertar en PostgreSQL
    async with db_session() as session:
        for client in spark_data['clients']:
            session.add(Client(**client))
        await session.commit()
```

#### **Fase 3: Adaptación del Frontend**
```typescript
// Antes (src/lib/database/db.ts)
async getAllOrders(): Promise<DBOrder[]> {
    const db = await this.getDB()
    return db.orders
}

// Después (src/lib/api/orders.ts)
export async function getAllOrders(): Promise<DBOrder[]> {
    const response = await fetch('/api/orders')
    return response.json()
}
```

#### **Fase 4: Testing & Rollout**
- Testing paralelo (frontend usa backend mientras existe Spark KV)
- Validación de datos migrados
- Rollout gradual por módulo
- Monitoreo intensivo primera semana

### 13.6 Criterios Técnicos de Aceptación

✅ **Rendimiento:**
- API responde < 200ms para operaciones de lectura
- API responde < 500ms para operaciones de escritura
- PWA carga inicial < 3s en 3G
- Búsquedas responden < 1s con 10,000+ registros

✅ **Escalabilidad:**
- Soporta 100 usuarios concurrentes
- Base de datos maneja 1M+ órdenes históricas
- Workers Celery procesan 1000+ tareas/hora

✅ **Disponibilidad:**
- Uptime 99.5% mensual
- Modo offline frontend permite crear órdenes sin conexión
- Sincronización automática al reconectar < 5s

✅ **Seguridad:**
- Todas las comunicaciones cifradas (TLS)
- Auditoría completa de acciones críticas
- Tests de penetración pasados
- OWASP Top 10 mitigado

✅ **Funcionalidad:**
- Todos los módulos del BRD implementados
- Integración WhatsApp funcional con 95%+ tasa de entrega
- QR público accesible y responsive
- Reportes generan en < 10s

---

## 14. Estimación de Costos de Implementación

### 14.1 Desarrollo (3-4 meses)
- **Backend Python + FastAPI:** 6-8 semanas
- **Migración Frontend a API:** 2-3 semanas
- **Integraciones (WhatsApp, PDFs):** 2 semanas
- **Testing & QA:** 2 semanas
- **Documentación:** 1 semana

### 14.2 Infraestructura Mensual (estimado)
- **Hosting Backend:** $15-50/mes (Railway/DigitalOcean)
- **PostgreSQL:** $10-25/mes (Neon/Supabase free tier o básico)
- **Redis:** $0-10/mes (incluido o Railway addon)
- **S3 Storage:** $5-15/mes (primeros 50GB)
- **WhatsApp API:** Variable según volumen mensajes
- **Total:** ~$50-100/mes inicialmente

### 14.3 Mantenimiento
- **Actualizaciones de seguridad:** 4 horas/mes
- **Soporte técnico:** 8 horas/mes
- **Backups y monitoreo:** Automatizado

---

**Documento completado y actualizado:** Enero 12, 2026

---
