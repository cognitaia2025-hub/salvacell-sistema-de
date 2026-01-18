import {
  getPendingActions,
  clearPendingAction,
  markAsSynced,
  getPendingOrders,
  saveOrder,
  getAllOrders,
  saveClient,
  getDB,
} from './indexed-db'
import { api } from '@/lib/api/client'

interface SyncResult {
  success: boolean
  errors: SyncError[]
  synced: {
    orders: number
    clients: number
    inventory: number
  }
}

interface SyncError {
  type: string
  entity?: string
  data?: any
  error: any
}

interface IdMapping {
  tempId: string
  serverId: string
  entity: string
}

export class SyncManager {
  private isSyncing = false
  private syncInterval: number | null = null
  private idMappings: IdMapping[] = []

  constructor() {
    // Listen for online events
    window.addEventListener('online', () => {
      console.log('📡 Conexión restaurada, sincronizando...')
      this.syncAll()
    })
  }

  startAutoSync(intervalMs = 30000) {
    if (this.syncInterval) return

    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine) {
        this.syncAll()
      }
    }, intervalMs)
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  /**
   * Check if an ID is a temporary offline-generated ID
   * Temporary IDs are prefixed with 'temp_' or 'offline_'
   */
  private isTemporaryId(id: string): boolean {
    return id.startsWith('temp_') || id.startsWith('offline_') || id.startsWith('local_')
  }

  /**
   * Resolve a temporary ID to its server-generated counterpart
   */
  private resolveId(tempId: string): string {
    const mapping = this.idMappings.find(m => m.tempId === tempId)
    return mapping ? mapping.serverId : tempId
  }

  /**
   * Update references in data to use server IDs instead of temp IDs
   */
  private resolveDataReferences(data: any): any {
    if (!data || typeof data !== 'object') return data

    const resolved = { ...data }

    // Common reference fields that might contain temp IDs
    const referenceFields = ['clientId', 'orderId', 'deviceId', 'itemId', 'client_id', 'order_id', 'device_id', 'item_id']
    
    for (const field of referenceFields) {
      if (resolved[field] && typeof resolved[field] === 'string' && this.isTemporaryId(resolved[field])) {
        resolved[field] = this.resolveId(resolved[field])
      }
    }

    return resolved
  }

  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('⏳ Sincronización en progreso...')
      return { success: false, errors: [], synced: { orders: 0, clients: 0, inventory: 0 } }
    }

    this.isSyncing = true
    const errors: SyncError[] = []
    const synced = { orders: 0, clients: 0, inventory: 0 }
    
    // Reset ID mappings for this sync session
    this.idMappings = []

    try {
      // 1. First sync clients (they may be referenced by orders)
      const pendingActions = await getPendingActions()
      const clientActions = pendingActions.filter(a => a.entity === 'client')
      const orderActions = pendingActions.filter(a => a.entity === 'order')
      const inventoryActions = pendingActions.filter(a => a.entity === 'inventory')
      
      console.log(`📤 Sincronizando: ${clientActions.length} clientes, ${orderActions.length} órdenes, ${inventoryActions.length} inventario`)

      // Sync clients first (orders depend on clients)
      for (const action of clientActions) {
        try {
          await this.syncAction(action)
          await clearPendingAction(action.id!)
          synced.clients++
        } catch (error) {
          console.error('❌ Error sincronizando cliente:', action, error)
          errors.push({ type: 'action', entity: 'client', data: action.data, error })
        }
      }

      // Sync orders (resolve client IDs to server IDs)
      for (const action of orderActions) {
        try {
          // Resolve any temporary references before syncing
          action.data = this.resolveDataReferences(action.data)
          await this.syncAction(action)
          await clearPendingAction(action.id!)
          synced.orders++
        } catch (error) {
          console.error('❌ Error sincronizando orden:', action, error)
          errors.push({ type: 'action', entity: 'order', data: action.data, error })
        }
      }

      // Sync inventory
      for (const action of inventoryActions) {
        try {
          await this.syncAction(action)
          await clearPendingAction(action.id!)
          synced.inventory++
        } catch (error) {
          console.error('❌ Error sincronizando inventario:', action, error)
          errors.push({ type: 'action', entity: 'inventory', data: action.data, error })
        }
      }

      // 2. Sync pending orders that were saved directly
      const pendingOrders = await getPendingOrders()
      console.log(`📤 Sincronizando ${pendingOrders.length} órdenes pendientes adicionales`)

      for (const order of pendingOrders) {
        try {
          // Resolve any temporary references
          const resolvedData = this.resolveDataReferences(order.data)
          const response = await api.post('/orders', resolvedData)
          
          // If the order had a temp ID, map it to the server ID
          if (this.isTemporaryId(order.id)) {
            this.idMappings.push({
              tempId: order.id,
              serverId: response.id,
              entity: 'order'
            })
            // Update the local order with the server ID
            await this.updateLocalOrderWithServerId(order.id, response)
          }
          
          await markAsSynced('orders', response.id || order.id)
          synced.orders++
        } catch (error) {
          console.error('❌ Error sincronizando orden:', order, error)
          errors.push({ type: 'order', data: order, error })
        }
      }

      // 3. Pull latest data from server (re-hydration)
      await this.pullLatestData()

      console.log('✅ Sincronización completada', synced)
      return { success: errors.length === 0, errors, synced }
    } catch (error) {
      console.error('❌ Error en sincronización:', error)
      return { success: false, errors: [{ type: 'general', error }], synced }
    } finally {
      this.isSyncing = false
    }
  }

  private async syncAction(action: any) {
    const { type, entity, data } = action
    let response: any

    switch (entity) {
      case 'order':
        if (type === 'create') {
          response = await api.post('/orders', data)
          if (this.isTemporaryId(data.id)) {
            this.idMappings.push({ tempId: data.id, serverId: response.id, entity: 'order' })
          }
        } else if (type === 'update') {
          const serverId = this.resolveId(data.id)
          await api.put(`/orders/${serverId}`, data)
        } else if (type === 'delete') {
          const serverId = this.resolveId(data.id)
          await api.delete(`/orders/${serverId}`)
        }
        break

      case 'client':
        if (type === 'create') {
          response = await api.post('/clients', data)
          if (this.isTemporaryId(data.id)) {
            this.idMappings.push({ tempId: data.id, serverId: response.id, entity: 'client' })
          }
        } else if (type === 'update') {
          const serverId = this.resolveId(data.id)
          await api.put(`/clients/${serverId}`, data)
        }
        break

      case 'inventory':
        if (type === 'create') {
          response = await api.post('/inventory/items', data)
          if (this.isTemporaryId(data.id)) {
            this.idMappings.push({ tempId: data.id, serverId: response.id, entity: 'inventory' })
          }
        } else if (type === 'update') {
          const serverId = this.resolveId(data.id)
          await api.put(`/inventory/items/${serverId}`, data)
        }
        break
    }
  }

  /**
   * Update a local order with the server-generated ID after syncing
   */
  private async updateLocalOrderWithServerId(tempId: string, serverOrder: any) {
    const database = await getDB()
    
    // Delete the old entry with temp ID
    await database.delete('orders', tempId)
    
    // Save the new entry with server ID
    await saveOrder({
      ...serverOrder,
      syncStatus: 'synced'
    })
  }

  /**
   * Pull latest data from server to update local IndexedDB
   * Implements "last-write-wins" conflict resolution strategy
   */
  private async pullLatestData() {
    try {
      console.log('📥 Descargando datos actualizados del servidor...')
      
      // Pull orders updated in the last 24 hours
      const since = new Date()
      since.setHours(since.getHours() - 24)
      
      try {
        const ordersResponse = await api.get('/orders', {
          params: {
            limit: 100,
            since: since.toISOString()
          }
        })
        
        if (Array.isArray(ordersResponse)) {
          const localOrders = await getAllOrders()
          const localOrdersMap = new Map(localOrders.map(o => [o.id, o]))
          
          for (const serverOrder of ordersResponse) {
            const localOrder = localOrdersMap.get(serverOrder.id)
            
            // Only update if server version is newer or local doesn't exist
            if (!localOrder || new Date(serverOrder.updated_at) > new Date(localOrder.updatedAt)) {
              await saveOrder({
                id: serverOrder.id,
                folio: serverOrder.folio,
                clientId: serverOrder.client_id,
                status: serverOrder.status,
                createdAt: serverOrder.created_at,
                ...serverOrder
              })
              await markAsSynced('orders', serverOrder.id)
            }
          }
          console.log(`📥 ${ordersResponse.length} órdenes actualizadas desde el servidor`)
        }
      } catch (error) {
        console.warn('⚠️ No se pudieron obtener las órdenes del servidor:', error)
      }
      
      // Pull clients (usually fewer, so we can pull all)
      try {
        const clientsResponse = await api.get('/clients', {
          params: { limit: 500 }
        })
        
        if (Array.isArray(clientsResponse)) {
          for (const serverClient of clientsResponse) {
            await saveClient({
              id: serverClient.id,
              name: serverClient.name,
              phone: serverClient.phone,
              createdAt: serverClient.created_at,
              ...serverClient
            })
            await markAsSynced('clients', serverClient.id)
          }
          console.log(`📥 ${clientsResponse.length} clientes actualizados desde el servidor`)
        }
      } catch (error) {
        console.warn('⚠️ No se pudieron obtener los clientes del servidor:', error)
      }
      
    } catch (error) {
      console.error('❌ Error descargando datos:', error)
    }
  }

  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      autoSyncEnabled: this.syncInterval !== null,
      pendingMappings: this.idMappings.length,
    }
  }

  /**
   * Get all ID mappings from the current sync session
   * Useful for updating UI references after sync
   */
  getIdMappings(): IdMapping[] {
    return [...this.idMappings]
  }

  /**
   * Clear ID mappings after they've been processed
   */
  clearIdMappings() {
    this.idMappings = []
  }
}

export const syncManager = new SyncManager()
