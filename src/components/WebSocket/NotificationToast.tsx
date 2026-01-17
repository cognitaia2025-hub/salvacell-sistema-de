/**
 * Notification Toast Component
 * Displays real-time notifications from WebSocket events
 */

import { useEffect } from 'react'
import { toast } from 'sonner'
import { EventType } from '@/lib/websocket/types'
import { useWebSocketEvents } from '@/hooks/use-websocket'

export function NotificationToast() {
  useWebSocketEvents({
    [EventType.NOTIFICATION]: (event) => {
      const { message, severity = 'info' } = event.data
      
      switch (severity) {
        case 'error':
          toast.error(message)
          break
        case 'warning':
          toast.warning(message)
          break
        case 'success':
          toast.success(message)
          break
        default:
          toast.info(message)
      }
    },
    [EventType.ORDER_CREATED]: (event) => {
      const { folio } = event.data
      toast.success(`Nueva orden creada: ${folio}`)
    },
    [EventType.ORDER_UPDATED]: (event) => {
      const { folio } = event.data
      toast.info(`Orden actualizada: ${folio}`)
    },
    [EventType.ORDER_STATUS_CHANGED]: (event) => {
      const { folio, status } = event.data
      toast.info(`Orden ${folio} cambió a estado: ${status}`)
    },
    [EventType.CLIENT_CREATED]: (event) => {
      const { nombre } = event.data
      toast.success(`Nuevo cliente: ${nombre}`)
    },
    [EventType.CLIENT_UPDATED]: (event) => {
      const { nombre } = event.data
      toast.info(`Cliente actualizado: ${nombre}`)
    },
    [EventType.INVENTORY_UPDATED]: (event) => {
      const { nombre } = event.data
      toast.info(`Inventario actualizado: ${nombre}`)
    },
    [EventType.STOCK_LOW]: (event) => {
      const { nombre, cantidad } = event.data
      toast.warning(`Stock bajo: ${nombre} (${cantidad} unidades)`)
    },
  })

  // This component doesn't render anything
  return null
}
