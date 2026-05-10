import { ArrowLeftOutlined, DashboardOutlined, FilePdfOutlined } from '@ant-design/icons'
import {
  Alert,
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Flex,
  Progress,
  Result,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
  theme,
} from 'antd'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiClient } from '@/lib/api'
import { appEnv } from '@/config/env'
import { SkillsRadarChart } from '@/components/candidate/SkillsRadarChart'

const { Title, Text } = Typography

type ApplicationDetail = {
  id: string
  cv_url: string
  cover_letter?: string
  hr_status: string
  hr_note?: string
  processing_status: string
  ai_matching_score?: number
  skills_radar?: Record<string, number>
  ai_summary?: {
    ai_summary?: string
    ai_explanation?: {
      score_reason?: string
      radar_breakdown?: string
    }
  }
  applied_at: string
  jobs: {
    id: string
    title: string
    description: string
    companies: { name: string; logo_url?: string }
  }
  candidates: {
    id: string
    years_of_experience?: number
    users: {
      full_name: string
      email: string
      phone?: string
      avatar_url?: string
    }
  }
}

type InterviewResult = {
  status: string
  interview_score: number
  communication_score: number
  confidence_score: number
  relevance_score: number
  attitude_score: number
  environment_note: string
  feedback_summary: string
  feedback_strengths: string
  feedback_weaknesses: string
  video_url: string
}

const HR_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Shortlisted', label: 'Shortlisted' },
  { value: 'Interviewing', label: 'Interviewing' },
  { value: 'Offered', label: 'Offered' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Rejected', label: 'Rejected' },
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
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(
      new Date(iso)
    )
  } catch {
    return iso
  }
}

