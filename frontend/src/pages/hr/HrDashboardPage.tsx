import {
  BarChartOutlined,
  CarryOutOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  theme,
  Alert,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '@/lib/api'

const { Title, Text } = Typography

type DashboardStats = {
  totalJobs: number
  totalApplications: number
  totalCandidates: number
}

type RecentApplication = {
  id: string
  hr_status: string
  applied_at: string
  ai_matching_score: string | number | null
  ai_summary: any
  jobs: { id: string; title: string }
  candidates: {
    users: { full_name: string; email: string; avatar_url?: string }
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

function getApiErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object') {
    const maybe = err as { response?: { data?: { message?: unknown } } }
    const msg = maybe.response?.data?.message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return fallback
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(iso))
  } catch {
    return iso
  }
}

const columns: ColumnsType<RecentApplication> = [
  {
    title: 'Candidate',
    key: 'candidate',
    render: (_, a) => (
      <Flex align="center" gap={8}>
        <Avatar size={36} src={a.candidates.users.avatar_url}>
          {a.candidates.users.full_name?.[0] ?? '?'}
        </Avatar>
        <div>
          <Text strong style={{ display: 'block' }}>
            {a.candidates.users.full_name}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {a.candidates.users.email}
          </Text>
          {a.ai_summary && (
            <Text 
              type="secondary" 
              italic 
              ellipsis 
              style={{ fontSize: 11, display: 'block', maxWidth: 180, opacity: 0.8 }}
            >
              {typeof a.ai_summary === 'string' ? a.ai_summary : (a.ai_summary.summary || a.ai_summary.reasoning || '')}
            </Text>
          )}
        </div>
      </Flex>
    ),
  },
  {
    title: 'AI Match',
    key: 'ai_score',
    render: (_, a) => {
      const score = a.ai_matching_score != null ? Number(a.ai_matching_score) : null
      let color = 'default'
      let label = 'N/A'
      if (score !== null) {
        if (score >= 70) color = 'success'
        else if (score >= 50) color = 'warning'
        else color = 'error'
        label = score >= 70 ? 'High' : score >= 50 ? 'Mid' : 'Low'
      }
      return (
        <Flex vertical gap={2}>
          <Text strong style={{ fontSize: 14 }}>
            {score !== null ? `${Math.round(score)}%` : '—'}
          </Text>
          <Tag color={color} style={{ margin: 0, fontSize: 10, lineHeight: '16px' }}>
            {label}
          </Tag>
        </Flex>
      )
    },
  },
  {
    title: 'Role',
    key: 'role',
    render: (_, a) => (
      <Link to={`/hr/job/${a.jobs.id}`}>
        <Text style={{ fontWeight: 600 }}>{a.jobs.title}</Text>
      </Link>
    ),
  },
  {
    title: 'Applied',
    dataIndex: 'applied_at',
    key: 'applied_at',
    render: (d: string) => <Text type="secondary">{formatDate(d)}</Text>,
  },
  {
    title: 'Status',
    dataIndex: 'hr_status',
    key: 'status',
    render: (s: string) => (
      <Tag color={HR_STATUS_COLOR[s] ?? 'default'} style={{ margin: 0, fontWeight: 600 }}>
        {s}
      </Tag>
    ),
  },
  {
    title: '',
    key: 'action',
    width: 80,
    render: (_, a) => (
      <Link to={`/hr/candidate/${a.id}`}>
        <Button type="link" size="small" style={{ padding: 0 }}>
          View
        </Button>
      </Link>
    ),
  },
]

export function HrDashboardPage() {
  const { token } = theme.useToken()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await apiClient.get('/dashboard/stats')
        const { stats: s, recentApplications } = res.data.data
        setStats(s)
        setRecentApps(recentApplications ?? [])
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to load dashboard data'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const sectionShell: CSSProperties = {
    background: token.colorFillAlter,
    borderRadius: 24,
    padding: token.paddingLG,
    overflow: 'hidden',
  }

  const statCardStyle: CSSProperties = {
    borderRadius: token.borderRadiusLG * 1.5,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: token.boxShadowTertiary,
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 300 }}>
        <Spin size="large" tip="Loading dashboard..." />
      </Flex>
    )
  }

  if (error) {
    return <Alert type="error" message={error} style={{ margin: 24 }} />
  }

  return (
    <div style={{ paddingBottom: token.marginXXL * 2 }}>
      <div style={{ marginBottom: token.marginXL }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Analytics Overview
        </Title>
        <Text type="secondary">Real-time recruitment performance metrics.</Text>
      </div>

      <Space direction="vertical" size={token.marginLG} style={{ width: '100%' }}>
        {/* Stat Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card style={statCardStyle}>
              <Flex align="center" gap={12}>
                <div
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background: `color-mix(in srgb, ${token.colorPrimary} 14%, transparent)`,
                    color: token.colorPrimary,
                    fontSize: 22,
                  }}
                >
                  <FileTextOutlined />
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}
                  >
                    Open Jobs
                  </Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {stats?.totalJobs ?? 0}
                  </Title>
                </div>
              </Flex>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={statCardStyle}>
              <Flex align="center" gap={12}>
                <div
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background: `color-mix(in srgb, ${token.colorInfo} 14%, transparent)`,
                    color: token.colorInfo,
                    fontSize: 22,
                  }}
                >
                  <CarryOutOutlined />
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}
                  >
                    Total Applications
                  </Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {stats?.totalApplications ?? 0}
                  </Title>
                </div>
              </Flex>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={statCardStyle}>
              <Flex align="center" gap={12}>
                <div
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background: `color-mix(in srgb, ${token.colorSuccess} 14%, transparent)`,
                    color: token.colorSuccess,
                    fontSize: 22,
                  }}
                >
                  <TeamOutlined />
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}
                  >
                    Candidates
                  </Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {stats?.totalCandidates ?? 0}
                  </Title>
                </div>
              </Flex>
            </Card>
          </Col>
        </Row>

        {/* Recent Applications Table */}
        <div style={sectionShell}>
          <Flex align="center" gap={8} style={{ marginBottom: token.marginLG }}>
            <div
              style={{
                padding: 8,
                borderRadius: 10,
                fontSize: 18,
                background: `color-mix(in srgb, ${token.colorPrimary} 14%, transparent)`,
                color: token.colorPrimary,
              }}
            >
              <BarChartOutlined />
            </div>
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Recent Applications
            </Title>
          </Flex>

          {recentApps.length === 0 ? (
            <Flex justify="center" align="center" style={{ padding: 40 }}>
              <div style={{ textAlign: 'center' }}>
                <CheckCircleOutlined
                  style={{ fontSize: 40, color: token.colorTextTertiary, marginBottom: 12 }}
                />
                <Text type="secondary" style={{ display: 'block' }}>
                  No applications yet
                </Text>
              </div>
            </Flex>
          ) : (
            <Table<RecentApplication>
              rowKey="id"
              columns={columns}
              dataSource={recentApps}
              pagination={false}
              style={{ background: 'transparent' }}
            />
          )}
        </div>
      </Space>
    </div>
  )
}
