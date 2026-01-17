import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { Order, Client, InventoryItem } from '@/lib/types'

interface SalvaCellDB extends DBSchema {
  orders: {
    key: string
    value: {
      id: string
      folio: string
      clientId: string
      data: any
      status: string
      syncStatus: 'pending' | 'synced' | 'error'
      createdAt: string
      updatedAt: string
    }
    indexes: {
      'by-sync-status': string
      'by-folio': string
    }
  }
  clients: {
    key: string
    value: {
      id: string
      name: string
      phone: string
      data: any
      syncStatus: 'pending' | 'synced' | 'error'
      createdAt: string
      updatedAt: string
    }
    indexes: {
      'by-sync-status': string
      'by-phone': string
    }
  }
  inventory: {
    key: string
    value: {
      id: string
      sku: string
      data: any
      syncStatus: 'pending' | 'synced' | 'error'
      updatedAt: string
    }
    indexes: {
      'by-sync-status': string
      'by-sku': string
    }
  }
  pendingActions: {
    key: number
    value: {
      id?: number
      type: 'create' | 'update' | 'delete'
      entity: 'order' | 'client' | 'inventory'
      data: any
      timestamp: string
    }
  }
}

let db: IDBPDatabase<SalvaCellDB> | null = null

export async function initDB(): Promise<IDBPDatabase<SalvaCellDB>> {
  if (db) return db

  db = await openDB<SalvaCellDB>('salvacell-db', 1, {
    upgrade(db) {
      // Orders store
      const ordersStore = db.createObjectStore('orders', { keyPath: 'id' })
      ordersStore.createIndex('by-sync-status', 'syncStatus')
      ordersStore.createIndex('by-folio', 'folio')

      // Clients store
      const clientsStore = db.createObjectStore('clients', { keyPath: 'id' })
      clientsStore.createIndex('by-sync-status', 'syncStatus')
      clientsStore.createIndex('by-phone', 'phone')

      // Inventory store
      const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id' })
      inventoryStore.createIndex('by-sync-status', 'syncStatus')
      inventoryStore.createIndex('by-sku', 'sku')

      // Pending actions store
      db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true })
    },
  })

  return db
}

export async function getDB(): Promise<IDBPDatabase<SalvaCellDB>> {
  if (!db) {
    return initDB()
  }
  return db
}

// Orders operations
export async function saveOrder(order: Order) {
  const database = await getDB()
  await database.put('orders', {
    id: order.id,
    folio: order.folio,
    clientId: order.clientId,
    data: order,
    status: order.status,
    syncStatus: 'pending',
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

export async function getOrder(id: string) {
  const database = await getDB()
  return database.get('orders', id)
}

export async function getAllOrders() {
  const database = await getDB()
  return database.getAll('orders')
}

export async function getPendingOrders() {
  const database = await getDB()
  return database.getAllFromIndex('orders', 'by-sync-status', 'pending')
}

// Clients operations
export async function saveClient(client: Client) {
  const database = await getDB()
  await database.put('clients', {
    id: client.id,
    name: client.name,
    phone: client.phone,
    data: client,
    syncStatus: 'pending',
    createdAt: client.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

export async function getClient(id: string) {
  const database = await getDB()
  return database.get('clients', id)
}

export async function getAllClients() {
  const database = await getDB()
  return database.getAll('clients')
}

// Pending actions
export async function addPendingAction(
  type: 'create' | 'update' | 'delete',
  entity: 'order' | 'client' | 'inventory',
  data: any
) {
  const database = await getDB()
  await database.add('pendingActions', {
    type,
    entity,
    data,
    timestamp: new Date().toISOString(),
  })
}

export async function getPendingActions() {
  const database = await getDB()
  return database.getAll('pendingActions')
}

export async function clearPendingAction(id: number) {
  const database = await getDB()
  await database.delete('pendingActions', id)
}

export async function markAsSynced(
  store: 'orders' | 'clients' | 'inventory',
  id: string
) {
  const database = await getDB()
  const item = await database.get(store, id)
  if (item) {
    item.syncStatus = 'synced'
    await database.put(store, item)
  }
}
