# Arquitectura de Base de Datos Relacional

## Visión General

El sistema SalvaCell implementa una arquitectura de base de datos relacional normalizada compatible con PostgreSQL, con 8 tablas principales que mantienen integridad referencial mediante foreign keys y actualizaciones en cascada.

## Diagrama Entidad-Relación

```
┌──────────────┐
│   CLIENTS    │◄─────┐
│──────────────│      │
│ id (PK)      │      │ 1:N
│ name         │      │
│ phone        │      │
│ alt_phone    │      │
│ alt_contact  │      │
│ email        │      │
│ created_at   │      │
│ updated_at   │      │
└──────────────┘      │
       ▲              │
       │ 1:N          │
       │              │
┌──────────────┐      │
│   DEVICES    │      │
│──────────────│      │
│ id (PK)      │      │
│ client_id(FK)│──────┘
│ brand        │
│ model        │
│ imei         │
│ created_at   │
│ updated_at   │
└──────────────┘
       ▲
       │ 1:1
       │
┌──────────────────────────┐
│        ORDERS            │
│──────────────────────────│
│ id (PK)                  │
│ folio (UNIQUE)           │
│ client_id (FK)           │────────┐
│ device_id (FK)           │────┐   │
│ status                   │    │   │
│ priority                 │    │   │
│ problem_description      │    │   │
│ technical_diagnosis      │    │   │
│ services                 │    │   │
│ estimated_cost           │    │   │
│ estimated_delivery       │    │   │
│ device_password          │    │   │
│ accessories              │    │   │
│ payment_status           │    │   │
│ total_amount             │    │   │
│ paid_amount              │    │   │
│ created_at               │    │   │
│ updated_at               │    │   │
│ created_by               │    │   │
└──────────────────────────┘    │   │
       │                        │   │
       │ 1:N                    │   │
       │                        │   │
       ├─────────────────┐      │   │
       │                 │      │   │
       ▼                 ▼      │   │
┌──────────────┐  ┌──────────────┐ │
│ORDER_HISTORY │  │ORDER_PHOTOS  │ │
│──────────────│  │──────────────│ │
│ id (PK)      │  │ id (PK)      │ │
│ order_id(FK) │  │ order_id(FK) │ │
│ status       │  │ history_id   │ │
│ notes        │  │ photo_data   │ │
│ changed_by   │  │ is_public    │ │
│ created_at   │  │ uploaded_by  │ │
└──────────────┘  │ created_at   │ │
                  └──────────────┘ │
       ▲                           │
       │ 1:N                       │
       │                           │
┌──────────────┐                   │
│   PAYMENTS   │                   │
│──────────────│                   │
│ id (PK)      │                   │
│ order_id(FK) │───────────────────┘
│ amount       │
│ method       │
│ notes        │
│ created_by   │
│ created_at   │
└──────────────┘

┌──────────────────────┐
│  INVENTORY_ITEMS     │
│──────────────────────│
│ id (PK)              │
│ sku (UNIQUE)         │
│ name                 │
│ category             │
│ description          │
│ purchase_price       │
│ sale_price           │
│ current_stock        │
│ min_stock            │
│ location             │
│ created_at           │
│ updated_at           │
└──────────────────────┘
       │
       │ 1:N
       ▼
┌──────────────────────┐
│ INVENTORY_MOVEMENTS  │
│──────────────────────│
│ id (PK)              │
│ item_id (FK)         │
│ order_id (FK, NULL)  │
│ type                 │
│ quantity             │
│ reason               │
│ created_by           │
│ created_at           │
└──────────────────────┘
```

## Tablas y Campos

### 1. CLIENTS (Tabla Padre)
Almacena información de contacto de los clientes.

| Campo | Tipo | Constraints | Descripción |
|-------|------|------------|-------------|
| id | string | PRIMARY KEY | Identificador único generado |
| name | string | NOT NULL | Nombre completo del cliente |
| phone | string | NOT NULL | Teléfono principal |
| alternatePhone | string | NULL | Teléfono alternativo |
| alternateContact | string | NULL | Contacto alterno (obligatorio si phone está inoperable) |
| email | string | NULL | Correo electrónico |
| createdAt | timestamp | NOT NULL | Fecha de creación |
| updatedAt | timestamp | NOT NULL | Última actualización |

**Relaciones:**
- 1:N con `devices` (un cliente puede tener múltiples dispositivos)
- 1:N con `orders` (un cliente puede tener múltiples órdenes)

**Índices:**
- PRIMARY KEY en `id`
- INDEX en `phone` para búsquedas rápidas
- INDEX en `name` para búsquedas parciales

