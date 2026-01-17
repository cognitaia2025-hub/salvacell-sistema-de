/**
 * WebSocket Types
 */

export enum EventType {
  // Orders
  ORDER_CREATED = "order_created",
  ORDER_UPDATED = "order_updated",
  ORDER_STATUS_CHANGED = "order_status_changed",
  
  // Clients
  CLIENT_CREATED = "client_created",
  CLIENT_UPDATED = "client_updated",
  
  // Inventory
  INVENTORY_UPDATED = "inventory_updated",
  STOCK_LOW = "stock_low",
  
  // Notifications
  NOTIFICATION = "notification",
  
  // System
  USER_CONNECTED = "user_connected",
  USER_DISCONNECTED = "user_disconnected",
}

export interface WebSocketEvent {
  type: EventType
  data: Record<string, any>
  timestamp: string
  user_id?: string | null
}

export interface WebSocketMessage {
  command?: string
  room?: string
  message?: string
  [key: string]: any
}

export enum ConnectionStatus {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  RECONNECTING = "reconnecting",
  ERROR = "error",
}

export type EventHandler = (event: WebSocketEvent) => void

export interface WebSocketClientConfig {
  url: string
  token?: string
  autoReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}
