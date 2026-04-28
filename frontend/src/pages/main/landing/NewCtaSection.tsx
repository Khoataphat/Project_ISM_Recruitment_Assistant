import { Button, Card, Col, Row, Space, Typography, theme } from 'antd'
import { useNavigate } from 'react-router-dom'

const ctaImageUrl =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDxsb6BpvzKoWMl7lGUvTxZuoAJByWSf6itP5V_SdBkbVnx4Akpg4gYFWCJ4wIVttTFLzEHyh8S1ikCm8XixNLid0js0H8pn-7b10wzRM2V9ULDbyJSU7Zpz1f9s-EW6ZtBv1WcNxNxX9CeWvRsb4XR0ZP4DPGNJ9t6T_oNTZ7Zm_NxyooThAUAsPHZH5JYKSAqf2zCM85S_rnnYuIsAVFbn96_XsaUqL-mR2mQoZyAy4YKJktIjUUIhUlMNb-JeaTYzsbs-lS3ng'

export function NewCtaSection() {
  const navigate = useNavigate()
  const { token } = theme.useToken()

  return (
    <section style={{ paddingBlock: 96, background: token.colorBgLayout }}>
      <div className="main-container">
        <Card
          className="landing-ctaCard"
          style={{
            borderRadius: 28,
            overflow: 'hidden',
            border: 0,
            background: `color-mix(in srgb, ${token.colorPrimary} 55%, black 45%)`,
            boxShadow: `0 28px 70px ${token.colorPrimaryBg}`,
          }}
          styles={{ body: { padding: 0 } }}
        >
          <Row gutter={0} style={{ minHeight: 420 }}>
            <Col xs={24} lg={12}>
              <div style={{ padding: 56, position: 'relative', zIndex: 1 }}>
                <Typography.Title
                  level={2}
                  style={{
                    marginTop: 0,
                    marginBottom: 16,
                    color: token.colorTextLightSolid,
                    fontWeight: 950,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                  }}
                >
                  Get the first look at unlisted roles
                </Typography.Title>

                <Typography.Paragraph
                  style={{
                    marginBottom: 28,
                    color: 'rgba(255,255,255,0.86)',
                    fontSize: 16,
                    maxWidth: 520,
                  }}
                >
                  Join our exclusive network and receive weekly AI-curated job alerts tailored
                  precisely to your tech stack and career goals.
                </Typography.Paragraph>

                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  <Button
                    type="default"
                    style={{
                      border: 0,
                      borderRadius: 14,
                      fontWeight: 900,
                      paddingInline: 18,
                      color: token.colorPrimary,
                      background: token.colorTextLightSolid,
                    }}
                    onClick={() => {
                      navigate('/candidate/jobs')
                    }}
                  >
                    Subscribe Now
                  </Button>

                  <Typography.Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12 }}>
                    No spam. Only high-impact opportunities. Unsubscribe at any time.
                  </Typography.Text>
                </Space>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div
                className="landing-ctaMedia"
                style={{
                  position: 'relative',
                  minHeight: 360,
                  height: '100%',
                  width: '100%',
                }}
              >
                <img
                  src={ctaImageUrl}
                  alt="Team collaborating"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  loading="lazy"
                />
                <div className="landing-ctaMediaOverlay" aria-hidden />
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </section>
  )
}
