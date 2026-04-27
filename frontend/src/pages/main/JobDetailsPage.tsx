import { BankOutlined, EnvironmentOutlined, LeftOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Col, Flex, Image, Result, Row, Typography, theme, Spin, Alert, message } from 'antd'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { JobApplyModal } from '@/components/candidate/JobApplyModal.tsx'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const { Title, Text, Paragraph } = Typography

type JobDetail = {
  id: string
  title: string
  description: string
  requirements: string
  benefits: string
  location: string
  salary: string
  tags: string[]
  companies: {
    name: string
    logo_url: string
  }
}

export function JobDetailsPage() {
  const { token } = theme.useToken()
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [applyOpen, setApplyOpen] = useState(false)
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return
      try {
        setLoading(true)
        const res = await apiClient.get(`/jobs/${id}`)
        setJob(res.data.data)
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Failed to fetch job details')
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [id])

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      message.info('Please log in to apply for this job.')
      navigate('/login')
      return
    }
    setApplyOpen(true)
  }

  const handleApplySubmit = async (file: File) => {
    if (!id) return
    const formData = new FormData()
    formData.append('jobId', id)
    formData.append('resume', file)
    formData.append('coverLetter', 'Applied via public job details page.')

    try {
      await apiClient.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      message.success('Your application has been submitted successfully!')
    } catch (err: any) {
      throw new Error(err.response?.data?.message ?? 'Failed to submit application')
    }
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 400 }}>
        <Spin size="large" tip="Loading job details..." />
      </Flex>
    )
  }

  if (error || !job) {
    return (
      <Result
        status="404"
        title="Job not found"
        subTitle={error ?? "This listing is unavailable or the link is incorrect."}
        extra={
          <Link to="/main/jobs">
            <Button type="primary">Back to jobs</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 48px' }}>
      <Flex vertical gap={24}>
        <Flex justify="space-between" align="flex-start" wrap gap={16}>
          <div>
            <Breadcrumb
              style={{ marginBottom: 12, fontSize: 12 }}
              items={[
                { title: <Link to="/main/jobs">Jobs</Link> },
                { title: <span style={{ color: token.colorTextSecondary }}>{job.companies.name}</span> },
                { title: <span style={{ color: token.colorText }}>{job.title}</span> },
              ]}
            />
            <Title level={2} style={{ marginTop: 0, marginBottom: 8 }}>
              {job.title}
            </Title>
            <Flex wrap gap={16}>
              <Flex gap={8} align="center">
                <BankOutlined style={{ color: token.colorTextSecondary }} />
                <Text strong>{job.companies.name}</Text>
              </Flex>
              <Flex gap={8} align="center">
                <EnvironmentOutlined style={{ color: token.colorTextSecondary }} />
                <Text type="secondary">{job.location}</Text>
              </Flex>
              <Text style={{ color: token.colorPrimary, fontWeight: 600 }}>{job.salary}</Text>
            </Flex>
          </div>
          <Flex gap={10} wrap>
            <Link to="/main/jobs">
              <Button icon={<LeftOutlined />}>Back</Button>
            </Link>
            <Button type="primary" onClick={handleApplyClick}>
              Apply now
            </Button>
          </Flex>
        </Flex>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <div
              style={{
                borderRadius: token.borderRadiusLG,
                overflow: 'hidden',
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Image
                src={job.companies.logo_url}
                alt=""
                preview={false}
                width="100%"
                height={220}
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
            <section style={{ marginTop: 24 }}>
              <Title level={4}>About the role</Title>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {job.description}
              </Paragraph>
              
              {job.requirements && (
                <>
                  <Title level={4} style={{ marginTop: 24 }}>Requirements</Title>
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{job.requirements}</Paragraph>
                </>
              )}

              {job.benefits && (
                <>
                  <Title level={4} style={{ marginTop: 24 }}>Benefits</Title>
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{job.benefits}</Paragraph>
                </>
              )}
            </section>
          </Col>
          <Col xs={24} md={8}>
            <Flex vertical gap={8} style={{ padding: token.paddingMD, background: token.colorFillAlter, borderRadius: token.borderRadiusLG }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Job ID
              </Text>
              <Text strong>{job.id}</Text>
              <Flex wrap gap={8} style={{ marginTop: 8 }}>
                {(job.tags || []).map((t) => (
                  <Text key={t} code style={{ fontSize: 12 }}>
                    {t}
                  </Text>
                ))}
              </Flex>
            </Flex>
          </Col>
        </Row>
      </Flex>

      <JobApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        jobTitle={job.title}
        subtitle="Upload your resume (PDF) to submit your application."
        onSubmit={handleApplySubmit}
      />
    </div>
  )
}
