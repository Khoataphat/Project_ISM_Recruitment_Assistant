import { Button, Col, Row, Space, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router'

export function HeroSection() {
  const navigate = useNavigate()
  return (
    <section className="main-hero">
      <div className="main-heroBg" aria-hidden />
      <div style={{ width: '75%', margin: '0 auto' }}>
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} lg={14}>
            <Tag color="blue" className="main-heroBadge">
              FUTURE-PROOF YOUR CAREER
            </Tag>

            <Typography.Title level={1} className="main-heroTitle">
              Architect Your <br /> <span className="main-heroAccent">Career Future</span>
            </Typography.Title>

            <Typography.Paragraph className="main-heroSubtitle">
              Where precision engineering meets professional growth. Discover curated opportunities
              at the intersection of innovation and editorial excellence.
            </Typography.Paragraph>

            <Row gutter={[12, 12]}>
              <Col md={8}>
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => navigate('/candidate/jobs')}
                >
                  Find My Future
                </Button>
              </Col>
              <Col md={8}>
                <Button type="default" size="large" block onClick={() => navigate('/hr/jobs')}>
                  Post a Job
                </Button>
              </Col>
            </Row>
          </Col>

          <Col xs={0} lg={10}>
            <div className="main-heroMedia" aria-hidden>
              <div className="main-heroMediaInner" />
              <div className="main-heroMediaOverlay" />
              <div className="main-heroMediaHud">
                <Space size={10}>
                  <div className="main-heroAvatars" aria-hidden>
                    <span />
                    <span />
                    <span />
                  </div>
                  <Typography.Text className="main-heroHudText">
                    Joined by 12,000+ architects
                  </Typography.Text>
                </Space>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  )
}
