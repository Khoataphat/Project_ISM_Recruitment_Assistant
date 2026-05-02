import { apiClient } from '@/lib/api'
import { unwrapData } from '@/services/http'
import type { ApiSuccessEnvelope, JobStatus } from '@/types'

export type ApiCompany = {
  id: string
  name: string
  logo_url: string | null
  description?: string | null
  headquarters_location: string | null
}

export type ApiHrProfile = {
  id: string
  position: string | null
  department_name?: string | null
}

export type ApiJob = {
  id: string
  company_id: string
  hr_id: string
  title: string
  level: string | null
  type: string | null
  location: string | null
  is_remote: boolean
  description: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  is_salary_visible: boolean
  application_deadline: string | null
  headcount: number | null
  min_experience_years: number | null
  education_requirement: string | null
  benefits: string[]
  application_count: number | null
  view_count: number | null
  status: JobStatus
  created_at: string
  updated_at: string
  companies: ApiCompany
  hr_profiles: ApiHrProfile | null
  [key: string]: unknown
}

export type CreateJobRequest = {
  title: string
  description: string
  status?: JobStatus
}

export type UpdateJobRequest = Partial<CreateJobRequest>

export async function getOpenJobs() {
  const response = await apiClient.get<ApiSuccessEnvelope<ApiJob[]>>('/jobs')
  return unwrapData(response)
}

export async function getJobById(jobId: string | number) {
  const response = await apiClient.get<ApiSuccessEnvelope<ApiJob>>(`/jobs/${jobId}`)
  return unwrapData(response)
}

export async function createJob(data: CreateJobRequest) {
  const response = await apiClient.post<ApiSuccessEnvelope<ApiJob>>('/jobs', data)
  return unwrapData(response)
}

export async function updateJob(jobId: string | number, data: UpdateJobRequest) {
  const response = await apiClient.patch<ApiSuccessEnvelope<ApiJob>>(`/jobs/${jobId}`, data)
  return unwrapData(response)
}

export async function getHrManageJobs() {
  const response = await apiClient.get<ApiSuccessEnvelope<ApiJob[]>>('/jobs/hr/manage')
  return unwrapData(response)
}
