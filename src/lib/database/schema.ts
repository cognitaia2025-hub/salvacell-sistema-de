export interface DBClient {
  id: string
  name: string
  phone: string
  alternatePhone?: string
  alternateContact?: string
  email?: string
  createdAt: string
  updatedAt: string
}

export interface DBDevice {
  id: string
  clientId: string
  brand: string
  model: string
  imei: string
  createdAt: string
  updatedAt: string
}

export interface DBOrder {
  id: string
  folio: string
  clientId: string
  deviceId: string
  status: 'received' | 'diagnosing' | 'waiting-parts' | 'repairing' | 'repaired' | 'delivered' | 'cancelled'
  priority: 'normal' | 'urgent'
  problemDescription: string
  technicalDiagnosis?: string
  services: string
  estimatedCost: number
  estimatedDelivery: string
  devicePassword?: string
  accessories?: string
  paymentStatus: 'pending' | 'partial' | 'paid'
  totalAmount: number
  paidAmount: number
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface DBOrderHistory {
  id: string
  orderId: string
  status: DBOrder['status']
  notes?: string
  changedBy?: string
  createdAt: string
}

export interface DBOrderPhoto {
  id: string
  orderId: string
  historyId?: string
  photoData: string
  isPublic: boolean
  uploadedBy?: string
  createdAt: string
}

export interface DBPayment {
  id: string
  orderId: string
  amount: number
  method: 'cash' | 'card' | 'transfer'
  notes?: string
  createdBy?: string
  createdAt: string
}

export interface DBInventoryItem {
  id: string
  sku: string
  name: string
  category: string
  description?: string
  purchasePrice: number
  salePrice: number
  currentStock: number
  minStock: number
  location?: string
  createdAt: string
  updatedAt: string
}

export interface DBInventoryMovement {
  id: string
  itemId: string
  orderId?: string
  type: 'entry' | 'exit' | 'adjustment'
  quantity: number
  reason?: string
  createdBy?: string
  createdAt: string
}

export interface Database {
  clients: DBClient[]
  devices: DBDevice[]
  orders: DBOrder[]
  orderHistory: DBOrderHistory[]
  orderPhotos: DBOrderPhoto[]
  payments: DBPayment[]
  inventoryItems: DBInventoryItem[]
  inventoryMovements: DBInventoryMovement[]
}

export const INITIAL_DATABASE: Database = {
  clients: [],
  devices: [],
  orders: [],
  orderHistory: [],
  orderPhotos: [],
  payments: [],
  inventoryItems: [],
  inventoryMovements: []
}
