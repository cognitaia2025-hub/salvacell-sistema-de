/**
 * useWebSocket Hook
 * Custom hook for subscribing to WebSocket events
 */

import { useEffect } from 'react'
import { EventType, EventHandler } from '@/lib/websocket/types'
import { useWebSocketContext } from '@/contexts/WebSocketContext'

/**
 * Subscribe to WebSocket events
 * @param eventType - Type of event to listen for
 * @param handler - Event handler function
 */
export function useWebSocket(eventType: EventType, handler: EventHandler) {
  const { subscribe, isConnected } = useWebSocketContext()

  useEffect(() => {
    if (!isConnected) {
      return
    }

    const unsubscribe = subscribe(eventType, handler)

    return () => {
      unsubscribe()
    }
  }, [eventType, handler, subscribe, isConnected])
}

/**
 * Subscribe to multiple WebSocket events
 * @param handlers - Map of event types to handlers
 */
export function useWebSocketEvents(handlers: Partial<Record<EventType, EventHandler>>) {
  const { subscribe, isConnected } = useWebSocketContext()

  useEffect(() => {
    if (!isConnected) {
      return
    }

    const unsubscribers = Object.entries(handlers).map(([eventType, handler]) => {
      if (handler) {
        return subscribe(eventType as EventType, handler)
      }
      return () => {}
    })

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  }, [handlers, subscribe, isConnected])
}
