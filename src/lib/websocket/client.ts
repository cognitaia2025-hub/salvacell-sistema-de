/**
 * WebSocket Client
 * Native WebSocket implementation for real-time communication
 */

import {
  ConnectionStatus,
  EventHandler,
  EventType,
  WebSocketClientConfig,
  WebSocketEvent,
  WebSocketMessage,
} from './types'

export class WebSocketClient {
  private ws: WebSocket | null = null
  private config: Required<WebSocketClientConfig>
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED
  private reconnectAttempts = 0
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private eventHandlers: Map<EventType, Set<EventHandler>> = new Map()
  private statusHandlers: Set<(status: ConnectionStatus) => void> = new Set()

  constructor(config: WebSocketClientConfig) {
    this.config = {
      token: undefined,
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...config,
    } as Required<WebSocketClientConfig>
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    this.setStatus(ConnectionStatus.CONNECTING)

    try {
      // Build WebSocket URL
      const wsUrl = this.buildWebSocketUrl()
      
      // Create WebSocket connection
      this.ws = new WebSocket(wsUrl)

      // Event handlers
      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onerror = this.handleError.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
    } catch (error) {
      console.error('Error creating WebSocket:', error)
      this.setStatus(ConnectionStatus.ERROR)
      this.scheduleReconnect()
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.config.autoReconnect = false
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.setStatus(ConnectionStatus.DISCONNECTED)
  }

  /**
   * Send message to server
   */
  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }

  /**
   * Join a room
   */
  joinRoom(room: string): void {
    this.send({ command: 'join_room', room })
  }

  /**
   * Leave a room
   */
  leaveRoom(room: string): void {
    this.send({ command: 'leave_room', room })
  }

  /**
   * Broadcast message to all clients
   */
  broadcast(message: string): void {
    this.send({ command: 'broadcast', message })
  }

  /**
   * Subscribe to event type
   */
  on(eventType: EventType, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set())
    }
    this.eventHandlers.get(eventType)!.add(handler)

    // Return unsubscribe function
    return () => {
      this.off(eventType, handler)
    }
  }

  /**
   * Unsubscribe from event type
   */
  off(eventType: EventType, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    this.statusHandlers.add(handler)
    // Return unsubscribe function
    return () => {
      this.statusHandlers.delete(handler)
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.status === ConnectionStatus.CONNECTED
  }

  // Private methods

  private buildWebSocketUrl(): string {
    const { url, token } = this.config
    const wsUrl = url.replace(/^http/, 'ws')
    return token ? `${wsUrl}?token=${encodeURIComponent(token)}` : wsUrl
  }

  private handleOpen(): void {
    console.log('WebSocket connected')
    this.setStatus(ConnectionStatus.CONNECTED)
    this.reconnectAttempts = 0
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data: WebSocketEvent = JSON.parse(event.data)
      
      // Dispatch to event handlers
      const handlers = this.eventHandlers.get(data.type)
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(data)
          } catch (error) {
            console.error(`Error in event handler for ${data.type}:`, error)
          }
        })
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error)
    this.setStatus(ConnectionStatus.ERROR)
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket closed:', event.code, event.reason)
    this.setStatus(ConnectionStatus.DISCONNECTED)
    this.ws = null

    if (this.config.autoReconnect) {
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    this.setStatus(ConnectionStatus.RECONNECTING)

    console.log(
      `Reconnecting in ${this.config.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`
    )

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, this.config.reconnectInterval)
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status
      this.statusHandlers.forEach(handler => {
        try {
          handler(status)
        } catch (error) {
          console.error('Error in status handler:', error)
        }
      })
    }
  }
}
