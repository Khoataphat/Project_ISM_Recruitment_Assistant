import { BuildOutlined, CodeOutlined, EditOutlined, RightOutlined } from '@ant-design/icons'
import {
  Avatar,
  Breadcrumb,
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Input,
  Pagination,
  Row,
  Select,
  Segmented,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
  theme,
} from 'antd'
import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { deleteJob, getHrJobs } from '@/services/jobsService'
import type { JobStatus as ApiJobStatus } from '@/types'

type JobFilter = 'all' | 'active' | 'filled'

type JobStatus = 'active' | 'paused' | 'filled'

type SortKey =
  | 'updated_desc'
  | 'updated_asc'
  | 'created_desc'
  | 'created_asc'
  | 'title_asc'
  | 'title_desc'

type JobItem = {
  id: string
  title: string
  subtitle: string
  status: JobStatus
  postedAt: string
  createdAtIso: string | null
  updatedAtIso: string | null
  icon: 'edit' | 'code' | 'arch'
  candidates: { type: 'avatars'; extra: number; count?: number } | { type: 'text'; label: string }
}

function formatPostedShort(iso: string) {
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

function normalizeStatus(status: ApiJobStatus): JobStatus {
  if (status === 'Open') return 'active'
  if (status === 'Draft') return 'paused'
  return 'filled'
}

function pickIcon(status: JobStatus): JobItem['icon'] {
  if (status === 'active') return 'edit'
  if (status === 'paused') return 'code'
  return 'arch'
}

function toJobItem(apiJob: {
  id: string
  title?: unknown
  status?: unknown
  created_at?: unknown
  updated_at?: unknown
  location?: unknown
  companies?: { name?: unknown } | null
  _count?: { applications?: unknown } | null
  application_count?: unknown
}): JobItem {
  const title =
    typeof apiJob.title === 'string' && apiJob.title.trim() ? apiJob.title : 'Untitled job'
  const apiStatus = (apiJob.status as ApiJobStatus | undefined) ?? 'Draft'
  const status = normalizeStatus(apiStatus)

  const company = apiJob.companies?.name
  const companyName = typeof company === 'string' && company.trim() ? company : 'Company'
  const location =
    typeof apiJob.location === 'string' && apiJob.location.trim() ? apiJob.location : '—'

  const rawCount =
    (typeof apiJob._count?.applications === 'number' ? apiJob._count?.applications : undefined) ??
    (typeof apiJob.application_count === 'number' ? apiJob.application_count : undefined) ??
    0

  const candidates =
    rawCount >= 100
      ? { type: 'text' as const, label: `${rawCount} Candidates` }
      : { type: 'avatars' as const, extra: rawCount }

  const postedAt =
    typeof apiJob.created_at === 'string' && apiJob.created_at.trim()
      ? formatPostedShort(apiJob.created_at)
      : '—'

  return {
    id: apiJob.id,
    title,
    subtitle: `${companyName} • ${location}`,
    status,
    postedAt,
    createdAtIso: typeof apiJob.created_at === 'string' ? apiJob.created_at : null,
    updatedAtIso: typeof apiJob.updated_at === 'string' ? apiJob.updated_at : null,
    icon: pickIcon(status),
    candidates,
  }
}

function JobIcon({
  kind,
  token,
}: {
  kind: JobItem['icon']
  token: ReturnType<typeof theme.useToken>['token']
}) {
  const base: CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: token.borderRadiusLG,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: token.fontSizeXL,
  }
  if (kind === 'edit') {
    return (
      <div
        style={{
          ...base,
          background: `color-mix(in srgb, ${token.colorPrimary} 18%, ${token.colorFillTertiary})`,
          color: token.colorPrimary,
        }}
      >
        <EditOutlined />
      </div>
    )
  }
  if (kind === 'code') {
    return (
      <div
        style={{
          ...base,
          background: token.colorFillSecondary,
          color: token.colorTextSecondary,
        }}
      >
        <CodeOutlined />
      </div>
    )
  }
  return (
    <div
      style={{
        ...base,
        background: `color-mix(in srgb, ${token.colorInfo} 16%, ${token.colorFillTertiary})`,
        color: token.colorInfo,
      }}
    >
      <BuildOutlined />
    </div>
  )
}

