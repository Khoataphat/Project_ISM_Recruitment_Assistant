import { apiClient } from '@/lib/api'
import { unwrapData } from '@/services/http'
import type { ApiSuccessEnvelope, JobStatus } from '@/types'

export type JobRecord = {
  id?: string | number
  jobId?: string | number
  title?: string
  description?: string
  status?: JobStatus
  [key: string]: unknown
}

export type CreateJobRequest = {
  title: string
  description: string
  status?: JobStatus
}

export type UpdateJobRequest = Partial<CreateJobRequest>

export async function getOpenJobs() {
  const response = await apiClient.get<ApiSuccessEnvelope<JobRecord[]>>('/jobs')
  return unwrapData(response)
}

export async function getJobById(jobId: string | number) {
  const response = await apiClient.get<ApiSuccessEnvelope<JobRecord>>(`/jobs/${jobId}`)
  return unwrapData(response)
}

export async function createJob(data: CreateJobRequest) {
  const response = await apiClient.post<ApiSuccessEnvelope<JobRecord>>('/jobs', data)
  return unwrapData(response)
}

export async function updateJob(jobId: string | number, data: UpdateJobRequest) {
  const response = await apiClient.patch<ApiSuccessEnvelope<JobRecord>>(`/jobs/${jobId}`, data)
  return unwrapData(response)
}

export async function getHrManageJobs() {
  const response = await apiClient.get<ApiSuccessEnvelope<JobRecord[]>>('/jobs/hr/manage')
  return unwrapData(response)
}
