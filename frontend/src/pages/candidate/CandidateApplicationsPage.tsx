import { BankOutlined, FilePdfOutlined } from '@ant-design/icons'
import {
  Button,
  Empty,
  Flex,
  Grid,
  Image,
  Input,
  Pagination,
  Select,
  Tag,
  Typography,
  theme,
  Spin,
  Alert,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { SkillsRadarChart } from '@/components/candidate/SkillsRadarChart'
import { parseSkillsRadar } from '@/components/candidate/skillsRadar'
import { getMyApplications, type CandidateApplication } from '@/services/applicationsService'

const { Title, Text, Paragraph } = Typography

/** Ant Design `Tag` color="default" is easy to mis-read; use explicit presets for every state. */
const HR_STATUS_COLOR: Record<string, string> = {
  Pending: 'gold',
  Shortlisted: 'blue',
  Interviewing: 'processing',
  Offered: 'orange',
  Accepted: 'success',
  Rejected: 'error',
}

const PROCESSING_STATUS_COLOR: Record<string, string> = {
  Pending: 'cyan',
  Processing: 'processing',
  Analyzed: 'success',
  Failed: 'error',
}

function tagColor(map: Record<string, string>, status: string | undefined): string {
  const raw = (status ?? '').trim()
  if (!raw) return 'geekblue'
  if (map[raw]) return map[raw]
  const pascal = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  return map[pascal] ?? 'geekblue'
}

const HR_STATUS_SORT_ORDER: Record<string, number> = {
  Pending: 0,
  Shortlisted: 1,
  Interviewing: 2,
  Offered: 3,
  Accepted: 4,
  Rejected: 5,
}

function getApiErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object') {
    const maybe = err as { response?: { data?: { message?: unknown } } }
    const msg = maybe.response?.data?.message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return fallback
}

function formatAppliedDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function formatAiScore(v: string | number | null | undefined): string | null {
  if (v === '' || v == null) return null
  const n = typeof v === 'string' ? Number.parseFloat(v) : v
  if (!Number.isFinite(n)) return null
  return `${Math.round(n * 10) / 10}%`
}

