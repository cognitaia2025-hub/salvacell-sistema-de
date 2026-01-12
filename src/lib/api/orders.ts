import { api } from './client'
import type { DBOrder, DBOrderHistory } from '../database/schema'

export interface OrderCreateData {
  client_id: string
  device_id?: string
  technician_id?: string
  priority?: 'normal' | 'urgent'
  problem_description: string
  diagnosis?: string
  solution?: string
  estimated_cost?: number
  final_cost?: number
  estimated_delivery_date?: string
}

export interface OrderUpdateData extends Partial<OrderCreateData> {
  status?: 'received' | 'diagnosing' | 'waiting_parts' | 'in_repair' | 'repaired' | 'delivered' | 'cancelled'
  actual_delivery_date?: string
}

export const ordersAPI = {
  // Get all orders with filters
  getAll: (params?: {
    skip?: number
    limit?: number
    status?: string
    search?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.skip) searchParams.append('skip', params.skip.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.status) searchParams.append('status', params.status)
    if (params?.search) searchParams.append('search', params.search)

    const query = searchParams.toString()
    return api.get<DBOrder[]>(`/orders${query ? `?${query}` : ''}`)
  },

  // Get order by ID
  getById: (orderId: string) =>
    api.get<DBOrder>(`/orders/${orderId}`),

  // Get order by folio
  getByFolio: (folio: string) =>
    api.get<DBOrder>(`/orders/folio/${folio}`),

  // Get order by QR code (public endpoint)
  getByQR: (qrCode: string) =>
    api.get<DBOrder>(`/orders/qr/${qrCode}`, { requiresAuth: false }),

  // Create new order
  create: (data: OrderCreateData) =>
    api.post<DBOrder>('/orders', data),

  // Update order
  update: (orderId: string, data: OrderUpdateData) =>
    api.put<DBOrder>(`/orders/${orderId}`, data),

  // Delete order
  delete: (orderId: string) =>
    api.delete(`/orders/${orderId}`),

  // Get order history
  getHistory: (orderId: string) =>
    api.get<DBOrderHistory[]>(`/orders/${orderId}/history`),

  // Add history entry
  addHistory: (orderId: string, data: { status: string; notes?: string }) =>
    api.post<DBOrderHistory>(`/orders/${orderId}/history`, data),
}
