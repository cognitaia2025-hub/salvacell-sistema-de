import { api } from './client'

export interface OperationalStats {
  total_orders: number
  delivered: number
  in_progress: number
  cancelled: number
  urgent: number
  avg_repair_days: number
}

export interface FinancialStats {
  total_revenue: number
  total_pending: number
  avg_ticket: number
  by_method: {
    cash: number
    card: number
    transfer: number
  }
}

export interface InventoryStats {
  total_value: number
  sell_value: number
  low_stock: number
  out_of_stock: number
  total_items: number
  by_category: Array<{ name: string; value: number }>
}

export interface ClientStats {
  total_clients: number
  recurring: number
  new_clients: number
  top_clients: Array<{ name: string; orders: number; spent: number }>
}

export interface DashboardSummary {
  operational: OperationalStats
  financial: FinancialStats
  inventory: InventoryStats
  clients: ClientStats
}

export interface OrderTrend {
  date: string
  orders: number
}

export interface StatusDistribution {
  name: string
  value: number
}

export type ReportPeriod = '7d' | '30d' | '90d' | '1y' | 'all'

export const reportsAPI = {
  // Get operational stats
  getOperational: (period: ReportPeriod = '30d') =>
    api.get<OperationalStats>(`/reports/operational?period=${period}`),

  // Get financial stats
  getFinancial: (period: ReportPeriod = '30d') =>
    api.get<FinancialStats>(`/reports/financial?period=${period}`),

  // Get inventory stats
  getInventory: () =>
    api.get<InventoryStats>('/reports/inventory'),

  // Get client stats
  getClients: (period: ReportPeriod = '30d') =>
    api.get<ClientStats>(`/reports/clients?period=${period}`),

  // Get orders trend
  getOrdersTrend: (period: ReportPeriod = '30d') =>
    api.get<OrderTrend[]>(`/reports/orders-trend?period=${period}`),

  // Get orders by status
  getOrdersByStatus: (period: ReportPeriod = '30d') =>
    api.get<StatusDistribution[]>(`/reports/orders-by-status?period=${period}`),

  // Get complete dashboard summary
  getDashboard: (period: ReportPeriod = '30d') =>
    api.get<DashboardSummary>(`/reports/dashboard?period=${period}`),
}