export function CandidateApplicationsPage() {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const isDesktop = !!screens.lg

  const [applications, setApplications] = useState<CandidateApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>('')
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<
    'applied_desc' | 'applied_asc' | 'hr_status' | 'title_asc'
  >('applied_desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const data = await getMyApplications()
        setApplications(Array.isArray(data) ? data : [])
        if (Array.isArray(data) && data.length > 0) {
          setSelectedApplicationId(data[0].id)
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to fetch applications'))
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [])

  const filteredApplications = useMemo(() => {
    const q = query.trim().toLowerCase()
    return applications.filter((a) => {
      const title = a.jobs?.title ?? ''
      const company = a.jobs?.companies?.name ?? ''
      const hr = a.hr_status ?? ''
      const proc = a.processing_status ?? ''
      if (!q) return true
      return (
        title.toLowerCase().includes(q) ||
        company.toLowerCase().includes(q) ||
        hr.toLowerCase().includes(q) ||
        proc.toLowerCase().includes(q)
      )
    })
  }, [applications, query])

  const sortedApplications = useMemo(() => {
    const list = [...filteredApplications]
    const hrRank = (s: string) => HR_STATUS_SORT_ORDER[s] ?? 99

    list.sort((a, b) => {
      switch (sortMode) {
        case 'applied_desc':
          return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
        case 'applied_asc':
          return new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime()
        case 'hr_status': {
          const d = hrRank(a.hr_status) - hrRank(b.hr_status)
          if (d !== 0) return d
          return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
        }
        case 'title_asc':
          return (a.jobs?.title ?? '').localeCompare(b.jobs?.title ?? '')
        default:
          return 0
      }
    })
    return list
  }, [filteredApplications, sortMode])

  useEffect(() => {
    setPage(1)
  }, [query, sortMode, pageSize])

  const visibleApplications = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedApplications.slice(start, start + pageSize)
  }, [sortedApplications, page, pageSize])

  useEffect(() => {
    if (!sortedApplications.length) {
      setSelectedApplicationId('')
      return
    }
    if (!selectedApplicationId || !sortedApplications.some((a) => a.id === selectedApplicationId)) {
      setSelectedApplicationId(sortedApplications[0].id)
    }
  }, [sortedApplications, selectedApplicationId])

  const selectedApplication = useMemo(
    () => sortedApplications.find((a) => a.id === selectedApplicationId) ?? sortedApplications[0],
    [sortedApplications, selectedApplicationId]
  )

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 500 }}>
        <Spin size="large" tip="Loading applications..." />
      </Flex>
    )
  }

  const job = selectedApplication?.jobs
  const aiLine = formatAiScore(selectedApplication?.ai_matching_score)
  const hasRadar =
    selectedApplication && parseSkillsRadar(selectedApplication.skills_radar).length >= 3

  return (
    <main className="candidate-jobsMain">
      <section className="candidate-jobsHero" aria-labelledby="candidate-apps-hero-title">
        <div className="candidate-jobsHeroOverlay" aria-hidden />
        <div className="candidate-jobsHeroContent">
          <Title id="candidate-apps-hero-title" level={2} className="candidate-jobsHeroTitle">
            Your applications
          </Title>
          <Text className="candidate-jobsHeroSubtitle">
            {applications.length} submission{applications.length === 1 ? '' : 's'} on file
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
                    placeholder="Search by job, company, or status…"
                  />
                </div>
                <Select
                  value={sortMode}
                  onChange={(v) => setSortMode(v)}
                  style={{ minWidth: 220 }}
                  options={[
                    { value: 'applied_desc', label: 'Applied (newest)' },
                    { value: 'applied_asc', label: 'Applied (oldest)' },
                    { value: 'hr_status', label: 'HR status' },
                    { value: 'title_asc', label: 'Job title A–Z' },
                  ]}
                />
              </Flex>

              <div className="candidate-jobsListScroll">
                <div className="candidate-jobsListInner">
                  {sortedApplications.length === 0 ? (
                    <Empty
                      className="candidate-appsEmpty"
                      style={{ padding: '48px 24px' }}
                      description={
                        <span style={{ color: token.colorTextSecondary }}>
                          {applications.length === 0
                            ? 'You have not applied to any roles yet.'
                            : 'No applications match your search.'}
                        </span>
                      }
                    >
                      <Link to="/candidate/jobs">
                        <Button type="primary">Browse jobs</Button>
                      </Link>
                    </Empty>
                  ) : (
                    visibleApplications.map((app) => (
                      <article
                        key={app.id}
                        className={`candidate-jobCard${app.id === selectedApplication?.id ? ' candidate-jobCard--selected' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-current={app.id === selectedApplication?.id ? 'true' : undefined}
                        onClick={() => setSelectedApplicationId(app.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedApplicationId(app.id)
                          }
                        }}
                      >
                        <Flex align="flex-start" justify="space-between" wrap gap={12}>
                          <Flex gap={28} align="center" style={{ minWidth: 0 }}>
                            <div className="candidate-jobLogoBox">
                              <Image
                                className="candidate-jobLogo"
                                src={app.jobs?.companies?.logo_url ?? undefined}
                                alt={`${app.jobs?.companies?.name ?? 'Company'} logo`}
                                preview={false}
                                width="100%"
                                height="100%"
                                style={{ objectFit: 'contain' }}
                              />
                            </div>

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div className="candidate-jobTitleRow">
                                <Text className="candidate-jobTitle">{app.jobs?.title ?? '—'}</Text>
                              </div>

                              <Flex className="candidate-jobMeta" align="center" wrap gap={10}>
                                <Text style={{ color: token.colorTextSecondary, fontWeight: 600 }}>
                                  {app.jobs?.companies?.name ?? '—'}
                                </Text>
                                <span className="candidate-dot" />
                                <Text style={{ color: token.colorTextSecondary, fontWeight: 600 }}>
                                  Applied {formatAppliedDate(app.applied_at)}
                                </Text>
                                <span className="candidate-dot" />
                                <Text style={{ color: token.colorTextSecondary, fontWeight: 600 }}>
                                  {app.jobs?.status ?? '—'}
                                </Text>
                              </Flex>

                              <Flex className="candidate-jobTagList" wrap gap={10}>
                                <Tag
                                  bordered={false}
                                  color={tagColor(HR_STATUS_COLOR, app.hr_status)}
                                  style={{
                                    margin: 0,
                                    fontWeight: 700,
                                    fontSize: 11,
                                    padding: '2px 10px',
                                    borderRadius: 999,
                                  }}
                                >
                                  HR: {app.hr_status}
                                </Tag>
                                <Tag
                                  bordered={false}
                                  color={tagColor(PROCESSING_STATUS_COLOR, app.processing_status)}
                                  style={{
                                    margin: 0,
                                    fontWeight: 700,
                                    fontSize: 11,
                                    padding: '2px 10px',
                                    borderRadius: 999,
                                  }}
                                >
                                  Processing: {app.processing_status}
                                </Tag>
                              </Flex>
                            </div>
                          </Flex>

                          <div onClick={(e) => e.stopPropagation()}>
                            <Button
                              type="link"
                              size="small"
                              icon={<FilePdfOutlined />}
                              href={app.cv_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontWeight: 600, paddingInline: 4 }}
                            >
                              CV
                            </Button>
                          </div>
                        </Flex>
                      </article>
                    ))
                  )}
                </div>
              </div>

              {sortedApplications.length > 0 ? (
                <div className="candidate-paginationBar">
                  <Text style={{ color: token.colorTextSecondary }}>
                    Page {page} of {Math.max(1, Math.ceil(sortedApplications.length / pageSize))}
                  </Text>
                  <Pagination
                    className="candidate-pagination"
                    current={page}
                    total={sortedApplications.length}
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
              ) : null}
            </Flex>
          </div>

          {isDesktop && selectedApplication && job ? (
            <aside className="candidate-jobsPreviewCol" aria-label="Application preview">
              <div className="candidate-jobPreviewSticky">
                <div className="candidate-jobPreview candidate-appPreview">
                  <div className="candidate-jobPreviewMedia">
                    <Image
                      src={job.companies?.logo_url ?? undefined}
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
                        {job.title}
                      </Title>
                    </Flex>

                    <Flex vertical gap={6} style={{ marginBottom: 12 }}>
                      <Flex gap={8} align="center" wrap>
                        <BankOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />
                        <Text style={{ fontWeight: 700, color: token.colorText }}>
                          {job.companies?.name ?? '—'}
                        </Text>
                      </Flex>
                      <Text type="secondary" style={{ fontWeight: 600, fontSize: 13 }}>
                        {job.status ?? '—'}
                        <span style={{ margin: '0 8px', opacity: 0.45 }} aria-hidden>
                          ·
                        </span>
                        Applied {formatAppliedDate(selectedApplication.applied_at)}
                      </Text>
                    </Flex>

                    <Flex wrap gap={8} className="candidate-jobPills" style={{ marginBottom: 16 }}>
                      <Tag
                        bordered={false}
                        color={tagColor(HR_STATUS_COLOR, selectedApplication.hr_status)}
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          fontSize: 12,
                          padding: '4px 12px',
                          borderRadius: 999,
                        }}
                      >
                        HR: {selectedApplication.hr_status}
                      </Tag>
                      <Tag
                        bordered={false}
                        color={tagColor(
                          PROCESSING_STATUS_COLOR,
                          selectedApplication.processing_status
                        )}
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          fontSize: 12,
                          padding: '4px 12px',
                          borderRadius: 999,
                        }}
                      >
                        Processing: {selectedApplication.processing_status}
                      </Tag>
                    </Flex>

                    {aiLine ? (
                      <div className="candidate-appPreviewScore">
                        <Text strong style={{ color: token.colorPrimary }}>
                          AI match score: {aiLine}
                        </Text>
                      </div>
                    ) : null}

                    <div className="candidate-appPreviewRadarSection">
                      {hasRadar ? (
                        <SkillsRadarChart skillsRadar={selectedApplication.skills_radar} />
                      ) : (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <span style={{ color: token.colorTextSecondary }}>
                              Skills radar will appear after your application is analyzed.
                            </span>
                          }
                        />
                      )}
                    </div>

                    {selectedApplication.cover_letter?.trim() ? (
                      <Paragraph
                        type="secondary"
                        ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
                        style={{ marginBottom: 16 }}
                        className="candidate-appPreviewCover"
                      >
                        {selectedApplication.cover_letter.trim()}
                      </Paragraph>
                    ) : null}

                    <Flex gap={10} wrap style={{ marginTop: 'auto' }}>
                      <Button
                        className="candidate-jobPreviewSecondaryBtn"
                        icon={<FilePdfOutlined />}
                        href={selectedApplication.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ flex: '1 1 auto' }}
                      >
                        Open CV
                      </Button>
                      <Link to={`/candidate/job/${job.id}`} style={{ flex: '1 1 auto' }}>
                        <Button type="primary" block className="candidate-applyNowBtn">
                          View job details
                        </Button>
                      </Link>
                    </Flex>
                  </div>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </main>
  )
}
