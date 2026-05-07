import {
  BankOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  LeftOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Flex,
  Image,
  Result,
  Row,
  Tag,
  Typography,
  theme,
  Spin,
  message,
} from 'antd'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { JobApplyModal } from '@/components/candidate/JobApplyModal.tsx'
import { InterviewPopupModal } from '@/components/candidate/InterviewPopupModal.tsx'
import { InterviewRecordingModal } from '@/components/candidate/InterviewRecordingModal.tsx'
import { getMyApplications, submitApplication } from '@/services/applicationsService'
import { getJobById, type ApiJob } from '@/services/jobsService'

const { Title, Text } = Typography

function getJobThematicImage(job: ApiJob) {
  const seed = job.id.split('-').pop() || '1'
  return `https://loremflickr.com/800/600/business,office,technology?random=${seed}`
}

function getApiErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object') {
    const maybe = err as { response?: { data?: { message?: unknown } } }
    const msg = maybe.response?.data?.message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return fallback
}

/** After each ". ", insert a blank line so Markdown splits into paragraphs (taller, easier to scan). */
function breakMarkdownAfterSentenceEnd(text: string) {
  return text.replace(/\. /g, '.\n\n')
}

const LEVEL_TAG_COLORS = ['blue', 'geekblue', 'purple', 'cyan'] as const
const TYPE_TAG_COLORS = ['magenta', 'volcano', 'orange', 'gold', 'lime'] as const

function pickTagColor(values: readonly string[], key: string) {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return values[(h >>> 0) % values.length]!
}

