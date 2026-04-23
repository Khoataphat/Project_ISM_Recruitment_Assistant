import axios from 'axios'
import { appEnv } from '@/config/env'

export const apiClient = axios.create({
  baseURL: appEnv.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Optional: Add interceptors for token handling if needed later
