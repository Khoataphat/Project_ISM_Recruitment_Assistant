import { useMemo, useState } from 'react'

import type {
  CandidateJobsAppliedFilters,
  CandidateJobsDraftFilters,
  CandidateJobsFiltersOptions,
} from '@/layouts/candidate/CandidateJobsFilters.types'
import { DEFAULT_CANDIDATE_JOBS_FILTERS } from '@/layouts/candidate/CandidateJobsFilters.types'
import {
  CandidateJobsFiltersContext,
  type CandidateJobsFiltersContextValue,
} from '@/layouts/candidate/CandidateJobsFiltersContext.ts'

export function CandidateJobsFiltersProvider({ children }: { children: React.ReactNode }) {
  const [draftFilters, setDraftFilters] = useState<CandidateJobsDraftFilters>(
    DEFAULT_CANDIDATE_JOBS_FILTERS
  )
  const [appliedFilters, setAppliedFilters] =
    useState<CandidateJobsAppliedFilters>(DEFAULT_CANDIDATE_JOBS_FILTERS)
  const [options, setOptions] = useState<CandidateJobsFiltersOptions>({ levels: [], types: [] })

  const value = useMemo<CandidateJobsFiltersContextValue>(
    () => ({
      draftFilters,
      setDraftFilters,
      appliedFilters,
      options,
      setOptions,
      apply: () => setAppliedFilters(draftFilters),
      clear: () => {
        setDraftFilters(DEFAULT_CANDIDATE_JOBS_FILTERS)
        setAppliedFilters(DEFAULT_CANDIDATE_JOBS_FILTERS)
      },
    }),
    [appliedFilters, draftFilters, options]
  )

  return (
    <CandidateJobsFiltersContext.Provider value={value}>
      {children}
    </CandidateJobsFiltersContext.Provider>
  )
}

