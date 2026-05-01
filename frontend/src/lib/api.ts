import axios, { type AxiosRequestHeaders, type InternalAxiosRequestConfig } from 'axios'
import { appEnv } from '@/config/env'
import type { ApiSuccessEnvelope } from '@/types'

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry401?: boolean
  }
}

const AUTH_PUBLIC_POST_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/resend-verification',
])

const refreshClient = axios.create({
  baseURL: appEnv.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const apiClient = axios.create({
  baseURL: appEnv.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

function getRequestPathname(config: InternalAxiosRequestConfig): string {
  const raw = config.url?.split('?')[0] ?? ''
  if (!raw) return '/'
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const pathname = new URL(raw).pathname.replace(/\/$/, '') || '/'
      return pathname
    } catch {
      return '/'
    }
  }
  const base = config.baseURL ?? appEnv.apiUrl
  try {
    return new URL(raw, base).pathname.replace(/\/$/, '') || '/'
  } catch {
    return raw.startsWith('/') ? raw.replace(/\/$/, '') || '/' : `/${raw}`.replace(/\/$/, '') || '/'
  }
}

function isAuthPublic401Passthrough(method: string, pathname: string): boolean {
  return method === 'post' && AUTH_PUBLIC_POST_PATHS.has(pathname)
}

function isPublicJobGet(method: string, pathname: string): boolean {
  if (method !== 'get') return false
  if (pathname === '/jobs') return true
  const m = pathname.match(/^\/jobs\/([^/]+)$/)
  if (!m) return false
  return m[1] !== 'hr'
}

function clearSessionAndRedirectLogin() {
  localStorage.removeItem('user')
  localStorage.removeItem('accessToken')
  window.location.href = '/login'
}

let refreshPromise: Promise<string> | null = null

async function performRefresh(): Promise<string> {
  const response =
    await refreshClient.post<ApiSuccessEnvelope<{ token: string }>>('/auth/refresh-token')
  const token = response.data?.data?.token
  if (!token || typeof token !== 'string') {
    throw new Error('API response is missing expected token')
  }
  localStorage.setItem('accessToken', token)
  return token
}

function getQueuedRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export async function refreshAccessToken(): Promise<string> {
  try {
    return await getQueuedRefresh()
  } catch {
    clearSessionAndRedirectLogin()
    throw new Error('Session expired')
  }
}

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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    if (status !== 401) return Promise.reject(error)

    const originalConfig = error.config as InternalAxiosRequestConfig | undefined
    if (!originalConfig) return Promise.reject(error)

    const method = (originalConfig.method ?? 'get').toLowerCase()
    const pathname = getRequestPathname(originalConfig)

    if (isAuthPublic401Passthrough(method, pathname) || isPublicJobGet(method, pathname)) {
      return Promise.reject(error)
    }

    if (originalConfig._retry401) {
      clearSessionAndRedirectLogin()
      return Promise.reject(error)
    }

    try {
      const token = await getQueuedRefresh()
      originalConfig.headers = originalConfig.headers ?? ({} as AxiosRequestHeaders)
      ;(originalConfig.headers as Record<string, string>).Authorization = `Bearer ${token}`
      originalConfig._retry401 = true
      return apiClient(originalConfig)
    } catch {
      clearSessionAndRedirectLogin()
      return Promise.reject(error)
    }
  }
)
