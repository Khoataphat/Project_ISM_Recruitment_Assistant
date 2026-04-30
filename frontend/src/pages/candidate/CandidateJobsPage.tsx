import { BankOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { Button, Flex, Grid, Image, Input, Pagination, Select, Typography, theme, Spin, Alert } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getOpenJobs, type ApiJob } from '@/services/jobsService'

const { Title, Text, Paragraph } = Typography

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
  const [jobs, setJobs] = useState<ApiJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string>('')
  const [query, setQuery] = useState('')
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
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const data = await getOpenJobs()
        setJobs(data ?? [])
        if (data?.length) setSelectedId(data[0].id)
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to fetch jobs'))
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

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
    if (!q) return jobs
    return jobs.filter((j) => {
      const company = j.companies?.name ?? ''
      const location = j.location ?? ''
      const level = j.level ?? ''
      const type = j.type ?? ''
      const title = j.title ?? ''
      return (
        title.toLowerCase().includes(q) ||
        company.toLowerCase().includes(q) ||
        location.toLowerCase().includes(q) ||
        level.toLowerCase().includes(q) ||
        type.toLowerCase().includes(q)
      )
    })
  }, [jobs, query])

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
        <Spin size="large" tip="Finding matches..." />
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
                    onChange={(e) => setQuery(e.target.value)}
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
                  {visibleJobs.map((job) => (
                    <article
                      key={job.id}
                      className={`candidate-jobCard${job.id === selectedJob?.id ? ' candidate-jobCard--selected' : ''}`}
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
                              src={job.companies?.logo_url ?? undefined}
                              alt={`${job.companies?.name ?? 'Company'} logo`}
                              preview={false}
                              width={'100%'}
                              height={'100%'}
                              style={{ objectFit: 'contain' }}
                            />
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="candidate-jobTitleRow">
                              <Text className="candidate-jobTitle">{job.title}</Text>
                            </div>

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
                              {job.type ? <span className="candidate-jobTag">{job.type}</span> : null}
                              {job.is_remote ? <span className="candidate-jobTag">Remote</span> : null}
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
                  ))}
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
                        src={selectedJob.companies?.logo_url ?? undefined} // Placeholder for cover if missing
                        alt=""
                        preview={false}
                        width="100%"
                        style={{
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'blur(40px)',
                          opacity: 0.3,
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

                      <Flex wrap gap={8} className="candidate-jobPills" style={{ marginBottom: 16 }}>
                        {selectedJob.level ? (
                          <span className="candidate-pill">{selectedJob.level}</span>
                        ) : null}
                        {selectedJob.type ? (
                          <span className="candidate-pill">{selectedJob.type}</span>
                        ) : null}
                        {selectedJob.is_remote ? <span className="candidate-pill">Remote</span> : null}
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
                          maxHeight: 200,
                          overflow: 'hidden',
                        }}
                        className="candidate-jobPreviewSummary"
                      >
                        {selectedJob.description ?? '—'}
                      </Paragraph>

                      {selectedJob.benefits?.length ? (
                        <div
                          style={{
                            marginBottom: 18,
                            padding: 12,
                            borderRadius: token.borderRadiusLG,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            background: token.colorBgContainer,
                            maxHeight: 160,
                            overflow: 'auto',
                          }}
                        >
                          <Text strong>Benefits</Text>
                          <div style={{ marginTop: 8 }}>
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                              {selectedJob.benefits.map((b, idx) => (
                                <li key={`${idx}-${b}`}>
                                  <Text type="secondary">{b}</Text>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : null}

                      <Flex gap={10} wrap>
                        <Link to={`/candidate/job/${selectedJob.id}`} style={{ flex: '1 1 auto' }}>
                          <Button block className="candidate-jobPreviewSecondaryBtn">
                            View full role
                          </Button>
                        </Link>
                        <Link to={`/candidate/job/${selectedJob.id}`} style={{ flex: '1 1 auto' }}>
                          <Button type="primary" block className="candidate-applyNowBtn">
                            Apply now
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
