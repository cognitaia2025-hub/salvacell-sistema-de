// Re-export all API modules
export { api, APIError } from './client'
export { clientsAPI } from './clients'
export { ordersAPI } from './orders'
export { inventoryAPI } from './inventory'
export { authAPI } from './auth'

export type { ClientWithStats, ClientCreateData, ClientUpdateData } from './clients'
export type { OrderCreateData, OrderUpdateData } from './orders'
export type {
  InventoryItemCreateData,
  InventoryItemUpdateData,
  InventoryMovementCreateData,
} from './inventory'
export type { LoginCredentials, TokenResponse, UserResponse } from './auth'
