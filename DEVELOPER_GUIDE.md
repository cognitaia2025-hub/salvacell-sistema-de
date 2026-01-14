# Guía de Uso: Base de Datos Relacional

Esta guía explica cómo usar la arquitectura de base de datos relacional en SalvaCell para cumplir con los requisitos de PostgreSQL con tablas padre-hijo.

## 📋 Tabla de Contenidos

1. [Conceptos Básicos](#conceptos-básicos)
2. [API de la Base de Datos](#api-de-la-base-de-datos)
3. [Hooks de React](#hooks-de-react)
4. [Ejemplos Prácticos](#ejemplos-prácticos)
5. [Migraciones](#migraciones)
6. [Integridad Referencial](#integridad-referencial)

## Conceptos Básicos

### Arquitectura

El sistema usa una clase `RelationalDB` que simula una base de datos relacional con:

- **8 tablas normalizadas**: clients, devices, orders, order_history, order_photos, payments, inventory_items, inventory_movements
- **Foreign keys validadas**: No puedes crear registros con IDs padre inexistentes
- **Actualizaciones en cascada**: Los cambios se propagan automáticamente
- **Integridad referencial**: Previene eliminaciones que rompan relaciones

### Importar la Base de Datos

```typescript
import { db } from '@/lib/database/db'
```

## API de la Base de Datos

### Clientes (Tabla Padre)

#### Crear Cliente
```typescript
const client = await db.insertClient({
  name: "Juan Pérez",
  phone: "5551234567",
  alternatePhone: "5559876543",
  alternateContact: "5551111111",
  email: "juan@example.com"
})
// Retorna: { id, name, phone, ..., createdAt, updatedAt }
```

#### Actualizar Cliente
```typescript
const updated = await db.updateClient(clientId, {
  phone: "5559999999",
  email: "newemail@example.com"
})
```

#### Buscar Clientes
```typescript
// Por nombre, teléfono o email
const results = await db.searchClients("Juan")

// Todos los clientes
const all = await db.getAllClients()

// Por ID
const client = await db.getClientById(clientId)

// Con estadísticas (JOIN con orders)
const stats = await db.getClientWithStats(clientId)
console.log(stats.totalOrders) // 5
console.log(stats.totalSpent) // 15000
console.log(stats.tier) // "vip"
console.log(stats.orders) // Array de órdenes
console.log(stats.devices) // Array de dispositivos
```

### Dispositivos (Tabla Hija de Clients)

#### Crear Dispositivo
```typescript
// REQUIERE clientId válido
const device = await db.insertDevice({
  clientId: client.id, // FOREIGN KEY
  brand: "Samsung",
  model: "Galaxy S21",
  imei: "123456789012345"
})

// Si clientId no existe, lanza error:
// "Foreign key constraint failed: clientId does not exist"
```

#### Obtener Dispositivos
```typescript
// Por ID
const device = await db.getDeviceById(deviceId)

// Todos los dispositivos de un cliente
const clientDevices = await db.getDevicesByClientId(clientId)
```

### Órdenes (Tabla Hija de Clients y Devices)

#### Crear Orden
```typescript
// REQUIERE clientId Y deviceId válidos
const order = await db.insertOrder({
  folio: "ORD-2024-001",
  clientId: client.id, // FOREIGN KEY
  deviceId: device.id, // FOREIGN KEY
  status: "received",
  priority: "normal",
  problemDescription: "Pantalla rota",
  technicalDiagnosis: "Requiere LCD nuevo",
  services: "Reemplazo de pantalla",
  estimatedCost: 1500,
  estimatedDelivery: "2024-02-15",
  devicePassword: "1234",
  accessories: "Cargador, funda",
  paymentStatus: "pending",
  totalAmount: 1500,
  paidAmount: 0,
  createdBy: "admin"
})

// Automáticamente crea primera entrada en order_history
```

#### Actualizar Orden
```typescript
// Actualizar estado (crea entrada en historial automáticamente)
await db.updateOrder(orderId, {
  status: "diagnosing",
  technicalDiagnosis: "LCD dañado, touch funcional"
})

// Actualizar múltiples campos
await db.updateOrder(orderId, {
  estimatedCost: 1800,
  estimatedDelivery: "2024-02-20",
  priority: "urgent"
})
```

#### Buscar Órdenes
```typescript
// Búsqueda relacional (busca en orders, clients, devices)
const results = await db.searchOrders("Samsung")
// Encuentra órdenes por:
// - Folio
// - Marca/modelo de dispositivo
// - IMEI
// - Nombre de cliente
// - Teléfono de cliente

// Por folio
const order = await db.getOrderByFolio("ORD-2024-001")

// Por ID
const order = await db.getOrderById(orderId)

// Todas las órdenes
const all = await db.getAllOrders()

// Órdenes de un cliente
const clientOrders = await db.getOrdersByClientId(clientId)
```

#### Obtener Orden con Relaciones (JOIN)
```typescript
// Equivalente a múltiples JOINs en SQL
const fullOrder = await db.getOrderWithRelations(orderId)

console.log(fullOrder.client) // Objeto Client completo
console.log(fullOrder.device) // Objeto Device completo
console.log(fullOrder.history) // Array de OrderHistory
console.log(fullOrder.photos) // Array de OrderPhoto
console.log(fullOrder.payments) // Array de Payment

// Por folio
const fullOrder = await db.getOrderWithRelationsByFolio("ORD-2024-001")
```

### Historial de Órdenes (Tabla Hija de Orders)

#### Agregar Entrada Manual
```typescript
// Normalmente se crea automáticamente al cambiar estado
// Pero puedes agregar entradas manualmente:
await db.insertOrderHistory({
  orderId: order.id, // FOREIGN KEY
  status: "repairing",
  notes: "Iniciando reparación de pantalla",
  changedBy: "technico_01"
})
```

#### Obtener Historial
```typescript
const history = await db.getOrderHistory(orderId)
// Array ordenado cronológicamente
// [{id, orderId, status, notes, changedBy, createdAt}, ...]
```

### Fotografías de Órdenes (Tabla Hija de Orders)

#### Subir Foto
```typescript
await db.insertOrderPhoto({
  orderId: order.id, // FOREIGN KEY
  historyId: historyEntry.id, // FOREIGN KEY (opcional)
  photoData: base64String,
  isPublic: true, // Visible en página pública
  uploadedBy: "technico_01"
})
```

#### Obtener Fotos
```typescript
const photos = await db.getOrderPhotos(orderId)
```

### Pagos (Tabla Hija de Orders)

#### Registrar Pago
```typescript
// Automáticamente actualiza paidAmount y paymentStatus en order
await db.insertPayment({
  orderId: order.id, // FOREIGN KEY
  amount: 500,
  method: "cash", // "cash" | "card" | "transfer"
  notes: "Anticipo del 50%",
  createdBy: "cajero_01"
})

// Después del pago, la orden se actualiza:
// - paidAmount: 0 → 500
// - paymentStatus: "pending" → "partial"

// Segundo pago
await db.insertPayment({
  orderId: order.id,
  amount: 1000,
  method: "card"
})
// - paidAmount: 500 → 1500
// - paymentStatus: "partial" → "paid"
```

#### Obtener Pagos
```typescript
const payments = await db.getPaymentsByOrderId(orderId)

// Total pagado
const total = await db.getTotalPaidForOrder(orderId)
```

### Inventario (Tabla Padre)

#### Crear Producto
```typescript
const item = await db.insertInventoryItem({
  sku: "LCD-SAM-S21",
  name: "Pantalla LCD Samsung S21",
  category: "Pantallas",
  description: "AMOLED original",
  purchasePrice: 800,
  salePrice: 1500,
  currentStock: 10,
  minStock: 2,
  location: "Estante A3"
})
```

#### Actualizar Producto
```typescript
await db.updateInventoryItem(itemId, {
  salePrice: 1600,
  minStock: 3
})
```

#### Eliminar Producto
```typescript
const deleted = await db.deleteInventoryItem(itemId)
```

#### Obtener Productos
```typescript
const item = await db.getInventoryItemById(itemId)
const all = await db.getAllInventoryItems()
```

#### Estadísticas de Inventario
```typescript
const stats = await db.getInventoryStats()
console.log(stats.totalItems) // 50
console.log(stats.totalValue) // 125000
console.log(stats.lowStockCount) // 5
console.log(stats.outOfStockCount) // 2
console.log(stats.lowStockItems) // Array
console.log(stats.outOfStockItems) // Array
```

### Movimientos de Inventario (Tabla Hija de Inventory Items)

#### Registrar Movimiento
```typescript
// Entrada (suma al stock)
await db.insertInventoryMovement({
  itemId: item.id, // FOREIGN KEY
  orderId: null, // Opcional: orden relacionada
  type: "entry",
  quantity: 5,
  reason: "Compra a proveedor XYZ",
  createdBy: "bodeguero"
})
// currentStock: 10 → 15

// Salida (resta del stock)
await db.insertInventoryMovement({
  itemId: item.id,
  orderId: order.id, // Vinculado a orden específica
  type: "exit",
  quantity: 1,
  reason: "Usado en reparación ORD-2024-001",
  createdBy: "technico_01"
})
// currentStock: 15 → 14

// Ajuste (establece valor exacto)
await db.insertInventoryMovement({
  itemId: item.id,
  type: "adjustment",
  quantity: 12,
  reason: "Inventario físico mensual",
  createdBy: "admin"
})
// currentStock: 14 → 12
```

#### Obtener Movimientos
```typescript
const movements = await db.getInventoryMovements(itemId)
// Array ordenado por fecha descendente (más reciente primero)
```

## Hooks de React

Para usar en componentes React, importa los hooks:

```typescript
import { 
  useOrders, 
  useClients, 
  useInventory,
  usePayments,
  useOrderHistory 
} from '@/hooks/use-relational-db'
```

### useOrders

```typescript
function MyComponent() {
  const { 
    orders,          // Array de órdenes
    loading,         // boolean
    createOrder,     // función async
    updateOrder,     // función async
    searchOrders,    // función async
    getOrderWithRelations, // función async
    getOrderByFolio, // función async
    refresh          // función para recargar
  } = useOrders()

  // Crear
  const handleCreate = async () => {
    const newOrder = await createOrder({
      folio: "ORD-001",
      clientId: "...",
      deviceId: "...",
      // ...resto de campos
    })
    // orders se actualiza automáticamente
  }

  // Actualizar
  const handleUpdate = async (id: string) => {
    await updateOrder(id, { status: "diagnosing" })
    // orders se actualiza automáticamente
  }

  return <div>...</div>
}
```

### useClients

```typescript
const { 
  clients,
  loading,
  createClient,
  updateClient,
  searchClients,
  getClientWithStats,
  refresh
} = useClients()
```

### useInventory

```typescript
const { 
  items,
  loading,
  createItem,
  updateItem,
  deleteItem,
  addMovement,
  getStats,
  refresh
} = useInventory()
```

### usePayments

```typescript
// Requiere orderId
const { 
  payments,
  loading,
  addPayment,
  refresh
} = usePayments(orderId)

const handlePayment = async () => {
  await addPayment({
    orderId,
    amount: 500,
    method: "cash"
  })
}
```

### useOrderHistory

```typescript
const { 
  history,
  loading,
  addHistoryEntry,
  refresh
} = useOrderHistory(orderId)
```

## Ejemplos Prácticos

### Crear Orden Completa

```typescript
import { db } from '@/lib/database/db'

async function createCompleteOrder() {
  // 1. Buscar o crear cliente
  let client = (await db.searchClients("5551234567"))[0]
  
  if (!client) {
    client = await db.insertClient({
      name: "Juan Pérez",
      phone: "5551234567",
      email: "juan@example.com"
    })
  }

  // 2. Crear dispositivo
  const device = await db.insertDevice({
    clientId: client.id,
    brand: "Samsung",
    model: "Galaxy S21",
    imei: "123456789012345"
  })

  // 3. Crear orden
  const order = await db.insertOrder({
    folio: `ORD-${Date.now()}`,
    clientId: client.id,
    deviceId: device.id,
    status: "received",
    priority: "normal",
    problemDescription: "Pantalla rota",
    services: "Reemplazo de LCD",
    estimatedCost: 1500,
    estimatedDelivery: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
    paymentStatus: "pending",
    totalAmount: 1500,
    paidAmount: 0
  })

  // 4. Registrar anticipo
  await db.insertPayment({
    orderId: order.id,
    amount: 500,
    method: "cash",
    notes: "Anticipo 33%"
  })

  // 5. Subir foto de diagnóstico
  await db.insertOrderPhoto({
    orderId: order.id,
    photoData: "data:image/jpeg;base64,...",
    isPublic: true
  })

  return order
}
```

### Actualizar Estado y Registrar Movimiento de Inventario

```typescript
async function repairPhone(orderId: string, lcdItemId: string) {
  // 1. Actualizar estado a "en reparación"
  await db.updateOrder(orderId, {
    status: "repairing",
    technicalDiagnosis: "LCD reemplazado exitosamente"
  })

  // 2. Registrar salida de inventario vinculada a la orden
  await db.insertInventoryMovement({
    itemId: lcdItemId,
    orderId: orderId, // Vinculado!
    type: "exit",
    quantity: 1,
    reason: `Usado en orden ${orderId}`,
    createdBy: "technico_01"
  })

  // 3. Marcar como reparado
  await db.updateOrder(orderId, {
    status: "repaired"
  })

  // 4. Subir foto del resultado
  await db.insertOrderPhoto({
    orderId: orderId,
    photoData: "data:image/jpeg;base64,...",
    isPublic: true,
    uploadedBy: "technico_01"
  })
}
```

### Entregar Orden y Completar Pago

```typescript
async function deliverOrder(orderId: string) {
  // 1. Obtener orden con relaciones
  const fullOrder = await db.getOrderWithRelations(orderId)
  
  if (!fullOrder) throw new Error("Orden no encontrada")

  // 2. Calcular saldo pendiente
  const balance = fullOrder.totalAmount - fullOrder.paidAmount

  if (balance > 0) {
    // 3. Registrar pago final
    await db.insertPayment({
      orderId: orderId,
      amount: balance,
      method: "card",
      notes: "Pago final al entregar"
    })
  }

  // 4. Actualizar estado a entregado
  await db.updateOrder(orderId, {
    status: "delivered"
  })

  // 5. Actualizar teléfono del cliente si cambió
  if (fullOrder.client.alternateContact) {
    const shouldUpdatePhone = confirm("¿Actualizar teléfono principal del cliente?")
    
    if (shouldUpdatePhone) {
      await db.updateClient(fullOrder.client.id, {
        phone: fullOrder.client.alternateContact,
        alternateContact: undefined
      })
    }
  }

  return fullOrder
}
```

### Reporte de Cliente

```typescript
async function generateClientReport(clientId: string) {
  const clientStats = await db.getClientWithStats(clientId)
  
  if (!clientStats) throw new Error("Cliente no encontrado")

  const report = {
    cliente: clientStats.name,
    tier: clientStats.tier, // "new" | "frequent" | "vip"
    totalOrdenes: clientStats.totalOrders,
    totalGastado: clientStats.totalSpent,
    promedioGasto: clientStats.totalSpent / clientStats.totalOrders,
    dispositivos: clientStats.devices.map(d => ({
      marca: d.brand,
      modelo: d.model,
      imei: d.imei
    })),
    ultimasOrdenes: clientStats.orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(o => ({
        folio: o.folio,
        fecha: o.createdAt,
        servicio: o.services,
        total: o.totalAmount,
        estado: o.status
      }))
  }

  return report
}
```

## Migraciones

Si tienes datos en el formato anterior (useKV directo), ejecuta la migración:

```typescript
import { migrateFromKVToRelationalDB } from '@/lib/database/migrations'

// Una sola vez
await migrateFromKVToRelationalDB()
```

La migración:
1. Lee datos legacy de `orders` y `inventory` en KV
2. Normaliza clientes (agrupa por teléfono)
3. Crea devices asociados
4. Crea orders con foreign keys correctas
5. Migra historial, pagos y fotos

## Integridad Referencial

### Validaciones Automáticas

✅ **Previene:**
- Crear dispositivo sin cliente válido
- Crear orden sin cliente/dispositivo válido
- Crear historial sin orden válida
- Crear pago sin orden válida
- Crear movimiento sin item válido

✅ **Actualiza automáticamente:**
- `paidAmount` y `paymentStatus` al registrar pagos
- `currentStock` al registrar movimientos
- Historial al cambiar estado de orden

✅ **Cascadas:**
- Actualizar IDs se propaga a tablas hijas
- Eliminar orden elimina su historial, fotos y pagos (pendiente implementar)

### Ejemplo de Validación

```typescript
try {
  // Esto fallará porque el clientId no existe
  const device = await db.insertDevice({
    clientId: "invalid_id",
    brand: "Samsung",
    model: "S21",
    imei: "123"
  })
} catch (error) {
  console.error(error)
  // Error: Foreign key constraint failed: clientId does not exist
}
```

## Próximos Pasos

1. **Migrar a PostgreSQL real**: La arquitectura está lista para una migración directa
2. **Agregar triggers**: Para auditoría y validaciones adicionales
3. **Full-text search**: Mejorar búsquedas con índices especializados
4. **Soft deletes**: Implementar borrado lógico en lugar de físico
5. **Auditoría completa**: Tabla de logs para todas las operaciones críticas

---

**¿Preguntas?** Consulta [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) para el esquema completo o revisa [README.md](./README.md) para una visión general del sistema.