---

### 2. DEVICES (Tabla Hija de CLIENTS)
Equipos registrados por cliente.

| Campo | Tipo | Constraints | Descripción |
|-------|------|------------|-------------|
| id | string | PRIMARY KEY | Identificador único |
| clientId | string | FOREIGN KEY → clients.id, NOT NULL | Referencia al propietario |
| brand | string | NOT NULL | Marca del dispositivo |
| model | string | NOT NULL | Modelo |
| imei | string | NOT NULL | IMEI o serial |
| createdAt | timestamp | NOT NULL | Fecha de registro |
| updatedAt | timestamp | NOT NULL | Última actualización |

**Relaciones:**
- N:1 con `clients` (muchos dispositivos pertenecen a un cliente)
- 1:1 con `orders` (un dispositivo por orden)

**Índices:**
- PRIMARY KEY en `id`
- FOREIGN KEY en `clientId`
- INDEX en `imei` para búsquedas
- INDEX compuesto en `clientId, brand, model`

---

### 3. ORDERS (Tabla Hija de CLIENTS y DEVICES)
Órdenes de reparación con toda la información del servicio.

| Campo | Tipo | Constraints | Descripción |
|-------|------|------------|-------------|
| id | string | PRIMARY KEY | Identificador único |
| folio | string | UNIQUE, NOT NULL | Número de orden legible |
| clientId | string | FOREIGN KEY → clients.id, NOT NULL | Cliente asociado |
| deviceId | string | FOREIGN KEY → devices.id, NOT NULL | Dispositivo a reparar |
| status | enum | NOT NULL | Estado actual (received, diagnosing, waiting-parts, repairing, repaired, delivered, cancelled) |
| priority | enum | NOT NULL | normal o urgent |
| problemDescription | string | NOT NULL | Problema reportado |
| technicalDiagnosis | string | NULL | Diagnóstico del técnico |
| services | string | NOT NULL | Servicios a realizar |
| estimatedCost | number | NOT NULL | Costo estimado |
| estimatedDelivery | string | NOT NULL | Fecha estimada de entrega |
| devicePassword | string | NULL | PIN/contraseña |
| accessories | string | NULL | Accesorios incluidos |
| paymentStatus | enum | NOT NULL | pending, partial, paid |
| totalAmount | number | NOT NULL | Monto total |
| paidAmount | number | NOT NULL, DEFAULT 0 | Monto pagado |
| createdAt | timestamp | NOT NULL | Fecha de creación |
| updatedAt | timestamp | NOT NULL | Última actualización |
| createdBy | string | NULL | Usuario que creó la orden |

**Relaciones:**
- N:1 con `clients`
- N:1 con `devices`
- 1:N con `order_history`
- 1:N con `order_photos`
- 1:N con `payments`

**Índices:**
- PRIMARY KEY en `id`
- UNIQUE en `folio`
- FOREIGN KEY en `clientId`
- FOREIGN KEY en `deviceId`
- INDEX en `status` para filtros
- INDEX en `createdAt` para ordenamiento temporal

---

### 4. ORDER_HISTORY (Tabla Hija de ORDERS)
Registro de todos los cambios de estado de una orden.

| Campo | Tipo | Constraints | Descripción |
|-------|------|------------|-------------|
| id | string | PRIMARY KEY | Identificador único |
| orderId | string | FOREIGN KEY → orders.id, NOT NULL | Orden asociada |
| status | enum | NOT NULL | Estado registrado |
| notes | string | NULL | Notas del cambio |
| changedBy | string | NULL | Usuario que hizo el cambio |
| createdAt | timestamp | NOT NULL | Momento del cambio |

**Relaciones:**
- N:1 con `orders` (múltiples entradas de historial por orden)
- 1:N con `order_photos` (opcional: fotos por entrada de historial)

**Índices:**
- PRIMARY KEY en `id`
- FOREIGN KEY en `orderId`
- INDEX compuesto en `orderId, createdAt`

---

### 5. ORDER_PHOTOS (Tabla Hija de ORDERS)
Fotografías de diagnóstico y evidencia.

| Campo | Tipo | Constraints | Descripción |
|-------|------|------------|-------------|
| id | string | PRIMARY KEY | Identificador único |
| orderId | string | FOREIGN KEY → orders.id, NOT NULL | Orden asociada |
| historyId | string | FOREIGN KEY → order_history.id, NULL | Entrada de historial opcional |
| photoData | string | NOT NULL | Datos de la imagen (base64) |
| isPublic | boolean | NOT NULL, DEFAULT false | Visible en página pública |
| uploadedBy | string | NULL | Usuario que subió la foto |
| createdAt | timestamp | NOT NULL | Fecha de subida |

