import { apiClient } from '@/lib/api'
import { unwrapData, unwrapMessage } from '@/services/http'
import type { ApiSuccessEnvelope, AuthUser } from '@/types'

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  email: string
  password: string
  fullName: string
}

export type VerifyEmailRequest = {
  email: string
  code: string
}

export type ResendVerificationRequest = {
  email: string
}

export type AuthPayload = {
  user: AuthUser
  token: string
}

export type RefreshTokenPayload = {
  token: string
}

export async function register(data: RegisterRequest) {
  const response = await apiClient.post<ApiSuccessEnvelope<AuthPayload>>('/auth/register', data)
  return unwrapData(response)
}

export async function login(data: LoginRequest) {
  const response = await apiClient.post<ApiSuccessEnvelope<AuthPayload>>('/auth/login', data)
  return unwrapData(response)
}

export async function logout() {
  const response = await apiClient.post<ApiSuccessEnvelope<unknown>>('/auth/logout')
  return unwrapMessage(response, 'Logged out successfully')
}

export async function getMe() {
  const response = await apiClient.get<ApiSuccessEnvelope<AuthUser>>('/auth/me')
  return unwrapData(response)
}

export async function verifyEmail(data: VerifyEmailRequest) {
  const response = await apiClient.post<ApiSuccessEnvelope<unknown>>('/auth/verify-email', data)
  return unwrapMessage(response, 'Email verified successfully')
}

export async function resendVerification(data: ResendVerificationRequest) {
  const response = await apiClient.post<ApiSuccessEnvelope<unknown>>(
    '/auth/resend-verification',
    data
  )
  return unwrapMessage(response, 'Verification email sent')
}

export async function refreshToken() {
  const response =
    await apiClient.post<ApiSuccessEnvelope<RefreshTokenPayload>>('/auth/refresh-token')
  return unwrapData(response)
}
