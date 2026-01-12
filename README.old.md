# SalvaCell - Sistema de Gestión de Reparaciones

Sistema integral de gestión para talleres de reparación de dispositivos móviles con arquitectura de base de datos relacional PostgreSQL-compliant.

## 🏗️ Arquitectura de Base de Datos

Este sistema implementa una **arquitectura de base de datos relacional normalizada** con 8 tablas interconectadas que mantienen integridad referencial mediante foreign keys:

### Tablas Principales

1. **clients** - Información de contacto de clientes
2. **devices** - Dispositivos registrados por cliente (1:N con clients)
3. **orders** - Órdenes de reparación (N:1 con clients y devices)
4. **order_history** - Historial de cambios de estado (1:N con orders)
5. **order_photos** - Fotografías de evidencia (1:N con orders)
6. **payments** - Registro de pagos y anticipos (1:N con orders)
7. **inventory_items** - Catálogo de repuestos
8. **inventory_movements** - Movimientos de inventario (1:N con inventory_items)

Ver documentación completa en [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

## 🎯 Características Principales

### ✅ Gestión de Órdenes
- Creación de órdenes multi-paso con validaciones
- Búsqueda por folio, cliente, teléfono, IMEI
- Generación automática de QR único
- 7 estados del ciclo de vida: Recibido → Diagnóstico → Esperando repuestos → En reparación → Reparado → Entregado/Cancelado
- Historial completo con timeline visual
- Sistema de carga de fotografías de evidencia
- Prioridad normal/urgente

### ✅ Base de Datos de Clientes
- Registro unificado con historial completo
- Búsqueda por nombre, teléfono, email
- Badges de cliente: VIP (>5 órdenes), Frecuente (3-5), Primera visita
- Estadísticas: total de visitas, total gastado, promedio
- Vista de equipos registrados por cliente
- Soporte para teléfono principal, alterno y contacto alterno

### ✅ Gestión de Inventario
- Catálogo completo con SKU, precios, stock
- Sistema de movimientos (entrada, salida, ajuste)
- Alertas de stock bajo/sin stock
- Estadísticas en tiempo real
- Historial completo de movimientos
- Filtros por categoría y estado

### ✅ Sistema de Pagos
- Anticipos y pagos parciales
- Tres métodos: efectivo, tarjeta, transferencia
- Cálculo automático de saldo pendiente
- Estados: pendiente → parcial → pagado
- Historial completo con timestamps

### ✅ Consulta Pública QR
- Página sin autenticación para clientes
- Barra de progreso visual
- Estado actualizado en tiempo real
- Diseño responsive mobile-first
- Reglamento del taller
- Información de contacto

## 🔧 Stack Tecnológico

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui v4
- **Icons**: Phosphor Icons
- **State**: React Hooks + Spark KV (con capa relacional)
- **Forms**: React Hook Form + Zod
- **Build**: Vite
- **Database Layer**: Arquitectura relacional con integridad referencial

## 📦 Instalación

```bash
npm install
```

## 🚀 Desarrollo

```bash
npm run dev
```

## 🗃️ Uso de la Base de Datos Relacional

### API Directa

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

// Obtener orden completa con relaciones (JOIN)
const fullOrder = await db.getOrderWithRelations(order.id)
console.log(fullOrder.client.name) // "Juan Pérez"
console.log(fullOrder.device.brand) // "Samsung"
console.log(fullOrder.history.length) // Historial completo
```

### React Hooks

```typescript
import { useOrders, useClients, useInventory } from '@/hooks/use-relational-db'

function MyComponent() {
  const { orders, createOrder, updateOrder, loading } = useOrders()
  const { clients, searchClients } = useClients()
  const { items, addMovement, getStats } = useInventory()

  // Crear orden
  const handleCreateOrder = async () => {
    await createOrder({
      folio: "ORD-001",
      clientId: "client_123",
      deviceId: "device_456",
      // ...más campos
    })
  }

  return <div>...</div>
}
```

## 🔄 Migración de Datos

Si tienes datos en el formato anterior, ejecuta la migración:

```typescript
import { migrateFromKVToRelationalDB } from '@/lib/database/migrations'

await migrateFromKVToRelationalDB()
```

## 📊 Consultas Relacionales

### Buscar órdenes con datos relacionados
```typescript
// Busca en orders, clients y devices simultáneamente
const results = await db.searchOrders("Samsung")
```

### Obtener cliente con estadísticas
```typescript
// Calcula totales, cuenta órdenes, determina tier
const clientStats = await db.getClientWithStats(clientId)
console.log(clientStats.tier) // "vip", "frequent", "new"
console.log(clientStats.totalSpent)
console.log(clientStats.orders) // Todas las órdenes del cliente
```

### Estadísticas de inventario
```typescript
const stats = await db.getInventoryStats()
console.log(stats.totalValue)
console.log(stats.lowStockItems)
console.log(stats.outOfStockItems)
```

## 🔐 Integridad Referencial

El sistema valida automáticamente:
- ✅ No puedes crear una orden sin un cliente válido
- ✅ No puedes crear una orden sin un dispositivo válido
- ✅ No puedes eliminar un cliente con órdenes activas
- ✅ Los pagos actualizan automáticamente el estado de pago de la orden
- ✅ Los movimientos de inventario actualizan el stock automáticamente
- ✅ Los cambios de estado crean entradas en el historial automáticamente

## 📱 Características de la Interfaz

### Diseño
- Color primario: Azul tecnológico `oklch(0.45 0.15 250)`
- Color de acento: Naranja energético `oklch(0.68 0.18 40)`
- Tipografía: Inter (UI) + Space Grotesk (Headers)
- Border radius: 10px
- Contraste WCAG AA compliant

### Componentes
- Formularios multi-paso con validación
- Timeline visual de historial
- Cards con hover effects
- Badges de estado con colores distintivos
- Sistema de notificaciones con Sonner
- Tablas responsivas con ordenamiento
- Búsqueda en tiempo real

## 🎨 Paleta de Colores

```css
:root {
  --primary: oklch(0.45 0.15 250);        /* Azul tecnológico */
  --accent: oklch(0.68 0.18 40);          /* Naranja energético */
  --success: oklch(0.60 0.15 145);        /* Verde técnico */
  --warning: oklch(0.75 0.14 85);         /* Amarillo ámbar */
  --destructive: oklch(0.55 0.22 25);     /* Rojo controlado */
}
```

## 📖 Documentación

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Esquema completo de la base de datos
- [PRD.md](./PRD.md) - Product Requirements Document

## 🔮 Roadmap

- [ ] Vinculación de salidas de inventario a órdenes específicas
- [ ] Sistema de notificaciones automáticas (SMS/WhatsApp)
- [ ] Reportes avanzados y analítica
- [ ] Control de acceso por roles
- [ ] Generación de PDFs (tickets, facturas)
- [ ] Migración a PostgreSQL real

## 📄 Licencia

MIT

---

**Desarrollado con ❤️ para talleres de reparación profesionales**
