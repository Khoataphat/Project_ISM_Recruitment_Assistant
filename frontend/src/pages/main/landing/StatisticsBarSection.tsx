import { Col, Row, Typography, theme } from 'antd'

const stats = [
  { value: '10k+', label: 'Active Jobs' },
  { value: '500+', label: 'Top Companies' },
  { value: '24h', label: 'Avg Response' },
  { value: '92%', label: 'Success Rate' },
] as const

export function StatisticsBarSection() {
  const { token } = theme.useToken()

  const bg = token.colorText // dark-ish in light theme; acts as inverse surface

  return (
    <section
      className="landing-stats"
      style={{
        background: bg,
        paddingBlock: 48,
      }}
    >
      <div className="main-container">
        <Row gutter={[24, 24]}>
          {stats.map((s) => (
            <Col key={s.label} xs={12} md={6}>
              <div style={{ textAlign: 'left' }}>
                <Typography.Text
                  style={{
                    display: 'block',
                    fontSize: 32,
                    fontWeight: 950,
                    letterSpacing: '-0.02em',
                    color: token.colorTextLightSolid,
                    lineHeight: 1.1,
                    marginBottom: 4,
                  }}
                >
                  {s.value}
                </Typography.Text>
                <Typography.Text
                  style={{
                    color: 'rgba(255,255,255,0.72)',
                    fontSize: 13,
                    fontWeight: 650,
                  }}
                >
                  {s.label}
                </Typography.Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  )
}
