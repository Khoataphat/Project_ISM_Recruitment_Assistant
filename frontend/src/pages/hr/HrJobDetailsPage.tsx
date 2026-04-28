import { EnvironmentOutlined, FileTextOutlined, RightOutlined, StarFilled } from '@ant-design/icons'
import {
  Avatar,
  Breadcrumb,
  Button,
  Col,
  Flex,
  Image,
  Pagination,
  Result,
  Row,
  Space,
  Tag,
  Typography,
  theme,
  Spin,
} from 'antd'
import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { apiClient } from '@/lib/api'

const PIPELINE_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBmrWT5hOOytaPJF8g5Hg4lP0mNxMaL3NyyHm_hv6YAprmcgngacokNZqQIVIYY_piu4ZjkwwVDDV8uGqjwnrzLIx8BNspsgRMPu-RN7-Q09SLjvzMO5kChuj5XF4ScN2A1JXvWSopmh8wWdc9B-or1gCUTAwzaGkWv3W0VBPlU6xOxvysUw6yPp_K3c1_t-CdY-WCIt-IMm-YA05wboIJmzi5bH_jOMcKIMaLbwYMyrurRxKqSUOgRe4Oc0OOqsE2AGgWS4ygCew'

type PipelineFilter = 'all' | 'interviewing' | 'new'

type PipelineRow = {
  applicationId: string
  name: string
  subtitle: string
  status: string
  appliedAtLabel: string
  resumeUrl: string
}

type HrJob = {
  id: string
  title: string
  location?: string
}

type HrApplication = {
  id: string
  job_id: string
  hr_status: string
  applied_at: string
  cv_url: string
  candidates: {
    users: {
      full_name: string
      email: string
    }
  }
}

function getApiErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object') {
    const maybe = err as { response?: { data?: { message?: unknown } } }
    const msg = maybe.response?.data?.message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return fallback
}

