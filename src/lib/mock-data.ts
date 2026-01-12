import type { Client, Order, InventoryItem, User } from './types'

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin Principal',
    email: 'admin@salvacell.com',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Carlos Técnico',
    email: 'carlos@salvacell.com',
    role: 'technician'
  },
  {
    id: '3',
    name: 'María Recepción',
    email: 'maria@salvacell.com',
    role: 'receptionist'
  }
]

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    phone: '5551234567',
    email: 'juan@email.com',
    createdAt: '2024-01-15T10:00:00Z',
    tier: 'vip',
    totalOrders: 8,
    totalSpent: 12500
  },
  {
    id: '2',
    name: 'María González',
    phone: '5559876543',
    alternatePhone: '5551111111',
    createdAt: '2024-06-20T14:30:00Z',
    tier: 'frequent',
    totalOrders: 4,
    totalSpent: 4200
  },
  {
    id: '3',
    name: 'Roberto Martínez',
    phone: '5557654321',
    email: 'roberto@email.com',
    createdAt: '2024-12-01T09:15:00Z',
    tier: 'new',
    totalOrders: 1,
    totalSpent: 850
  }
]

export const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    folio: 'SC-2024-001',
    clientId: '1',
    client: MOCK_CLIENTS[0],
    device: {
      brand: 'Apple',
      model: 'iPhone 13 Pro',
      imei: '356789012345678',
      password: '1234',
      accessories: 'Funda, protector de pantalla'
    },
    problem: 'Pantalla rota en esquina superior derecha',
    diagnosis: 'Reemplazo completo de display OLED requerido',
    services: 'Cambio de pantalla OLED original',
    estimatedCost: 3500,
    estimatedDelivery: '2024-12-28T18:00:00Z',
    priority: 'normal',
    status: 'in_repair',
    paymentStatus: 'partial',
    createdAt: '2024-12-26T10:30:00Z',
    updatedAt: '2024-12-27T14:20:00Z',
    statusHistory: [
      {
        id: 'h1',
        status: 'received',
        timestamp: '2024-12-26T10:30:00Z',
        userId: '3',
        userName: 'María Recepción',
        notes: 'Cliente reporta caída del dispositivo'
      },
      {
        id: 'h2',
        status: 'diagnosing',
        timestamp: '2024-12-26T11:00:00Z',
        userId: '2',
        userName: 'Carlos Técnico',
        notes: 'Iniciando diagnóstico completo'
      },
      {
        id: 'h3',
        status: 'waiting_parts',
        timestamp: '2024-12-26T15:00:00Z',
        userId: '2',
        userName: 'Carlos Técnico',
        notes: 'Pantalla OLED solicitada a proveedor'
      },
      {
        id: 'h4',
        status: 'in_repair',
        timestamp: '2024-12-27T14:20:00Z',
        userId: '2',
        userName: 'Carlos Técnico',
        notes: 'Repuesto recibido, iniciando instalación'
      }
    ],
    payments: [
      {
        id: 'p1',
        amount: 1000,
        method: 'cash',
        timestamp: '2024-12-26T10:30:00Z',
        userId: '3',
        notes: 'Anticipo 30%'
      }
    ],
    qrCode: 'SC-2024-001'
  },
  {
    id: '2',
    folio: 'SC-2024-002',
    clientId: '2',
    client: MOCK_CLIENTS[1],
    device: {
      brand: 'Samsung',
      model: 'Galaxy S23',
      imei: '356789098765432',
      password: '9876',
      accessories: 'Cargador'
    },
    problem: 'Batería se descarga muy rápido',
    diagnosis: 'Batería degradada, capacidad al 65%',
    services: 'Reemplazo de batería original',
    estimatedCost: 1200,
    estimatedDelivery: '2024-12-27T16:00:00Z',
    priority: 'urgent',
    status: 'repaired',
    paymentStatus: 'pending',
    createdAt: '2024-12-25T09:15:00Z',
    updatedAt: '2024-12-26T16:45:00Z',
    statusHistory: [
      {
        id: 'h5',
        status: 'received',
        timestamp: '2024-12-25T09:15:00Z',
        userId: '3',
        userName: 'María Recepción'
      },
      {
        id: 'h6',
        status: 'diagnosing',
        timestamp: '2024-12-25T10:00:00Z',
        userId: '2',
        userName: 'Carlos Técnico'
      },
      {
        id: 'h7',
        status: 'in_repair',
        timestamp: '2024-12-26T09:00:00Z',
        userId: '2',
        userName: 'Carlos Técnico'
      },
      {
        id: 'h8',
        status: 'repaired',
        timestamp: '2024-12-26T16:45:00Z',
        userId: '2',
        userName: 'Carlos Técnico',
        notes: 'Batería reemplazada, pruebas exitosas. Listo para entrega.'
      }
    ],
    payments: [],
    qrCode: 'SC-2024-002'
  },
  {
    id: '3',
    folio: 'SC-2024-003',
    clientId: '3',
    client: MOCK_CLIENTS[2],
    device: {
      brand: 'Xiaomi',
      model: 'Redmi Note 12',
      imei: '356789055555555',
      accessories: 'Ninguno'
    },
    problem: 'No enciende, no carga',
    services: 'Diagnóstico y reparación',
    estimatedCost: 0,
    estimatedDelivery: '2024-12-29T12:00:00Z',
    priority: 'normal',
    status: 'diagnosing',
    paymentStatus: 'pending',
    createdAt: '2024-12-27T11:00:00Z',
    updatedAt: '2024-12-27T11:00:00Z',
    statusHistory: [
      {
        id: 'h9',
        status: 'received',
        timestamp: '2024-12-27T11:00:00Z',
        userId: '3',
        userName: 'María Recepción',
        notes: 'Primera visita del cliente'
      },
      {
        id: 'h10',
        status: 'diagnosing',
        timestamp: '2024-12-27T11:30:00Z',
        userId: '2',
        userName: 'Carlos Técnico',
        notes: 'Revisando placa madre y puerto de carga'
      }
    ],
    payments: [],
    qrCode: 'SC-2024-003'
  }
]

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    sku: 'PANT-IP13PRO-BLK',
    name: 'Pantalla OLED iPhone 13 Pro',
    category: 'Pantallas',
    buyPrice: 2800,
    sellPrice: 3500,
    currentStock: 3,
    minStock: 2,
    location: 'Estante A-12'
  },
  {
    id: '2',
    sku: 'BAT-S23-OEM',
    name: 'Batería Samsung Galaxy S23',
    category: 'Baterías',
    buyPrice: 800,
    sellPrice: 1200,
    currentStock: 8,
    minStock: 5,
    location: 'Estante B-05'
  },
  {
    id: '3',
    sku: 'PANT-RN12-LCD',
    name: 'Pantalla LCD Redmi Note 12',
    category: 'Pantallas',
    buyPrice: 450,
    sellPrice: 750,
    currentStock: 1,
    minStock: 3,
    location: 'Estante A-18'
  },
  {
    id: '4',
    sku: 'TOOL-OPEN-SET',
    name: 'Kit de herramientas de apertura',
    category: 'Herramientas',
    buyPrice: 150,
    sellPrice: 0,
    currentStock: 12,
    minStock: 3,
    location: 'Cajón C-01'
  }
]

export function generateFolio(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `SC-${year}-${random}`
}

export function calculateClientTier(orderCount: number): Client['tier'] {
  if (orderCount >= 5) return 'vip'
  if (orderCount >= 3) return 'frequent'
  return 'new'
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}