import { Col, Row, Typography, theme } from 'antd'

const stats = [
  { value: '10k+', label: 'Active Jobs' },
  { value: '500+', label: 'Top Companies' },
  { value: '24h', label: 'Avg Response' },
  { value: '92%', label: 'Success Rate' },
] as const

export function StatisticsBarSection() {
  const { token } = theme.useToken()

  // Muted slate + subtle primary tint (avoids saturated “neon” strip)
  const bg = `linear-gradient(
    160deg,
    color-mix(in srgb, ${token.colorPrimary} 14%, #2a3140) 0%,
    color-mix(in srgb, ${token.colorPrimary} 7%, #171c26) 100%
  )`

  return (
    <section
      className="landing-stats"
      style={{
        background: bg,
        paddingBlock: 'clamp(2.25rem, 5vw, 3rem)',
      }}
    >
      <div className="main-container">
        <Row gutter={[24, 32]} justify="center">
          {stats.map((s) => (
            <Col key={s.label} xs={12} sm={12} md={6}>
              <div style={{ textAlign: 'center' }}>
                <Typography.Text
                  style={{
                    display: 'block',
                    fontSize: 'clamp(1.5rem, 3vw + 0.75rem, 2rem)',
                    fontWeight: 950,
                    letterSpacing: '-0.02em',
                    color: token.colorTextLightSolid,
                    lineHeight: 1.1,
                    marginBottom: 6,
                  }}
                >
                  {s.value}
                </Typography.Text>
                <Typography.Text
                  style={{
                    color: 'rgba(255,255,255,0.78)',
                    fontSize: 13,
                    fontWeight: 650,
                    letterSpacing: '0.02em',
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
