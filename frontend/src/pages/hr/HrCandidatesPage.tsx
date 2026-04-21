import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Input, Select, Space, Table, Tag, Typography, theme } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { candidateJobs } from '@/data/candidateJobs'
import type { ApplicationStatus, StoredJobApplication } from '@/lib/candidateApplicationsStorage'
import { listJobApplications } from '@/lib/candidateApplicationsStorage'

const { Title, Text } = Typography

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  interviewing: 'Interviewing',
  under_review: 'Under review',
  closed: 'Closed',
}

function formatAppliedDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

function statusTagColor(status: ApplicationStatus, token: ReturnType<typeof theme.useToken>['token']) {
  switch (status) {
    case 'interviewing':
      return { color: token.colorPrimary, bg: token.colorPrimaryBg }
    case 'under_review':
      return { color: token.colorSuccess, bg: token.colorSuccessBg }
    case 'closed':
      return { color: token.colorError, bg: token.colorErrorBg }
    default:
      return { color: token.colorTextSecondary, bg: token.colorFillSecondary }
  }
}

export function HrCandidatesPage() {
  const { token } = theme.useToken()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [jobId, setJobId] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<ApplicationStatus | 'all'>('all')

  const rows = useMemo(() => listJobApplications(), [location.key])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((a) => {
      if (jobId && a.jobId !== jobId) return false
      if (status !== 'all' && a.status !== status) return false
      if (!q) return true
      const blob = [
        a.jobTitle,
        a.company,
        a.resumeFileName,
        a.applicantDisplayName,
        a.applicantEmail,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
  }, [rows, search, jobId, status])

  const columns: ColumnsType<StoredJobApplication> = [
    {
      title: 'Applied',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      width: 200,
      render: (iso: string) => <Text type="secondary">{formatAppliedDate(iso)}</Text>,
    },
    {
      title: 'Candidate',
      key: 'candidate',
      ellipsis: true,
      render: (_, a) => (
        <div>
          <Text strong>{a.applicantDisplayName ?? '—'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {a.applicantEmail ?? '—'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      ellipsis: true,
      render: (_, a) => (
        <div>
          <Text strong>{a.jobTitle}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {a.company}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (s: ApplicationStatus) => {
        const c = statusTagColor(s, token)
        return (
          <Tag bordered={false} style={{ margin: 0, color: c.color, background: c.bg, fontWeight: 600 }}>
            {STATUS_LABEL[s]}
          </Tag>
        )
      },
    },
    {
      title: 'Resume',
      dataIndex: 'resumeFileName',
      key: 'resume',
      ellipsis: true,
      width: 160,
      render: (name: string) => <Text type="secondary">{name}</Text>,
    },
    {
      title: '',
      key: 'actions',
      width: 100,
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
            Applications submitted from public and candidate job flows (demo data in local storage).
          </Text>
        </div>

        <Card
          variant="borderless"
          style={{
            borderRadius: token.borderRadiusLG * 1.25,
            border: `1px solid ${token.colorBorderSecondary}`,
            background: token.colorBgContainer,
            boxShadow: token.boxShadowTertiary,
          }}
        >
          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            <Flex wrap gap={12}>
              <Input
                allowClear
                placeholder="Search name, email, job, company, file…"
                prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 360, minWidth: 200, flex: 1 }}
              />
              <Select
                allowClear
                placeholder="All jobs"
                style={{ minWidth: 220 }}
                value={jobId}
                onChange={(v) => setJobId(v)}
                options={candidateJobs.map((j) => ({ label: `${j.title} · ${j.company}`, value: j.id }))}
              />
              <Select<ApplicationStatus | 'all'>
                style={{ minWidth: 160 }}
                value={status}
                onChange={(v) => setStatus(v)}
                options={[
                  { label: 'All statuses', value: 'all' },
                  { label: STATUS_LABEL.applied, value: 'applied' },
                  { label: STATUS_LABEL.interviewing, value: 'interviewing' },
                  { label: STATUS_LABEL.under_review, value: 'under_review' },
                  { label: STATUS_LABEL.closed, value: 'closed' },
                ]}
              />
            </Flex>

            <Table<StoredJobApplication>
              rowKey="id"
              columns={columns}
              dataSource={filtered}
              pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
              scroll={{ x: 900 }}
            />
          </Space>
        </Card>
      </Flex>
    </div>
  )
}
