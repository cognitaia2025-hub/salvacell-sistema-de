import { db } from './db'
import type { DBClient, DBDevice, DBOrder } from './schema'
import type { Order, Client, InventoryItem } from '../types'

export async function migrateFromKVToRelationalDB() {
  const existingOrders = await window.spark.kv.get<any[]>('orders')
  const existingInventory = await window.spark.kv.get<any[]>('inventory')
  
  if (!existingOrders || existingOrders.length === 0) {
    console.log('No existing data to migrate')
    return
  }

  console.log(`Migrating ${existingOrders.length} orders to relational DB...`)

  for (const oldOrder of existingOrders) {
    try {
      let client = await db.searchClients(oldOrder.client.phone)
      let dbClient: DBClient
      
      if (client.length === 0) {
        dbClient = await db.insertClient({
          name: oldOrder.client.name,
          phone: oldOrder.client.phone,
          alternatePhone: oldOrder.client.alternatePhone,
          alternateContact: oldOrder.client.alternateContact,
          email: oldOrder.client.email
        })
      } else {
        dbClient = client[0]
      }

      const dbDevice = await db.insertDevice({
        clientId: dbClient.id,
        brand: oldOrder.device.brand,
        model: oldOrder.device.model,
        imei: oldOrder.device.imei
      })

      const dbOrder = await db.insertOrder({
        folio: oldOrder.folio,
        clientId: dbClient.id,
        deviceId: dbDevice.id,
        status: oldOrder.status,
        priority: oldOrder.priority,
        problemDescription: oldOrder.problem,
        technicalDiagnosis: oldOrder.diagnosis,
        services: oldOrder.services,
        estimatedCost: oldOrder.estimatedCost,
        estimatedDelivery: oldOrder.estimatedDelivery,
        devicePassword: oldOrder.device.password,
        accessories: oldOrder.device.accessories,
        paymentStatus: oldOrder.paymentStatus,
        totalAmount: oldOrder.estimatedCost,
        paidAmount: 0,
        createdBy: 'migration'
      })

      if (oldOrder.statusHistory && oldOrder.statusHistory.length > 0) {
        for (const history of oldOrder.statusHistory.slice(1)) {
          await db.insertOrderHistory({
            orderId: dbOrder.id,
            status: history.status,
            notes: history.notes,
            changedBy: history.userName
          })
        }
      }

      if (oldOrder.payments && oldOrder.payments.length > 0) {
        for (const payment of oldOrder.payments) {
          await db.insertPayment({
            orderId: dbOrder.id,
            amount: payment.amount,
            method: payment.method,
            notes: payment.notes,
            createdBy: payment.userName
          })
        }
      }

      if (oldOrder.photos && oldOrder.photos.length > 0) {
        for (const photo of oldOrder.photos) {
          await db.insertOrderPhoto({
            orderId: dbOrder.id,
            photoData: photo,
            isPublic: true,
            uploadedBy: 'migration'
          })
        }
      }

    } catch (error) {
      console.error(`Failed to migrate order ${oldOrder.folio}:`, error)
    }
  }

  if (existingInventory && existingInventory.length > 0) {
    console.log(`Migrating ${existingInventory.length} inventory items...`)
    
    for (const oldItem of existingInventory) {
      try {
        await db.insertInventoryItem({
          sku: oldItem.sku,
          name: oldItem.name,
          category: oldItem.category,
          description: '',
          purchasePrice: oldItem.buyPrice,
          salePrice: oldItem.sellPrice,
          currentStock: oldItem.currentStock,
          minStock: oldItem.minStock,
          location: oldItem.location
        })
      } catch (error) {
        console.error(`Failed to migrate inventory item ${oldItem.sku}:`, error)
      }
    }
  }

  console.log('Migration completed successfully')
}

export function mapDBOrderToOrder(dbOrder: Awaited<ReturnType<typeof db.getOrderWithRelations>>): Order | null {
  if (!dbOrder || !dbOrder.client || !dbOrder.device) return null

  const client: Client = {
    id: dbOrder.client.id,
    name: dbOrder.client.name,
    phone: dbOrder.client.phone,
    alternatePhone: dbOrder.client.alternatePhone,
    alternateContact: dbOrder.client.alternateContact,
    email: dbOrder.client.email,
    createdAt: dbOrder.client.createdAt
  }

  const statusHistory = dbOrder.history.map(h => ({
    id: h.id,
    status: h.status === 'waiting-parts' ? 'waiting_parts' as const : h.status === 'repairing' ? 'in_repair' as const : h.status,
    timestamp: h.createdAt,
    userId: h.changedBy || 'system',
    userName: h.changedBy || 'Sistema',
    notes: h.notes
  }))

  const payments = dbOrder.payments.map(p => ({
    id: p.id,
    amount: p.amount,
    method: p.method,
    timestamp: p.createdAt,
    userId: p.createdBy || 'system',
    userName: p.createdBy || 'Sistema',
    notes: p.notes
  }))

  const photos = dbOrder.photos.filter(p => p.isPublic).map(p => p.photoData)

  return {
    id: dbOrder.id,
    folio: dbOrder.folio,
    clientId: dbOrder.clientId,
    client,
    device: {
      brand: dbOrder.device.brand,
      model: dbOrder.device.model,
      imei: dbOrder.device.imei,
      password: dbOrder.devicePassword,
      accessories: dbOrder.accessories
    },
    problem: dbOrder.problemDescription,
    diagnosis: dbOrder.technicalDiagnosis,
    services: dbOrder.services,
    estimatedCost: dbOrder.totalAmount,
    estimatedDelivery: dbOrder.estimatedDelivery,
    priority: dbOrder.priority,
    status: dbOrder.status === 'waiting-parts' ? 'waiting_parts' : dbOrder.status === 'repairing' ? 'in_repair' : dbOrder.status,
    paymentStatus: dbOrder.paymentStatus,
    createdAt: dbOrder.createdAt,
    updatedAt: dbOrder.updatedAt,
    statusHistory,
    payments,
    photos,
    qrCode: dbOrder.folio
  }
}

export function mapDBInventoryItemToInventoryItem(dbItem: Awaited<ReturnType<typeof db.getInventoryItemById>>): InventoryItem | null {
  if (!dbItem) return null

  return {
    id: dbItem.id,
    sku: dbItem.sku,
    name: dbItem.name,
    category: dbItem.category,
    buyPrice: dbItem.purchasePrice,
    sellPrice: dbItem.salePrice,
    currentStock: dbItem.currentStock,
    minStock: dbItem.minStock,
    location: dbItem.location
  }
}
