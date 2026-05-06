import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Alert,
  Avatar,
  Button,
  Card,
  Flex,
  Input,
  Select,
  Table,
  Tag,
  Typography,
  theme,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '@/lib/api'

const { Title, Text } = Typography

type ApiApplication = {
  id: string
  hr_status: string
  applied_at: string
  ai_matching_score: string | number | null
  ai_summary: any
  jobs: {
    id: string
    title: string
    companies: { name: string; logo_url?: string }
  }
  candidates: {
    id: string
    users: { id: string; full_name: string; email: string; avatar_url?: string }
  }
}

const HR_STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Shortlisted', value: 'Shortlisted' },
  { label: 'Interviewing', value: 'Interviewing' },
  { label: 'Offered', value: 'Offered' },
  { label: 'Accepted', value: 'Accepted' },
  { label: 'Rejected', value: 'Rejected' },
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
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso)
    )
  } catch {
    return iso
  }
}

export function HrCandidatesPage() {
  const { token } = theme.useToken()
  const [applications, setApplications] = useState<ApiApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiClient.get('/dashboard/applications')
      setApplications(res.data.data.applications ?? [])
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load applications'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return applications
      .filter((a) => {
        if (statusFilter !== 'all' && a.hr_status !== statusFilter) return false
        if (!q) return true
        const blob = [
          a.candidates.users.full_name,
          a.candidates.users.email,
          a.jobs.title,
          a.jobs.companies.name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return blob.includes(q)
      })
      .sort((a, b) => {
        const scoreA = a.ai_matching_score != null ? Number(a.ai_matching_score) : -1
        const scoreB = b.ai_matching_score != null ? Number(b.ai_matching_score) : -1
        return scoreB - scoreA
      })
  }, [applications, search, statusFilter])

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setUpdatingId(applicationId)
    try {
      await apiClient.patch(`/dashboard/applications/${applicationId}/status`, {
        status: newStatus,
      })
      message.success(`Status updated to ${newStatus}`)
      // Optimistically update local state
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, hr_status: newStatus } : a))
      )
    } catch (err: unknown) {
      message.error(getApiErrorMessage(err, 'Failed to update status'))
    } finally {
      setUpdatingId(null)
    }
  }

  const columns: ColumnsType<ApiApplication> = [
    {
      title: 'Applied',
      dataIndex: 'applied_at',
      key: 'applied_at',
      width: 180,
      render: (d: string) => <Text type="secondary">{formatDate(d)}</Text>,
    },
    {
      title: 'Candidate',
      key: 'candidate',
      ellipsis: true,
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
                style={{ fontSize: 11, display: 'block', maxWidth: 200, opacity: 0.8 }}
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
      width: 140,
      render: (_, a) => {
        const score = a.ai_matching_score != null ? Number(a.ai_matching_score) : null
        let color = 'default'
        let label = 'N/A'
        if (score !== null) {
          if (score >= 70) {
            color = 'success'
            label = 'Highly Recommended'
          } else if (score >= 50) {
            color = 'warning'
            label = 'Consider'
          } else {
            color = 'error'
            label = 'Not a fit'
          }
        }
        return (
          <Flex vertical gap={2}>
            <Text strong style={{ color: score !== null ? (score >= 70 ? token.colorSuccess : score >= 50 ? token.colorWarning : token.colorError) : undefined }}>
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
      ellipsis: true,
      render: (_, a) => (
        <div>
          <Text strong>{a.jobs.title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {a.jobs.companies.name}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 200,
      render: (_, a) => (
        <Select
          size="small"
          value={a.hr_status}
          loading={updatingId === a.id}
          disabled={updatingId === a.id}
          onChange={(val) => handleStatusChange(a.id, val)}
          style={{ minWidth: 140 }}
          options={HR_STATUS_OPTIONS.filter((o) => o.value !== 'all').map((o) => ({
            value: o.value,
            label: (
              <Tag color={STATUS_COLOR[o.value]} style={{ margin: 0 }}>
                {o.label}
              </Tag>
            ),
          }))}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, a) => (
        <Link to={`/hr/candidate/${a.id}`}>
          <Button type="link" icon={<EyeOutlined />} style={{ padding: 0 }}>
            View
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <Flex vertical gap={token.marginLG}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Candidates
          </Title>
          <Text type="secondary" style={{ fontWeight: 500 }}>
            All applications from the live database.
          </Text>
        </div>

        {error && <Alert type="error" message={error} closable onClose={() => setError(null)} />}

        <Card
          variant="borderless"
          style={{
            borderRadius: token.borderRadiusLG * 1.25,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: token.boxShadowTertiary,
          }}
        >
          <Flex vertical gap={token.marginMD}>
            <Flex wrap gap={12}>
              <Input
                allowClear
                placeholder="Search name, email, role, company…"
                prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 360, minWidth: 200, flex: 1 }}
              />
              <Select
                style={{ minWidth: 180 }}
                value={statusFilter}
                onChange={setStatusFilter}
                options={HR_STATUS_OPTIONS}
              />
            </Flex>

            <Table<ApiApplication>
              rowKey="id"
              columns={columns}
              dataSource={filtered}
              loading={loading}
              pagination={{ pageSize: 15, showSizeChanger: true, pageSizeOptions: [15, 30, 50] }}
              scroll={{ x: 900 }}
            />
          </Flex>
        </Card>
      </Flex>
    </div>
  )
}
