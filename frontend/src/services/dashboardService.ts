import { apiClient } from '@/lib/api'
import { unwrapData, unwrapMessage } from '@/services/http'
import type { ApiSuccessEnvelope, ApplicationStatus, PaginationMeta } from '@/types'

export type DashboardApplication = {
  applicationId?: string | number
  id?: string | number
  userId?: string | number
  jobId?: string | number
  status?: ApplicationStatus
  submittedAt?: string
  reviewedAt?: string | null
  reviewedBy?: string | number | null
  user?: {
    userId?: string | number
    email?: string
    fullName?: string
    full_name?: string
    [key: string]: unknown
  }
  job?: {
    jobId?: string | number
    title?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export type DashboardApplicationsQuery = {
  page?: number
  limit?: number
  status?: ApplicationStatus
  search?: string
}

export type DashboardApplicationsPayload = {
  applications: DashboardApplication[]
  pagination: PaginationMeta
}

export type AcceptApplicationRequest = {
  interviewDate: string
  interviewLocation: string
}

function buildQueryParams(query?: DashboardApplicationsQuery) {
  const params = new URLSearchParams()

  if (!query) return params

  if (query.page !== undefined) params.set('page', String(query.page))
  if (query.limit !== undefined) params.set('limit', String(query.limit))
  if (query.status) params.set('status', query.status)
  if (query.search) params.set('search', query.search)

  return params
}

export async function getDashboardApplications(query?: DashboardApplicationsQuery) {
  const params = buildQueryParams(query)
  const queryString = params.toString()
  const path = queryString ? `/dashboard/applications?${queryString}` : '/dashboard/applications'

  const response = await apiClient.get<ApiSuccessEnvelope<DashboardApplicationsPayload>>(path)
  return unwrapData(response)
}

export async function getDashboardApplicationById(applicationId: string | number) {
  const response = await apiClient.get<ApiSuccessEnvelope<DashboardApplication>>(
    `/dashboard/applications/${applicationId}`
  )
  return unwrapData(response)
}

export async function acceptDashboardApplication(
  applicationId: string | number,
  data: AcceptApplicationRequest
) {
  const response = await apiClient.patch<ApiSuccessEnvelope<unknown>>(
    `/dashboard/applications/${applicationId}/accept`,
    data
  )
  return unwrapMessage(response, 'Application accepted')
}

export async function rejectDashboardApplication(applicationId: string | number) {
  const response = await apiClient.patch<ApiSuccessEnvelope<unknown>>(
    `/dashboard/applications/${applicationId}/reject`
  )
  return unwrapMessage(response, 'Application rejected')
}
