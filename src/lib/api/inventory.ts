import { api } from './client'
import type { DBInventoryItem, DBInventoryMovement } from '../database/schema'

export interface InventoryItemCreateData {
  sku: string
  name: string
  description?: string
  category?: string
  purchase_price?: number
  sale_price?: number
  stock?: number
  min_stock?: number
  location?: string
}

export interface InventoryItemUpdateData extends Partial<InventoryItemCreateData> {}

export interface InventoryMovementCreateData {
  item_id: string
  type: 'entry' | 'exit' | 'adjustment' | 'return'
  quantity: number
  reason?: string
  reference?: string
  order_id?: string
}

export const inventoryAPI = {
  // Items
  items: {
    getAll: (params?: {
      skip?: number
      limit?: number
      category?: string
      low_stock?: boolean
      search?: string
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.skip) searchParams.append('skip', params.skip.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.category) searchParams.append('category', params.category)
      if (params?.low_stock !== undefined)
        searchParams.append('low_stock', params.low_stock.toString())
      if (params?.search) searchParams.append('search', params.search)

      const query = searchParams.toString()
      return api.get<DBInventoryItem[]>(`/inventory/items${query ? `?${query}` : ''}`)
    },

    getById: (itemId: string) =>
      api.get<DBInventoryItem>(`/inventory/items/${itemId}`),

    create: (data: InventoryItemCreateData) =>
      api.post<DBInventoryItem>('/inventory/items', data),

    update: (itemId: string, data: InventoryItemUpdateData) =>
      api.put<DBInventoryItem>(`/inventory/items/${itemId}`, data),

    delete: (itemId: string) =>
      api.delete(`/inventory/items/${itemId}`),
  },

  // Movements
  movements: {
    getAll: (params?: {
      skip?: number
      limit?: number
      item_id?: string
      movement_type?: string
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.skip) searchParams.append('skip', params.skip.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.item_id) searchParams.append('item_id', params.item_id)
      if (params?.movement_type) searchParams.append('movement_type', params.movement_type)

      const query = searchParams.toString()
      return api.get<DBInventoryMovement[]>(`/inventory/movements${query ? `?${query}` : ''}`)
    },

    create: (data: InventoryMovementCreateData) =>
      api.post<DBInventoryMovement>('/inventory/movements', data),
  },
}
