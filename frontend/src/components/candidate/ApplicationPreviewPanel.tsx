import { BankOutlined, FilePdfOutlined } from '@ant-design/icons'
import { Button, Empty, Flex, Image, Tag, Typography, theme } from 'antd'
import { Link } from 'react-router-dom'

import { SkillsRadarChart } from '@/components/candidate/SkillsRadarChart'
import { parseSkillsRadar } from '@/components/candidate/skillsRadar'
import type { CandidateApplication } from '@/services/applicationsService'

const { Title, Text, Paragraph } = Typography

function getJobThematicImage(job: any) {
  if (!job) return ''
  const seed = (job.id || '1').split('-').pop() || '1'
  return `https://loremflickr.com/400/400/business,office,technology?random=${seed}`
}

const HR_STATUS_COLOR: Record<string, string> = {
  Pending: 'gold',
  Shortlisted: 'blue',
  Interviewing: 'processing',
  Offered: 'orange',
  Accepted: 'success',
  Rejected: 'error',
}

const PROCESSING_STATUS_COLOR: Record<string, string> = {
  Pending: 'cyan',
  Processing: 'processing',
  Analyzed: 'success',
  Failed: 'error',
}

function tagColor(map: Record<string, string>, status: string | undefined): string {
  const raw = (status ?? '').trim()
  if (!raw) return 'geekblue'
  if (map[raw]) return map[raw]
  const pascal = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  return map[pascal] ?? 'geekblue'
}

function formatAppliedDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function formatAiScore(v: string | number | null | undefined): string | null {
  if (v === '' || v == null) return null
  const n = typeof v === 'string' ? Number.parseFloat(v) : v
  if (!Number.isFinite(n)) return null
  return `${Math.round(n * 10) / 10}%`
}

type ApplicationPreviewPanelProps = {
  application: CandidateApplication
}

export function ApplicationPreviewPanel({ application }: ApplicationPreviewPanelProps) {
  const { token } = theme.useToken()
  const job = application.jobs
  const aiLine = formatAiScore(application.ai_matching_score)
  const hasRadar = parseSkillsRadar(application.skills_radar).length >= 3

  return (
    <div className="candidate-appPreviewPanel">
      <div className="candidate-appPreviewPanel-header">
        <div
          className="candidate-appPreviewPanel-logo"
          style={{ background: token.colorFillQuaternary }}
        >
          <Image
            src={getJobThematicImage(job)}
            alt={`${job?.companies?.name ?? 'Company'} logo`}
            preview={false}
            width="100%"
            height="100%"
            style={{ objectFit: 'cover', borderRadius: 8 }}
          />
        </div>
        <div className="candidate-appPreviewPanel-meta">
          <Title
            level={3}
            className="candidate-jobPreviewTitle candidate-appPreviewPanel-title"
            style={{ margin: 0, marginBottom: 8 }}
          >
            {job.title}
          </Title>
          <Flex vertical gap={6} style={{ marginBottom: 10 }}>
            <Flex gap={8} align="center" wrap>
              <BankOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />
              <Text style={{ fontWeight: 700, color: token.colorText }}>
                {job.companies?.name ?? '—'}
              </Text>
            </Flex>
            <Text type="secondary" style={{ fontWeight: 600, fontSize: 13 }}>
              {job.status ?? '—'}
              <span style={{ margin: '0 8px', opacity: 0.45 }} aria-hidden>
                ·
              </span>
              Applied {formatAppliedDate(application.applied_at)}
            </Text>
          </Flex>
          <Flex wrap gap={8} className="candidate-jobPills">
            <Tag
              bordered={false}
              color={tagColor(HR_STATUS_COLOR, application.hr_status)}
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 12,
                padding: '4px 12px',
                borderRadius: 999,
              }}
            >
              HR: {application.hr_status}
            </Tag>
            <Tag
              bordered={false}
              color={tagColor(PROCESSING_STATUS_COLOR, application.processing_status)}
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 12,
                padding: '4px 12px',
                borderRadius: 999,
              }}
            >
              Processing: {application.processing_status}
            </Tag>
          </Flex>
        </div>
      </div>

      <div className="candidate-appPreviewPanel-content">
        {aiLine ? (
          <div className="candidate-appPreviewScore">
            <Text strong style={{ color: token.colorPrimary }}>
              AI match score: {aiLine}
            </Text>
          </div>
        ) : null}

        <div className="candidate-appPreviewRadarSection" style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: 13, display: 'block', color: token.colorText }}>
              Phân tích độ khớp kỹ năng
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Độ khớp CV của bạn so với công việc này được hệ thống AI tính toán dựa trên yêu cầu cụ thể của vị trí.
            </Text>
          </div>
          {hasRadar ? (
            <SkillsRadarChart skillsRadar={application.skills_radar} />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: token.colorTextSecondary }}>
                  Skills radar will appear after your application is analyzed.
                </span>
              }
            />
          )}
        </div>

        {application.cover_letter?.trim() ? (
          <Paragraph
            type="secondary"
            ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
            style={{ marginBottom: 16 }}
            className="candidate-appPreviewCover"
          >
            {application.cover_letter.trim()}
          </Paragraph>
        ) : null}

        <Flex gap={10} wrap style={{ marginTop: 'auto' }}>
          <Button
            className="candidate-jobPreviewSecondaryBtn"
            icon={<FilePdfOutlined />}
            href={application.cv_url}
            target="_blank"
            rel="noreferrer"
            style={{ flex: '1 1 auto' }}
          >
            Open CV
          </Button>
          <Link to={`/candidate/job/${job.id}`} style={{ flex: '1 1 auto' }}>
            <Button type="primary" block className="candidate-applyNowBtn">
              View job details
            </Button>
          </Link>
        </Flex>
      </div>
    </div>
  )
}