export function HrCandidateDetailsPage() {
  const { id } = useParams()
  const { token } = theme.useToken()
  const [app, setApp] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const [interview, setInterview] = useState<InterviewResult | null>(null)
  const [interviewLoading, setInterviewLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return
      try {
        setLoading(true)
        setError(null)
        const res = await apiClient.get(`/dashboard/applications/${id}`)
        setApp(res.data.data)
      } catch (err: unknown) {
        const maybe = err as { response?: { status?: unknown } }
        if (maybe.response?.status === 404) {
          setApp(null)
        } else {
          setError(getApiErrorMessage(err, 'Failed to load application'))
        }
      } finally {
        setLoading(false)
      }
    }

    const fetchInterview = async () => {
      if (!id) return
      try {
        setInterviewLoading(true)
        const res = await apiClient.get(`/ai-interview/result/${id}`)
        setInterview(res.data.data)
      } catch (err: unknown) {
        // It's okay if interview result doesn't exist yet
        console.error('Failed to load interview result', err)
      } finally {
        setInterviewLoading(false)
      }
    }

    fetchDetail()
    fetchInterview()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!app) return
    setUpdating(true)
    try {
      await apiClient.patch(`/dashboard/applications/${app.id}/status`, { status: newStatus })
      setApp({ ...app, hr_status: newStatus })
      message.success(`Status updated to ${newStatus}`)
    } catch (err: unknown) {
      message.error(getApiErrorMessage(err, 'Failed to update status'))
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 300 }}>
        <Spin size="large" />
      </Flex>
    )
  }

  if (error) {
    return <Alert type="error" message={error} style={{ margin: 24 }} />
  }

  if (!app) {
    return (
      <Result
        status="404"
        title="Application not found"
        subTitle="This application ID is invalid or was removed."
        extra={
          <Link to="/hr/candidates">
            <Button type="primary">Back to candidates</Button>
          </Link>
        }
      />
    )
  }

  const aiScore = app.ai_matching_score ? Math.round(Number(app.ai_matching_score)) : 0
  const isAnalyzed = app.processing_status === 'Analyzed'

  const interviewRadar = interview
    ? {
        Communication: interview.communication_score || 0,
        Confidence: interview.confidence_score || 0,
        Relevance: interview.relevance_score || 0,
        Attitude: interview.attitude_score || 0,
      }
    : {}

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <Flex vertical gap={token.marginLG}>
        <Breadcrumb
          style={{ fontSize: token.fontSizeSM }}
          items={[
            { title: <Link to="/hr/candidates">Candidates</Link> },
            { title: <span style={{ color: token.colorText }}>Application</span> },
          ]}
        />

        <Flex justify="space-between" align="flex-start" wrap gap={16}>
          <Flex align="center" gap={16}>
            <Avatar size={56} src={app.candidates.users.avatar_url} style={{ flexShrink: 0 }}>
              {app.candidates.users.full_name?.[0] ?? '?'}
            </Avatar>
            <div>
              <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
                {app.candidates.users.full_name}
              </Title>
              <Text type="secondary">{app.candidates.users.email}</Text>
              {app.candidates.users.phone && (
                <Text type="secondary"> · {app.candidates.users.phone}</Text>
              )}
            </div>
          </Flex>
          <Link to="/hr/candidates">
            <Button icon={<ArrowLeftOutlined />}>Back to list</Button>
          </Link>
        </Flex>

        {/* AI Analysis Section (CV Scoring) */}
        {app.processing_status !== 'Pending' ? (
          <Card
            title={
              <Space>
                <DashboardOutlined style={{ color: token.colorPrimary }} />
                <span>AI CV Analysis Result</span>
              </Space>
            }
            variant="borderless"
            style={{
              borderRadius: token.borderRadiusLG * 1.25,
              border: `1px solid ${token.colorPrimaryBorder}`,
              background: `color-mix(in srgb, ${token.colorPrimaryBg} 40%, transparent)`,
            }}
          >
            {app.processing_status === 'Processing' ? (
              <Flex justify="center" align="center" vertical gap={16} style={{ minHeight: 150 }}>
                <Spin />
                <Text type="secondary">AI đang phân tích CV, vui lòng đợi...</Text>
              </Flex>
            ) : app.processing_status === 'Failed' ? (
              <Alert
                message="AI CV Analysis Failed"
                description="Có lỗi xảy ra khi phân tích CV của ứng viên này. Vui lòng liên hệ quản trị viên hoặc thử lại sau."
                type="error"
                showIcon
              />
            ) : (
              <>
                <Flex gap={24} wrap>
                  <div style={{ flex: '0 0 120px', textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      percent={aiScore}
                      size={100}
                      strokeColor={{
                        '0%': token.colorError,
                        '50%': token.colorWarning,
                        '100%': token.colorSuccess,
                      }}
                      format={(p) => (
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                          <span style={{ fontSize: 24, fontWeight: 800, color: token.colorText }}>
                            {p}
                          </span>
                          <span style={{ fontSize: 10, color: token.colorTextSecondary }}>MATCH</span>
                        </div>
                      )}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 300 }}>
                    <Title level={5} style={{ marginTop: 0 }}>
                      Matching Summary
                    </Title>
                    <div
                      style={{
                        padding: 12,
                        background: token.colorBgContainer,
                        borderRadius: token.borderRadius,
                        border: `1px solid ${token.colorBorderSecondary}`,
                      }}
                    >
                      <Text style={{ display: 'block', marginBottom: 8 }}>
                        {app.ai_summary?.ai_summary}
                      </Text>
                      {app.ai_summary?.ai_explanation?.score_reason && (
                        <div style={{ marginTop: 12 }}>
                          <Text strong>
                            Reason:
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {app.ai_summary.ai_explanation.score_reason}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                </Flex>

                {app.skills_radar && (
                  <div style={{ marginTop: 24 }}>
                    <Title level={5}>Skills Breakdown</Title>
                    <Flex gap={8} wrap>
                      {Object.entries(app.skills_radar).map(([skill, val]) => (
                        <div
                          key={skill}
                          style={{
                            padding: '8px 16px',
                            background: token.colorBgContainer,
                            borderRadius: 100,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <Text strong style={{ fontSize: 13 }}>
                            {skill}
                          </Text>
                          <Tag
                            color={val > 70 ? 'success' : val > 40 ? 'warning' : 'error'}
                            style={{ margin: 0, borderRadius: 10 }}
                          >
                            {val}%
                          </Tag>
                        </div>
                      ))}
                    </Flex>
                    {app.ai_summary?.ai_explanation?.radar_breakdown && (
                      <div style={{ marginTop: 16 }}>
                        <Text type="secondary" style={{ fontSize: 13, fontStyle: 'italic' }}>
                          * {app.ai_summary.ai_explanation.radar_breakdown}
                        </Text>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </Card>
        ) : (
           <Card
            title={
              <Space>
                <DashboardOutlined style={{ color: token.colorTextQuaternary }} />
                <span>AI CV Analysis Result</span>
              </Space>
            }
            variant="borderless"
            style={{
              borderRadius: token.borderRadiusLG * 1.25,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainerDisabled,
            }}
          >
            <Result
              icon={<DashboardOutlined style={{ fontSize: 48, color: token.colorTextQuaternary }} />}
              title="CV chưa được phân tích"
              subTitle="Ứng viên này chưa được hệ thống tự động chấm điểm CV. Có thể do ứng tuyển trước khi tính năng được kích hoạt."
            />
          </Card>
        )}

        {/* AI Interview Section */}
        {(interview || interviewLoading) && (
          <Card
            title={
              <Space>
                <DashboardOutlined style={{ color: token.colorWarning }} />
                <span>AI Interview Evaluation</span>
              </Space>
            }
            variant="borderless"
            style={{
              borderRadius: token.borderRadiusLG * 1.25,
              border: `1px solid ${token.colorWarningBorder}`,
              background: `color-mix(in srgb, ${token.colorWarningBg} 20%, transparent)`,
            }}
          >
            {interviewLoading ? (
              <Flex justify="center" align="center" style={{ minHeight: 150 }}>
                <Spin />
              </Flex>
            ) : interview ? (
              interview.status?.toUpperCase() === 'PROCESSING' ? (
                <Flex justify="center" align="center" vertical gap={16} style={{ minHeight: 150, padding: 24 }}>
                  <Spin size="large" />
                  <Text type="secondary" style={{ fontSize: 16 }}>AI đang phân tích video, vui lòng quay lại sau vài phút</Text>
                </Flex>
              ) : (
                <Flex vertical gap={24}>
                  <Flex gap={24} wrap>
                    <div style={{ flex: '0 0 120px', textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      percent={interview.interview_score}
                      size={100}
                      strokeColor={{
                        '0%': token.colorError,
                        '50%': token.colorWarning,
                        '100%': token.colorSuccess,
                      }}
                      format={(p) => (
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                          <span style={{ fontSize: 24, fontWeight: 800, color: token.colorText }}>
                            {p}
                          </span>
                          <span style={{ fontSize: 10, color: token.colorTextSecondary }}>SCORE</span>
                        </div>
                      )}
                    />
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 250 }}>
                    <SkillsRadarChart skillsRadar={interviewRadar} accentColor={token.colorWarning} />
                  </div>
                </Flex>

                {interview.environment_note && (
                  <Alert
                    message="Environment & Professionalism Note"
                    description={interview.environment_note}
                    type="info"
                    showIcon
                    style={{ borderRadius: token.borderRadiusLG }}
                  />
                )}

                <Flex gap={16} wrap>
                  <div style={{ flex: 1, minWidth: 300 }}>
                    <Title level={5} style={{ marginTop: 0 }}>
                      Feedback Summary
                    </Title>
                    <div
                      style={{
                        padding: 16,
                        background: token.colorBgContainer,
                        borderRadius: token.borderRadiusLG,
                        border: `1px solid ${token.colorBorderSecondary}`,
                      }}
                    >
                      <Text style={{ display: 'block', marginBottom: 12 }}>
                        {interview.feedback_summary}
                      </Text>
                      
                      {interview.feedback_strengths && (
                        <div style={{ marginBottom: 12 }}>
                          <Text strong type="success">Strengths:</Text>
                          <br />
                          <Text style={{ fontSize: 13 }}>{interview.feedback_strengths}</Text>
                        </div>
                      )}
                      
                      {interview.feedback_weaknesses && (
                        <div>
                          <Text strong type="danger">Areas for Improvement:</Text>
                          <br />
                          <Text style={{ fontSize: 13 }}>{interview.feedback_weaknesses}</Text>
                        </div>
                      )}
                    </div>
                  </div>
                </Flex>

                {interview.video_url && (
                  <div>
                    <Title level={5}>Interview Recording</Title>
                    <div style={{ 
                      borderRadius: token.borderRadiusLG, 
                      overflow: 'hidden',
                      border: `1px solid ${token.colorBorderSecondary}`
                    }}>
                      <video 
                        controls 
                        src={`${appEnv.apiUrl.replace(/\/$/, '')}${interview.video_url?.startsWith('/') ? '' : '/'}${interview.video_url}`} 
                        style={{ width: '100%', display: 'block' }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                )}
              </Flex>
              )
            ) : (
              <Flex justify="center" align="center" style={{ minHeight: 150 }}>
                <Result
                  icon={<DashboardOutlined style={{ fontSize: 48, color: token.colorTextQuaternary }} />}
                  title="No AI Interview Result Yet"
                  subTitle="The candidate has not completed the AI video interview or it is still processing."
                />
              </Flex>
            )}
          </Card>
        )}

        <Card
          variant="borderless"
          style={{
            borderRadius: token.borderRadiusLG * 1.25,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: token.boxShadowTertiary,
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Job Info + Status Control */}
            <Flex align="center" gap={16} wrap>
              {app.jobs.companies.logo_url && (
                <Avatar
                  size={56}
                  src={app.jobs.companies.logo_url}
                  shape="square"
                  style={{
                    borderRadius: token.borderRadiusLG,
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <Title level={4} style={{ margin: 0 }}>
                  {app.jobs.title}
                </Title>
                <Text type="secondary">{app.jobs.companies.name}</Text>
              </div>
              <Flex vertical gap={8} style={{ minWidth: 220 }}>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                  Pipeline status
                </Text>
                <Select
                  value={app.hr_status}
                  onChange={handleStatusChange}
                  loading={updating}
                  disabled={updating}
                  style={{ width: '100%' }}
                  options={HR_STATUS_OPTIONS.map((o) => ({
                    value: o.value,
                    label: (
                      <Tag color={STATUS_COLOR[o.value]} style={{ margin: 0 }}>
                        {o.label}
                      </Tag>
                    ),
                  }))}
                />
              </Flex>
            </Flex>

            {/* Quick action buttons */}
            <Flex gap={8} wrap>
              {['Shortlisted', 'Interviewing', 'Accepted', 'Rejected'].map((s) => (
                <Button
                  key={s}
                  size="small"
                  type={app.hr_status === s ? 'primary' : 'default'}
                  danger={s === 'Rejected'}
                  loading={updating}
                  onClick={() => handleStatusChange(s)}
                  disabled={app.hr_status === s}
                >
                  {s}
                </Button>
              ))}
            </Flex>

            <Descriptions
              column={1}
              size="small"
              labelStyle={{ width: 180, fontWeight: 600, color: token.colorTextSecondary }}
            >
              <Descriptions.Item label="Application ID">
                <Text code>{app.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Job">
                <Link to={`/hr/job/${app.jobs.id}`}>
                  <Text code>{app.jobs.id}</Text>
                </Link>
              </Descriptions.Item>
              <Descriptions.Item label="Applied at">{formatDate(app.applied_at)}</Descriptions.Item>
              <Descriptions.Item label="AI Processing">
                <Tag color={isAnalyzed ? 'success' : 'processing'}>{app.processing_status}</Tag>
              </Descriptions.Item>
              {app.candidates.years_of_experience !== undefined && (
                <Descriptions.Item label="Experience">
                  {app.candidates.years_of_experience} years
                </Descriptions.Item>
              )}
              {app.cover_letter && (
                <Descriptions.Item label="Cover Letter">
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{app.cover_letter}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Flex gap={12} wrap>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                href={app.cv_url}
                target="_blank"
                rel="noreferrer"
              >
                Open / Download CV
              </Button>
              <Tag style={{ margin: 0, alignSelf: 'center' }} color={STATUS_COLOR[app.hr_status]}>
                {app.hr_status}
              </Tag>
            </Flex>
          </Space>
        </Card>
      </Flex>
    </div>
  )
}
