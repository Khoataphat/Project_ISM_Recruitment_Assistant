import {
  BarChartOutlined,
  BellOutlined,
  CarryOutOutlined,
  FilterOutlined,
  MoreOutlined,
  SearchOutlined,
  UserSwitchOutlined,
  VerticalAlignMiddleOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Card, Flex, Input, Space, Table, Tag, Typography, theme } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'

const HEADER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCYXFOm7nH0MqTlXa6VsUCz_Oq7nuEUQwhNWvrM1qDjkzvzdYTxIO6CCdyecBHI7AYk6CgFABBRO3UoKwmOms_UocbQOS8taYVcurr9vo7n4G6lS281wB375AF3v7GN-DxP-92cksi2e26yeP10Sxpr4nMV_l4LrP3PddjwCRvEiPFSOufMTfbhZ4eYL8rBWaYTOBruc_L_VMbyKoh3W-oBI6migXNsqYmNRF62x_yubNnhfnCW76TcgjK7CBVZlEb2nkHCOZJz3A'

type JobRow = {
  key: string
  id: string
  title: string
  candidateCount: number
  progress: number
  postedAt: string
}

const TOP_JOBS: JobRow[] = [
  {
    key: '1',
    id: '1',
    title: 'Senior Product Designer',
    candidateCount: 124,
    progress: 80,
    postedAt: 'Oct 12, 2023',
  },
  {
    key: '2',
    id: '2',
    title: 'Fullstack Engineer (React)',
    candidateCount: 89,
    progress: 60,
    postedAt: 'Oct 10, 2023',
  },
  {
    key: '3',
    id: '3',
    title: 'Marketing Director',
    candidateCount: 215,
    progress: 100,
    postedAt: 'Oct 08, 2023',
  },
  {
    key: '4',
    id: '4',
    title: 'QA Lead Analyst',
    candidateCount: 45,
    progress: 25,
    postedAt: 'Oct 05, 2023',
  },
  {
    key: '5',
    id: '5',
    title: 'Operations Manager',
    candidateCount: 62,
    progress: 40,
    postedAt: 'Oct 01, 2023',
  },
]

type CandidateRow = {
  key: string
  id: string
  name: string
  source: string
  jobTitle: string
  timeLabel: string
  status: string
   statusTone: 'primary' | 'info' | 'default' | 'muted'
  avatar: string
  avatarAlt: string
}

