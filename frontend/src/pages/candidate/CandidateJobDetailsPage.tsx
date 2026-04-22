import { BankOutlined, EnvironmentOutlined, LeftOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Col, Flex, Image, Result, Row, Typography, theme } from 'antd'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { JobApplyModal } from '@/components/candidate/JobApplyModal.tsx'
import { JOB_HEAT_BADGE_LABELS, getCandidateJobById } from '@/data/candidateJobs'
import { addJobApplication, fileToDataUrl } from '@/lib/candidateApplicationsStorage'

const { Title, Text, Paragraph } = Typography

export function CandidateJobDetailsPage() {
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
                  { title: <span className="candidate-breadcrumbLink">{job.company}</span> },
                  { title: <span className="candidate-breadcrumbActive">{job.title}</span> },
                ]}
              />

              <Flex align="center" wrap gap={12} style={{ marginTop: 8, marginBottom: 10 }}>
                {job.heatBadge ? (
                  <span
                    className={`candidate-jobHeatBadge candidate-jobHeatBadge--lg candidate-jobHeatBadge--${job.heatBadge}`}
                    aria-label={JOB_HEAT_BADGE_LABELS[job.heatBadge]}
                  >
                    {JOB_HEAT_BADGE_LABELS[job.heatBadge]}
                  </span>
                ) : null}
                <Title className="candidate-jobH1" level={1} style={{ margin: 0, flex: '1 1 280px', minWidth: 0 }}>
                  {job.title}
                </Title>
              </Flex>

              <Flex wrap gap={18} align="center">
                <Flex gap={8} align="center">
                  <BankOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />
                  <Text style={{ fontWeight: 700, color: token.colorText }}>{job.company}</Text>
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
            {job.tags.map((t) => (
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
              src={job.coverImageUrl}
              alt=""
              preview={false}
              width="100%"
              height="100%"
              style={{ objectFit: 'cover' }}
            />
            <div className="candidate-heroOverlay" />
          </div>

          <section style={{ marginTop: 40 }}>
            <Title level={3} style={{ marginTop: 0, marginBottom: 16 }}>
              About the Role
            </Title>
            <div className="candidate-prose">
              <Paragraph style={{ marginTop: 0, color: token.colorTextSecondary }}>
                Vertex Systems is seeking a visionary Senior Product Designer to spearhead the evolution of our core
                enterprise analytics platform. You will be responsible for transforming complex data flows into elegant,
                intuitive experiences that empower our global clients to make better business decisions.
              </Paragraph>
              <Paragraph style={{ color: token.colorTextSecondary, marginBottom: 0 }}>
                As a lead voice in our design team, you'll work closely with engineering and product management to define
                the visual language and user architecture of next-generation AI-driven tools. This isn't just about
                moving pixels; it's about building the infrastructure for the future of work.
              </Paragraph>
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
        subtitle="Complete your application for the Design Systems team."
        onSubmit={async (file) => {
          await addJobApplication(job.id, file)
        }}
      />

      <footer className="candidate-detailFooter">
        <div className="candidate-detailFooterInner">
          <div>
            <Text className="candidate-detailFooterBrand">Editorial Enterprise Recruitment</Text>
            <div style={{ height: 6 }} />
            <Text className="candidate-detailFooterCopy">© 2024 Editorial Enterprise Recruitment. All rights reserved.</Text>
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

