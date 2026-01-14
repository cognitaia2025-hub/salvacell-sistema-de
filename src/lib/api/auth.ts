import { api } from './client'

export interface LoginCredentials {
  username: string
  password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface UserResponse {
  id: string
  username: string
  email: string
  full_name?: string
  role: 'admin' | 'technician' | 'receptionist' | 'warehouse'
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export const authAPI = {
  // Login
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<TokenResponse>('/auth/login', credentials, {
      requiresAuth: false,
    })

    // Store tokens in localStorage
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)

    return response
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  // Get current user info
  getCurrentUser: () => api.get<UserResponse>('/auth/me'),

  // Update current user
  updateCurrentUser: (data: { email?: string; full_name?: string }) =>
    api.put<UserResponse>('/auth/me', data),

  // Change password
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/auth/change-password', data),

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token')
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('access_token')
  },
}
