/**
 * WebSocket Integration Examples - Frontend
 * Demonstrates how to use WebSocket in React components
 */

// Example 1: Orders List with Real-time Updates
// File: src/components/OrdersList.tsx

import { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/use-websocket'
import { EventType } from '@/lib/websocket/types'
import { toast } from 'sonner'

export function OrdersList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch initial orders
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const response = await fetch('/api/orders')
    const data = await response.json()
    setOrders(data)
    setLoading(false)
  }

  // Listen for new orders
  useWebSocket(EventType.ORDER_CREATED, (event) => {
    const newOrder = event.data
    
    // Add to list
    setOrders(prev => [newOrder, ...prev])
    
    // Show notification
    toast.success(`Nueva orden: ${newOrder.folio}`)
    
    // Play sound (optional)
    new Audio('/notification.mp3').play()
  })

  // Listen for order updates
  useWebSocket(EventType.ORDER_UPDATED, (event) => {
    const updatedOrder = event.data
    
    setOrders(prev => 
      prev.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    )
  })

  // Listen for status changes
  useWebSocket(EventType.ORDER_STATUS_CHANGED, (event) => {
    const { id, new_status, folio } = event.data
    
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, status: new_status } : order
      )
    )
    
    toast.info(`Orden ${folio} cambió a: ${new_status}`)
  })

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Órdenes ({orders.length})</h2>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}


// Example 2: Dashboard with Multiple Event Types
// File: src/components/Dashboard.tsx

import { useWebSocketEvents } from '@/hooks/use-websocket'
import { EventType } from '@/lib/websocket/types'
import { useQueryClient } from '@tanstack/react-query'

export function Dashboard() {
  const queryClient = useQueryClient()

  // Handle multiple events
  useWebSocketEvents({
    [EventType.ORDER_CREATED]: (event) => {
      // Invalidate orders query to refetch
      queryClient.invalidateQueries(['orders'])
      
      // Update dashboard stats
      queryClient.setQueryData(['stats'], (old: any) => ({
        ...old,
        totalOrders: (old?.totalOrders || 0) + 1
      }))
    },
    
    [EventType.STOCK_LOW]: (event) => {
      const { nombre, cantidad } = event.data
      
      // Show urgent notification
      toast.error(`⚠️ Stock bajo: ${nombre} (${cantidad} unidades)`, {
        duration: 10000,
        important: true
      })
      
      // Invalidate inventory query
      queryClient.invalidateQueries(['inventory'])
    },
    
    [EventType.CLIENT_CREATED]: (event) => {
      queryClient.invalidateQueries(['clients'])
    },
    
    [EventType.INVENTORY_UPDATED]: (event) => {
      queryClient.invalidateQueries(['inventory'])
    }
  })

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Dashboard content */}
    </div>
  )
}


// Example 3: Order Details with Status Updates
// File: src/components/OrderDetails.tsx

import { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/use-websocket'
import { EventType } from '@/lib/websocket/types'

export function OrderDetails({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState(null)

  // Listen only for this specific order
  useWebSocket(EventType.ORDER_STATUS_CHANGED, (event) => {
    if (event.data.id === orderId) {
      setOrder(prev => ({
        ...prev,
        status: event.data.new_status,
        updated_at: event.data.updated_at
      }))
    }
  })

  useWebSocket(EventType.ORDER_UPDATED, (event) => {
    if (event.data.id === orderId) {
      setOrder(event.data)
    }
  })

  return (
    <div>
      <h2>Orden #{order?.folio}</h2>
      <p>Estado: {order?.status}</p>
      {/* More order details */}
    </div>
  )
}


// Example 4: Inventory Alert Component
// File: src/components/InventoryAlerts.tsx

import { useState } from 'react'
import { useWebSocket } from '@/hooks/use-websocket'
import { EventType } from '@/lib/websocket/types'
import { AlertCircle } from 'lucide-react'

export function InventoryAlerts() {
  const [lowStockItems, setLowStockItems] = useState([])

  useWebSocket(EventType.STOCK_LOW, (event) => {
    const item = event.data
    
    // Add to alerts list if not already there
    setLowStockItems(prev => {
      const exists = prev.some(i => i.id === item.id)
      if (exists) {
        return prev.map(i => i.id === item.id ? item : i)
      }
      return [...prev, item]
    })
  })

  useWebSocket(EventType.INVENTORY_UPDATED, (event) => {
    const { id, cantidad, stock_minimo } = event.data
    
    // Remove from alerts if stock is no longer low
    if (cantidad > stock_minimo) {
      setLowStockItems(prev => prev.filter(item => item.id !== id))
    }
  })

  if (lowStockItems.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border-2 border-red-500 rounded-lg p-4 max-w-sm shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="text-red-600" />
        <h3 className="font-bold text-red-800">Alertas de Stock Bajo</h3>
      </div>
      <ul className="space-y-1">
        {lowStockItems.map(item => (
          <li key={item.id} className="text-sm">
            <strong>{item.nombre}</strong>: {item.cantidad} unidades
            (mínimo: {item.stock_minimo})
          </li>
        ))}
      </ul>
    </div>
  )
}


// Example 5: Global WebSocket Status Monitor
// File: src/components/WebSocketMonitor.tsx

import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { ConnectionStatus } from '@/lib/websocket/types'
import { useEffect } from 'react'

export function WebSocketMonitor() {
  const { status, client, isConnected } = useWebSocketContext()

  useEffect(() => {
    if (isConnected) {
      console.log('✅ WebSocket connected')
      
      // Join specific rooms based on user role
      client?.joinRoom('orders')
      client?.joinRoom('inventory')
    }
  }, [isConnected, client])

  useEffect(() => {
    if (status === ConnectionStatus.ERROR) {
      console.error('❌ WebSocket connection error')
    }
  }, [status])

  // Component doesn't render anything
  // It just monitors the connection and logs events
  return null
}


// Example 6: Custom Hook for Order Notifications
// File: src/hooks/use-order-notifications.ts

import { useWebSocketEvents } from './use-websocket'
import { EventType } from '@/lib/websocket/types'
import { toast } from 'sonner'

export function useOrderNotifications() {
  useWebSocketEvents({
    [EventType.ORDER_CREATED]: (event) => {
      const { folio, cliente_nombre } = event.data
      toast.success(`Nueva orden ${folio} de ${cliente_nombre}`)
    },
    
    [EventType.ORDER_STATUS_CHANGED]: (event) => {
      const { folio, new_status } = event.data
      
      const statusMessages = {
        completed: `✅ Orden ${folio} completada`,
        cancelled: `❌ Orden ${folio} cancelada`,
        in_progress: `🔧 Orden ${folio} en progreso`,
        ready: `✅ Orden ${folio} lista para entrega`
      }
      
      const message = statusMessages[new_status] || `Orden ${folio} actualizada`
      toast.info(message)
    }
  })
}
