import { createContext, useContext } from 'react'

import type {
  CandidateJobsAppliedFilters,
  CandidateJobsDraftFilters,
  CandidateJobsFiltersOptions,
} from '@/layouts/candidate/CandidateJobsFilters.types'

export type CandidateJobsFiltersContextValue = {
  draftFilters: CandidateJobsDraftFilters
  setDraftFilters: (next: CandidateJobsDraftFilters) => void
  appliedFilters: CandidateJobsAppliedFilters
  options: CandidateJobsFiltersOptions
  setOptions: (next: CandidateJobsFiltersOptions) => void
  apply: () => void
  clear: () => void
  patchFilters: (patch: Partial<CandidateJobsAppliedFilters>) => void
}

export const CandidateJobsFiltersContext = createContext<
  CandidateJobsFiltersContextValue | undefined
>(undefined)

export function useCandidateJobsFilters() {
  const ctx = useContext(CandidateJobsFiltersContext)
  if (!ctx) {
    throw new Error('useCandidateJobsFilters must be used within CandidateJobsFiltersProvider')
  }
  return ctx
}
