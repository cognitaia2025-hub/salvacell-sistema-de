import {
  getPendingActions,
  clearPendingAction,
  markAsSynced,
  getPendingOrders,
} from './indexed-db'
import { api } from '@/lib/api/client'

export class SyncManager {
  private isSyncing = false
  private syncInterval: number | null = null

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

  async syncAll(): Promise<{ success: boolean; errors: any[] }> {
    if (this.isSyncing) {
      console.log('⏳ Sincronización en progreso...')
      return { success: false, errors: [] }
    }

    this.isSyncing = true
    const errors: any[] = []

    try {
      // 1. Sync pending actions
      const pendingActions = await getPendingActions()
      console.log(`📤 Sincronizando ${pendingActions.length} acciones pendientes`)

      for (const action of pendingActions) {
        try {
          await this.syncAction(action)
          await clearPendingAction(action.id!)
        } catch (error) {
          console.error('❌ Error sincronizando acción:', action, error)
          errors.push({ action, error })
        }
      }

      // 2. Sync pending orders
      const pendingOrders = await getPendingOrders()
      console.log(`📤 Sincronizando ${pendingOrders.length} órdenes pendientes`)

      for (const order of pendingOrders) {
        try {
          await api.post('/orders', order.data)
          await markAsSynced('orders', order.id)
        } catch (error) {
          console.error('❌ Error sincronizando orden:', order, error)
          errors.push({ type: 'order', order, error })
        }
      }

      // 3. Pull latest data from server
      await this.pullLatestData()

      console.log('✅ Sincronización completada')
      return { success: errors.length === 0, errors }
    } catch (error) {
      console.error('❌ Error en sincronización:', error)
      return { success: false, errors: [error] }
    } finally {
      this.isSyncing = false
    }
  }

  private async syncAction(action: any) {
    const { type, entity, data } = action

    switch (entity) {
      case 'order':
        if (type === 'create') {
          await api.post('/orders', data)
        } else if (type === 'update') {
          await api.put(`/orders/${data.id}`, data)
        } else if (type === 'delete') {
          await api.delete(`/orders/${data.id}`)
        }
        break

      case 'client':
        if (type === 'create') {
          await api.post('/clients', data)
        } else if (type === 'update') {
          await api.put(`/clients/${data.id}`, data)
        }
        break

      case 'inventory':
        if (type === 'create') {
          await api.post('/inventory/items', data)
        } else if (type === 'update') {
          await api.put(`/inventory/items/${data.id}`, data)
        }
        break
    }
  }

  private async pullLatestData() {
    try {
      // Pull latest orders, clients, etc. from server
      // and update IndexedDB
      console.log('📥 Descargando datos actualizados del servidor...')
      
      // Note: This functionality is deferred for future implementation
      // When implemented, it should:
      // 1. Fetch latest data from API endpoints
      // 2. Update local IndexedDB with fresh data
      // 3. Handle conflicts between local and remote data
      // 4. Maintain data consistency
      
      // Example implementation:
      // const orders = await api.get('/orders')
      // for (const order of orders) {
      //   await saveOrder(order)
      //   await markAsSynced('orders', order.id)
      // }
    } catch (error) {
      console.error('❌ Error descargando datos:', error)
    }
  }

  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      autoSyncEnabled: this.syncInterval !== null,
    }
  }
}

export const syncManager = new SyncManager()
