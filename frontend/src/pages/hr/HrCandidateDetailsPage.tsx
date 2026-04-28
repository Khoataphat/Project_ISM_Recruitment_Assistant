import { ArrowLeftOutlined, FilePdfOutlined } from '@ant-design/icons'
import {
  Alert,
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Flex,
  Result,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
  theme,
} from 'antd'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiClient } from '@/lib/api'

const { Title, Text } = Typography

type ApplicationDetail = {
  id: string
  cv_url: string
  cover_letter?: string
  hr_status: string
  hr_note?: string
  processing_status: string
  applied_at: string
  jobs: {
    id: string
    title: string
    companies: { name: string; logo_url?: string }
  }
  candidates: {
    id: string
    years_of_experience?: number
    users: {
      full_name: string
      email: string
      phone?: string
      avatar_url?: string
    }
  }
}

const HR_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Shortlisted', label: 'Shortlisted' },
  { value: 'Interviewing', label: 'Interviewing' },
  { value: 'Offered', label: 'Offered' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Rejected', label: 'Rejected' },
]

const STATUS_COLOR: Record<string, string> = {
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
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(
      new Date(iso)
    )
  } catch {
    return iso
  }
}

export function HrCandidateDetailsPage() {
  const { id } = useParams()
  const { token } = theme.useToken()
  const [app, setApp] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return
      try {
        setLoading(true)
        setError(null)
        const res = await apiClient.get(`/dashboard/applications/${id}`)
        setApp(res.data.data)
      } catch (err: unknown) {
        const maybe = err as { response?: { status?: unknown } }
        if (maybe.response?.status === 404) {
          setApp(null)
        } else {
          setError(getApiErrorMessage(err, 'Failed to load application'))
        }
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!app) return
    setUpdating(true)
    try {
      await apiClient.patch(`/dashboard/applications/${app.id}/status`, { status: newStatus })
      setApp({ ...app, hr_status: newStatus })
      message.success(`Status updated to ${newStatus}`)
    } catch (err: unknown) {
      message.error(getApiErrorMessage(err, 'Failed to update status'))
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 300 }}>
        <Spin size="large" />
      </Flex>
    )
  }

  if (error) {
    return <Alert type="error" message={error} style={{ margin: 24 }} />
  }

  if (!app) {
    return (
      <Result
        status="404"
        title="Application not found"
        subTitle="This application ID is invalid or was removed."
        extra={
          <Link to="/hr/candidates">
            <Button type="primary">Back to candidates</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <Flex vertical gap={token.marginLG}>
        <Breadcrumb
          style={{ fontSize: token.fontSizeSM }}
          items={[
            { title: <Link to="/hr/candidates">Candidates</Link> },
            { title: <span style={{ color: token.colorText }}>Application</span> },
          ]}
        />

        <Flex justify="space-between" align="flex-start" wrap gap={16}>
          <Flex align="center" gap={16}>
            <Avatar size={56} src={app.candidates.users.avatar_url} style={{ flexShrink: 0 }}>
              {app.candidates.users.full_name?.[0] ?? '?'}
            </Avatar>
            <div>
              <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
                {app.candidates.users.full_name}
              </Title>
              <Text type="secondary">{app.candidates.users.email}</Text>
              {app.candidates.users.phone && (
                <Text type="secondary"> · {app.candidates.users.phone}</Text>
              )}
            </div>
          </Flex>
          <Link to="/hr/candidates">
            <Button icon={<ArrowLeftOutlined />}>Back to list</Button>
          </Link>
        </Flex>

        <Card
          variant="borderless"
          style={{
            borderRadius: token.borderRadiusLG * 1.25,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: token.boxShadowTertiary,
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Job Info + Status Control */}
            <Flex align="center" gap={16} wrap>
              {app.jobs.companies.logo_url && (
                <Avatar
                  size={56}
                  src={app.jobs.companies.logo_url}
                  shape="square"
                  style={{
                    borderRadius: token.borderRadiusLG,
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <Title level={4} style={{ margin: 0 }}>
                  {app.jobs.title}
                </Title>
                <Text type="secondary">{app.jobs.companies.name}</Text>
              </div>
              <Flex vertical gap={8} style={{ minWidth: 220 }}>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                  Pipeline status
                </Text>
                <Select
                  value={app.hr_status}
                  onChange={handleStatusChange}
                  loading={updating}
                  disabled={updating}
                  style={{ width: '100%' }}
                  options={HR_STATUS_OPTIONS.map((o) => ({
                    value: o.value,
                    label: (
                      <Tag color={STATUS_COLOR[o.value]} style={{ margin: 0 }}>
                        {o.label}
                      </Tag>
                    ),
                  }))}
                />
              </Flex>
            </Flex>

            {/* Quick action buttons */}
            <Flex gap={8} wrap>
              {['Shortlisted', 'Interviewing', 'Accepted', 'Rejected'].map((s) => (
                <Button
                  key={s}
                  size="small"
                  type={app.hr_status === s ? 'primary' : 'default'}
                  danger={s === 'Rejected'}
                  loading={updating}
                  onClick={() => handleStatusChange(s)}
                  disabled={app.hr_status === s}
                >
                  {s}
                </Button>
              ))}
            </Flex>

            <Descriptions
              column={1}
              size="small"
              labelStyle={{ width: 180, fontWeight: 600, color: token.colorTextSecondary }}
            >
              <Descriptions.Item label="Application ID">
                <Text code>{app.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Job">
                <Link to={`/hr/job/${app.jobs.id}`}>
                  <Text code>{app.jobs.id}</Text>
                </Link>
              </Descriptions.Item>
              <Descriptions.Item label="Applied at">{formatDate(app.applied_at)}</Descriptions.Item>
              <Descriptions.Item label="AI Processing">{app.processing_status}</Descriptions.Item>
              {app.candidates.years_of_experience !== undefined && (
                <Descriptions.Item label="Experience">
                  {app.candidates.years_of_experience} years
                </Descriptions.Item>
              )}
              {app.cover_letter && (
                <Descriptions.Item label="Cover Letter">
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{app.cover_letter}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Flex gap={12} wrap>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                href={app.cv_url}
                target="_blank"
                rel="noreferrer"
              >
                Open / Download CV
              </Button>
              <Tag style={{ margin: 0, alignSelf: 'center' }} color={STATUS_COLOR[app.hr_status]}>
                {app.hr_status}
              </Tag>
            </Flex>
          </Space>
        </Card>
      </Flex>
    </div>
  )
}
