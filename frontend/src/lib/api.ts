import axios, { type AxiosRequestHeaders } from 'axios'
import { appEnv } from '@/config/env'

export const apiClient = axios.create({
  baseURL: appEnv.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach auth token from localStorage on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token && token.trim()) {
    config.headers = config.headers ?? ({} as AxiosRequestHeaders)
    ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    const h = config.headers
    if (h && typeof (h as { delete?: (k: string) => void }).delete === 'function') {
      ;(h as { delete: (k: string) => void }).delete('Content-Type')
    } else if (h && typeof h === 'object') {
      delete (h as Record<string, unknown>)['Content-Type']
      delete (h as Record<string, unknown>)['content-type']
    }
  }
  return config
})

// Normalize error responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
