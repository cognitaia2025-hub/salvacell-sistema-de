/**
 * useWebSocket Hook
 * Custom hook for subscribing to WebSocket events
 */

import { useEffect, useRef } from 'react'
import { EventType, EventHandler, WebSocketEvent } from '@/lib/websocket/types'
import { useWebSocketContext } from '@/contexts/WebSocketContext'

/**
 * Subscribe to WebSocket events
 * @param eventType - Type of event to listen for
 * @param handler - Event handler function
 * 
 * Note: Handler should be wrapped in useCallback in the calling component
 * to avoid unnecessary re-subscriptions
 */
export function useWebSocket(eventType: EventType, handler: EventHandler) {
  const { subscribe, isConnected } = useWebSocketContext()
  const handlerRef = useRef(handler)

  // Update handler ref when it changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!isConnected) {
      return
    }

    // Use stable handler from ref
    const stableHandler = (event: WebSocketEvent) => handlerRef.current(event)
    const unsubscribe = subscribe(eventType, stableHandler)

    return () => {
      unsubscribe()
    }
  }, [eventType, subscribe, isConnected])
}

/**
 * Subscribe to multiple WebSocket events
 * @param handlers - Map of event types to handlers
 * 
 * Note: Handlers object should be memoized with useMemo in the calling component
 * to avoid unnecessary re-subscriptions
 */
export function useWebSocketEvents(handlers: Partial<Record<EventType, EventHandler>>) {
  const { subscribe, isConnected } = useWebSocketContext()
  const handlersRef = useRef(handlers)

  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  useEffect(() => {
    if (!isConnected) {
      return
    }

    const unsubscribers = Object.entries(handlersRef.current).map(([eventType, handler]) => {
      if (typeof handler === 'function') {
        // Wrap handler to use latest version from ref
        const stableHandler = (event: WebSocketEvent) => {
          const currentHandler = handlersRef.current[eventType as EventType]
          if (typeof currentHandler === 'function') {
            currentHandler(event)
          }
        }
        return subscribe(eventType as EventType, stableHandler)
      }
      return () => {}
    })

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  }, [subscribe, isConnected])
}
