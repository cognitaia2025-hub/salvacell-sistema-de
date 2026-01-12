import { api } from './client'
import type { DBClient } from '../database/schema'

export interface ClientWithStats extends DBClient {
  total_orders: number
  total_spent: number
  device_count: number
}

export interface ClientCreateData {
  name: string
  phone: string
  alternate_phone?: string
  alternate_contact?: string
  email?: string
  notes?: string
}

export interface ClientUpdateData extends Partial<ClientCreateData> {}

export const clientsAPI = {
  // Get all clients with optional search
  getAll: (params?: { skip?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.skip) searchParams.append('skip', params.skip.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)

    const query = searchParams.toString()
    return api.get<DBClient[]>(`/clients${query ? `?${query}` : ''}`)
  },

  // Get client by ID with stats
  getById: (clientId: string) =>
    api.get<ClientWithStats>(`/clients/${clientId}`),

  // Create new client
  create: (data: ClientCreateData) =>
    api.post<DBClient>('/clients', data),

  // Update client
  update: (clientId: string, data: ClientUpdateData) =>
    api.put<DBClient>(`/clients/${clientId}`, data),

  // Delete client
  delete: (clientId: string) =>
    api.delete(`/clients/${clientId}`),
}
