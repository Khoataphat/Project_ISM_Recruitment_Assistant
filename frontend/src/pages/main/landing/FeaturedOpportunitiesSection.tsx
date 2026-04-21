import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router'

export function FeaturedOpportunitiesSection() {  
  const navigate = useNavigate()
  return (
    <section className="main-section main-featured">
      <div className="main-container">
        <Row justify="space-between" align="bottom" gutter={[16, 16]} className="main-sectionHead">
          <Col>
            <Typography.Title level={2} className="main-h2">
              Featured Opportunities
            </Typography.Title>
            <Typography.Paragraph className="main-muted">
              The most high-impact roles currently curated within our architect network.
            </Typography.Paragraph>
          </Col>
          <Col>
            <Button type="link" className="main-linkBtn" onClick={() => navigate('/candidate/jobs')}>
              Explore All 2,410 Roles <ArrowRightOutlined />
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Card className="main-card main-cardPrimary" variant="borderless" style={{height: '100%'}}>
              <Space orientation="vertical" size={14} style={{ width: '100%' }}>
                <Row justify="space-between" align="top">
                  <Col>
                    <Tag color="blue">Premium</Tag>
                  </Col>
                </Row>

                <Typography.Title level={3} style={{ margin: 0 }}>
                  Senior Systems Architect
                </Typography.Title>

                <Typography.Paragraph className="main-muted" style={{ marginBottom: 0 }}>
                  Lead the transformation of enterprise infrastructure for a Fortune 500 digital
                  services provider. Hybrid role with significant equity.
                </Typography.Paragraph>

                <Space wrap>
                  <Tag> $180k - $240k</Tag>
                  <Tag>London / Remote</Tag>
                  <Tag>Cloud Infrastructure</Tag>
                </Space>

                <Button size="large" type="default" className="main-applyBtn">
                  Apply Instantly
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card className="main-card" variant="borderless">
                  <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                      UI Design Director
                    </Typography.Title>
                    <Typography.Paragraph className="main-muted" style={{ marginBottom: 0 }}>
                      Defining the visual language for the next generation of fintech platforms.
                    </Typography.Paragraph>
                    <Typography.Text className="main-miniCaps">Posted 2 hours ago</Typography.Text>
                    <Button block>View Details</Button>
                  </Space>
                </Card>
              </Col>

              <Col xs={24}>
                <Card className="main-card" variant="borderless">
                  <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                      Lead DevSecOps
                    </Typography.Title>
                    <Typography.Paragraph className="main-muted" style={{ marginBottom: 0 }}>
                      Integrating security at the core of high-frequency trading systems.
                    </Typography.Paragraph>
                    <Typography.Text className="main-miniCaps">Global Remote</Typography.Text>
                    <Button block>View Details</Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </section>
  )
}

