import { useState, useEffect, useCallback } from 'react'
import { ordersAPI, clientsAPI, inventoryAPI, type OrderCreateData, type OrderUpdateData } from '@/lib/api'
import type { DBOrder, DBClient, DBInventoryItem } from '@/lib/database/schema'

export function useRelationalDB() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        // Check API connection
        await fetch('/api/health').catch(() => {})
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize:', error)
        setIsInitialized(true) // Continue anyway
      }
    }
    init()
  }, [])

  return { isInitialized }
}

export function useOrders() {
  const [orders, setOrders] = useState<DBOrder[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const allOrders = await ordersAPI.getAll()
      setOrders(allOrders)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const createOrder = useCallback(async (orderData: OrderCreateData) => {
    const newOrder = await ordersAPI.create(orderData)
    await loadOrders()
    return newOrder
  }, [loadOrders])

  const updateOrder = useCallback(async (orderId: string, updates: OrderUpdateData) => {
    const updated = await ordersAPI.update(orderId, updates)
    await loadOrders()
    return updated
  }, [loadOrders])

  const searchOrders = useCallback(async (query: string) => {
    return await db.searchOrders(query)
  }, [])

  const getOrderWithRelations = useCallback(async (orderId: string) => {
    return await db.getOrderWithRelations(orderId)
  }, [])

  const getOrderByFolio = useCallback(async (folio: string) => {
    return await db.getOrderByFolio(folio)
  }, [])

  return {
    orders,
    loading,
    createOrder,
    updateOrder,
    searchOrders,
    getOrderWithRelations,
    getOrderByFolio,
    refresh: loadOrders
  }
}

export function useClients() {
  const [clients, setClients] = useState<DBClient[]>([])
  const [loading, setLoading] = useState(true)

  const loadClients = useCallback(async () => {
    setLoading(true)
    try {
      const allClients = await db.getAllClients()
      setClients(allClients)
    } catch (error) {
      console.error('Failed to load clients:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const createClient = useCallback(async (clientData: Parameters<typeof db.insertClient>[0]) => {
    const newClient = await db.insertClient(clientData)
    await loadClients()
    return newClient
  }, [loadClients])

  const updateClient = useCallback(async (clientId: string, updates: Parameters<typeof db.updateClient>[1]) => {
    const updated = await db.updateClient(clientId, updates)
    await loadClients()
    return updated
  }, [loadClients])

  const searchClients = useCallback(async (query: string) => {
    return await db.searchClients(query)
  }, [])

  const getClientWithStats = useCallback(async (clientId: string) => {
    return await db.getClientWithStats(clientId)
  }, [])

  return {
    clients,
    loading,
    createClient,
    updateClient,
    searchClients,
    getClientWithStats,
    refresh: loadClients
  }
}

export function useInventory() {
  const [items, setItems] = useState<DBInventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const allItems = await db.getAllInventoryItems()
      setItems(allItems)
    } catch (error) {
      console.error('Failed to load inventory:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const createItem = useCallback(async (itemData: Parameters<typeof db.insertInventoryItem>[0]) => {
    const newItem = await db.insertInventoryItem(itemData)
    await loadItems()
    return newItem
  }, [loadItems])

  const updateItem = useCallback(async (itemId: string, updates: Parameters<typeof db.updateInventoryItem>[1]) => {
    const updated = await db.updateInventoryItem(itemId, updates)
    await loadItems()
    return updated
  }, [loadItems])

  const deleteItem = useCallback(async (itemId: string) => {
    const deleted = await db.deleteInventoryItem(itemId)
    if (deleted) {
      await loadItems()
    }
    return deleted
  }, [loadItems])

  const addMovement = useCallback(async (movementData: Parameters<typeof db.insertInventoryMovement>[0]) => {
    const movement = await db.insertInventoryMovement(movementData)
    await loadItems()
    return movement
  }, [loadItems])

  const getStats = useCallback(async () => {
    return await db.getInventoryStats()
  }, [])

  return {
    items,
    loading,
    createItem,
    updateItem,
    deleteItem,
    addMovement,
    getStats,
    refresh: loadItems
  }
}

export function usePayments(orderId: string) {
  const [payments, setPayments] = useState<Awaited<ReturnType<typeof db.getPaymentsByOrderId>>>([])
  const [loading, setLoading] = useState(true)

  const loadPayments = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const orderPayments = await db.getPaymentsByOrderId(orderId)
      setPayments(orderPayments)
    } catch (error) {
      console.error('Failed to load payments:', error)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const addPayment = useCallback(async (paymentData: Parameters<typeof db.insertPayment>[0]) => {
    const newPayment = await db.insertPayment(paymentData)
    await loadPayments()
    return newPayment
  }, [loadPayments])

  return {
    payments,
    loading,
    addPayment,
    refresh: loadPayments
  }
}

export function useOrderHistory(orderId: string) {
  const [history, setHistory] = useState<Awaited<ReturnType<typeof db.getOrderHistory>>>([])
  const [loading, setLoading] = useState(true)

  const loadHistory = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const orderHistory = await db.getOrderHistory(orderId)
      setHistory(orderHistory)
    } catch (error) {
      console.error('Failed to load order history:', error)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const addHistoryEntry = useCallback(async (historyData: Parameters<typeof db.insertOrderHistory>[0]) => {
    const newEntry = await db.insertOrderHistory(historyData)
    await loadHistory()
    return newEntry
  }, [loadHistory])

  return {
    history,
    loading,
    addHistoryEntry,
    refresh: loadHistory
  }
}
