import { BankOutlined, CheckCircleOutlined, EnvironmentOutlined } from '@ant-design/icons'
import {
  Button,
  Flex,
  Grid,
  Image,
  Input,
  Pagination,
  Select,
  Typography,
  theme,
  Spin,
  Alert,
  Tag,
} from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { getOpenJobs, type ApiJob } from '@/services/jobsService'
import { getMyApplications } from '@/services/applicationsService'
import { useCandidateJobsFilters } from '@/layouts/candidate/CandidateJobsFiltersContext.ts'

const { Title, Text, Paragraph } = Typography

function getJobThematicImage(job: ApiJob) {
  const seed = job.id.split('-').pop() || '1'
  return `https://loremflickr.com/800/600/business,office,technology?random=${seed}`
}

function getApiErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object') {
    const maybe = err as { response?: { data?: { message?: unknown } } }
    const msg = maybe.response?.data?.message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return fallback
}

export function CandidateJobsPage() {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const isDesktop = !!screens.lg
  const [searchParams, setSearchParams] = useSearchParams()
  const { appliedFilters, setOptions, patchFilters } = useCandidateJobsFilters()
  const [jobs, setJobs] = useState<ApiJob[]>([])
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string>('')
  const qFromUrl = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(qFromUrl)
  const [sortMode, setSortMode] = useState<
    | 'newest'
    | 'deadline'
    | 'salary_min'
    | 'application_count'
    | 'title_asc'
    | 'company_asc'
    | 'location_asc'
    | 'view_count'
  >('newest')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    setQuery(qFromUrl)
  }, [qFromUrl])

  useEffect(() => {
    if (!searchParams.has('location')) return
    patchFilters({ locationQuery: searchParams.get('location') ?? '' })
  }, [patchFilters, searchParams])

  const setQueryAndUrl = useCallback(
    (next: string) => {
      setQuery(next)
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          const t = next.trim()
          if (t) p.set('q', t)
          else p.delete('q')
          return p
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [jobsData, appsData] = await Promise.all([
          getOpenJobs(),
          getMyApplications(),
        ])
        setJobs(jobsData ?? [])
        if (jobsData?.length) setSelectedId(jobsData[0].id)
        
        const appliedIds = new Set((appsData ?? []).map((app: any) => app.job_id))
        setAppliedJobIds(appliedIds)
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to fetch data'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const levels = Array.from(
      new Set(
        jobs.map((j) => j.level).filter((v): v is string => typeof v === 'string' && !!v.trim())
      )
    ).sort((a, b) => a.localeCompare(b))

    const types = Array.from(
      new Set(
        jobs.map((j) => j.type).filter((v): v is string => typeof v === 'string' && !!v.trim())
      )
    ).sort((a, b) => a.localeCompare(b))

    setOptions({ levels, types })
  }, [jobs, setOptions])

  const formatSalary = (job: ApiJob) => {
    if (!job.is_salary_visible) return 'Hidden'
    const min = job.salary_min
    const max = job.salary_max
    const currency = job.salary_currency ?? ''
    if (min == null && max == null) return `Negotiable${currency ? ` (${currency})` : ''}`
    if (min != null && max != null)
      return `${min.toLocaleString()}–${max.toLocaleString()} ${currency}`.trim()
    if (min != null) return `From ${min.toLocaleString()} ${currency}`.trim()
    return `Up to ${max?.toLocaleString()} ${currency}`.trim()
  }

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '—'
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString()
  }

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase()
    return jobs.filter((j) => {
      if (appliedFilters.remoteOnly && !j.is_remote) return false
      if (appliedFilters.level && j.level !== appliedFilters.level) return false
      if (appliedFilters.type && j.type !== appliedFilters.type) return false
      if (appliedFilters.statuses.length && !appliedFilters.statuses.includes(j.status)) {
        return false
      }
      if (
        appliedFilters.minExperienceYears != null &&
        (j.min_experience_years == null ||
          j.min_experience_years < appliedFilters.minExperienceYears)
      ) {
        return false
      }
      if (
        appliedFilters.salaryMin != null &&
        j.salary_max != null &&
        j.salary_max < appliedFilters.salaryMin
      ) {
        return false
      }
      if (
        appliedFilters.salaryMax != null &&
        j.salary_min != null &&
        j.salary_min > appliedFilters.salaryMax
      ) {
        return false
      }

      if (appliedFilters.locationQuery.trim()) {
        const locQ = appliedFilters.locationQuery.trim().toLowerCase()
        if (!(j.location ?? '').toLowerCase().includes(locQ)) return false
      }

      const company = j.companies?.name ?? ''
      const location = j.location ?? ''
      const level = j.level ?? ''
      const type = j.type ?? ''
      const title = j.title ?? ''
      if (!q) return true
      return (
        title.toLowerCase().includes(q) ||
        company.toLowerCase().includes(q) ||
        location.toLowerCase().includes(q) ||
        level.toLowerCase().includes(q) ||
        type.toLowerCase().includes(q)
      )
    })
  }, [appliedFilters, jobs, query])

  const sortedJobs = useMemo(() => {
    const list = [...filteredJobs]

    const byString = (a: string, b: string) => a.localeCompare(b)
    const byNumberDescNullLast = (a: number | null | undefined, b: number | null | undefined) => {
      const av = a ?? Number.NEGATIVE_INFINITY
      const bv = b ?? Number.NEGATIVE_INFINITY
      return bv - av
    }

    list.sort((a, b) => {
      switch (sortMode) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'deadline':
          return (
            new Date(a.application_deadline ?? 8640000000000000).getTime() -
            new Date(b.application_deadline ?? 8640000000000000).getTime()
          )
        case 'salary_min':
          return byNumberDescNullLast(a.salary_min, b.salary_min)
        case 'application_count':
          return byNumberDescNullLast(a.application_count, b.application_count)
        case 'view_count':
          return byNumberDescNullLast(a.view_count, b.view_count)
        case 'title_asc':
          return byString(a.title ?? '', b.title ?? '')
        case 'company_asc':
          return byString(a.companies?.name ?? '', b.companies?.name ?? '')
        case 'location_asc':
          return byString(a.location ?? '', b.location ?? '')
        default:
          return 0
      }
    })

    return list
  }, [filteredJobs, sortMode])

  useEffect(() => {
    setPage(1)
  }, [query, sortMode, pageSize])

  const visibleJobs = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedJobs.slice(start, start + pageSize)
  }, [sortedJobs, page, pageSize])

  useEffect(() => {
    if (!sortedJobs.length) {
      setSelectedId('')
      return
    }
    if (!selectedId || !sortedJobs.some((j) => j.id === selectedId)) {
      setSelectedId(sortedJobs[0].id)
    }
  }, [sortedJobs, selectedId])

  const selectedJob = useMemo(
    () => sortedJobs.find((j) => j.id === selectedId) || sortedJobs[0],
    [sortedJobs, selectedId]
  )

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 500 }}>
        <Spin size="large" description="Finding matches..." />
      </Flex>
    )
  }

  return (
    <main className="candidate-jobsMain">
      <section className="candidate-jobsHero" aria-labelledby="candidate-jobs-hero-title">
        <div className="candidate-jobsHeroOverlay" aria-hidden />
        <div className="candidate-jobsHeroContent">
          <Title id="candidate-jobs-hero-title" level={2} className="candidate-jobsHeroTitle">
            Global Opportunities
          </Title>
          <Text className="candidate-jobsHeroSubtitle">
            {jobs.length} open positions available for you
          </Text>
        </div>
      </section>

      <div className="candidate-jobsContainer">
        {error && <Alert type="error" message={error} style={{ marginBottom: 24 }} />}

        <div className="candidate-jobsSplit">
          <div className="candidate-jobsListCol">
            <Flex vertical gap={12} className="candidate-jobsListPane">
              <Flex gap={10} wrap align="center">
                <div style={{ flex: '1 1 280px', minWidth: 240 }}>
                  <Input.Search
                    allowClear
                    value={query}
                    onChange={(e) => setQueryAndUrl(e.target.value)}
                    placeholder="Search by title, company, location, level, type…"
                  />
                </div>
                <Select
                  value={sortMode}
                  onChange={(v) => setSortMode(v)}
                  style={{ minWidth: 220 }}
                  options={[
                    { value: 'newest', label: 'Newest' },
                    { value: 'deadline', label: 'Deadline' },
                    { value: 'salary_min', label: 'Salary (min)' },
                    { value: 'application_count', label: 'Most applied' },
                    { value: 'view_count', label: 'Most viewed' },
                    { value: 'title_asc', label: 'Title A–Z' },
                    { value: 'company_asc', label: 'Company A–Z' },
                    { value: 'location_asc', label: 'Location A–Z' },
                  ]}
                />
              </Flex>

              <div className="candidate-jobsListScroll">
                <div className="candidate-jobsListInner">
                  {visibleJobs.map((job) => {
                    const isApplied = appliedJobIds.has(job.id)
                    return (
                      <article
                        key={job.id}
                        className={`candidate-jobCard${job.id === selectedJob?.id ? ' candidate-jobCard--selected' : ''}`}
                        style={isApplied ? { 
                          background: token.colorInfoBg,
                          opacity: 0.7,
                          position: 'relative',
                        } : { position: 'relative' }}
                        role="button"
                      tabIndex={0}
                      aria-current={job.id === selectedJob?.id ? 'true' : undefined}
                      onClick={() => setSelectedId(job.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedId(job.id)
                        }
                      }}
                    >
                      <Flex align="flex-start" justify="space-between" wrap gap={12}>
                        <Flex gap={28} align="center" style={{ minWidth: 0 }}>
                          <div className="candidate-jobLogoBox">
                            <Image
                              className="candidate-jobLogo"
                              src={getJobThematicImage(job)}
                              alt={`${job.companies?.name ?? 'Company'} logo`}
                              preview={false}
                              width={'100%'}
                              height={'100%'}
                              style={{ objectFit: 'cover', borderRadius: 8 }}
                            />
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="candidate-jobTitleRow">
                              <Text className="candidate-jobTitle">{job.title}</Text>
                            </div>
                              {isApplied && (
                                <Tag 
                                  icon={<CheckCircleOutlined />}
                                  color="processing" 
                                  bordered={true}
                                  style={{ 
                                    position: 'absolute',
                                    top: 14,
                                    right: 14,
                                    borderRadius: 99, 
                                    paddingInline: 14,
                                    paddingBlock: 2,
                                    fontWeight: 800, 
                                    fontSize: 11,
                                    margin: 0,
                                    background: '#fff',
                                    borderColor: token.colorPrimary,
                                    color: token.colorPrimary,
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    zIndex: 2,
                                  }}
                                >
                                  Đã ứng tuyển
                                </Tag>
                              )}

                            <Flex className="candidate-jobMeta" align="center" wrap gap={10}>
                              <Text style={{ color: token.colorTextSecondary, fontWeight: 600 }}>
                                {job.companies?.name ?? '—'}
                              </Text>
                              <span className="candidate-dot" />
                              <Text style={{ color: token.colorTextSecondary, fontWeight: 600 }}>
                                {job.location ?? '—'}
                              </Text>
                              <span className="candidate-dot" />
                              <Text className="candidate-jobSalary">{formatSalary(job)}</Text>
                            </Flex>

                            <Flex className="candidate-jobTagList" wrap gap={10}>
                              {job.level ? (
                                <span className="candidate-jobTag">{job.level}</span>
                              ) : null}
                              {job.type ? (
                                <span className="candidate-jobTag">{job.type}</span>
                              ) : null}
                              {job.is_remote ? (
                                <span className="candidate-jobTag">Remote</span>
                              ) : null}
                              <span className="candidate-jobTag">{job.status}</span>
                              {job.min_experience_years != null ? (
                                <span className="candidate-jobTag">
                                  Min exp: {job.min_experience_years}y
                                </span>
                              ) : null}
                            </Flex>
                          </div>
                        </Flex>

                        <div onClick={(e) => e.stopPropagation()} />
                      </Flex>
                    </article>
                  )
                })}
              </div>
            </div>

            <div className="candidate-paginationBar">
              <Text style={{ color: token.colorTextSecondary }}>
                Page {page} of {Math.max(1, Math.ceil(sortedJobs.length / pageSize))}
              </Text>
              <Pagination
                className="candidate-pagination"
                current={page}
                total={sortedJobs.length}
                pageSize={pageSize}
                onChange={(p, ps) => {
                  setPage(p)
                  if (ps !== pageSize) setPageSize(ps)
                }}
                showSizeChanger
                pageSizeOptions={[10, 20, 50]}
                showQuickJumper={false}
              />
            </div>
          </Flex>
        </div>

        {isDesktop ? (
          <aside className="candidate-jobsPreviewCol" aria-label="Job preview">
            {selectedJob ? (
              <div className="candidate-jobPreviewSticky">
                <div className="candidate-jobPreview">
                  <div className="candidate-jobPreviewMedia">
                    <Image
                      src={getJobThematicImage(selectedJob)}
                      alt=""
                      preview={false}
                      width="100%"
                      style={{
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div className="candidate-jobPreviewMediaShade" aria-hidden />
                  </div>

                  <div className="candidate-jobPreviewBody">
                    <Flex align="center" wrap gap={10} style={{ marginBottom: 10 }}>
                      <Title
                        level={3}
                        className="candidate-jobPreviewTitle"
                        style={{ margin: 0, flex: '1 1 200px' }}
                      >
                        {selectedJob.title}
                      </Title>
                        {appliedJobIds.has(selectedJob.id) && (
                          <Tag 
                            icon={<CheckCircleOutlined />}
                            color="processing" 
                            style={{ fontWeight: 700, borderRadius: 99, paddingInline: 12 }}
                          >
                            Đã ứng tuyển
                          </Tag>
                        )}
                    </Flex>

                    <Flex wrap gap={16} align="center" style={{ marginBottom: 16 }}>
                      <Flex gap={8} align="center">
                        <BankOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />
                        <Text style={{ fontWeight: 700, color: token.colorText }}>
                          {selectedJob.companies?.name ?? '—'}
                        </Text>
                      </Flex>
                      <Flex gap={8} align="center">
                        <EnvironmentOutlined
                          style={{ fontSize: 16, color: token.colorTextSecondary }}
                        />
                        <Text style={{ color: token.colorTextSecondary }}>
                          {selectedJob.location ?? '—'}
                        </Text>
                      </Flex>
                      <Flex gap={8} align="center">
                        <span className="candidate-moneyIcon" />
                        <Text className="candidate-jobPay">{formatSalary(selectedJob)}</Text>
                      </Flex>
                    </Flex>

                    <Flex
                      wrap
                      gap={8}
                      className="candidate-jobPills"
                      style={{ marginBottom: 16 }}
                    >
                      {selectedJob.level ? (
                        <span className="candidate-pill">{selectedJob.level}</span>
                      ) : null}
                      {selectedJob.type ? (
                        <span className="candidate-pill">{selectedJob.type}</span>
                      ) : null}
                      {selectedJob.is_remote ? (
                        <span className="candidate-pill">Remote</span>
                      ) : null}
                      {selectedJob.application_deadline ? (
                        <span className="candidate-pill">
                          Deadline: {formatDate(selectedJob.application_deadline)}
                        </span>
                      ) : null}
                    </Flex>

                    <Paragraph
                      style={{
                        marginBottom: 20,
                        color: token.colorTextSecondary,
                      }}
                      className="candidate-jobPreviewSummary"
                    >
                      {selectedJob.description ?? '—'}
                    </Paragraph>

                    <Flex gap={10} wrap style={{ marginTop: 'auto' }}>
                      <Link to={`/candidate/job/${selectedJob.id}`} style={{ flex: '1 1 auto' }}>
                        <Button block className="candidate-jobPreviewSecondaryBtn">
                          View full role
                        </Button>
                      </Link>
                      <Link to={`/candidate/job/${selectedJob.id}`} style={{ flex: '1 1 auto' }}>
                        <Button 
                          type={appliedJobIds.has(selectedJob.id) ? 'default' : 'primary'} 
                          block 
                          className="candidate-applyNowBtn"
                          style={appliedJobIds.has(selectedJob.id) ? { 
                            background: token.colorFillSecondary,
                            borderColor: 'transparent',
                            color: token.colorTextSecondary
                          } : undefined}
                        >
                          {appliedJobIds.has(selectedJob.id) ? 'Đã ứng tuyển' : 'Apply now'}
                        </Button>
                      </Link>
                    </Flex>
                  </div>
                </div>
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </div>
    </main>
  )
}
