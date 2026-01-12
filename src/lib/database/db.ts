import type {
  Database,
  DBClient,
  DBDevice,
  DBOrder,
  DBOrderHistory,
  DBOrderPhoto,
  DBPayment,
  DBInventoryItem,
  DBInventoryMovement,
  INITIAL_DATABASE
} from './schema'

class RelationalDB {
  private async getDB(): Promise<Database> {
    const db = await window.spark.kv.get<Database>('relational_db')
    if (!db) {
      const initial: Database = {
        clients: [],
        devices: [],
        orders: [],
        orderHistory: [],
        orderPhotos: [],
        payments: [],
        inventoryItems: [],
        inventoryMovements: []
      }
      await window.spark.kv.set('relational_db', initial)
      return initial
    }
    return db
  }

  private async saveDB(db: Database): Promise<void> {
    await window.spark.kv.set('relational_db', db)
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async insertClient(client: Omit<DBClient, 'id' | 'createdAt' | 'updatedAt'>): Promise<DBClient> {
    const db = await this.getDB()
    const newClient: DBClient = {
      ...client,
      id: this.generateId('client'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.clients.push(newClient)
    await this.saveDB(db)
    return newClient
  }

  async updateClient(id: string, updates: Partial<Omit<DBClient, 'id' | 'createdAt'>>): Promise<DBClient | null> {
    const db = await this.getDB()
    const index = db.clients.findIndex(c => c.id === id)
    if (index === -1) return null
    
    db.clients[index] = {
      ...db.clients[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    await this.saveDB(db)
    return db.clients[index]
  }

  async getClientById(id: string): Promise<DBClient | null> {
    const db = await this.getDB()
    return db.clients.find(c => c.id === id) || null
  }

  async searchClients(query: string): Promise<DBClient[]> {
    const db = await this.getDB()
    const lowerQuery = query.toLowerCase()
    return db.clients.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.phone.includes(query) ||
      c.email?.toLowerCase().includes(lowerQuery)
    )
  }

  async getAllClients(): Promise<DBClient[]> {
    const db = await this.getDB()
    return db.clients
  }

  async insertDevice(device: Omit<DBDevice, 'id' | 'createdAt' | 'updatedAt'>): Promise<DBDevice> {
    const db = await this.getDB()
    
    const clientExists = db.clients.some(c => c.id === device.clientId)
    if (!clientExists) {
      throw new Error('Foreign key constraint failed: clientId does not exist')
    }

    const newDevice: DBDevice = {
      ...device,
      id: this.generateId('device'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.devices.push(newDevice)
    await this.saveDB(db)
    return newDevice
  }

  async getDeviceById(id: string): Promise<DBDevice | null> {
    const db = await this.getDB()
    return db.devices.find(d => d.id === id) || null
  }

  async getDevicesByClientId(clientId: string): Promise<DBDevice[]> {
    const db = await this.getDB()
    return db.devices.filter(d => d.clientId === clientId)
  }

  async insertOrder(order: Omit<DBOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<DBOrder> {
    const db = await this.getDB()
    
    const clientExists = db.clients.some(c => c.id === order.clientId)
    if (!clientExists) {
      throw new Error('Foreign key constraint failed: clientId does not exist')
    }

    const deviceExists = db.devices.some(d => d.id === order.deviceId)
    if (!deviceExists) {
      throw new Error('Foreign key constraint failed: deviceId does not exist')
    }

    const newOrder: DBOrder = {
      ...order,
      id: this.generateId('order'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.orders.push(newOrder)
    await this.saveDB(db)
    
    await this.insertOrderHistory({
      orderId: newOrder.id,
      status: newOrder.status,
      notes: 'Orden creada',
      changedBy: order.createdBy
    })
    
    return newOrder
  }

  async updateOrder(id: string, updates: Partial<Omit<DBOrder, 'id' | 'createdAt'>>): Promise<DBOrder | null> {
    const db = await this.getDB()
    const index = db.orders.findIndex(o => o.id === id)
    if (index === -1) return null
    
    const oldStatus = db.orders[index].status
    
    db.orders[index] = {
      ...db.orders[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    await this.saveDB(db)
    
    if (updates.status && updates.status !== oldStatus) {
      await this.insertOrderHistory({
        orderId: id,
        status: updates.status,
        notes: updates.technicalDiagnosis,
        changedBy: undefined
      })
    }
    
    return db.orders[index]
  }

  async getOrderById(id: string): Promise<DBOrder | null> {
    const db = await this.getDB()
    return db.orders.find(o => o.id === id) || null
  }

  async getOrderByFolio(folio: string): Promise<DBOrder | null> {
    const db = await this.getDB()
    return db.orders.find(o => o.folio === folio) || null
  }

  async getOrdersByClientId(clientId: string): Promise<DBOrder[]> {
    const db = await this.getDB()
    return db.orders.filter(o => o.clientId === clientId)
  }

  async getAllOrders(): Promise<DBOrder[]> {
    const db = await this.getDB()
    return db.orders
  }

  async searchOrders(query: string): Promise<DBOrder[]> {
    const db = await this.getDB()
    const lowerQuery = query.toLowerCase()
    
    const matchingOrders = db.orders.filter(o => 
      o.folio.toLowerCase().includes(lowerQuery)
    )

    const devices = db.devices.filter(d => 
      d.brand.toLowerCase().includes(lowerQuery) ||
      d.model.toLowerCase().includes(lowerQuery) ||
      d.imei.includes(query)
    )
    const deviceIds = new Set(devices.map(d => d.id))
    const ordersByDevice = db.orders.filter(o => deviceIds.has(o.deviceId))

    const clients = db.clients.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.phone.includes(query)
    )
    const clientIds = new Set(clients.map(c => c.id))
    const ordersByClient = db.orders.filter(o => clientIds.has(o.clientId))

    const allOrders = [...matchingOrders, ...ordersByDevice, ...ordersByClient]
    const uniqueOrders = Array.from(new Map(allOrders.map(o => [o.id, o])).values())
    
    return uniqueOrders
  }

  async insertOrderHistory(history: Omit<DBOrderHistory, 'id' | 'createdAt'>): Promise<DBOrderHistory> {
    const db = await this.getDB()
    
    const orderExists = db.orders.some(o => o.id === history.orderId)
    if (!orderExists) {
      throw new Error('Foreign key constraint failed: orderId does not exist')
    }

    const newHistory: DBOrderHistory = {
      ...history,
      id: this.generateId('history'),
      createdAt: new Date().toISOString()
    }
    db.orderHistory.push(newHistory)
    await this.saveDB(db)
    return newHistory
  }

  async getOrderHistory(orderId: string): Promise<DBOrderHistory[]> {
    const db = await this.getDB()
    return db.orderHistory
      .filter(h => h.orderId === orderId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  async insertOrderPhoto(photo: Omit<DBOrderPhoto, 'id' | 'createdAt'>): Promise<DBOrderPhoto> {
    const db = await this.getDB()
    
    const orderExists = db.orders.some(o => o.id === photo.orderId)
    if (!orderExists) {
      throw new Error('Foreign key constraint failed: orderId does not exist')
    }

    const newPhoto: DBOrderPhoto = {
      ...photo,
      id: this.generateId('photo'),
      createdAt: new Date().toISOString()
    }
    db.orderPhotos.push(newPhoto)
    await this.saveDB(db)
    return newPhoto
  }

  async getOrderPhotos(orderId: string): Promise<DBOrderPhoto[]> {
    const db = await this.getDB()
    return db.orderPhotos.filter(p => p.orderId === orderId)
  }

  async insertPayment(payment: Omit<DBPayment, 'id' | 'createdAt'>): Promise<DBPayment> {
    const db = await this.getDB()
    
    const orderExists = db.orders.some(o => o.id === payment.orderId)
    if (!orderExists) {
      throw new Error('Foreign key constraint failed: orderId does not exist')
    }

    const newPayment: DBPayment = {
      ...payment,
      id: this.generateId('payment'),
      createdAt: new Date().toISOString()
    }
    db.payments.push(newPayment)
    await this.saveDB(db)

    const order = await this.getOrderById(payment.orderId)
    if (order) {
      const totalPaid = await this.getTotalPaidForOrder(payment.orderId)
      let newStatus: DBOrder['paymentStatus'] = 'pending'
      if (totalPaid >= order.totalAmount) {
        newStatus = 'paid'
      } else if (totalPaid > 0) {
        newStatus = 'partial'
      }
      await this.updateOrder(payment.orderId, {
        paidAmount: totalPaid,
        paymentStatus: newStatus
      })
    }
    
    return newPayment
  }

  async getPaymentsByOrderId(orderId: string): Promise<DBPayment[]> {
    const db = await this.getDB()
    return db.payments
      .filter(p => p.orderId === orderId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  async getTotalPaidForOrder(orderId: string): Promise<number> {
    const payments = await this.getPaymentsByOrderId(orderId)
    return payments.reduce((sum, p) => sum + p.amount, 0)
  }

  async insertInventoryItem(item: Omit<DBInventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<DBInventoryItem> {
    const db = await this.getDB()
    const newItem: DBInventoryItem = {
      ...item,
      id: this.generateId('item'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.inventoryItems.push(newItem)
    await this.saveDB(db)
    return newItem
  }

  async updateInventoryItem(id: string, updates: Partial<Omit<DBInventoryItem, 'id' | 'createdAt'>>): Promise<DBInventoryItem | null> {
    const db = await this.getDB()
    const index = db.inventoryItems.findIndex(i => i.id === id)
    if (index === -1) return null
    
    db.inventoryItems[index] = {
      ...db.inventoryItems[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    await this.saveDB(db)
    return db.inventoryItems[index]
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    const db = await this.getDB()
    const index = db.inventoryItems.findIndex(i => i.id === id)
    if (index === -1) return false
    
    db.inventoryItems.splice(index, 1)
    await this.saveDB(db)
    return true
  }

  async getInventoryItemById(id: string): Promise<DBInventoryItem | null> {
    const db = await this.getDB()
    return db.inventoryItems.find(i => i.id === id) || null
  }

  async getAllInventoryItems(): Promise<DBInventoryItem[]> {
    const db = await this.getDB()
    return db.inventoryItems
  }

  async insertInventoryMovement(movement: Omit<DBInventoryMovement, 'id' | 'createdAt'>): Promise<DBInventoryMovement> {
    const db = await this.getDB()
    
    const itemExists = db.inventoryItems.some(i => i.id === movement.itemId)
    if (!itemExists) {
      throw new Error('Foreign key constraint failed: itemId does not exist')
    }

    const newMovement: DBInventoryMovement = {
      ...movement,
      id: this.generateId('movement'),
      createdAt: new Date().toISOString()
    }
    db.inventoryMovements.push(newMovement)
    await this.saveDB(db)

    const item = db.inventoryItems.find(i => i.id === movement.itemId)
    if (item) {
      let newStock = item.currentStock
      if (movement.type === 'entry') {
        newStock += movement.quantity
      } else if (movement.type === 'exit') {
        newStock -= movement.quantity
      } else if (movement.type === 'adjustment') {
        newStock = movement.quantity
      }
      await this.updateInventoryItem(movement.itemId, { currentStock: newStock })
    }
    
    return newMovement
  }

  async getInventoryMovements(itemId: string): Promise<DBInventoryMovement[]> {
    const db = await this.getDB()
    return db.inventoryMovements
      .filter(m => m.itemId === itemId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async getOrderWithRelations(orderId: string) {
    const order = await this.getOrderById(orderId)
    if (!order) return null

    const client = await this.getClientById(order.clientId)
    const device = await this.getDeviceById(order.deviceId)
    const history = await this.getOrderHistory(orderId)
    const photos = await this.getOrderPhotos(orderId)
    const payments = await this.getPaymentsByOrderId(orderId)

    return {
      ...order,
      client,
      device,
      history,
      photos,
      payments
    }
  }

  async getOrderWithRelationsByFolio(folio: string) {
    const order = await this.getOrderByFolio(folio)
    if (!order) return null

    return this.getOrderWithRelations(order.id)
  }

  async getClientWithStats(clientId: string) {
    const client = await this.getClientById(clientId)
    if (!client) return null

    const orders = await this.getOrdersByClientId(clientId)
    const devices = await this.getDevicesByClientId(clientId)
    
    const totalSpent = orders.reduce((sum, o) => sum + o.paidAmount, 0)
    const totalOrders = orders.length

    let tier: 'new' | 'frequent' | 'vip' = 'new'
    if (totalOrders > 5) tier = 'vip'
    else if (totalOrders >= 3) tier = 'frequent'

    return {
      ...client,
      totalOrders,
      totalSpent,
      tier,
      orders,
      devices
    }
  }

  async getInventoryStats() {
    const items = await this.getAllInventoryItems()
    
    const totalValue = items.reduce((sum, i) => sum + (i.currentStock * i.salePrice), 0)
    const lowStockItems = items.filter(i => i.currentStock < i.minStock && i.currentStock > 0)
    const outOfStockItems = items.filter(i => i.currentStock === 0)

    return {
      totalItems: items.length,
      totalValue,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      lowStockItems,
      outOfStockItems
    }
  }
}

export const db = new RelationalDB()
