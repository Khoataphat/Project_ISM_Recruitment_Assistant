import { BankOutlined, EnvironmentOutlined, LeftOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Col, Flex, Image, Result, Row, Typography, theme, Spin, message } from 'antd'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { JobApplyModal } from '@/components/candidate/JobApplyModal.tsx'
import { apiClient } from '@/lib/api'

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

export function CandidateJobDetailsPage() {
  const { token } = theme.useToken()
  const { id } = useParams()
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

  const handleApplySubmit = async (file: File) => {
    if (!id) return
    const formData = new FormData()
    formData.append('jobId', id)
    formData.append('resume', file)
    formData.append('coverLetter', 'Applied via candidate job details page.')

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
          <Link to="/candidate/jobs">
            <Button type="primary">Back to jobs</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="candidate-jobDetails">
      <header className="candidate-jobHeader">
        <Flex vertical gap={16}>
          <Flex justify="space-between" align="flex-end" wrap gap={16}>
            <div>
              <Breadcrumb
                className="candidate-breadcrumb"
                separator={<span className="candidate-breadcrumbSep">›</span>}
                items={[
                  { title: <Link to="/candidate/jobs">Jobs</Link> },
                  { title: <span className="candidate-breadcrumbLink">{job.companies.name}</span> },
                  { title: <span className="candidate-breadcrumbActive">{job.title}</span> },
                ]}
              />

              <Flex align="center" wrap gap={12} style={{ marginTop: 8, marginBottom: 10 }}>
                <Title className="candidate-jobH1" level={1} style={{ margin: 0, flex: '1 1 280px', minWidth: 0 }}>
                  {job.title}
                </Title>
              </Flex>

              <Flex wrap gap={18} align="center">
                <Flex gap={8} align="center">
                  <BankOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />
                  <Text style={{ fontWeight: 700, color: token.colorText }}>{job.companies.name}</Text>
                </Flex>
                <Flex gap={8} align="center">
                  <EnvironmentOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />
                  <Text style={{ color: token.colorTextSecondary }}>{job.location}</Text>
                </Flex>
                <Flex gap={8} align="center">
                  <span className="candidate-moneyIcon" />
                  <Text className="candidate-jobPay">{job.salary}</Text>
                </Flex>
              </Flex>

              <Text style={{ display: 'block', marginTop: 10, color: token.colorTextTertiary }}>Job ID: {id}</Text>
            </div>

            <Flex gap={10} wrap>
              <Link to="/candidate/jobs">
                <Button icon={<LeftOutlined />}>Back</Button>
              </Link>
              <Button type="primary" className="candidate-applyNowBtn" onClick={() => setApplyOpen(true)}>
                Apply Now
              </Button>
            </Flex>
          </Flex>

          <Flex wrap gap={8} className="candidate-jobPills">
            {(job.tags || []).map((t) => (
              <span key={t} className="candidate-pill">
                {t}
              </span>
            ))}
          </Flex>
        </Flex>
      </header>

      <Row gutter={[48, 48]}>
        <Col xs={24} lg={16}>
          <div className="candidate-heroCard">
            <Image
              src={job.companies.logo_url}
              alt=""
              preview={false}
              width="100%"
              height="100%"
              style={{ objectFit: 'cover', filter: 'blur(40px)', opacity: 0.3 }}
            />
            <div className="candidate-heroOverlay" />
          </div>

          <section style={{ marginTop: 40 }}>
            <Title level={3} style={{ marginTop: 0, marginBottom: 16 }}>
              About the Role
            </Title>
            <div className="candidate-prose">
              <Paragraph style={{ marginTop: 0, color: token.colorTextSecondary, whiteSpace: 'pre-wrap' }}>
                {job.description}
              </Paragraph>
              
              {job.requirements && (
                <>
                  <Title level={4} style={{ marginTop: 24 }}>Requirements</Title>
                  <Paragraph style={{ color: token.colorTextSecondary, whiteSpace: 'pre-wrap' }}>{job.requirements}</Paragraph>
                </>
              )}

              {job.benefits && (
                <>
                  <Title level={4} style={{ marginTop: 24 }}>Benefits</Title>
                  <Paragraph style={{ color: token.colorTextSecondary, whiteSpace: 'pre-wrap' }}>{job.benefits}</Paragraph>
                </>
              )}
            </div>
          </section>
        </Col>

        <Col xs={24} lg={8}>
          <aside style={{ minHeight: 1 }} />
        </Col>
      </Row>

      <JobApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        jobTitle={job.title}
        subtitle="Submit your application for this role."
        onSubmit={handleApplySubmit}
      />

      <footer className="candidate-detailFooter">
        <div className="candidate-detailFooterInner">
          <div>
            <Text className="candidate-detailFooterBrand">Editorial Enterprise Recruitment</Text>
            <div style={{ height: 6 }} />
            <Text className="candidate-detailFooterCopy">© 2026 Editorial Enterprise Recruitment. All rights reserved.</Text>
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
    </div>
  )
}
