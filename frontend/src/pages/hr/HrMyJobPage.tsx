import {
  ArrowUpOutlined,
  BuildOutlined,
  CodeOutlined,
  EditOutlined,
  EllipsisOutlined,
  FilterOutlined,
  RightOutlined,
  StarOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Breadcrumb,
  Button,
  Col,
  Flex,
  Row,
  Segmented,
  Space,
  Tag,
  Typography,
  theme,
} from 'antd'
import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type JobFilter = 'all' | 'active' | 'filled'

type JobStatus = 'active' | 'paused' | 'filled'

type JobItem = {
  id: string
  title: string
  subtitle: string
  status: JobStatus
  postedAt: string
  icon: 'edit' | 'code' | 'arch'
  candidates: { type: 'avatars'; extra: number; count?: number } | { type: 'text'; label: string }
}

const JOBS: JobItem[] = [
  {
    id: '1',
    title: 'Senior Creative Director',
    subtitle: 'Global Marketing • London, UK',
    status: 'active',
    postedAt: 'Oct 12, 2023',
    icon: 'edit',
    candidates: { type: 'avatars', extra: 24 },
  },
  {
    id: '2',
    title: 'Principal Backend Engineer',
    subtitle: 'Core Platform • Remote',
    status: 'paused',
    postedAt: 'Sep 28, 2023',
    icon: 'code',
    candidates: { type: 'avatars', extra: 8 },
  },
  {
    id: '3',
    title: 'Head of Product Design',
    subtitle: 'Experience Team • New York',
    status: 'filled',
    postedAt: 'Aug 15, 2023',
    icon: 'arch',
    candidates: { type: 'text', label: '142 Candidates' },
  },
]

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
}) {
  const [hovered, setHovered] = useState(false)

  const jobCardStyle: CSSProperties = {
    padding: `${token.paddingLG * 1.5}px ${token.paddingLG}px`,
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG * 2,
    border: `1px solid transparent`,
    boxShadow: '0 4px 20px rgba(0, 26, 67, 0.03)',
    transition: `box-shadow ${token.motionDurationMid} ${token.motionEaseInOut}, border-color ${token.motionDurationMid}`,
  }

  return (
    <Row
      gutter={[16, 16]}
      align="middle"
      style={jobCardStyle}
      onMouseEnter={(e) => {
        setHovered(true)
        const el = e.currentTarget
        el.style.boxShadow = '0 12px 40px rgba(0, 26, 67, 0.06)'
        el.style.borderColor = `color-mix(in srgb, ${token.colorPrimary} 14%, transparent)`
      }}
      onMouseLeave={(e) => {
        setHovered(false)
        const el = e.currentTarget
        el.style.boxShadow = '0 4px 20px rgba(0, 26, 67, 0.03)'
        el.style.borderColor = 'transparent'
      }}
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
        <Button
          type="text"
          icon={<EllipsisOutlined />}
          style={{ color: token.colorTextTertiary }}
          aria-label="Actions"
        />
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

  const filteredJobs = useMemo(() => {
    if (filter === 'all') return JOBS
    if (filter === 'active') return JOBS.filter((j) => j.status === 'active')
    return JOBS.filter((j) => j.status === 'filled')
  }, [filter])

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
  }

  const promoStyle: CSSProperties = {
    padding: token.paddingXL + token.padding,
    borderRadius: token.borderRadiusLG * 3,
    background: `color-mix(in srgb, ${token.colorPrimary} 22%, ${token.colorBgLayout})`,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200,
  }

  const statCardStyle: CSSProperties = {
    padding: token.paddingXL + token.padding,
    borderRadius: token.borderRadiusLG * 3,
    background: token.colorFillSecondary,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <Flex vertical gap={token.marginXL}>
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
            <Flex
              align="center"
              gap={token.marginXXS}
              wrap="wrap"
              style={{
                padding: token.paddingXXS + 2,
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadowTertiary,
                border: `1px solid color-mix(in srgb, ${token.colorBorder} 35%, transparent)`,
              }}
            >
              <Segmented<JobFilter>
                value={filter}
                onChange={(v) => setFilter(v)}
                options={[
                  { label: 'All Jobs', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Filled', value: 'filled' },
                ]}
              />
              <div
                style={{
                  width: 1,
                  height: token.controlHeightSM,
                  background: `color-mix(in srgb, ${token.colorBorder} 45%, transparent)`,
                  marginInline: token.marginXXS,
                }}
              />
              <Button
                type="text"
                icon={<FilterOutlined />}
                aria-label="Filter"
                style={{ color: token.colorTextSecondary }}
              />
            </Flex>
          </Flex>
        </header>

        <section>
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

          <Space direction="vertical" size={token.margin} style={{ width: '100%' }}>
            {filteredJobs.map((job) => (
              <JobListRow key={job.id} job={job} token={token} />
            ))}
          </Space>
        </section>

        <Row gutter={[token.marginLG, token.marginLG]}>
          <Col xs={24} md={16}>
            <div style={promoStyle}>
              <div style={{ position: 'relative', zIndex: 1, maxWidth: 360 }}>
                <Typography.Title
                  level={4}
                  style={{ margin: `0 0 ${token.marginXS}px`, color: token.colorText }}
                >
                  Ready to expand?
                </Typography.Title>
                <Typography.Paragraph
                  style={{
                    color: token.colorTextSecondary,
                    marginBottom: token.marginLG,
                    fontSize: token.fontSize,
                  }}
                >
                  Your current fulfillment rate is 12% higher than last quarter. Scale your team
                  with Enterprise AI tools.
                </Typography.Paragraph>
                <Button
                  type="primary"
                  size="large"
                  style={{ fontWeight: 700, borderRadius: token.borderRadiusLG }}
                >
                  Explore Talent Pool
                </Button>
              </div>
              <StarOutlined
                style={{
                  position: 'absolute',
                  right: token.marginLG,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 180,
                  color: token.colorPrimary,
                  opacity: 0.08,
                }}
              />
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={statCardStyle}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM, fontWeight: 700, letterSpacing: '0.08em' }}
              >
                TOTAL CANDIDATES
              </Typography.Text>
              <Typography.Title
                level={1}
                style={{
                  margin: `${token.marginSM}px 0 0`,
                  fontWeight: 900,
                  fontSize: 48,
                  lineHeight: 1.1,
                }}
              >
                1,284
              </Typography.Title>
              <Flex
                align="center"
                gap={token.marginXXS}
                style={{
                  marginTop: token.margin,
                  color: token.colorSuccess,
                  fontWeight: 700,
                  fontSize: token.fontSize,
                }}
              >
                <ArrowUpOutlined />
                +8.2% this month
              </Flex>
            </div>
          </Col>
        </Row>
      </Flex>
    </div>
  )
}
