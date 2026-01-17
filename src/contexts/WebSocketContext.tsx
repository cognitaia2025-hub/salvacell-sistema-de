/**
 * WebSocket Context
 * Provides WebSocket client instance to React components
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { WebSocketClient } from '@/lib/websocket/client'
import { ConnectionStatus, EventType, EventHandler } from '@/lib/websocket/types'

interface WebSocketContextValue {
  client: WebSocketClient | null
  status: ConnectionStatus
  isConnected: boolean
  subscribe: (eventType: EventType, handler: EventHandler) => () => void
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined)

interface WebSocketProviderProps {
  children: React.ReactNode
  url?: string
  token?: string
  autoConnect?: boolean
}

export function WebSocketProvider({
  children,
  url = 'ws://localhost:8000/ws/connect',
  token,
  autoConnect = false,  // Temporarily disabled until backend WebSocket is fixed
}: WebSocketProviderProps) {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED)
  const clientRef = useRef<WebSocketClient | null>(null)

  useEffect(() => {
    // Create WebSocket client only once
    // Note: If you need to update url/token dynamically, you'll need to
    // disconnect and recreate the client. Current implementation creates
    // the connection once on mount for stability.
    if (!clientRef.current) {
      const client = new WebSocketClient({
        url,
        token,
        autoReconnect: true,
        reconnectInterval: 3000,
        maxReconnectAttempts: 5,
      })

      // Subscribe to status changes
      client.onStatusChange(setStatus)

      clientRef.current = client

      // Auto-connect if enabled
      if (autoConnect) {
        client.connect()
      }
    }

    // Cleanup on unmount only
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }
    }
  }, []) // Empty deps - create connection once for stability

  const subscribe = (eventType: EventType, handler: EventHandler) => {
    if (!clientRef.current) {
      console.warn('WebSocket client not initialized')
      return () => {}
    }
    return clientRef.current.on(eventType, handler)
  }

  const value: WebSocketContextValue = {
    client: clientRef.current,
    status,
    isConnected: status === ConnectionStatus.CONNECTED,
    subscribe,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider')
  }
  return context
}