function formatAppliedShort(iso: string) {
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

const HR_STATUS_COLOR: Record<string, string> = {
  Pending: 'default',
  Shortlisted: 'blue',
  Interviewing: 'processing',
  Offered: 'gold',
  Accepted: 'success',
  Rejected: 'error',
}

function CandidateTableRow({
  row,
  token,
}: {
  row: PipelineRow
  token: ReturnType<typeof theme.useToken>['token']
}) {
  const [hovered, setHovered] = useState(false)

  const rowStyle: CSSProperties = {
    padding: `${token.paddingLG}px ${token.paddingLG * 1.5}px`,
    transition: `background ${token.motionDurationMid}`,
  }

  const initials =
    row.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'

  return (
    <Row
      gutter={[16, 16]}
      align="middle"
      style={rowStyle}
      onMouseEnter={(e) => {
        setHovered(true)
        e.currentTarget.style.background = `color-mix(in srgb, ${token.colorFillAlter} 45%, transparent)`
      }}
      onMouseLeave={(e) => {
        setHovered(false)
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <Col xs={24} lg={8}>
        <Flex align="center" gap={token.margin}>
          <Avatar
            size={48}
            shape="square"
            style={{
              borderRadius: token.borderRadiusLG,
              background: token.colorFillSecondary,
              color: token.colorPrimary,
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
          <div>
            <Typography.Text
              strong
              style={{
                display: 'block',
                color: hovered ? token.colorPrimary : token.colorText,
                transition: `color ${token.motionDurationMid}`,
              }}
            >
              {row.name}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {row.subtitle}
            </Typography.Text>
          </div>
        </Flex>
      </Col>
      <Col xs={24} lg={5} style={{ textAlign: 'center' }}>
        <Tag
          color={HR_STATUS_COLOR[row.status] || 'default'}
          style={{ borderRadius: 999, fontWeight: 700, textTransform: 'uppercase' }}
        >
          {row.status}
        </Tag>
      </Col>
      <Col xs={24} lg={4} style={{ textAlign: 'center' }}>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
          {row.appliedAtLabel}
        </Typography.Text>
      </Col>
      <Col xs={24} lg={7}>
        <Flex justify="flex-end" gap={token.marginSM} wrap="wrap">
          <Button
            type="default"
            icon={<FileTextOutlined />}
            style={{
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadowTertiary,
              borderColor: `color-mix(in srgb, ${token.colorBorder} 55%, transparent)`,
            }}
            href={row.resumeUrl}
            target="_blank"
            rel="noreferrer"
          />
          <Link to={`/hr/candidate/${row.applicationId}`}>
            <Button
              type="default"
              style={{
                fontWeight: 700,
                fontSize: token.fontSizeSM,
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadowTertiary,
                borderColor: `color-mix(in srgb, ${token.colorBorder} 55%, transparent)`,
              }}
            >
              View application
            </Button>
          </Link>
        </Flex>
      </Col>
    </Row>
  )
}

export function HrJobDetailsPage() {
  const { id } = useParams()
  const { token } = theme.useToken()
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>('all')
  const [page, setPage] = useState(1)
  const [job, setJob] = useState<HrJob | null>(null)
  const [applications, setApplications] = useState<HrApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        setLoading(true)
        const [jobRes, appsRes] = await Promise.all([
          apiClient.get(`/jobs/${id}`),
          apiClient.get('/dashboard/applications'), // Need to filter by jobId in frontend or backend
        ])
        setJob(jobRes.data.data)
        // Filter apps by jobId
        const apps: HrApplication[] = appsRes.data.data
        const filteredApps = apps.filter((a) => a.job_id === id)
        setApplications(filteredApps)
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to fetch job details'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const pipelineRows = useMemo(
    () =>
      applications.map((a) => ({
        applicationId: a.id,
        name: a.candidates.users.full_name,
        subtitle: a.candidates.users.email,
        status: a.hr_status,
        appliedAtLabel: formatAppliedShort(a.applied_at),
        resumeUrl: a.cv_url,
      })),
    [applications]
  )

  const filteredRows = useMemo(() => {
    if (pipelineFilter === 'all') return pipelineRows
    if (pipelineFilter === 'interviewing')
      return pipelineRows.filter((r) => r.status === 'Interviewing')
    return pipelineRows.filter((r) => r.status === 'Pending')
  }, [pipelineFilter, pipelineRows])

  const stats = useMemo(() => {
    return {
      total: applications.length,
      applied: applications.filter((a) => a.hr_status === 'Pending').length,
      interviewing: applications.filter((a) => a.hr_status === 'Interviewing').length,
      closed: applications.filter((a) => a.hr_status === 'Rejected' || a.hr_status === 'Accepted')
        .length,
    }
  }, [applications])

  const pageSize = 4
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, page])

  const pipelineCardStyle: CSSProperties = {
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG * 2,
    padding: token.paddingLG * 1.5,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200,
  }

  const alertCardStyle: CSSProperties = {
    background: token.colorPrimary,
    color: token.colorTextLightSolid,
    borderRadius: token.borderRadiusLG * 2,
    padding: token.paddingLG * 1.5,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200,
  }

  const listCardStyle: CSSProperties = {
    borderRadius: token.borderRadiusLG * 2,
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(0, 26, 67, 0.06)',
    background: token.colorBgContainer,
  }

  const listHeaderStyle: CSSProperties = {
    padding: `${token.paddingLG}px ${token.paddingLG * 1.5}px`,
    borderBottom: `1px solid color-mix(in srgb, ${token.colorBorderSecondary} 55%, transparent)`,
  }

  const tableHeadStyle: CSSProperties = {
    padding: `${token.padding}px ${token.paddingLG * 1.5}px`,
    background: token.colorFillAlter,
    color: token.colorTextSecondary,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  }

  const filterBtn = (key: PipelineFilter, label: string) => {
    const active = pipelineFilter === key
    return (
      <Button
        type="text"
        size="small"
        onClick={() => {
          setPipelineFilter(key)
          setPage(1)
        }}
        style={{
          fontSize: token.fontSizeSM,
          fontWeight: 800,
          borderRadius: token.borderRadius,
          color: active ? token.colorPrimary : token.colorTextSecondary,
          background: active ? token.colorPrimaryBg : undefined,
        }}
      >
        {label}
      </Button>
    )
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 500 }}>
        <Spin size="large" />
      </Flex>
    )
  }

  if (error || !job) {
    return (
      <div style={{ maxWidth: 640, margin: '48px auto' }}>
        <Result
          status="404"
          title="Job not found"
          subTitle={error ?? 'There is no job with this id.'}
          extra={
            <Link to="/hr/jobs">
              <Button type="primary">Back to jobs</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const highlightCount = Math.min(3, stats.total)

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <Flex vertical gap={token.marginXL * 1.25}>
        <Flex justify="space-between" align="flex-end" wrap="wrap" gap={token.marginLG}>
          <div>
            <Breadcrumb
              style={{
                marginBottom: token.marginMD,
                fontSize: token.fontSizeSM,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
              items={[
                {
                  title: (
                    <Link to="/hr/jobs" style={{ color: token.colorTextSecondary }}>
                      Jobs
                    </Link>
                  ),
                },
                {
                  title: <span style={{ color: token.colorPrimary }}>Candidates</span>,
                },
              ]}
              separator={<RightOutlined style={{ fontSize: 10, color: token.colorTextTertiary }} />}
            />
            <Typography.Title
              level={2}
              style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}
            >
              {job.title}
            </Typography.Title>
            <Flex gap={token.marginSM} wrap="wrap" style={{ marginTop: token.margin }}>
              <Tag
                style={{
                  margin: 0,
                  borderRadius: 999,
                  padding: `${token.paddingXXS + 2}px ${token.paddingSM}px`,
                  fontWeight: 600,
                  fontSize: token.fontSizeSM,
                  border: 'none',
                  background: token.colorFillTertiary,
                  color: token.colorTextSecondary,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: token.colorSuccess,
                    marginRight: token.marginXXS,
                  }}
                />
                Active Role
              </Tag>
              <Tag
                icon={<EnvironmentOutlined />}
                style={{
                  margin: 0,
                  borderRadius: 999,
                  padding: `${token.paddingXXS + 2}px ${token.paddingSM}px`,
                  fontWeight: 600,
                  fontSize: token.fontSizeSM,
                  border: 'none',
                  background: token.colorFillTertiary,
                  color: token.colorTextSecondary,
                }}
              >
                {job.location}
              </Tag>
            </Flex>
          </div>
          <Space wrap>
            <Button
              size="large"
              style={{
                fontWeight: 600,
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadowTertiary,
                borderColor: `color-mix(in srgb, ${token.colorBorder} 45%, transparent)`,
              }}
            >
              Export List
            </Button>
            <Button
              type="primary"
              size="large"
              style={{ fontWeight: 600, borderRadius: token.borderRadiusLG }}
            >
              Edit Job Detail
            </Button>
          </Space>
        </Flex>

        <Row gutter={[token.marginLG, token.marginLG]}>
          <Col xs={24} lg={16}>
            <div style={pipelineCardStyle}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <Typography.Text
                  type="secondary"
                  style={{ fontWeight: 500, fontSize: token.fontSize }}
                >
                  Total Pipeline
                </Typography.Text>
                <Typography.Title
                  level={2}
                  style={{ margin: `${token.marginXXS}px 0 0`, fontSize: 48, fontWeight: 800 }}
                >
                  {stats.total}
                </Typography.Title>
                <Flex gap={token.marginLG} wrap="wrap" style={{ marginTop: token.marginLG }}>
                  <div>
                    <Typography.Text
                      style={{
                        display: 'block',
                        fontSize: token.fontSizeSM,
                        fontWeight: 800,
                        color: token.colorTextSecondary,
                        marginBottom: token.marginXXS,
                      }}
                    >
                      APPLIED
                    </Typography.Text>
                    <Typography.Text strong style={{ fontSize: token.fontSizeHeading3 }}>
                      {stats.applied}
                    </Typography.Text>
                  </div>
                  <div>
                    <Typography.Text
                      style={{
                        display: 'block',
                        fontSize: token.fontSizeSM,
                        fontWeight: 800,
                        color: token.colorTextSecondary,
                        marginBottom: token.marginXXS,
                      }}
                    >
                      INTERVIEWING
                    </Typography.Text>
                    <Typography.Text
                      strong
                      style={{ fontSize: token.fontSizeHeading3, color: token.colorPrimary }}
                    >
                      {stats.interviewing}
                    </Typography.Text>
                  </div>
                  <div>
                    <Typography.Text
                      style={{
                        display: 'block',
                        fontSize: token.fontSizeSM,
                        fontWeight: 800,
                        color: token.colorTextSecondary,
                        marginBottom: token.marginXXS,
                      }}
                    >
                      CLOSED
                    </Typography.Text>
                    <Typography.Text strong style={{ fontSize: token.fontSizeHeading3 }}>
                      {stats.closed}
                    </Typography.Text>
                  </div>
                </Flex>
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: '50%',
                  height: '100%',
                  opacity: 0.1,
                  pointerEvents: 'none',
                }}
              >
                <Image
                  src={PIPELINE_BG}
                  alt=""
                  preview={false}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </Col>
          <Col xs={24} lg={8}>
            <div style={alertCardStyle}>
              <Typography.Text
                style={{
                  color: `color-mix(in srgb, ${token.colorTextLightSolid} 88%, transparent)`,
                  fontWeight: 500,
                  fontSize: token.fontSizeSM,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Top Talent Alert
              </Typography.Text>
              <Typography.Title
                level={4}
                style={{
                  color: token.colorTextLightSolid,
                  margin: `${token.marginSM}px 0 ${token.margin}px`,
                  fontWeight: 700,
                  lineHeight: 1.35,
                }}
              >
                {stats.total === 0
                  ? 'No applications yet for this role'
                  : `${highlightCount} candidate${highlightCount === 1 ? '' : 's'} in the active pipeline`}
              </Typography.Title>
              <Link to="/hr/candidates">
                <Button
                  style={{
                    marginTop: token.marginSM,
                    fontWeight: 700,
                    borderRadius: token.borderRadiusLG,
                    color: token.colorPrimary,
                    border: 'none',
                  }}
                >
                  View all candidates
                </Button>
              </Link>
              <StarFilled
                style={{
                  position: 'absolute',
                  right: -token.marginLG,
                  bottom: -token.marginLG,
                  fontSize: 120,
                  color: token.colorTextLightSolid,
                  opacity: 0.12,
                }}
              />
            </div>
          </Col>
        </Row>

        <div style={listCardStyle}>
          <Flex
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={token.margin}
            style={listHeaderStyle}
          >
            <Typography.Title level={5} style={{ margin: 0, fontWeight: 700 }}>
              Active Pipeline
            </Typography.Title>
            <Space size={token.marginXS}>
              {filterBtn('all', 'ALL')}
              {filterBtn('interviewing', 'INTERVIEWING')}
              {filterBtn('new', 'NEW')}
            </Space>
          </Flex>

          <div>
            <Row gutter={[16, 0]} style={tableHeadStyle}>
              <Col xs={0} lg={8}>
                Candidate
              </Col>
              <Col xs={0} lg={5} style={{ textAlign: 'center' }}>
                Status
              </Col>
              <Col xs={0} lg={4} style={{ textAlign: 'center' }}>
                Date Applied
              </Col>
              <Col xs={0} lg={7} style={{ textAlign: 'right' }}>
                Action
              </Col>
            </Row>

            {paged.length === 0 ? (
              <div style={{ padding: token.paddingLG * 2, textAlign: 'center' }}>
                <Typography.Text type="secondary">No candidates in this view.</Typography.Text>
              </div>
            ) : (
              paged.map((row) => (
                <CandidateTableRow key={row.applicationId} row={row} token={token} />
              ))
            )}
          </div>

          <Flex
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={token.margin}
            style={{
              padding: `${token.paddingLG}px ${token.paddingLG * 1.5}px`,
              background: `color-mix(in srgb, ${token.colorFillAlter} 50%, transparent)`,
            }}
          >
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM, fontWeight: 500 }}
            >
              Showing {paged.length === 0 ? 0 : (page - 1) * pageSize + 1}–
              {(page - 1) * pageSize + paged.length} of {filteredRows.length} candidates
            </Typography.Text>
            <Pagination
              size="small"
              current={page}
              total={filteredRows.length}
              pageSize={pageSize}
              onChange={setPage}
              showSizeChanger={false}
            />
          </Flex>
        </div>
      </Flex>
    </div>
  )
}
