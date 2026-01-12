// API client configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class APIError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message)
    this.name = 'APIError'
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  // Add auth token if required
  if (requiresAuth) {
    const token = localStorage.getItem('access_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new APIError(
      response.status,
      errorData.detail || 'Error en la solicitud',
      errorData
    )
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

export const api = {
  // GET request
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  // POST request
  post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT request
  put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE request
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  // Upload file (FormData)
  upload: async <T>(endpoint: string, formData: FormData, options?: RequestOptions) => {
    const { requiresAuth = true, ...fetchOptions } = options || {}

    const headers: HeadersInit = {
      ...fetchOptions.headers,
    }

    if (requiresAuth) {
      const token = localStorage.getItem('access_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new APIError(
        response.status,
        errorData.detail || 'Error al subir archivo',
        errorData
      )
    }

    return response.json() as Promise<T>
  },
}

export { APIError }
