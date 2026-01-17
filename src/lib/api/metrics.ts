import { api } from './client'

// ============= Types =============
export interface UserEngagementMetrics {
  daily_active_users: number
  monthly_active_users: number
  user_retention_rate: number
  total_registered_users: number
  active_users_today: number
  new_users_this_month: number
}

export interface SystemPerformanceMetrics {
  avg_response_time_ms: number
  system_uptime_percent: number
  total_requests: number
  error_rate_percent: number
  active_sessions: number
}

export interface OperationalMetrics {
  total_orders_today: number
  orders_in_progress: number
  orders_completed_today: number
  pending_orders: number
  revenue_today: number
  customer_satisfaction_score: number
}

export interface DashboardMetrics {
  user_engagement: UserEngagementMetrics
  system_performance: SystemPerformanceMetrics
  operational: OperationalMetrics
}

// ============= API Functions =============
export const metricsAPI = {
  /**
   * Get user engagement metrics (DAU, MAU, retention rate)
   */
  getUserEngagement: async (): Promise<UserEngagementMetrics> => {
    return api.get('/metrics/user-engagement')
  },

  /**
   * Get system performance metrics (response time, uptime, error rates)
   */
  getSystemPerformance: async (): Promise<SystemPerformanceMetrics> => {
    return api.get('/metrics/system-performance')
  },

  /**
   * Get operational metrics for today
   */
  getOperational: async (): Promise<OperationalMetrics> => {
    return api.get('/metrics/operational')
  },

  /**
   * Get all dashboard metrics in one call
   */
  getDashboard: async (): Promise<DashboardMetrics> => {
    return api.get('/metrics/dashboard')
  },

  /**
   * Reset performance metrics (admin use)
   */
  resetMetrics: async (): Promise<{ status: string }> => {
    return api.post('/metrics/reset-metrics')
  },
}
