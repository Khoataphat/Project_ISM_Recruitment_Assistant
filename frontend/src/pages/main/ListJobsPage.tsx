import {
  ArrowRightOutlined,
  BankOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileSearchOutlined,
  HeartOutlined,
  RocketOutlined,
  SearchOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Image,
  Input,
  Row,
  Space,
  Tag,
  Typography,
  theme,
  Spin,
  Alert,
} from 'antd'
import { Link } from 'react-router-dom'

import landingHero from '@/assets/images/landing-hero.png'
import { apiClient } from '@/lib/api'

const { Title, Text, Paragraph } = Typography

type Job = {
  id: string
  title: string
  location: string
  salary: string
  tags: string[]
  companies: {
    name: string
    logo_url: string
  }
}

function cardGradient(index: number, token: ReturnType<typeof theme.useToken>['token']) {
  const pairs: [string, string][] = [
    [token.colorPrimary, token.colorInfo],
    [token.colorSuccess, token.colorPrimary],
    [token.colorWarning, token.colorSuccess],
    [token.colorInfo, token.colorError],
    [token.colorPrimary, token.colorSuccess],
    [token.colorInfo, token.colorWarning],
  ]
  const [a, b] = pairs[index % pairs.length]
  const base = token.colorBgContainer
  return `linear-gradient(
    145deg,
    color-mix(in srgb, ${a} 18%, ${base}) 0%,
    ${base} 42%,
    color-mix(in srgb, ${b} 15%, ${base}) 100%
  )`
}