**Relaciones:**
- N:1 con `orders`
- N:1 con `order_history` (opcional)

**Índices:**
- PRIMARY KEY en `id`
- FOREIGN KEY en `orderId`
- INDEX en `orderId, isPublic`

---

### 6. PAYMENTS (Tabla Hija de ORDERS)
Registro de pagos y anticipos.

| Campo | Tipo | Constraints | Descripción |
|-------|------|------------|-------------|
| id | string | PRIMARY KEY | Identificador único |
| orderId | string | FOREIGN KEY → orders.id, NOT NULL | Orden asociada |
| amount | number | NOT NULL | Monto del pago |
| method | enum | NOT NULL | cash, card, transfer |
| notes | string | NULL | Notas del pago |
| createdBy | string | NULL | Usuario que registró el pago |
| createdAt | timestamp | NOT NULL | Fecha del pago |

**Relaciones:**
- N:1 con `orders` (múltiples pagos por orden)

**Índices:**
- PRIMARY KEY en `id`
- FOREIGN KEY en `orderId`
- INDEX compuesto en `orderId, createdAt`

---

### 7. INVENTORY_ITEMS (Tabla Padre)
Catálogo de repuestos y productos.

| Campo | Tipo | Constraints | Descripción |
|-------|------|------------|-------------|
| id | string | PRIMARY KEY | Identificador único |
| sku | string | UNIQUE, NOT NULL | Código del producto |
| name | string | NOT NULL | Nombre del producto |
| category | string | NOT NULL | Categoría |
| description | string | NULL | Descripción detallada |
| purchasePrice | number | NOT NULL | Precio de compra |
| salePrice | number | NOT NULL | Precio de venta |
| currentStock | number | NOT NULL, DEFAULT 0 | Stock actual |
| minStock | number | NOT NULL | Stock mínimo |
| location | string | NULL | Ubicación en bodega |
| createdAt | timestamp | NOT NULL | Fecha de creación |
| updatedAt | timestamp | NOT NULL | Última actualización |

**Relaciones:**
- 1:N con `inventory_movements`

**Índices:**
- PRIMARY KEY en `id`
- UNIQUE en `sku`
- INDEX en `category`
- INDEX en `currentStock` para alertas

---

### 8. INVENTORY_MOVEMENTS (Tabla Hija de INVENTORY_ITEMS)
Movimientos de entrada, salida y ajustes de inventario.

| Campo | Tipo | Constraints | Descripción |
|-------|------|------------|-------------|
| id | string | PRIMARY KEY | Identificador único |
| itemId | string | FOREIGN KEY → inventory_items.id, NOT NULL | Producto afectado |
| orderId | string | FOREIGN KEY → orders.id, NULL | Orden asociada (si es salida por reparación) |
| type | enum | NOT NULL | entry, exit, adjustment |
| quantity | number | NOT NULL | Cantidad del movimiento |
| reason | string | NULL | Motivo del movimiento |
| createdBy | string | NULL | Usuario que realizó el movimiento |
| createdAt | timestamp | NOT NULL | Fecha del movimiento |

**Relaciones:**
- N:1 con `inventory_items`
- N:1 con `orders` (opcional, cuando es salida por reparación)

**Índices:**
- PRIMARY KEY en `id`
- FOREIGN KEY en `itemId`
- FOREIGN KEY en `orderId`
- INDEX compuesto en `itemId, createdAt`

---

## Integridad Referencial

### Reglas de Foreign Keys

1. **clients → devices, orders**
   - ON DELETE: RESTRICT (no se puede eliminar cliente con órdenes/dispositivos)
   - ON UPDATE: CASCADE (actualización de IDs se propaga)

2. **devices → orders**
   - ON DELETE: RESTRICT (no se puede eliminar dispositivo con órdenes)
   - ON UPDATE: CASCADE

3. **orders → order_history, order_photos, payments**
   - ON DELETE: CASCADE (al eliminar orden se eliminan sus registros relacionados)
   - ON UPDATE: CASCADE

4. **inventory_items → inventory_movements**
   - ON DELETE: RESTRICT (no se puede eliminar item con movimientos)
   - ON UPDATE: CASCADE

### Validaciones Automáticas

