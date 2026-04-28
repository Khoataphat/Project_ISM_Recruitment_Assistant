import { BulbOutlined, FilePdfOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Image,
  Row,
  Tag,
  Typography,
  theme,
  Spin,
  Alert,
} from 'antd'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { apiClient } from '@/lib/api'

const { Title, Text } = Typography

type Application = {
  id: string
  cv_url: string
  hr_status: string
  applied_at: string
  jobs: {
    id: string
    title: string
    companies: {
      name: string
      logo_url: string
    }
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

function getApiErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object') {
    const maybe = err as { response?: { data?: { message?: unknown } } }
    const msg = maybe.response?.data?.message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return fallback
}

export function CandidateApplicationsPage() {
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const res = await apiClient.get('/applications')
        setApplications(res.data.data)
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to fetch applications'))
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [])

  const totalSent = applications.length
  const interviewCount = applications.filter((a) => a.hr_status === 'Interviewing').length

  const statBoxStyle = {
    background: token.colorBgContainer,
    padding: '8px 16px',
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
  } as const

  const listHeaderStyle = {
    display: 'grid',
    gridTemplateColumns: '5fr 2fr 2fr 2fr',
    gap: 12,
    padding: '16px 24px',
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    minWidth: 520,
  } as const

  const rowGridStyle = {
    display: 'grid',
    gridTemplateColumns: '5fr 2fr 2fr 2fr',
    gap: 12,
    alignItems: 'center',
    padding: '20px 24px',
    borderRadius: token.borderRadiusLG,
    background: token.colorBgContainer,
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  } as const

  const renderRow = (app: Application) => {
    return (
      <div
        key={app.id}
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/candidate/job/${app.jobs.id}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            navigate(`/candidate/job/${app.jobs.id}`)
          }
        }}
        style={{ ...rowGridStyle, minWidth: 520 }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = token.colorPrimaryBg
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = token.colorBgContainer
        }}
      >
        <Flex align="center" gap={16}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: token.colorFillAlter,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
              flexShrink: 0,
            }}
          >
            <Image
              src={app.jobs.companies.logo_url}
              alt={`${app.jobs.companies.name} logo`}
              preview={false}
              style={{ width: '100%', objectFit: 'contain' }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <Text strong style={{ display: 'block', color: token.colorText }}>
              {app.jobs.title}
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {app.jobs.companies.name}
            </Text>
          </div>
        </Flex>
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
            {formatAppliedDate(app.applied_at)}
          </Text>
        </div>
        <Flex justify="flex-end">
          <Tag
            bordered={false}
            color={HR_STATUS_COLOR[app.hr_status] || 'default'}
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 11,
              padding: '4px 14px',
              borderRadius: 999,
            }}
          >
            {app.hr_status}
          </Tag>
        </Flex>
        <Flex justify="flex-end" onClick={(e) => e.stopPropagation()}>
          <Button
            type="link"
            size="small"
            icon={<FilePdfOutlined />}
            href={app.cv_url}
            target="_blank"
            rel="noreferrer"
            style={{ fontWeight: 600, paddingInline: 4 }}
          >
            PDF
          </Button>
        </Flex>
      </div>
    )
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 500 }}>
        <Spin size="large" tip="Loading applications..." />
      </Flex>
    )
  }

  return (
    <main style={{ maxWidth: 1152, margin: '0 auto' }}>
      <Flex vertical gap={40}>
        <Flex justify="space-between" align="flex-end" wrap gap={16}>
          <div>
            <Title
              level={2}
              style={{ margin: 0, marginBottom: 8, fontWeight: 900, letterSpacing: '-0.02em' }}
            >
              Your Applications
            </Title>
            <Text style={{ color: token.colorTextSecondary, fontWeight: 600 }}>
              Track and manage your ongoing career journey.
            </Text>
          </div>
          <Flex gap={12} wrap>
            <div style={statBoxStyle}>
              <Flex align="center" gap={12}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: token.colorTextTertiary,
                  }}
                >
                  Total Sent
                </Text>
                <Text style={{ fontSize: 20, fontWeight: 800, color: token.colorPrimary }}>
                  {totalSent}
                </Text>
              </Flex>
            </div>
            <div style={statBoxStyle}>
              <Flex align="center" gap={12}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: token.colorTextTertiary,
                  }}
                >
                  Interviews
                </Text>
                <Text style={{ fontSize: 20, fontWeight: 800, color: token.colorSuccess }}>
                  {interviewCount}
                </Text>
              </Flex>
            </div>
          </Flex>
        </Flex>

        {error && <Alert type="error" message={error} style={{ marginBottom: 24 }} />}

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={16}>
            <Card
              styles={{ body: { padding: 4 } }}
              style={{
                background: token.colorFillAlter,
                borderColor: token.colorBorderSecondary,
                borderRadius: token.borderRadiusLG * 1.25,
              }}
            >
              <div style={listHeaderStyle}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: token.colorTextTertiary,
                  }}
                >
                  Role & Company
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: token.colorTextTertiary,
                    textAlign: 'center',
                  }}
                >
                  Applied Date
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: token.colorTextTertiary,
                    textAlign: 'right',
                  }}
                >
                  Status
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: token.colorTextTertiary,
                    textAlign: 'right',
                  }}
                >
                  Resume
                </Text>
              </div>
              <Flex vertical gap={4} style={{ padding: 4, overflowX: 'auto' }}>
                {applications.length === 0 ? (
                  <Empty
                    style={{ padding: '48px 24px' }}
                    description={
                      <span style={{ color: token.colorTextSecondary }}>
                        You have not applied to any roles yet.
                      </span>
                    }
                  >
                    <Link to="/candidate/jobs">
                      <Button type="primary">Browse jobs</Button>
                    </Link>
                  </Empty>
                ) : (
                  applications.map(renderRow)
                )}
              </Flex>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Flex vertical gap={24}>
              <Card
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: token.borderRadiusLG * 1.25,
                  boxShadow: `0 12px 40px color-mix(in srgb, ${token.colorPrimary} 8%, transparent)`,
                  borderColor: token.colorBorderSecondary,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 128,
                    height: 128,
                    borderRadius: '50%',
                    background: `color-mix(in srgb, ${token.colorPrimary} 8%, transparent)`,
                    transform: 'translate(32px, -32px)',
                    pointerEvents: 'none',
                  }}
                />
                <Title level={4} style={{ marginTop: 0, marginBottom: 24, position: 'relative' }}>
                  Weekly Progress
                </Title>
                <Flex vertical gap={20} style={{ position: 'relative' }}>
                  <Flex justify="space-between" align="center">
                    <Text type="secondary" style={{ fontWeight: 500 }}>
                      Profile views
                    </Text>
                    <Text strong style={{ color: token.colorPrimary }}>
                      —
                    </Text>
                  </Flex>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 999,
                      background: token.colorFillSecondary,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: '75%',
                        borderRadius: 999,
                        background: token.colorPrimary,
                      }}
                    />
                  </div>
                  <Flex justify="space-between" align="center">
                    <Text type="secondary" style={{ fontWeight: 500 }}>
                      Search appearances
                    </Text>
                    <Text strong style={{ color: token.colorPrimary }}>
                      —
                    </Text>
                  </Flex>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 999,
                      background: token.colorFillSecondary,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: '50%',
                        borderRadius: 999,
                        background: token.colorPrimary,
                      }}
                    />
                  </div>
                </Flex>
              </Card>

              <Card
                style={{
                  borderRadius: token.borderRadiusLG * 1.25,
                  background: token.colorPrimaryBg,
                  borderColor: 'transparent',
                }}
                styles={{ body: { padding: 32 } }}
              >
                <BulbOutlined
                  style={{
                    fontSize: 28,
                    color: token.colorPrimary,
                    marginBottom: 16,
                    display: 'block',
                  }}
                />
                <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
                  Editorial insight
                </Title>
                <Text
                  style={{
                    display: 'block',
                    marginBottom: 24,
                    color: token.colorTextSecondary,
                    lineHeight: 1.6,
                  }}
                >
                  Candidates who update their portfolio once every 3 months see a 40% increase in
                  recruiter engagement.
                </Text>
                <Button block size="large" type="default" style={{ fontWeight: 700 }}>
                  Explore advice
                </Button>
              </Card>
            </Flex>
          </Col>
        </Row>
      </Flex>

      <footer className="candidate-detailFooter" style={{ marginTop: 80 }}>
        <div className="candidate-detailFooterInner">
          <div>
            <Text className="candidate-detailFooterBrand">Editorial Enterprise Recruitment</Text>
            <div style={{ height: 6 }} />
            <Text className="candidate-detailFooterCopy">
              © 2026 Editorial Enterprise Recruitment. All rights reserved.
            </Text>
          </div>

          <Flex wrap gap={18} justify="center" className="candidate-detailFooterLinks">
            {['Terms of Service', 'Privacy Policy', 'Help Center', 'API Documentation'].map((t) => (
              <a key={t} href="#" className="candidate-detailFooterLink">
                {t}
              </a>
            ))}
          </Flex>
        </div>
      </footer>
    </main>
  )
}
