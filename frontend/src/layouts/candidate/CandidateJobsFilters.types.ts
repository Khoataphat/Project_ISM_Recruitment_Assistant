export type CandidateJobsAppliedFilters = {
  remoteOnly: boolean
  locationQuery: string
  level?: string
  type?: string
  salaryMin?: number
  salaryMax?: number
  minExperienceYears?: number
  statuses: Array<'Open' | 'Closed' | 'Draft'>
}

export type CandidateJobsDraftFilters = CandidateJobsAppliedFilters

export type CandidateJobsFiltersOptions = {
  levels: string[]
  types: string[]
}

export const DEFAULT_CANDIDATE_JOBS_FILTERS: CandidateJobsAppliedFilters = {
  remoteOnly: false,
  locationQuery: '',
  level: undefined,
  type: undefined,
  salaryMin: undefined,
  salaryMax: undefined,
  minExperienceYears: undefined,
  statuses: [],
}
