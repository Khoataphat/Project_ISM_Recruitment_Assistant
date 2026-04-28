export type UserRole = 'HR' | 'CANDIDATE'
export type JobStatus = 'open' | 'closed'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

export type AuthUser = {
  id?: string | number
  userId?: string | number
  email: string
  role: UserRole
  full_name?: string
  fullName?: string
  [key: string]: unknown
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}