export function CandidateJobDetailsPage() {
  const { token } = theme.useToken()
  const { id } = useParams()
  const [applyOpen, setApplyOpen] = useState(false)
  const [interviewPopupOpen, setInterviewPopupOpen] = useState(false)
  const [interviewRecordingOpen, setInterviewRecordingOpen] = useState(false)
  const [interviewStream, setInterviewStream] = useState<MediaStream | null>(null)
  
  const [job, setJob] = useState<ApiJob | null>(null)
  const [isApplied, setIsApplied] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        setLoading(true)
        const [jobData, appsData] = await Promise.all([
          getJobById(id),
          getMyApplications(),
        ])
        setJob(jobData)
        const alreadyApplied = (appsData ?? []).some((app: any) => app.job_id === id)
        setIsApplied(alreadyApplied)
        if (alreadyApplied) {
          const app = (appsData ?? []).find((app: any) => app.job_id === id)
          if (app) setApplicationId(app.id)
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to fetch data'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '—'
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
  }

  const formatSalary = (j: ApiJob) => {
    if (!j.is_salary_visible) return 'Salary hidden'
    const cur = j.salary_currency ?? ''
    const min = j.salary_min
    const max = j.salary_max

    const fmt = (n: number) =>
      new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)

    if (typeof min === 'number' && typeof max === 'number')
      return `${fmt(min)} – ${fmt(max)} ${cur}`
    if (typeof min === 'number') return `From ${fmt(min)} ${cur}`
    if (typeof max === 'number') return `Up to ${fmt(max)} ${cur}`
    return '—'
  }

  const statusColor = (s: ApiJob['status']) => {
    if (s === 'Open') return 'green'
    if (s === 'Closed') return 'red'
    return 'gold'
  }

  const handleApplySubmit = async (file: File) => {
    if (!id) return
    try {
      const result = await submitApplication({
        jobId: id,
        resume: file,
        coverLetter: 'Applied via candidate job details page.',
      })
      if (result && result.id) {
        setApplicationId(String(result.id))
      }
      setIsApplied(true)
      // Note: Modal will handle its own closing after the AI progress animation
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, 'Failed to submit application'))
    }
  }

  const handleInterviewAccept = (stream: MediaStream) => {
    setInterviewStream(stream)
    setInterviewPopupOpen(false)
    setInterviewRecordingOpen(true)
  }

  const handleInterviewComplete = () => {
    setInterviewRecordingOpen(false)
    setIsInterviewCompleted(true)
    if (interviewStream) {
      interviewStream.getTracks().forEach(t => t.stop())
      setInterviewStream(null)
    }
  }

  const handleInterviewClose = () => {
    setInterviewRecordingOpen(false)
    if (interviewStream) {
      interviewStream.getTracks().forEach(t => t.stop())
      setInterviewStream(null)
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
        subTitle={error ?? 'This listing is unavailable or the link is incorrect.'}
        extra={
          <Link to="/candidate/jobs">
            <Button type="primary">Back to jobs</Button>
          </Link>
        }
      />
    )
  }

  const companyName = job.companies?.name ?? 'Company'

  return (
    <div className="candidate-jobDetails">
      <header className="candidate-jobHeader">
        <Breadcrumb
          className="candidate-breadcrumb candidate-jobDetailsBreadcrumb"
          separator={<span className="candidate-breadcrumbSep">›</span>}
          items={[
            { title: <Link to="/candidate/jobs">Jobs</Link> },
            {
              title: <span className="candidate-breadcrumbLink">{job.companies?.name ?? '—'}</span>,
            },
            { title: <span className="candidate-breadcrumbActive">{job.title}</span> },
          ]}
        />

        <div className="candidate-jobHeaderGlassPanel">
          <div className="candidate-jobHeaderGrid">
            <div className="candidate-jobHeaderTop">
              <div className="candidate-jobHeaderBrand">
                <Image
                  className="candidate-jobHeaderLogo"
                  src={getJobThematicImage(job)}
                  alt={companyName}
                  preview={false}
                  width={176}
                  height={176}
                  style={{ borderRadius: 12, objectFit: 'cover' }}
                />
                <div className="candidate-jobHeaderMeta">
                  <Flex align="center" gap={12}>
                    <Title className="candidate-jobH1" level={2} style={{ margin: 0 }}>
                      {job.title}
                    </Title>
                    {isApplied && (
                      <Tag 
                        icon={<CheckCircleOutlined />}
                        color="processing" 
                        style={{ 
                          fontWeight: 800, 
                          borderRadius: 99, 
                          paddingInline: 16,
                          paddingBlock: 2,
                          background: '#fff',
                          borderColor: token.colorPrimary,
                          color: token.colorPrimary,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        Đã ứng tuyển
                      </Tag>
                    )}
                  </Flex>
                  <div className="candidate-jobHeaderLine">
                    <BankOutlined
                      className="candidate-jobHeaderLineIcon"
                      style={{ color: token.colorTextSecondary }}
                    />
                    <Text style={{ fontWeight: 750, color: token.colorText }}>
                      {job.companies?.name ?? '—'}
                    </Text>
                  </div>
                  <div className="candidate-jobHeaderLocDeadline">
                    <div className="candidate-jobHeaderLocDeadlinePart">
                      <EnvironmentOutlined
                        className="candidate-jobHeaderLineIcon"
                        style={{ color: token.colorTextSecondary }}
                      />
                      <Text style={{ color: token.colorTextSecondary }}>{job.location ?? '—'}</Text>
                    </div>
                    <div className="candidate-jobHeaderLocDeadlinePart">
                      <CalendarOutlined
                        className="candidate-jobHeaderLineIcon"
                        style={{ color: token.colorTextSecondary }}
                      />
                      <Text style={{ color: token.colorTextSecondary }}>
                        Deadline {formatDate(job.application_deadline)}
                      </Text>
                    </div>
                  </div>
                  <div className="candidate-jobHeaderLine">
                    <span className="candidate-moneyIcon candidate-jobHeaderMoneyIcon" />
                    <Text className="candidate-jobPay">{formatSalary(job)}</Text>
                  </div>
                  <Flex wrap gap={8} className="candidate-jobPills candidate-jobHeaderMetaTags">
                    <Tag color={statusColor(job.status)} className="candidate-jobMetaTag">
                      {job.status}
                    </Tag>
                    {job.level ? (
                      <Tag
                        color={pickTagColor(LEVEL_TAG_COLORS, job.level)}
                        className="candidate-jobMetaTag"
                      >
                        {job.level}
                      </Tag>
                    ) : null}
                    {job.type ? (
                      <Tag
                        color={pickTagColor(TYPE_TAG_COLORS, job.type)}
                        className="candidate-jobMetaTag"
                      >
                        {job.type}
                      </Tag>
                    ) : null}
                    <Tag
                      color={job.is_remote ? 'geekblue' : 'orange'}
                      className="candidate-jobMetaTag"
                    >
                      {job.is_remote ? 'Remote' : 'On-site'}
                    </Tag>
                  </Flex>
                </div>
              </div>

              <Flex gap={10} wrap justify="end" className="candidate-jobHeaderActions">
                <Link to="/candidate/jobs">
                  <Button icon={<LeftOutlined />} className="candidate-jobBackBtn">
                    Back
                  </Button>
                </Link>
                <Button
                  type={!isApplied ? 'primary' : 'default'}
                  className="candidate-applyNowBtn"
                  onClick={() => {
                    if (!isApplied) {
                      setApplyOpen(true)
                    } else if (!isInterviewCompleted) {
                      setInterviewPopupOpen(true)
                    }
                  }}
                  style={(isApplied && isInterviewCompleted) ? { 
                    background: token.colorFillSecondary,
                    borderColor: 'transparent',
                    color: token.colorTextSecondary
                  } : (isApplied && !isInterviewCompleted) ? {
                    background: '#faad14',
                    borderColor: '#faad14',
                    color: '#fff'
                  } : undefined}
                  disabled={isApplied && isInterviewCompleted}
                >
                  {!isApplied ? 'Apply now' : (!isInterviewCompleted ? 'Hoàn tất hồ sơ' : 'Đã ứng tuyển')}
                </Button>
              </Flex>
            </div>
          </div>
        </div>
      </header>

      <Row gutter={[18, 18]} className="candidate-jobDetailGrid" align="stretch" wrap>
        <Col xs={24} lg={16} className="candidate-jobDetailMainCol">
          <Card
            className="candidate-jobDetailCard candidate-jobGlassCard"
            styles={{ body: { padding: 18 } }}
          >
            <div className="candidate-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {job.description?.trim()
                  ? breakMarkdownAfterSentenceEnd(job.description.trim())
                  : '—'}
              </ReactMarkdown>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8} className="candidate-jobDetailSideCol">
          <Card
            className="candidate-jobInfoCard candidate-jobGlassCard candidate-jobGlassCardSubtle"
            styles={{ body: { padding: 16 } }}
          >
            <Flex vertical gap={12}>
              <div className="candidate-infoRow">
                <Text type="secondary">Salary</Text>
                <Text strong className="candidate-infoValue">
                  {formatSalary(job)}
                </Text>
              </div>

              <div className="candidate-infoRow">
                <Text type="secondary">Deadline</Text>
                <Text strong className="candidate-infoValue">
                  {formatDate(job.application_deadline)}
                </Text>
              </div>

              <div className="candidate-infoRow">
                <Text type="secondary">Headcount</Text>
                <Text strong className="candidate-infoValue">
                  {job.headcount ?? '—'}
                </Text>
              </div>

              <div className="candidate-infoRow">
                <Text type="secondary">Min experience</Text>
                <Text strong className="candidate-infoValue">
                  {typeof job.min_experience_years === 'number'
                    ? `${job.min_experience_years} year(s)`
                    : '—'}
                </Text>
              </div>

              <div className="candidate-infoRow">
                <Text type="secondary">Company</Text>
                <Text strong className="candidate-infoValue">
                  {job.companies?.name ?? '—'}
                </Text>
              </div>

              {job.companies?.description ? (
                <div className="candidate-infoBlock">
                  <Text type="secondary">About company</Text>
                  <Text className="candidate-infoMuted">{job.companies.description}</Text>
                </div>
              ) : null}

              {job.hr_profiles ? (
                <div className="candidate-infoBlock">
                  <Text type="secondary">HR contact</Text>
                  <Flex wrap gap={8} align="center" style={{ marginTop: 6 }}>
                    <Tag icon={<UserOutlined />}>{job.hr_profiles.position ?? 'HR'}</Tag>
                    {job.hr_profiles.department_name ? (
                      <Tag icon={<TeamOutlined />}>{job.hr_profiles.department_name}</Tag>
                    ) : null}
                  </Flex>
                </div>
              ) : null}
            </Flex>
          </Card>
        </Col>
      </Row>

      <JobApplyModal
        open={applyOpen}
        onClose={() => {
          setApplyOpen(false)
          // If application was successful, show success and trigger next step
          if (isApplied) {
            message.success('Your application has been submitted successfully!')
            setTimeout(() => {
              setInterviewPopupOpen(true)
            }, 600)
          }
        }}
        jobTitle={job.title}
        subtitle="Submit your application for this role."
        onSubmit={handleApplySubmit}
      />

      <InterviewPopupModal
        open={interviewPopupOpen}
        onClose={() => setInterviewPopupOpen(false)}
        onAccept={handleInterviewAccept}
      />

      <InterviewRecordingModal
        open={interviewRecordingOpen}
        jobId={id || ''}
        applicationId={applicationId || ''}
        stream={interviewStream}
        onClose={handleInterviewClose}
        onComplete={handleInterviewComplete}
      />
    </div>
  )
}