const TOP_CANDIDATES: CandidateRow[] = [
  {
    key: '1',
    id: '1',
    name: 'Elena Rodriguez',
    source: 'Applied via LinkedIn Referral',
    jobTitle: 'Senior Product Designer',
    timeLabel: '2 Hours Ago',
    status: 'Under Review',
    statusTone: 'info',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDeRN2edUkamkgPZlQufOllQV2cgEq5L9VUBrhcNbbJwd-92wgkOmn_3Kd9WlohFR4KkDJSThJzcsY54JVUVNybSdvvIhUhVFr6meKV9n2TAUaQKI8glRKEaHh-RnXYl3jLokIb81ZSQPYjUkd7A-FfswO0gdVVa5L480SRTMCb_YL7KQkqUZYwvG1xA6MDkz_LGX7SITWG5gKZNxXJpT7r2xzEyELsDG6_a_bn97wcqQ9ZwAys5cd2aVxbEhSnaq4BzWeRWmMn6w',
    avatarAlt: 'close-up portrait of a young professional woman with a bright smile in a modern corporate setting',
  },
  {
    key: '2',
    id: '2',
    name: 'Marcus Chen',
    source: 'Applied via Glassdoor',
    jobTitle: 'Fullstack Engineer',
    timeLabel: '5 Hours Ago',
    status: 'Technical Interview',
    statusTone: 'primary',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBLLITmtezoIegehM5sYoeCiSMzO80Z9Ee27Vek18a5YcTywrD5Typy9DC8rtzcift8-tLeZs2Oa1UkO2SVkD8SBFvzmJRReJslseSIm83LShzOGjdmQfUtEYcPZR3T_oJaJg7rhFKWtYvwI9tEdiDV6lO2-zzhs6YEvVtkWl015eWGJ1xxD2GKi4Vwm1rXGpP83ZnptrRZH_uOndsMcUTD55naM3UdaVEF9VIvLm4gEsbumIBOvnythvwFpY6-TROYhZiBvXQeKQ',
    avatarAlt: 'professional portrait of a man in a crisp white shirt with sophisticated neutral background lighting',
  },
  {
    key: '3',
    id: '3',
    name: 'Sarah Jenkins',
    source: 'Internal Referral',
    jobTitle: 'Marketing Director',
    timeLabel: 'Yesterday',
    status: 'Interviewing',
    statusTone: 'default',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAsOTaVFzfmRLAFGD-hmN8Q9yzfX4NfOh2qYGcGVEbrh-E1F6BOs6mLgbC_JiHIYA1KgjAYpGfK82FK0DfR99xdxgKmdssIShhOfq5zUPCEjSd51T2iHvflaQmd9AiiK7eYAIG7BCkm3vDceNhY42rJZ3e3dv8T9U4Gcuvf_-QWeRNzHqs9y37aLzoTNlxfVPEEho_DF3mwFk6eXGKn80rf3od6pmzxMmpGvCmiA9PqDovA6BqpYl_wdJGEcEJcUca-YSe__cEJFA',
    avatarAlt: 'businesswoman in professional attire looking confident against a blurred high-end office background',
  },
  {
    key: '4',
    id: '4',
    name: 'Julian Weber',
    source: 'Direct Application',
    jobTitle: 'QA Lead Analyst',
    timeLabel: '2 Days Ago',
    status: 'New Application',
    statusTone: 'default',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC-rvz7-JwOVBF_zlOlbi7z8vadM2vKapI5-_sP7N08QRTwVw_hZWiDdwtaaHkiFnc41WjG-ITMchAJ9TQ66XqTOUzG_4aI2UswUoUqPyGdo3i_0yvDLt-0RSepSDQ5iPMIuSuLGjZZznatZ7FUU52ZshRUSrF-3zppqgR6pvyDwqk6GBLuDMLtb2h8DyNrPq8ZJavGxTchH0E3b4K5LtF-CNygcgy8xOeQpM4vfm4eYvXyec0ywtRCWxF8me8ExsuvDE0FPyTGyQ',
    avatarAlt: 'cheerful young man in casual office wear with soft natural morning light',
  },
  {
    key: '5',
    id: '5',
    name: 'Maya Patel',
    source: 'Applied via Indeed',
    jobTitle: 'Operations Manager',
    timeLabel: '3 Days Ago',
    status: 'Rejected',
    statusTone: 'muted',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChhPKjAhak4i-FbBeAIcjF-TQb3gnGeKLw_oX7BYKzgkUUZMU2BhNzhu0WvxhgWfS9316dVuEfk_bUdMA3yaPs_SVLqckjGkzRHvXe58TzEICyLAQhvEaF6IFSFXenB8w0y_z5yixTKDenAxuJ5o3Mxvg_XgM6gWhO3C29Vnia5F6qTM6TE1Si0wjU2pbXBtxEiOeK2o0acm2ZrBrIB6kmeXYlHKtygV6Awy6TrDu6zXpyOXsG3m6Wcg4z0c5-fgQ4ptxF-QcBIQ',
    avatarAlt: 'professional female looking at camera with sophisticated lighting in a modern minimal space',
  },
]

const FLOAT_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA5L8tMRZOteVTe_yCzeo24T3uNrWrnxcnxOmf3f81YcYQIant23_K9bEA9sW-6r5YuKC3xajXkV9lyB_ncHzqLeK_xJgoGApDHiqcpjzljWQo_DcZ5cVsKriUrdWk420UWcwqd6fz01ooZbxU6uvM5v7xbhh6npAtArxxjMI--Wb8sQ0nXKCYL3euXSatjgB424aSdQOOan0ujc6VYJzOD1uvLs4OyOC7ARh9mf_y95xbIJocXHf0A9PrxNAp6aqhCxM8MCHGUYA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBfyMUImVDqKDtnOtyLKCQk1KWjAznLWu-MVdEmsvCBhGw-ZvamzUVqgqvSbjRFUI5Vb_dU2tWcIU_2UL4BfIGawr6zGd5WgBD7RdB_5N-1mS7IIe8pSYil896FSHED_aLz1Eja8ZcIkXU3nmwGfMGTcCuJ97kcpoYxFrb7wUaVHMBAdke8uQMqbS3wkAQKhPwviwhYU-845lqgLwuXTkZXsRoNCERRYEvJjfg73cxf-5_mBLLRnkrVeX3q-n5CyVlh2xCBsXj1qw',
]

function statusColor(token: ReturnType<typeof theme.useToken>['token'], tone: CandidateRow['statusTone']) {
  switch (tone) {
    case 'primary':
      return token.colorPrimary
    case 'info':
      return token.colorInfo
    case 'muted':
      return token.colorTextTertiary
    default:
      return token.colorTextSecondary
  }
}

function CandidateProgressBar({
  progress,
  token,
}: {
  progress: number
  token: ReturnType<typeof theme.useToken>['token']
}) {
  const track: CSSProperties = {
    width: 64,
    height: 6,
    borderRadius: token.borderRadiusSM,
    background: token.colorFillSecondary,
    overflow: 'hidden',
  }
  const fill: CSSProperties = {
    width: `${progress}%`,
    height: '100%',
    background: token.colorPrimary,
    borderRadius: token.borderRadiusSM,
 }
  return (
    <div style={track}>
      <div style={fill} />
    </div>
  )
}