export function ListJobsPage() {
  const { token } = theme.useToken()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const res = await apiClient.get('/jobs')
        setJobs(res.data.data)
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Failed to fetch jobs')
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter((job) => {
    const q = search.toLowerCase()
    return (
      job.title.toLowerCase().includes(q) ||
      job.companies.name.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q)
    )
  })

  const statCard = (icon: ReactNode, label: string, value: string) => (
    <Card
      size="small"
      variant="borderless"
      style={{
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        boxShadow: token.boxShadowTertiary,
      }}
      styles={{ body: { padding: `${token.paddingSM}px ${token.padding}px` } }}
    >
      <Flex align="center" gap={12}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: token.borderRadius,
            background: token.colorPrimaryBg,
            color: token.colorPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          {icon}
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {label}
          </Text>
          <div>
            <Text strong style={{ fontSize: 16 }}>
              {value}
            </Text>
          </div>
        </div>
      </Flex>
    </Card>
  )

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 400 }}>
        <Spin size="large" tip="Discovering opportunities..." />
      </Flex>
    )
  }

  return (
    <main style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 16px 56px' }}>
      {error && <Alert type="error" message={error} style={{ marginBottom: 24 }} />}

      <Card
        variant="borderless"
        style={{
          marginBottom: 28,
          borderRadius: token.borderRadiusLG * 1.25,
          overflow: 'hidden',
          border: `1px solid ${token.colorBorderSecondary}`,
          background: `linear-gradient(120deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 55%, color-mix(in srgb, ${token.colorInfo} 6%, ${token.colorBgContainer}) 100%)`,
          boxShadow: token.boxShadowSecondary,
        }}
        styles={{ body: { padding: token.paddingLG } }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={14}>
            <Space orientation="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Tag icon={<RocketOutlined />} color="processing" style={{ marginBottom: 10 }}>
                  Curated listings
                </Tag>
                <Title level={2} style={{ margin: 0, marginBottom: 8, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Find your next role
                </Title>
                <Paragraph style={{ marginBottom: 0, color: token.colorTextSecondary, fontSize: 15, maxWidth: 520 }}>
                  Search live openings, compare teams, and jump into full job briefs. Each card highlights location,
                  compensation, and the skills employers care about most.
                </Paragraph>
              </div>

              <Input
                size="large"
                allowClear
                placeholder="Search by title, company, or skill…"
                prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  maxWidth: 440,
                  borderRadius: token.borderRadiusLG,
                }}
              />

              <Flex wrap gap={10} align="center">
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                  Popular:
                </Text>
                <Tag icon={<ThunderboltOutlined />}>React</Tag>
                <Tag icon={<BankOutlined />}>Finance</Tag>
                <Tag icon={<TeamOutlined />}>Leadership</Tag>
              </Flex>
            </Space>
          </Col>

          <Col xs={24} lg={10}>
            <div
              style={{
                position: 'relative',
                borderRadius: token.borderRadiusLG * 1.25,
                overflow: 'hidden',
                border: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: token.boxShadowTertiary,
              }}
            >
              <Image src={landingHero} alt="" preview={false} style={{ width: '100%', display: 'block' }} />
              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  bottom: 12,
                  right: 12,
                  padding: '10px 14px',
                  borderRadius: token.borderRadiusLG,
                  background: `color-mix(in srgb, ${token.colorBgContainer} 88%, transparent)`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <Flex align="center" justify="space-between" gap={12} wrap>
                  <Flex align="center" gap={10}>
                    <Avatar.Group maxCount={3} size="small">
                      {jobs.slice(0, 5).map((j) => (
                        <Avatar key={j.id} src={j.companies.logo_url} />
                      ))}
                    </Avatar.Group>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: token.colorText }}>
                      Teams hiring this week
                    </Text>
                  </Flex>
                  <Badge status="processing" text="Live" />
                </Flex>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          {statCard(<TeamOutlined />, 'Active roles', `${jobs.length}+`)}
        </Col>
        <Col xs={24} sm={8}>
          {statCard(<FileSearchOutlined />, 'New this week', '48')}
        </Col>
        <Col xs={24} sm={8}>
          {statCard(<ThunderboltOutlined />, 'Avg. response', '2–4 days')}
        </Col>
      </Row>

      <Flex align="center" justify="space-between" wrap gap={12} style={{ marginBottom: 20 }}>
        <Flex align="center" gap={10}>
          <BankOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
              Open positions
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Hand-picked roles with clear compensation and location.
            </Text>
          </div>
        </Flex>
      </Flex>

      <Divider style={{ margin: '0 0 20px', borderColor: token.colorBorderSecondary }} />

      <Row gutter={[16, 16]}>
        {filteredJobs.map((job, index) => (
          <Col xs={24} md={12} key={job.id}>
            <Card
              variant="borderless"
              style={{
                height: '100%',
                background: cardGradient(index, token),
                borderRadius: token.borderRadiusLG,
                border: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: token.boxShadowTertiary,
              }}
              styles={{ body: { padding: token.paddingLG } }}
            >
              <Space orientation="vertical" size={14} style={{ width: '100%' }}>
                <Flex align="flex-start" justify="space-between" gap={12}>
                  <Flex align="center" gap={12} style={{ minWidth: 0 }}>
                    <Badge.Ribbon text="Featured" color="geekblue" style={{ top: 4 }}>
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: token.borderRadiusLG,
                          background: token.colorBgElevated,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 8,
                          flexShrink: 0,
                          border: `1px solid ${token.colorBorderSecondary}`,
                          boxShadow: token.boxShadowTertiary,
                        }}
                      >
                        <Image
                          src={job.companies.logo_url}
                          alt=""
                          preview={false}
                          style={{ width: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    </Badge.Ribbon>
                    <div style={{ minWidth: 0 }}>
                      <Link to={`/main/job/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                          {job.title}
                        </Title>
                      </Link>
                      <Flex align="center" gap={6} wrap style={{ marginTop: 4 }}>
                        <BankOutlined style={{ color: token.colorTextTertiary, fontSize: 13 }} />
                        <Text type="secondary" style={{ fontWeight: 600, fontSize: 13 }}>
                          {job.companies.name}
                        </Text>
                      </Flex>
                    </div>
                  </Flex>
                  <Button type="text" icon={<HeartOutlined />} aria-label="Save job" style={{ color: token.colorTextSecondary }} />
                </Flex>

                <Flex vertical gap={8}>
                  <Flex align="center" gap={8} wrap>
                    <EnvironmentOutlined style={{ color: token.colorPrimary }} />
                    <Text style={{ color: token.colorTextSecondary, fontWeight: 500 }}>{job.location}</Text>
                  </Flex>
                  <Flex align="center" gap={8} wrap>
                    <DollarOutlined style={{ color: token.colorSuccess }} />
                    <Paragraph style={{ marginBottom: 0, color: token.colorText, fontWeight: 600 }}>{job.salary}</Paragraph>
                  </Flex>
                  <Flex align="center" gap={8}>
                    <ClockCircleOutlined style={{ color: token.colorWarning }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Recruiters typically reply within 2–4 business days
                    </Text>
                  </Flex>
                </Flex>

                <Flex align="center" gap={8} wrap>
                  {(job.tags || []).map((t) => (
                    <Tag key={t} icon={<ThunderboltOutlined />} style={{ margin: 0 }}>
                      {t}
                    </Tag>
                  ))}
                </Flex>

                <Link to={`/main/job/${job.id}`}>
                  <Button type="primary" block icon={<ArrowRightOutlined />} iconPosition="end">
                    View job details
                  </Button>
                </Link>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </main>
  )
}
