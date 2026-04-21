import { BankOutlined, EnvironmentOutlined, LeftOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Col, Flex, Image, Result, Row, Typography, theme } from 'antd'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { JobApplyModal } from '@/components/candidate/JobApplyModal.tsx'
import { getCandidateJobById } from '@/data/candidateJobs'
import { addJobApplication, fileToDataUrl } from '@/lib/candidateApplicationsStorage'

const { Title, Text, Paragraph } = Typography

export function JobDetailsPage() {
  const { token } = theme.useToken()
  const { id } = useParams()
  const [applyOpen, setApplyOpen] = useState(false)

  const job = useMemo(() => getCandidateJobById(id), [id])

  if (!job) {
    return (
      <Result
        status="404"
        title="Job not found"
        subTitle="This listing is unavailable or the link is incorrect."
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
                { title: <span style={{ color: token.colorTextSecondary }}>{job.company}</span> },
                { title: <span style={{ color: token.colorText }}>{job.title}</span> },
              ]}
            />
            <Title level={2} style={{ marginTop: 0, marginBottom: 8 }}>
              {job.title}
            </Title>
            <Flex wrap gap={16}>
              <Flex gap={8} align="center">
                <BankOutlined style={{ color: token.colorTextSecondary }} />
                <Text strong>{job.company}</Text>
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
            <Button type="primary" onClick={() => setApplyOpen(true)}>
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
                src={job.logoUrl}
                alt=""
                preview={false}
                width="100%"
                height={220}
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
            <section style={{ marginTop: 24 }}>
              <Title level={4}>About the role</Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Apply with your CV (PDF). Your application is stored for this demo so recruiters can review it in the
                HR console.
              </Paragraph>
            </section>
          </Col>
          <Col xs={24} md={8}>
            <Flex vertical gap={8} style={{ padding: token.paddingMD, background: token.colorFillAlter, borderRadius: token.borderRadiusLG }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Job ID
              </Text>
              <Text strong>{id}</Text>
              <Flex wrap gap={8} style={{ marginTop: 8 }}>
                {job.tags.map((t) => (
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
        onSubmit={async (file) => {
          const resumeDataUrl = await fileToDataUrl(file)
          addJobApplication({
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            logoUrl: job.logoUrl,
            status: 'applied',
            resumeFileName: file.name,
            resumeDataUrl,
          })
        }}
      />
    </div>
  )
}
