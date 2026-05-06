import { BulbOutlined, CheckCircleFilled, LoadingOutlined } from '@ant-design/icons'
import { Alert, Steps, Typography, theme } from 'antd'
import type { CandidateApplication } from '@/services/applicationsService'

const { Text } = Typography

export type ApplicationJourneyTrackerProps = {
  application: CandidateApplication
  direction?: 'horizontal' | 'vertical'
}

export function ApplicationJourneyTracker({
  application,
  direction = 'vertical',
}: ApplicationJourneyTrackerProps) {
  const { token } = theme.useToken()

  const formatAppliedDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
      }).format(new Date(iso))
    } catch {
      return iso
    }
  }

  const score = application.ai_matching_score != null ? Number(application.ai_matching_score) : null
  
  const getStepStatus = (index: number) => {
    // Step 1: CV Submitted
    if (index === 0) return 'finish'
    
    // Step 2: AI Evaluated
    if (index === 1) {
      if (score === null) return 'wait'
      // User requested to still show 'finish' (checkmark) but visually distinguish low score
      return 'finish'
    }
    
    // Step 3: HR Reviewed
    if (index === 2) {
      // If AI failed or is waiting, HR won't have reviewed usually, but follow the data
      return application.viewed_by_hr_at ? 'finish' : 'wait'
    }
    
    // Step 4: Final Result
    if (index === 3) {
      if (application.hr_status === 'Rejected') return 'error'
      if (['Interviewing', 'Offered', 'Accepted'].includes(application.hr_status)) return 'finish'
      return 'wait'
    }
    return 'wait'
  }

  const items = [
    {
      title: <Text strong style={{ fontSize: 13 }}>CV Submitted</Text>,
      description: (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Received on {formatAppliedDate(application.applied_at)}
        </Text>
      ),
    },
    {
      title: <Text strong style={{ fontSize: 13 }}>AI Evaluated</Text>,
      icon: score != null && score < 50 ? <CheckCircleFilled style={{ color: '#faad14' }} /> : undefined,
      description: score != null ? (
        <Text 
          style={{ 
            fontSize: 12, 
            color: score >= 50 ? token.colorSuccess : '#faad14' 
          }}
        >
          Score: {Math.round(score)}% {score < 50 && '(Low Match)'}
        </Text>
      ) : (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Analyzing your profile...
        </Text>
      ),
    },
    {
      title: <Text strong style={{ fontSize: 13 }}>HR Reviewed</Text>,
      description: (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {application.viewed_by_hr_at ? 'HR has viewed your CV' : 'Awaiting HR review'}
        </Text>
      ),
    },
    {
      title: <Text strong style={{ fontSize: 13 }}>Final Result</Text>,
      description: application.hr_status === 'Rejected' ? (
        <Text type="danger" style={{ fontSize: 12 }}>
          Not selected for this role
        </Text>
      ) : ['Interviewing', 'Offered', 'Accepted'].includes(application.hr_status) ? (
        <Text type="success" style={{ fontSize: 12 }}>
          Moving to {application.hr_status} phase
        </Text>
      ) : (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Decision pending
        </Text>
      ),
    },
  ]

  return (
    <div
      style={{
        background:
          direction === 'vertical'
            ? `linear-gradient(to bottom right, ${token.colorFillQuaternary}, transparent)`
            : 'transparent',
        padding: direction === 'vertical' ? '20px 16px' : '0',
        borderRadius: token.borderRadiusLG,
        border: direction === 'vertical' ? `1px solid ${token.colorBorderSecondary}` : 'none',
        margin: direction === 'vertical' ? '16px 0' : '8px 0 0',
      }}
    >
      {direction === 'vertical' && (
        <Text
          strong
          style={{
            display: 'block',
            marginBottom: 20,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: token.colorTextSecondary,
          }}
        >
          Application Journey
        </Text>
      )}
      <Steps
        direction={direction}
        labelPlacement="vertical"
        size="small"
        items={items.map((item, i) => ({
          ...item,
          status: getStepStatus(i) as any,
        }))}
      />

      {score != null && score < 50 && (
        <div 
          style={{ 
            marginTop: 20, 
            padding: '12px 16px', 
            background: `color-mix(in srgb, ${token.colorWarning} 8%, transparent)`, 
            borderRadius: token.borderRadius,
            borderLeft: `3px solid ${token.colorWarning}`,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start'
          }}
        >
          <BulbOutlined style={{ color: token.colorWarning, fontSize: 18, marginTop: 2 }} />
          <div>
            <Text style={{ fontSize: 13, display: 'block' }}>
              CV của bạn có vẻ không phù hợp với công việc hiện tại, bạn có thể tham khảo thêm các công việc phù hợp sau:
            </Text>
            <Text type="secondary" italic style={{ fontSize: 12 }}>
              (Tính năng gợi ý công việc đang được phát triển)
            </Text>
          </div>
        </div>
      )}
    </div>
  )
}
