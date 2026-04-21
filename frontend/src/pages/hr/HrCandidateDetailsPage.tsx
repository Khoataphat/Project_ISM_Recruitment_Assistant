import { ArrowLeftOutlined, FilePdfOutlined } from '@ant-design/icons'
import {
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Flex,
  Image,
  Result,
  Select,
  Space,
  Tag,
  Typography,
  message,
  theme,
} from 'antd'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import type { ApplicationStatus } from '@/lib/candidateApplicationsStorage'
import { getJobApplicationById, updateJobApplicationStatus } from '@/lib/candidateApplicationsStorage'

const { Title, Text } = Typography

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  interviewing: 'Interviewing',
  under_review: 'Under review',
  closed: 'Closed',
}

function formatAppliedDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function HrCandidateDetailsPage() {
  const { id } = useParams()
  const { token } = theme.useToken()
  const [version, setVersion] = useState(0)

  const app = useMemo(() => {
    void version
    return getJobApplicationById(id)
  }, [id, version])

  if (!app) {
    return (
      <Result
        status="404"
        title="Application not found"
        subTitle="This application id is invalid or was removed."
        extra={
          <Link to="/hr/candidates">
            <Button type="primary">Back to candidates</Button>
          </Link>
        }
      />
    )
  }

  const handleStatusChange = (next: ApplicationStatus) => {
    const updated = updateJobApplicationStatus(app.id, next)
    if (updated) {
      message.success('Status updated')
      setVersion((v) => v + 1)
    } else {
      message.error('Could not update status')
    }
  }

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
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
              {app.applicantDisplayName ?? 'Candidate'}
            </Title>
            <Text type="secondary">{app.applicantEmail ?? '—'}</Text>
          </div>
          <Link to="/hr/candidates">
            <Button icon={<ArrowLeftOutlined />}>Back to list</Button>
          </Link>
        </Flex>

        <Card
          variant="borderless"
          style={{
            borderRadius: token.borderRadiusLG * 1.25,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: token.boxShadowTertiary,
          }}
        >
          <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <Flex align="center" gap={16} wrap>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: token.borderRadiusLG,
                  background: token.colorFillAlter,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8,
                }}
              >
                <Image src={app.logoUrl} alt="" preview={false} style={{ width: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Title level={4} style={{ margin: 0 }}>
                  {app.jobTitle}
                </Title>
                <Text type="secondary">{app.company}</Text>
              </div>
              <Flex vertical gap={8} style={{ minWidth: 220 }}>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                  Pipeline status
                </Text>
                <Select<ApplicationStatus>
                  value={app.status}
                  onChange={handleStatusChange}
                  style={{ width: '100%' }}
                  options={(Object.keys(STATUS_LABEL) as ApplicationStatus[]).map((k) => ({
                    value: k,
                    label: STATUS_LABEL[k],
                  }))}
                />
              </Flex>
            </Flex>

            <Descriptions
              column={1}
              size="small"
              labelStyle={{ width: 160, fontWeight: 600, color: token.colorTextSecondary }}
            >
              <Descriptions.Item label="Application ID">
                <Text code>{app.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Job ID">
                <Link to={`/hr/job/${app.jobId}`}>
                  <Text code>{app.jobId}</Text>
                </Link>
              </Descriptions.Item>
              <Descriptions.Item label="Applied at">{formatAppliedDate(app.appliedAt)}</Descriptions.Item>
              <Descriptions.Item label="Resume file">{app.resumeFileName}</Descriptions.Item>
            </Descriptions>

            <Flex gap={12} wrap>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                href={app.resumeDataUrl}
                download={app.resumeFileName}
                target="_blank"
                rel="noreferrer"
              >
                Open / download CV
              </Button>
              <Tag style={{ margin: 0, alignSelf: 'center' }}>{STATUS_LABEL[app.status]}</Tag>
            </Flex>
          </Space>
        </Card>
      </Flex>
    </div>
  )
}