export function HrDashboardPage() {
  const { token } = theme.useToken()

  const sectionShell: CSSProperties = {
    background: token.colorFillAlter,
    borderRadius: 32,
    padding: token.paddingXL + token.padding,
    overflow: 'hidden',
  }

  const tableHeaderCell: CSSProperties = {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    borderBottom: 'none',
    background: 'transparent',
    paddingBottom: token.paddingXS,
  }

  const iconBoxPrimary: CSSProperties = {
    padding: token.paddingXS,
    borderRadius: token.borderRadiusLG,
    background: `color-mix(in srgb, ${token.colorPrimary} 14%, transparent)`,
    color: token.colorPrimary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: token.fontSizeLG,
  }

  const iconBoxInfo: CSSProperties = {
    ...iconBoxPrimary,
    background: `color-mix(in srgb, ${token.colorInfo} 14%, transparent)`,
    color: token.colorInfo,
  }

  const jobColumns: ColumnsType<JobRow> = [
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, row) => (
        <Link to={`/hr/job/${row.id}`} style={{ fontWeight: 600, color: token.colorPrimary }}>
          {title}
        </Link>
      ),
    },
    {
           title: (
        <Button
          type="text"
          size="small"
          icon={<VerticalAlignMiddleOutlined />}
          style={{ color: token.colorTextSecondary, fontWeight: 700 }}
        >
          Candidate Count
        </Button>
      ),
      dataIndex: 'candidateCount',
      key: 'count',
      sorter: (a, b) => a.candidateCount - b.candidateCount,
      render: (count: number, row) => (
        <Flex align="center" gap={token.marginSM}>
          <Typography.Text strong>{count}</Typography.Text>
          <CandidateProgressBar progress={row.progress} token={token} />
        </Flex>
      ),
    },
    {
      title: 'Posting Date',
      dataIndex: 'postedAt',
      key: 'postedAt',
      render: (d: string) => (
        <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
          {d}
        </Typography.Text>
      ),
    },
    {
      title: <span style={{ display: 'block', textAlign: 'right' }}>Actions</span>,
      key: 'actions',
      align: 'right',
      render: () => (
        <Button type="text" icon={<MoreOutlined />} style={{ color: token.colorTextTertiary }} aria-label="Row actions" />
      ),
    },
  ]

  const floatBar: CSSProperties = {
    position: 'fixed',
    bottom: token.marginXL,
    right: token.marginXL,
    zIndex: 45,
    padding: token.padding,
    borderRadius: 24,
    background: `color-mix(in srgb, ${token.colorBgContainer} 78%, transparent)`,
    backdropFilter: 'blur(16px)',
    boxShadow: token.boxShadowSecondary,
    border: `1px solid color-mix(in srgb, ${token.colorPrimary} 8%, transparent)`,
  }

  return (
    <div style={{ paddingBottom: token.marginXXL * 2 }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={token.margin} style={{ marginBottom: token.marginXL }}>
        <div>
          <Typography.Title level={2} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.02em', color: token.colorText }}>
            Analytics Overview
          </Typography.Title>
          <Typography.Paragraph style={{ margin: `${token.marginXXS}px 0 0`, color: token.colorTextSecondary, fontSize: token.fontSize }}>
            Real-time recruitment performance metrics.
          </Typography.Paragraph>
        </div>
        <Flex align="center" gap={token.margin} wrap="wrap">
          <Input
            allowClear
            placeholder="Search data..."
            prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
            style={{
              width: 256,
              borderRadius: token.borderRadiusLG,
              background: token.colorBgContainer,
              boxShadow: `0 0 0 1px color-mix(in srgb, ${token.colorBorder} 35%, transparent)`,
            }}
          />
          <Button
            type="default"
            shape="circle"
            icon={<BellOutlined />}
            style={{
              background: token.colorFillTertiary,
              borderColor: 'transparent',
              color: token.colorText,
            }}
            aria-label="Notifications"
          />
          <Avatar size={40} src={HEADER_AVATAR} style={{ border: `2px solid color-mix(in srgb, ${token.colorPrimary} 12%, transparent)` }} />
        </Flex>
      </Flex>

      <Space direction="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <div style={sectionShell}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={token.margin} style={{ marginBottom: token.marginLG }}>
            <Flex align="center" gap={token.marginSM}>
              <div style={iconBoxPrimary}>
                <BarChartOutlined />
              </div>
              <Typography.Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                Top 5 Jobs
              </Typography.Title>
            </Flex>
            <Button size="small" icon={<FilterOutlined />} style={{ fontWeight: 600, borderRadius: token.borderRadiusLG }}>
              Filter
            </Button>
          </Flex>
          <Table<JobRow>
            rowKey="key"
            columns={jobColumns}
            dataSource={TOP_JOBS}
            pagination={false}
            showSorterTooltip={false}
            components={{
              header: {
                cell: (props) => (
                  <th {...props} style={{ ...props.style, ...tableHeaderCell }} />
                ),
              },
              body: {
                row: (props) => (
                  <tr
                    {...props}
                    style={{
                      ...props.style,
                      background: token.colorBgContainer,
                      boxShadow: token.boxShadowTertiary,
                    }}
                  />
                ),
                cell: (props) => (
                  <td
                    {...props}
                    style={{
                      ...props.style,
                      borderBottom: 'none',
                      paddingTop: token.paddingMD,
                      paddingBottom: token.paddingMD,
                    }}
                  />
                ),
              },
            }}
            style={{ background: 'transparent' }}
          />
        </div>

        <div style={sectionShell}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={token.margin} style={{ marginBottom: token.marginLG }}>
            <Flex align="center" gap={token.marginSM}>
              <div style={iconBoxInfo}>
                <UserSwitchOutlined />
              </div>
              <Typography.Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                Top 5 Candidates
              </Typography.Title>
            </Flex>
            <Tag
              style={{
                margin: 0,
                borderRadius: token.borderRadiusLG,
                fontWeight: 700,
                border: 'none',
                background: `color-mix(in srgb, ${token.colorPrimary} 12%, transparent)`,
                color: token.colorPrimary,
              }}
            >
              Recent Activity
            </Tag>
          </Flex>

          <Space direction="vertical" size={token.margin} style={{ width: '100%' }}>
            {TOP_CANDIDATES.map((c) => (
              <Card
                key={c.key}
                bordered={false}
                hoverable
                styles={{ body: { padding: token.paddingLG } }}
                style={{
                  borderRadius: token.borderRadiusLG * 2,
                  background: token.colorBgContainer,
                  transition: `transform ${token.motionDurationMid} ${token.motionEaseInOut}`,
                }}
              >
                <Flex align="center" justify="space-between" gap={token.margin} wrap="wrap">
                  <Flex align="center" gap={token.margin}>
                    <Avatar size={48} src={c.avatar} shape="square" style={{ borderRadius: token.borderRadiusLG }} alt={c.avatarAlt} />
                    <div>
                      <Typography.Text strong style={{ display: 'block', color: token.colorText, fontSize: token.fontSizeLG }}>
                        {c.name}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                        {c.source}
                      </Typography.Text>
                    </div>
                  </Flex>
                  <Flex flex={1} align="center" gap={token.marginXXS} style={{ minWidth: 200 }}>
                    <Typography.Text type="secondary">
                      <CarryOutOutlined />
                    </Typography.Text>
                    <Typography.Text style={{ fontWeight: 500 }}>{c.jobTitle}</Typography.Text>
                    <Button type="link" size="small" icon={<FilterOutlined />} style={{ padding: 0, minWidth: 'auto' }} aria-label="Filter by job" />
                  </Flex>
                  <div style={{ textAlign: 'right' }}>
                    <Typography.Text strong style={{ display: 'block' }}>
                      {c.timeLabel}
                    </Typography.Text>
                    <Typography.Text
                      style={{
                        fontSize: token.fontSizeSM,
                        fontWeight: 600,
                        color: statusColor(token, c.statusTone),
                      }}
                    >
                      {c.status}
                    </Typography.Text>
                  </div>
                </Flex>
              </Card>
            ))}
          </Space>
        </div>
      </Space>

      <div style={floatBar}>
        <Flex align="center" gap={token.margin}>
          <Flex style={{ marginLeft: token.marginXXS }}>
            {FLOAT_AVATARS.map((src, i) => (
              <Avatar
                key={i}
                size={32}
                src={src}
                style={{
                  marginLeft: i === 0 ? 0 : -token.marginXS,
                  border: `2px solid ${token.colorBgContainer}`,
                }}
              />
            ))}
            <Avatar
              size={32}
              style={{
                marginLeft: -token.marginXS,
                background: token.colorPrimary,
                color: token.colorTextLightSolid,
                fontSize: 10,
                fontWeight: 700,
                border: `2px solid ${token.colorBgContainer}`,
              }}
            >
              +42
            </Avatar>
          </Flex>
          <div
            style={{
              width: 1,
              alignSelf: 'stretch',
              minHeight: token.controlHeightSM,
              background: `color-mix(in srgb, ${token.colorBorder} 45%, transparent)`,
            }}
          />
          <Flex align="center" gap={token.marginXS}>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM, fontWeight: 700 }}>
              Active Hirers
            </Typography.Text>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: token.colorSuccess,
                boxShadow: `0 0 0 4px color-mix(in srgb, ${token.colorSuccess} 25%, transparent)`,
              }}
            />
          </Flex>
        </Flex>
      </div>
    </div>
  )
}
