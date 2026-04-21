import { RightOutlined, TeamOutlined } from '@ant-design/icons'
import { Button, Card, Col, Flex, Row, Space, Table, Tag, Typography, theme } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { candidateJobs } from '@/data/candidateJobs'
import { listJobApplications } from '@/lib/candidateApplicationsStorage'

const { Title, Text } = Typography

type JobRow = {
  id: string
  title: string
  company: string
  location: string
  applications: number
}

export function HrJobsPage() {
  const { token } = theme.useToken()
  const location = useLocation()

  const applications = useMemo(() => listJobApplications(), [location.key])

  const data: JobRow[] = useMemo(() => {
    return candidateJobs.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      applications: applications.filter((a) => a.jobId === j.id).length,
    }))
  }, [applications])

  const columns: ColumnsType<JobRow> = [
    {
      title: 'Role',
      key: 'role',
      render: (_, r) => (
        <div>
          <Text strong>{r.title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.company}
          </Text>
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 200,
      render: (loc: string) => <Text type="secondary">{loc}</Text>,
    },
    {
      title: 'Applications',
      dataIndex: 'applications',
      key: 'applications',
      width: 140,
      align: 'center',
      render: (n: number) => (
        <Tag icon={<TeamOutlined />} color={n > 0 ? 'blue' : 'default'} style={{ margin: 0 }}>
          {n}
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

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto' }}>
      <Flex vertical gap={token.marginLG}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Jobs
          </Title>
          <Text type="secondary" style={{ fontWeight: 500 }}>
            Open roles aligned with the candidate job board. Application counts come from submitted CVs (demo).
          </Text>
        </div>

        <Card
          variant="borderless"
          style={{
            borderRadius: token.borderRadiusLG * 1.25,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: token.boxShadowTertiary,
          }}
        >
          <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small" style={{ background: token.colorFillAlter, borderColor: token.colorBorderSecondary }}>
                  <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                    Total applications
                  </Text>
                  <Title level={3} style={{ margin: '8px 0 0' }}>
                    {applications.length}
                  </Title>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" style={{ background: token.colorFillAlter, borderColor: token.colorBorderSecondary }}>
                  <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                    Active job posts
                  </Text>
                  <Title level={3} style={{ margin: '8px 0 0' }}>
                    {candidateJobs.length}
                  </Title>
                </Card>
              </Col>
            </Row>

            <Table<JobRow> rowKey="id" columns={columns} dataSource={data} pagination={false} />
          </Space>
        </Card>
      </Flex>
    </div>
  )
}