function StatusTag({
  status,
  token,
}: {
  status: JobStatus
  token: ReturnType<typeof theme.useToken>['token']
}) {
  const dot: CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: '50%',
    marginRight: token.marginXXS,
  }
  if (status === 'active') {
    return (
      <Tag
        style={{
          margin: 0,
          borderRadius: 999,
          border: 'none',
          fontWeight: 700,
          fontSize: token.fontSizeSM,
          background: token.colorSuccessBg,
          color: token.colorSuccess,
        }}
      >
        <span
          style={{
            ...dot,
            background: token.colorSuccess,
            display: 'inline-block',
            verticalAlign: 'middle',
          }}
        />
        Active
      </Tag>
    )
  }
  if (status === 'paused') {
    return (
      <Tag
        style={{
          margin: 0,
          borderRadius: 999,
          border: 'none',
          fontWeight: 700,
          fontSize: token.fontSizeSM,
          background: token.colorWarningBg,
          color: token.colorWarning,
        }}
      >
        <span
          style={{
            ...dot,
            background: token.colorWarning,
            display: 'inline-block',
            verticalAlign: 'middle',
          }}
        />
        Paused
      </Tag>
    )
  }
  return (
    <Tag
      style={{
        margin: 0,
        borderRadius: 999,
        border: 'none',
        fontWeight: 700,
        fontSize: token.fontSizeSM,
        background: token.colorFillSecondary,
        color: token.colorTextSecondary,
      }}
    >
      <span
        style={{
          ...dot,
          background: token.colorTextTertiary,
          display: 'inline-block',
          verticalAlign: 'middle',
        }}
      />
      Filled
    </Tag>
  )
}