- **Antes de INSERT en devices**: Validar que `clientId` exista en `clients`
- **Antes de INSERT en orders**: Validar que `clientId` y `deviceId` existan
- **Antes de INSERT en order_history**: Validar que `orderId` exista
- **Antes de INSERT en payments**: Validar que `orderId` exista, actualizar `paidAmount` y `paymentStatus` en `orders`
- **Antes de INSERT en inventory_movements**: Validar que `itemId` exista, actualizar `currentStock` en `inventory_items`

---

## Queries Relacionales Comunes

### 1. Obtener orden completa con todas sus relaciones
```typescript
// Simula: SELECT * FROM orders 
// LEFT JOIN clients ON orders.client_id = clients.id
// LEFT JOIN devices ON orders.device_id = devices.id
// LEFT JOIN order_history ON orders.id = order_history.order_id
// LEFT JOIN payments ON orders.id = payments.order_id
const order = await db.getOrderWithRelations(orderId)
```

### 2. Obtener cliente con estadísticas
```typescript
// Simula: SELECT clients.*, COUNT(orders.id) as total_orders, SUM(orders.paid_amount) as total_spent
// FROM clients
// LEFT JOIN orders ON clients.id = orders.client_id
// GROUP BY clients.id
const clientStats = await db.getClientWithStats(clientId)
```

### 3. Buscar órdenes por múltiples criterios relacionales
```typescript
// Simula: SELECT DISTINCT orders.* FROM orders
// LEFT JOIN clients ON orders.client_id = clients.id
// LEFT JOIN devices ON orders.device_id = devices.id
// WHERE orders.folio LIKE '%query%' 
// OR clients.name LIKE '%query%'
// OR devices.brand LIKE '%query%'
const results = await db.searchOrders(query)
```

### 4. Estadísticas de inventario
```typescript
// Simula: SELECT SUM(current_stock * sale_price) as total_value,
// COUNT(*) as total_items,
// COUNT(CASE WHEN current_stock < min_stock THEN 1 END) as low_stock_count
// FROM inventory_items
const stats = await db.getInventoryStats()
```

---

## Migración desde Sistema Legacy

El sistema incluye un módulo de migración que convierte datos del formato anterior (basado en objetos anidados) al nuevo esquema relacional:

```typescript
import { migrateFromKVToRelationalDB } from '@/lib/database/migrations'

// Ejecutar migración una sola vez
await migrateFromKVToRelationalDB()
```

El proceso de migración:
1. Lee órdenes del formato legacy (`orders` key en KV)
2. Extrae y normaliza clientes únicos por teléfono
3. Crea registros de dispositivos asociados a clientes
4. Crea órdenes con foreign keys correctas
5. Migra historial de estados
6. Migra pagos existentes
7. Migra fotografías
8. Migra items de inventario

---

## API de Uso

```typescript
import { db } from '@/lib/database/db'

// Crear cliente
const client = await db.insertClient({
  name: "Juan Pérez",
  phone: "5551234567",
  email: "juan@example.com"
})

// Crear dispositivo del cliente
const device = await db.insertDevice({
  clientId: client.id,
  brand: "Samsung",
  model: "Galaxy S21",
  imei: "123456789012345"
})

// Crear orden
const order = await db.insertOrder({
  folio: "ORD-2024-001",
  clientId: client.id,
  deviceId: device.id,
  status: "received",
  priority: "normal",
  problemDescription: "Pantalla rota",
  services: "Reemplazo de pantalla",
  estimatedCost: 1500,
  estimatedDelivery: "2024-02-01",
  paymentStatus: "pending",
  totalAmount: 1500,
  paidAmount: 0
})

// Registrar pago (automáticamente actualiza paymentStatus)
await db.insertPayment({
  orderId: order.id,
  amount: 500,
  method: "cash",
  notes: "Anticipo"
})

// Cambiar estado (automáticamente crea entrada en historial)
await db.updateOrder(order.id, {
  status: "diagnosing",
  technicalDiagnosis: "Requiere LCD completo"
})

// Obtener orden completa con relaciones
const fullOrder = await db.getOrderWithRelations(order.id)
console.log(fullOrder.client.name) // "Juan Pérez"
console.log(fullOrder.device.brand) // "Samsung"
console.log(fullOrder.history.length) // 2 (created + updated)
console.log(fullOrder.payments.length) // 1
```

---

## Escalabilidad Futura

Esta arquitectura está diseñada para:
- ✅ Migración directa a PostgreSQL sin cambios en lógica de negocio
- ✅ Agregar triggers y stored procedures
- ✅ Implementar full-text search
- ✅ Agregar índices GiST/GIN para búsquedas avanzadas
- ✅ Particionamiento de tablas por fechas
- ✅ Replicación master-slave
- ✅ Auditoría completa con tablas de log
