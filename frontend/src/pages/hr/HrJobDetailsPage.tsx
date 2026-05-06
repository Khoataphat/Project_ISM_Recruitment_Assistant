import {
  DownloadOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  RightOutlined,
  StarFilled,
} from '@ant-design/icons'
import {
  Avatar,
  Breadcrumb,
  Button,
  Col,
  Empty,
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
import { getHrJobById } from '@/services/jobsService'

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

  const rowStyle: CSSProperties = useMemo(
    () => ({
      padding: `${token.paddingLG}px ${token.paddingLG * 1.5}px`,
      borderTop: `1px solid rgba(15, 23, 42, 0.06)`,
      background: hovered ? 'rgba(22, 119, 255, 0.06)' : 'transparent',
      boxShadow: hovered ? 'inset 3px 0 0 rgba(22, 119, 255, 0.65)' : 'none',
      outline: hovered ? `2px solid rgba(22, 119, 255, 0.22)` : 'none',
      outlineOffset: -2,
      transition:
        'background-color 220ms ease, background 220ms ease, border-color 220ms ease, box-shadow 220ms ease',
    }),
    [hovered, token]
  )

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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
        setHovered(false)
      }}
      role="group"
      aria-label={`Candidate: ${row.name}`}
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
        const [jobData, appsRes] = await Promise.all([
          getHrJobById(id),
          apiClient.get('/dashboard/applications'), // backend returns { applications, pagination }
        ])
        setJob({
          id: jobData.id,
          title: jobData.title,
          location: jobData.location ?? undefined,
        })
        // Filter apps by jobId
        const apps: HrApplication[] = appsRes.data?.data?.applications ?? []
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

  const pageStyle: CSSProperties = {
    position: 'relative',
    margin: '0 auto',
  }

  const pageBgStyle: CSSProperties = {
    position: 'absolute',
    inset: -24,
    top: -token.paddingXL * 2,
    pointerEvents: 'none',
    zIndex: 0,
    background: [
      `radial-gradient(820px 520px at 12% 10%, rgba(22, 119, 255, 0.18), transparent 62%)`,
      `radial-gradient(740px 460px at 86% 0%, rgba(56, 189, 248, 0.14), transparent 60%)`,
      `radial-gradient(520px 320px at 55% 42%, rgba(22, 119, 255, 0.08), transparent 60%)`,
    ].join(','),
    filter: 'saturate(1.05)',
  }

  const pipelineCardStyle: CSSProperties = {
    borderRadius: token.borderRadiusLG * 2,
    padding: token.paddingLG * 1.5,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200,
    border: '1px solid rgba(15, 23, 42, 0.08)',
    background: [
      'linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.72))',
      `radial-gradient(520px 300px at 18% 20%, rgba(22, 119, 255, 0.18), transparent 62%)`,
      `radial-gradient(520px 300px at 82% 10%, rgba(56, 189, 248, 0.12), transparent 58%)`,
    ].join(','),
    backdropFilter: 'blur(14px)',
    boxShadow: '0 22px 70px rgba(0, 26, 67, 0.08)',
  }

  const alertCardStyle: CSSProperties = {
    background: `linear-gradient(135deg, ${token.colorPrimary} 0%, color-mix(in srgb, ${token.colorPrimary} 70%, #312e81) 100%)`,
    color: token.colorTextLightSolid,
    borderRadius: token.borderRadiusLG * 2,
    padding: token.paddingLG * 1.5,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200,
    boxShadow: '0 22px 70px rgba(22, 119, 255, 0.28)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    height: '100%',
  }

  const listCardStyle: CSSProperties = {
    borderRadius: token.borderRadiusLG * 2,
    overflow: 'hidden',
    boxShadow: '0 18px 55px rgba(0, 26, 67, 0.08)',
    background: 'rgba(255, 255, 255, 0.78)',
    backdropFilter: 'blur(14px)',
    border: '1px solid rgba(15, 23, 42, 0.08)',
  }

  const listHeaderStyle: CSSProperties = {
    padding: `${token.paddingLG}px ${token.paddingLG * 1.5}px`,
    borderBottom: `1px solid color-mix(in srgb, ${token.colorBorderSecondary} 55%, transparent)`,
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.68))',
    position: 'sticky',
    top: 0,
    zIndex: 3,
    backdropFilter: 'blur(14px)',
  }

  const tableHeadStyle: CSSProperties = {
    padding: `${token.padding}px ${token.paddingLG * 1.5}px`,
    background: 'rgba(15, 23, 42, 0.03)',
    color: `color-mix(in srgb, ${token.colorText} 62%, transparent)`,
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
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          borderRadius: 999,
          color: active
            ? token.colorPrimary
            : `color-mix(in srgb, ${token.colorText} 60%, transparent)`,
          background: active
            ? `linear-gradient(180deg, rgba(22, 119, 255, 0.14), rgba(22, 119, 255, 0.06))`
            : 'transparent',
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
    <div style={pageStyle}>
      <div style={pageBgStyle} />
      <Flex vertical gap={token.marginXL * 1.25} style={{ position: 'relative', zIndex: 1 }}>
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
              style={{
                margin: 0,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.12,
              }}
            >
              {job.title}
            </Typography.Title>
            <Flex gap={token.marginSM} wrap="wrap" style={{ marginTop: token.margin }}>
              <Tag
                style={{
                  margin: 0,
                  borderRadius: 999,
                  padding: `${token.paddingXXS + 2}px ${token.paddingSM}px`,
                  fontWeight: 700,
                  fontSize: token.fontSizeSM,
                  border: `1px solid rgba(15, 23, 42, 0.08)`,
                  background:
                    'linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.68))',
                  color: `color-mix(in srgb, ${token.colorText} 78%, transparent)`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: `linear-gradient(180deg, ${token.colorSuccess} 0%, color-mix(in srgb, ${token.colorSuccess} 55%, #16a34a) 100%)`,
                    marginRight: token.marginXXS,
                    boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.12)',
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
                  fontWeight: 700,
                  fontSize: token.fontSizeSM,
                  border: `1px solid rgba(15, 23, 42, 0.08)`,
                  background:
                    'linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.68))',
                  color: `color-mix(in srgb, ${token.colorText} 74%, transparent)`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                {job.location}
              </Tag>
            </Flex>
          </div>
          <Space wrap>
            <Button
              size="large"
              icon={<DownloadOutlined />}
              style={{
                fontWeight: 750,
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadowTertiary,
                borderColor: `color-mix(in srgb, ${token.colorBorder} 45%, transparent)`,
                background: 'rgba(255, 255, 255, 0.78)',
                backdropFilter: 'blur(12px)',
                display: 'none',
              }}
            >
              Export List
            </Button>
            <Link
              to={`/hr/job/${job.id}/edit`}
              state={{ mode: 'edit' }}
              style={{ textDecoration: 'none' }}
            >
              <Button
                type="primary"
                size="large"
                icon={<EditOutlined />}
                style={{
                  fontWeight: 750,
                  borderRadius: token.borderRadiusLG,
                  boxShadow: '0 18px 55px rgba(22, 119, 255, 0.22)',
                }}
              >
                Edit Job Detail
              </Button>
            </Link>
          </Space>
        </Flex>

        <Row gutter={[token.marginLG, token.marginLG]}>
          <Col xs={24} lg={16}>
            <div style={pipelineCardStyle}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <Typography.Text
                  type="secondary"
                  style={{
                    fontWeight: 750,
                    fontSize: token.fontSizeSM,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: `color-mix(in srgb, ${token.colorText} 58%, transparent)`,
                  }}
                >
                  Total Pipeline
                </Typography.Text>
                <Typography.Title
                  level={2}
                  style={{
                    margin: `${token.marginXXS}px 0 0`,
                    fontSize: 52,
                    fontWeight: 950,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {stats.total}
                </Typography.Title>
                <Flex gap={token.marginLG} wrap="wrap" style={{ marginTop: token.marginLG }}>
                  {[
                    { label: 'Applied', value: stats.applied, accent: 'muted' as const },
                    {
                      label: 'Interviewing',
                      value: stats.interviewing,
                      accent: 'primary' as const,
                    },
                    { label: 'Closed', value: stats.closed, accent: 'muted' as const },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        minWidth: 140,
                        padding: `${token.paddingSM}px ${token.paddingMD}px`,
                        borderRadius: token.borderRadiusLG * 1.25,
                        border: '1px solid rgba(15, 23, 42, 0.06)',
                        background: 'rgba(255, 255, 255, 0.62)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 28px rgba(0, 26, 67, 0.06)',
                      }}
                    >
                      <Typography.Text
                        style={{
                          display: 'block',
                          fontSize: 11,
                          fontWeight: 900,
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                          color: `color-mix(in srgb, ${token.colorText} 56%, transparent)`,
                          marginBottom: token.marginXXS,
                        }}
                      >
                        {item.label}
                      </Typography.Text>
                      <Typography.Text
                        strong
                        style={{
                          fontSize: token.fontSizeHeading3,
                          letterSpacing: '-0.02em',
                          color: item.accent === 'primary' ? token.colorPrimary : token.colorText,
                        }}
                      >
                        {item.value}
                      </Typography.Text>
                    </div>
                  ))}
                </Flex>
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: '50%',
                  height: '100%',
                  pointerEvents: 'none',
                  borderRadius: token.borderRadiusLG * 2,
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={PIPELINE_BG}
                  alt=""
                  preview={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: token.borderRadiusLG * 2,
                    overflow: 'hidden',
                  }}
                />
              </div>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background:
                    'linear-gradient(90deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.25) 55%, rgba(255, 255, 255, 0.0) 78%)',
                }}
              />
            </div>
          </Col>
          <Col xs={24} lg={8}>
            <div style={alertCardStyle}>
              <Typography.Text
                style={{
                  color: `color-mix(in srgb, ${token.colorTextLightSolid} 88%, transparent)`,
                  fontWeight: 750,
                  fontSize: token.fontSizeSM,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                }}
              >
                Top Talent Alert
              </Typography.Text>
              <Typography.Title
                level={4}
                style={{
                  color: token.colorTextLightSolid,
                  margin: `${token.marginSM}px 0 ${token.margin}px`,
                  fontWeight: 850,
                  lineHeight: 1.35,
                  letterSpacing: '-0.02em',
                }}
              >
                {stats.total === 0
                  ? 'No applications yet for this role'
                  : `${highlightCount} candidate${highlightCount === 1 ? '' : 's'} in the active pipeline`}
              </Typography.Title>
              <Typography.Paragraph
                style={{
                  margin: 0,
                  maxWidth: 360,
                  color: `color-mix(in srgb, ${token.colorTextLightSolid} 84%, transparent)`,
                  lineHeight: 1.6,
                }}
              >
                Review standout applicants, compare CVs, and move strong matches into interviews in
                a few clicks.
              </Typography.Paragraph>
              <Link to="/hr/candidates">
                <Button
                  style={{
                    marginTop: token.marginSM,
                    fontWeight: 700,
                    borderRadius: token.borderRadiusLG,
                    color: token.colorPrimary,
                    border: 'none',
                    height: 40,
                    paddingInline: 16,
                    boxShadow: '0 18px 45px rgba(0, 0, 0, 0.16)',
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
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  opacity: 0.9,
                  background: [
                    'radial-gradient(600px 360px at 20% 20%, rgba(255, 255, 255, 0.22), transparent 60%)',
                    'radial-gradient(420px 260px at 90% 10%, rgba(56, 189, 248, 0.24), transparent 58%)',
                  ].join(','),
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
            <div
              style={{
                padding: 6,
                borderRadius: 999,
                background: 'rgba(15, 23, 42, 0.04)',
                border: '1px solid rgba(15, 23, 42, 0.06)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Space size={4}>
                {filterBtn('all', 'ALL')}
                {filterBtn('interviewing', 'INTERVIEWING')}
                {filterBtn('new', 'NEW')}
              </Space>
            </div>
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
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Typography.Text strong style={{ display: 'block' }}>
                        No candidates in this view
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        Try switching filters or check back later for new applications.
                      </Typography.Text>
                    </div>
                  }
                >
                  <Space wrap>
                    <Button
                      onClick={() => {
                        setPipelineFilter('all')
                        setPage(1)
                      }}
                    >
                      Show all
                    </Button>
                    <Link to="/hr/candidates" style={{ textDecoration: 'none' }}>
                      <Button type="primary">Browse candidates</Button>
                    </Link>
                  </Space>
                </Empty>
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
              background: 'rgba(15, 23, 42, 0.02)',
              borderTop: '1px solid rgba(15, 23, 42, 0.06)',
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