function JobListRow({
  job,
  token,
}: {
  job: JobItem
  token: ReturnType<typeof theme.useToken>['token']
  onDelete: (jobId: string) => void
  deleting: boolean
}) {
  const [hovered, setHovered] = useState(false)

  const jobCardStyle: CSSProperties = useMemo(
    () => ({
      padding: `${token.paddingLG * 1.25}px ${token.paddingLG}px`,
      background: hovered
        ? `color-mix(in srgb, ${token.colorPrimaryBg} 26%, ${token.colorBgContainer})`
        : token.colorBgContainer,
      borderRadius: token.borderRadiusLG * 2,
      border: `1px solid ${
        hovered
          ? `color-mix(in srgb, ${token.colorPrimary} 18%, ${token.colorBorderSecondary})`
          : token.colorBorderSecondary
      }`,
      boxShadow: hovered
        ? '0 18px 55px rgba(0, 26, 67, 0.10)'
        : '0 10px 34px rgba(0, 26, 67, 0.06)',
      transition: `box-shadow 220ms ease, border-color 220ms ease, background-color 220ms ease`,
    }),
    [hovered, token]
  )

  return (
    <Row
      gutter={[16, 16]}
      align="middle"
      style={jobCardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      role="group"
      aria-label={`Job: ${job.title}`}
      className="hr-focusRing hr-interactive"
    >
      <Col xs={24} lg={10}>
        <Flex align="center" gap={token.margin}>
          <JobIcon kind={job.icon} token={token} />
          <div>
            <Link to={`/hr/job/${job.id}`} style={{ textDecoration: 'none' }}>
              <Typography.Title
                level={5}
                style={{
                  margin: 0,
                  fontWeight: 700,
                  color: hovered ? token.colorPrimary : token.colorText,
                  transition: `color ${token.motionDurationMid}`,
                }}
              >
                {job.title}
              </Typography.Title>
            </Link>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
              {job.subtitle}
            </Typography.Text>
          </div>
        </Flex>
      </Col>
      <Col xs={12} lg={4}>
        <StatusTag status={job.status} token={token} />
      </Col>
      <Col xs={12} lg={4}>
        <CandidatePreview data={job.candidates} token={token} />
      </Col>
      <Col xs={12} lg={4}>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
          {job.postedAt}
        </Typography.Text>
      </Col>
      <Col xs={12} lg={2} style={{ textAlign: 'right' }}>
        <Space size="small">
          <Tooltip title="Edit">
            <Link
              to={`/hr/job/${job.id}`}
              state={{ mode: 'edit' }}
              style={{ textDecoration: 'none', display: 'inline-flex' }}
              aria-label={`Edit ${job.title}`}
            >
              <Button type="text" size="small" icon={<EditOutlined />} />
            </Link>
          </Tooltip>
        </Space>
      </Col>
    </Row>
  )
}

function CandidatePreview({
  data,
  token,
}: {
  data: JobItem['candidates']
  token: ReturnType<typeof theme.useToken>['token']
}) {
  if (data.type === 'text') {
    return (
      <Typography.Text type="secondary" strong style={{ fontSize: token.fontSize }}>
        {data.label}
      </Typography.Text>
    )
  }
  const n = data.extra >= 10 ? 2 : 1
  return (
    <Flex align="center" style={{ marginLeft: token.marginXXS }}>
      {Array.from({ length: n }).map((_, i) => (
        <Avatar
          key={i}
          size={32}
          style={{
            marginLeft: i === 0 ? 0 : -token.marginXS,
            border: `2px solid ${token.colorBgContainer}`,
            background: token.colorFillTertiary,
          }}
        />
      ))}
      <Avatar
        size={32}
        style={{
          marginLeft: -token.marginXS,
          border: `2px solid ${token.colorBgContainer}`,
          background: `color-mix(in srgb, ${token.colorPrimary} 16%, ${token.colorFillTertiary})`,
          color: token.colorPrimary,
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        +{data.extra}
      </Avatar>
    </Flex>
  )
}

export function HrMyJobPage() {
  const { token } = theme.useToken()
  const [filter, setFilter] = useState<JobFilter>('all')
  const [searchText, setSearchText] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('updated_desc')
  const [page, setPage] = useState(1)
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingById, setDeletingById] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const apiJobs = await getHrJobs()
        if (!mounted) return
        setJobs(apiJobs.map(toJobItem))
      } catch (err: unknown) {
        if (!mounted) return
        const msg =
          err && typeof err === 'object'
            ? ((err as { message?: unknown }).message as string | undefined)
            : undefined
        setError(typeof msg === 'string' && msg.trim() ? msg : 'Failed to load jobs')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    setPage(1)
  }, [filter, searchText, sortKey])

  const derivedJobs = useMemo(() => {
    const q = searchText.trim().toLowerCase()

    const filtered =
      filter === 'all'
        ? jobs
        : filter === 'active'
          ? jobs.filter((j) => j.status === 'active')
          : jobs.filter((j) => j.status === 'filled')

    const searched = q ? filtered.filter((j) => j.title.toLowerCase().includes(q)) : filtered

    const sorted = [...searched].sort((a, b) => {
      if (sortKey === 'title_asc') return a.title.localeCompare(b.title)
      if (sortKey === 'title_desc') return b.title.localeCompare(a.title)

      const aCreated = a.createdAtIso ? Date.parse(a.createdAtIso) : Number.NEGATIVE_INFINITY
      const bCreated = b.createdAtIso ? Date.parse(b.createdAtIso) : Number.NEGATIVE_INFINITY

      const aUpdated = a.updatedAtIso ? Date.parse(a.updatedAtIso) : aCreated
      const bUpdated = b.updatedAtIso ? Date.parse(b.updatedAtIso) : bCreated

      if (sortKey === 'created_desc') return bCreated - aCreated
      if (sortKey === 'created_asc') return aCreated - bCreated
      if (sortKey === 'updated_asc') return aUpdated - bUpdated
      return bUpdated - aUpdated
    })

    return sorted
  }, [filter, jobs, searchText, sortKey])

  const pageSize = 10
  const total = derivedJobs.length
  const pagedJobs = useMemo(() => {
    const start = (page - 1) * pageSize
    return derivedJobs.slice(start, start + pageSize)
  }, [derivedJobs, page])

  const summary = useMemo(() => {
    const totalJobs = jobs.length
    const active = jobs.filter((j) => j.status === 'active').length
    const filled = jobs.filter((j) => j.status === 'filled').length
    return { totalJobs, active, filled }
  }, [jobs])

  const headerRowStyle: CSSProperties = {
    padding: `${token.padding}px ${token.paddingLG}px`,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: token.margin,
    position: 'sticky',
    top: 76,
    zIndex: 1,
  }

  return (
    <div
      style={{
        width: '100%',
        height: `calc(100vh - 80px - ${token.paddingLG * 2}px)`,
        minHeight: 0,
      }}
    >
      <Flex vertical gap={token.marginXL} style={{ height: '100%', minHeight: 0 }}>
        <header>
          <Breadcrumb
            style={{ marginBottom: token.marginMD, fontSize: token.fontSizeSM }}
            items={[
              {
                title: (
                  <Link to="/hr/dashboard" style={{ color: token.colorTextSecondary }}>
                    Dashboard
                  </Link>
                ),
              },
              {
                title: <span style={{ color: token.colorText, fontWeight: 500 }}>My Jobs</span>,
              },
            ]}
            separator={<RightOutlined style={{ fontSize: 10, color: token.colorTextTertiary }} />}
          />
          <Flex justify="space-between" align="flex-end" wrap="wrap" gap={token.marginLG}>
            <div style={{ maxWidth: 420 }}>
              <Typography.Title
                level={1}
                style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}
              >
                Job Management
              </Typography.Title>
              <Typography.Paragraph
                style={{ margin: `${token.marginXS}px 0 0`, color: token.colorTextSecondary }}
              >
                Oversee your active requisitions and talent pipeline across the enterprise
                infrastructure.
              </Typography.Paragraph>
            </div>
            <Flex wrap="wrap" gap={token.marginSM} style={{ marginBottom: 2 }}>
              {[
                { label: 'Total', value: summary.totalJobs },
                { label: 'Active', value: summary.active },
                { label: 'Filled', value: summary.filled },
              ].map((item) => (
                <div
                  key={item.label}
                  className="hr-surface hr-glass hr-surface--flat"
                  style={{
                    padding: `${token.paddingSM}px ${token.paddingMD}px`,
                    minWidth: 120,
                  }}
                >
                  <div className="hr-miniCaps">{item.label}</div>
                  <Typography.Text style={{ fontSize: token.fontSizeXL, fontWeight: 900 }}>
                    {item.value}
                  </Typography.Text>
                </div>
              ))}
            </Flex>
          </Flex>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <section>
            {error && (
              <Alert type="error" message={error} showIcon style={{ marginBottom: token.margin }} />
            )}
            <div
              className="hr-surface hr-glass hr-sticky-surface"
              style={{
                padding: token.paddingSM,
                marginBottom: token.margin,
                top: 0,
              }}
            >
              <Flex justify="space-between" align="center" wrap="wrap" gap={token.margin}>
                <Input
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search by title…"
                  style={{ maxWidth: 420, flex: '1 1 260px' }}
                />

                <Flex wrap="wrap" gap={token.marginSM} style={{ justifyContent: 'flex-end' }}>
                  <Segmented<JobFilter>
                    value={filter}
                    onChange={(v) => setFilter(v)}
                    options={[
                      { label: 'All Jobs', value: 'all' },
                      { label: 'Active', value: 'active' },
                      { label: 'Filled', value: 'filled' },
                    ]}
                  />
                  <Select<SortKey>
                    value={sortKey}
                    onChange={setSortKey}
                    style={{ width: 240 }}
                    options={[
                      { value: 'updated_desc', label: 'Updated: newest' },
                      { value: 'updated_asc', label: 'Updated: oldest' },
                      { value: 'created_desc', label: 'Posted: newest' },
                      { value: 'created_asc', label: 'Posted: oldest' },
                      { value: 'title_asc', label: 'Title: A–Z' },
                      { value: 'title_desc', label: 'Title: Z–A' },
                    ]}
                  />
                </Flex>
              </Flex>
            </div>
            <Row gutter={[16, 0]} style={headerRowStyle} wrap={false}>
              <Col xs={0} lg={10}>
                Job Details
              </Col>
              <Col xs={0} lg={4}>
                Status
              </Col>
              <Col xs={0} lg={4}>
                Candidates
              </Col>
              <Col xs={0} lg={4}>
                Posted Date
              </Col>
              <Col xs={0} lg={2} style={{ textAlign: 'right' }}>
                Actions
              </Col>
            </Row>

            {loading ? (
              <Card
                className="hr-surface hr-glass"
                bordered={false}
                style={{ marginTop: token.margin }}
                bodyStyle={{ padding: token.paddingLG }}
              >
                <Flex align="center" gap={token.margin}>
                  <Spin />
                  <div>
                    <Typography.Text strong style={{ display: 'block' }}>
                      Loading jobs…
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      Fetching your requisitions and latest updates.
                    </Typography.Text>
                  </div>
                </Flex>
              </Card>
            ) : pagedJobs.length === 0 ? (
              <Card
                className="hr-surface hr-glass"
                bordered={false}
                style={{ marginTop: token.margin }}
                bodyStyle={{ padding: token.paddingLG * 1.5 }}
              >
                <Empty
                  description={
                    <div>
                      <Typography.Text strong style={{ display: 'block' }}>
                        No jobs match your current view
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        Try clearing search/filters or switch segment.
                      </Typography.Text>
                    </div>
                  }
                >
                  <Flex
                    justify="center"
                    wrap="wrap"
                    gap={token.marginSM}
                    style={{ marginTop: token.margin }}
                  >
                    <Button
                      onClick={() => {
                        setSearchText('')
                        setFilter('all')
                        setSortKey('updated_desc')
                      }}
                    >
                      Clear filters
                    </Button>
                    <Link to="/hr/my-job" style={{ textDecoration: 'none' }}>
                      <Button type="primary">Post New Job</Button>
                    </Link>
                  </Flex>
                </Empty>
              </Card>
            ) : (
              <Space direction="vertical" size={token.margin} style={{ width: '100%' }}>
                {pagedJobs.map((job) => (
                  <JobListRow
                    key={job.id}
                    job={job}
                    token={token}
                    deleting={Boolean(deletingById[job.id])}
                    onDelete={async (jobId) => {
                      try {
                        setDeletingById((prev) => ({ ...prev, [jobId]: true }))
                        await deleteJob(jobId)
                        setJobs((prev) => prev.filter((j) => j.id !== jobId))
                        message.success('Job deleted')
                      } catch (err: unknown) {
                        const msg =
                          err && typeof err === 'object'
                            ? ((err as { message?: unknown }).message as string | undefined)
                            : undefined
                        message.error(
                          typeof msg === 'string' && msg.trim() ? msg : 'Failed to delete job'
                        )
                      } finally {
                        setDeletingById((prev) => {
                          const next = { ...prev }
                          delete next[jobId]
                          return next
                        })
                      }
                    }}
                  />
                ))}
              </Space>
            )}
          </section>
        </div>

        <Flex justify="space-between" align="center" wrap="wrap" gap={token.margin}>
          <Typography.Text type="secondary">
            {total === 0 ? '0' : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of{' '}
            {total}
          </Typography.Text>
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={setPage}
            showSizeChanger={false}
          />
        </Flex>
      </Flex>
    </div>
  )
}
