import { api } from './client'

export interface Payment {
  id: string
  order_id: string
  amount: number
  method: 'cash' | 'card' | 'transfer'
  status: 'pending' | 'partial' | 'paid'
  reference?: string
  notes?: string
  created_at: string
  created_by?: string
}

export interface PaymentCreate {
  order_id: string
  amount: number
  method: 'cash' | 'card' | 'transfer'
  reference?: string
  notes?: string
}

export interface PaymentUpdate {
  status?: 'pending' | 'partial' | 'paid'
  notes?: string
}

export interface PaymentSummary {
  order_id: string
  estimated_cost: number
  final_cost: number
  total_paid: number
  pending: number
  payment_status: 'pending' | 'partial' | 'paid'
  payment_count: number
}

export const paymentsAPI = {
  // Create new payment
  create: (data: PaymentCreate) =>
    api.post<Payment>('/payments', data),

  // Get all payments
  getAll: (params?: {
    skip?: number
    limit?: number
    order_id?: string
    method?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.skip) searchParams.append('skip', params.skip.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.order_id) searchParams.append('order_id', params.order_id)
    if (params?.method) searchParams.append('method', params.method)

    const query = searchParams.toString()
    return api.get<Payment[]>(`/payments${query ? `?${query}` : ''}`)
  },

  // Get payment by ID
  getById: (paymentId: string) =>
    api.get<Payment>(`/payments/${paymentId}`),

  // Get payments for an order
  getByOrder: (orderId: string) =>
    api.get<Payment[]>(`/payments/order/${orderId}`),

  // Get payment summary for an order
  getOrderSummary: (orderId: string) =>
    api.get<PaymentSummary>(`/payments/order/${orderId}/summary`),

  // Update payment
  update: (paymentId: string, data: PaymentUpdate) =>
    api.put<Payment>(`/payments/${paymentId}`, data),

  // Delete payment
  delete: (paymentId: string) =>
    api.delete(`/payments/${paymentId}`),
}
