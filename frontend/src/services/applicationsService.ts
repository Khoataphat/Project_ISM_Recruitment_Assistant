import { apiClient } from '@/lib/api'
import { unwrapData } from '@/services/http'
import type { ApiSuccessEnvelope, ApplicationStatus } from '@/types'

export type ApplicationRecord = {
  applicationId?: string | number
  id?: string | number
  userId?: string | number
  jobId?: string | number
  resumeUrl?: string
  coverLetter?: string | null
  status?: ApplicationStatus
  submittedAt?: string
  reviewedAt?: string | null
  reviewedBy?: string | number | null
  job?: {
    title?: string
    status?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export type SubmitApplicationRequest = {
  jobId: string | number
  resume: File
  coverLetter?: string
}

export async function submitApplication(data: SubmitApplicationRequest) {
  const formData = new FormData()
  formData.append('jobId', String(data.jobId))
  formData.append('resume', data.resume)

  if (data.coverLetter && data.coverLetter.trim()) {
    formData.append('coverLetter', data.coverLetter.trim())
  }

  const response = await apiClient.post<ApiSuccessEnvelope<ApplicationRecord>>(
    '/applications',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  )

  return unwrapData(response)
}

export async function getMyApplications() {
  const response = await apiClient.get<ApiSuccessEnvelope<ApplicationRecord[]>>('/applications')
  return unwrapData(response)
}
