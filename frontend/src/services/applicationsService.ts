import { apiClient } from '@/lib/api'
import { unwrapData } from '@/services/http'
import type { ApiSuccessEnvelope, ApplicationStatus } from '@/types'

/** Matches backend multer limit in upload.middleware.ts */
export const APPLICATION_MAX_RESUME_MB = 5
export const APPLICATION_MAX_COVER_LETTER_LENGTH = 2000

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

function truncateCoverLetter(text: string) {
  const t = text.trim()
  if (t.length <= APPLICATION_MAX_COVER_LETTER_LENGTH) return t
  return t.slice(0, APPLICATION_MAX_COVER_LETTER_LENGTH)
}

export async function submitApplication(data: SubmitApplicationRequest) {
  const formData = new FormData()
  formData.append('jobId', String(data.jobId))
  formData.append('resume', data.resume)

  if (data.coverLetter && data.coverLetter.trim()) {
    formData.append('coverLetter', truncateCoverLetter(data.coverLetter))
  }

  const response = await apiClient.post<ApiSuccessEnvelope<ApplicationRecord>>(
    '/applications',
    formData
  )

  return unwrapData(response)
}

export async function getMyApplications() {
  const response = await apiClient.get<ApiSuccessEnvelope<ApplicationRecord[]>>('/applications')
  return unwrapData(response)
}
