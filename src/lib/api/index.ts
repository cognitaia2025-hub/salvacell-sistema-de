// Re-export all API modules
export { api, APIError } from './client'
export { clientsAPI } from './clients'
export { ordersAPI } from './orders'
export { inventoryAPI } from './inventory'
export { authAPI } from './auth'
export { reportsAPI } from './reports'
export { paymentsAPI } from './payments'
export { photosApi } from './photos'


export type { ClientWithStats, ClientCreateData, ClientUpdateData } from './clients'
export type { OrderCreateData, OrderUpdateData } from './orders'
export type {
  InventoryItemCreateData,
  InventoryItemUpdateData,
  InventoryMovementCreateData,
} from './inventory'
export type { LoginCredentials, TokenResponse, UserResponse } from './auth'
export type {
  OperationalStats,
  FinancialStats,
  InventoryStats,
  ClientStats,
  DashboardSummary,
  OrderTrend,
  StatusDistribution,
  ReportPeriod,
} from './reports'
export type {
  Payment,
  PaymentCreate,
  PaymentUpdate,
  PaymentSummary,
} from './payments'
export type { OrderPhoto } from './photos'

