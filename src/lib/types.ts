export type OrderStatus =
  | 'received'
  | 'diagnosing'
  | 'waiting_parts'
  | 'in_repair'
  | 'repaired'
  | 'delivered'
  | 'cancelled'

export type OrderPriority = 'normal' | 'urgent'

export type PaymentMethod = 'cash' | 'card' | 'transfer'

export type PaymentStatus = 'pending' | 'partial' | 'paid'

export type UserRole = 'admin' | 'technician' | 'receptionist' | 'warehouse'

export type ClientTier = 'new' | 'frequent' | 'vip'

export interface Client {
  id: string
  name: string
  phone: string
  alternatePhone?: string
  email?: string
  createdAt: string
  tier?: ClientTier
  totalOrders?: number
  totalSpent?: number
}

export interface Device {
  brand: string
  model: string
  imei: string
  password?: string
  accessories?: string
}

export interface StatusHistoryEntry {
  id: string
  status: OrderStatus
  timestamp: string
  userId: string
  userName: string
  notes?: string
  photos?: string[]
}

export interface Payment {
  id: string
  amount: number
  method: PaymentMethod
  timestamp: string
  userId: string
  notes?: string
}

export interface Order {
  id: string
  folio: string
  clientId: string
  client: Client
  device: Device
  problem: string
  diagnosis?: string
  services: string
  estimatedCost: number
  estimatedDelivery: string
  priority: OrderPriority
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
  statusHistory: StatusHistoryEntry[]
  payments: Payment[]
  photos?: string[]
  qrCode?: string
}

export interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  buyPrice: number
  sellPrice: number
  currentStock: number
  minStock: number
  location?: string
}

export interface InventoryMovement {
  id: string
  itemId: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  orderId?: string
  userId: string
  timestamp: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string
  color: string
  bgColor: string
}> = {
  received: {
    label: 'Recibido',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  },
  diagnosing: {
    label: 'En Diagnóstico',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100'
  },
  waiting_parts: {
    label: 'Esperando Repuestos',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100'
  },
  in_repair: {
    label: 'En Reparación',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100'
  },
  repaired: {
    label: 'Reparado',
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  delivered: {
    label: 'Entregado',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100'
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  }
}

export const CLIENT_TIER_CONFIG: Record<ClientTier, {
  label: string
  color: string
  icon: string
}> = {
  new: {
    label: 'Primera Visita',
    color: 'text-slate-600',
    icon: 'User'
  },
  frequent: {
    label: 'Cliente Frecuente',
    color: 'text-orange-600',
    icon: 'Fire'
  },
  vip: {
    label: 'Cliente VIP',
    color: 'text-purple-600',
    icon: 'Star'
  }
}