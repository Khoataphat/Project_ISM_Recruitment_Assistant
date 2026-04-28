import { ArrowRightOutlined, BankOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { Button, Card, Col, Flex, Row, Space, Tag, Typography, theme } from 'antd'

const jobs = [
  {
    match: '99% MATCH',
    title: 'Senior Software Architect',
    company: 'Google Cloud',
    location: 'Zurich, CH',
    salary: '$140k - $210k',
    logoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBUTZI3gMW5D-LISUX_-I9sRbbjVm59LVMB6PuW98QGAg67Gp1AlWKTxdf-ZhOsA6T5xzuyHMa783cZY5NZKQKR3iqdEN8ahJ0TNEm3cYsSqyfIszMhsH4NVBb2cKD1qj1fsKc1sVQNoCNNMrzWSUP3pUPN78on8Vv0N5s-h2FpaePy3iY5EPOT7XzN2ruIrTqKSTDji7fO62uiFBDI7rH__5p6E9ApDI1Q4u3SSGhfF_FF_lqRU2BM1xinWyvKRkjBSbUejrUWcQ',
  },
  {
    match: '95% MATCH',
    title: 'Staff Product Designer',
    company: 'Stripe',
    location: 'Remote',
    salary: '$160k - $240k',
    logoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBn6V1g8BgllaTFMyyRaDSMxcr5yuLD8U7sytfXVF0sNqA7Ayntxd_zkxnfgTQ6Nfr2Z3QaewiQnK9UxZh03deyDvIFqAwPOxvXQWsn3xAq1vEyovN4YYkQE5N-mYz6jXL8l_UiZF7KBywur7fy9zRRLWGyoTwRTqmfmTRT2oLCF_uEkQ0SOMw5b3FCQlBhvq9A0jJ1ZYeTdrYatVyPkCRHRgAc_Dsx_yAYV_ILQtI-PpC3apn9N7rHPl_v2rvVZx4qP51lUlgeYQ',
  },
  {
    match: '92% MATCH',
    title: 'Backend Engineer (L5)',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    salary: '$200k - $300k',
    logoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCbf7kCW2Sh9nRAyQAFkB7wr-fSsUWCTh0zfK2PiKAN5hHuXZKkpdUu6OKxGFWqjCu5Sa6mguaot6wbb4gsGmweBAnRpsGGvPGU3dgfCPnPICb_r42zPBK2XmzjQtITKAq1iAQ9HV5IFyl7D7iMjI3287ef9qNNMXpqyLNwPxOYorJk-s7pfnLNPShCn4Kw2lSB5UxpYqwVlBFpcig15AM4PCLvCa6-m3b_eLQ7qr6WM2Aek8BGB3rtrdkKKTl7sxwz9bsKtf6CCw',
  },
] as const

export function LatestJobsSection() {
  const { token } = theme.useToken()

  return (
    <section
      className="landing-latest"
      style={{
        paddingBlock: 96,
        background: token.colorBgLayout,
      }}
    >
      <div className="main-container">
        <Flex
          gap={24}
          wrap="wrap"
          align="flex-end"
          justify="space-between"
          style={{ marginBottom: 48 }}
        >
          <div style={{ maxWidth: 720 }}>
            <Typography.Title
              level={2}
              style={{
                marginTop: 0,
                marginBottom: 12,
                fontWeight: 950,
                letterSpacing: '-0.03em',
              }}
            >
              Latest job openings
            </Typography.Title>
            <Typography.Paragraph style={{ marginBottom: 0, color: token.colorTextSecondary }}>
              Discover your next opportunity from our curated list of high-impact roles at top-tier
              technology companies.
            </Typography.Paragraph>
          </div>

          <Button
            type="link"
            className="landing-browseLink"
            style={{ fontWeight: 900, paddingInline: 0 }}
            icon={null}
          >
            Browse all positions <ArrowRightOutlined />
          </Button>
        </Flex>

        <Row gutter={[16, 16]}>
          {jobs.map((job) => (
            <Col key={job.title} xs={24} md={12} lg={8}>
              <Card
                className="landing-jobCard shadow-soft-blue-hover"
                style={{
                  borderRadius: token.borderRadiusLG,
                  borderColor: token.colorBorderSecondary,
                  background: token.colorBgContainer,
                }}
                styles={{ body: { padding: 24 } }}
              >
                <Flex justify="space-between" align="flex-start" style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: token.borderRadiusLG,
                      background: token.colorFillQuaternary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 10,
                    }}
                  >
                    <img
                      src={job.logoUrl}
                      alt={`${job.company} Logo`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      loading="lazy"
                    />
                  </div>

                  <Tag
                    style={{
                      border: 0,
                      borderRadius: 8,
                      background: token.colorPrimaryBg,
                      color: token.colorPrimary,
                      fontSize: 10,
                      fontWeight: 950,
                      letterSpacing: '0.12em',
                      padding: '4px 8px',
                    }}
                  >
                    {job.match}
                  </Tag>
                </Flex>

                <Typography.Title
                  level={4}
                  className="landing-jobTitle"
                  style={{ marginTop: 0, marginBottom: 10, fontWeight: 900 }}
                >
                  {job.title}
                </Typography.Title>

                <Space size={16} style={{ color: token.colorTextSecondary, marginBottom: 18 }}>
                  <Space size={6}>
                    <BankOutlined />
                    <span>{job.company}</span>
                  </Space>
                  <Space size={6}>
                    <EnvironmentOutlined />
                    <span>{job.location}</span>
                  </Space>
                </Space>

                <Flex
                  justify="space-between"
                  align="center"
                  style={{
                    paddingTop: 18,
                    borderTop: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <Typography.Text style={{ fontWeight: 900 }}>
                    {job.salary}{' '}
                    <span style={{ fontSize: 12, fontWeight: 500, color: token.colorTextTertiary }}>
                      / yr
                    </span>
                  </Typography.Text>

                  <Button type="link" className="landing-viewDetailBtn" style={{ fontWeight: 900 }}>
                    View Detail
                  </Button>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  )
}
