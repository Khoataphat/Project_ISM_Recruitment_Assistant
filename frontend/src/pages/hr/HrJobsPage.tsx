import { RightOutlined, PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Flex, Row, Spin, Table, Tag, Typography, theme } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getHrJobs, type ApiJob } from '@/services/jobsService'

const { Title, Text } = Typography

const STATUS_COLOR: Record<string, string> = {
  Open: 'success',
  Closed: 'error',
  Draft: 'default',
}

export function HrJobsPage() {
  const { token } = theme.useToken()
  const [jobs, setJobs] = useState<ApiJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        setError(null)
        const apiJobs = await getHrJobs()
        setJobs(apiJobs)
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object'
            ? ((err as { message?: unknown }).message as string | undefined)
            : undefined
        setError(typeof msg === 'string' && msg.trim() ? msg : 'Failed to load jobs')
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const totalApplications = jobs.reduce((sum, j) => sum + (j._count?.applications ?? 0), 0)

  const columns: ColumnsType<ApiJob> = [
    {
      title: 'Role',
      key: 'role',
      render: (_, r) => (
        <div>
          <Text strong>{r.title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.companies.name}
          </Text>
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 200,
      render: (loc: string) => <Text type="secondary">{loc ?? '—'}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (s: string) => (
        <Tag color={STATUS_COLOR[s] ?? 'default'} style={{ margin: 0, fontWeight: 600 }}>
          {s}
        </Tag>
      ),
    },
    {
      title: 'Applications',
      key: 'applications',
      width: 140,
      align: 'center',
      render: (_, r) => (
        <Tag color={(r._count?.applications ?? 0) > 0 ? 'blue' : 'default'} style={{ margin: 0 }}>
          {r._count?.applications ?? 0}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 140,
      align: 'right',
      render: (_, r) => (
        <Link to={`/hr/job/${r.id}`}>
          <Button type="primary" ghost icon={<RightOutlined />} iconPosition="end">
            Pipeline
          </Button>
        </Link>
      ),
    },
  ]

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 300 }}>
        <Spin size="large" tip="Loading jobs..." />
      </Flex>
    )
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto' }}>
      <Flex vertical gap={token.marginLG}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Jobs
            </Title>
            <Text type="secondary" style={{ fontWeight: 500 }}>
              Live job postings from the database.
            </Text>
          </div>
          <Link to="/hr/my-job">
            <Button type="primary" icon={<PlusOutlined />}>
              Post New Job
            </Button>
          </Link>
        </Flex>

        {error && <Alert type="error" message={error} />}

        <Card
          variant="borderless"
          style={{
            borderRadius: token.borderRadiusLG * 1.25,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: token.boxShadowTertiary,
          }}
        >
          <Flex vertical gap={token.marginMD}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card
                  size="small"
                  style={{
                    background: token.colorFillAlter,
                    borderColor: token.colorBorderSecondary,
                  }}
                >
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}
                  >
                    Total applications
                  </Text>
                  <Title level={3} style={{ margin: '8px 0 0' }}>
                    {totalApplications}
                  </Title>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card
                  size="small"
                  style={{
                    background: token.colorFillAlter,
                    borderColor: token.colorBorderSecondary,
                  }}
                >
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}
                  >
                    Active job posts
                  </Text>
                  <Title level={3} style={{ margin: '8px 0 0' }}>
                    {jobs.filter((j) => j.status === 'Open').length}
                  </Title>
                </Card>
              </Col>
            </Row>

            <Table<ApiJob>
              rowKey="id"
              columns={columns}
              dataSource={jobs}
              pagination={{ pageSize: 15 }}
            />
          </Flex>
        </Card>
      </Flex>
    </div>
  )
}
