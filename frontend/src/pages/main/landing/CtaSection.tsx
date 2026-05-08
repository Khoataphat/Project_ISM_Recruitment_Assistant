import { Button, Card, Space, Typography } from 'antd'
import { useNavigate } from 'react-router'

export function CtaSection() {
  const navigate = useNavigate()
  return (
    <section className="main-section main-cta">
      <div>
        <Card className="main-ctaCard" variant="borderless">
          <div className="main-ctaBg" aria-hidden />
          <div className="main-ctaInner">
            <Typography.Title level={2} className="main-ctaTitle">
              Ready to blueprint your next move?
            </Typography.Title>
            <Typography.Paragraph className="main-ctaText">
              Join the premier network for architects of the digital age. Your future isn&apos;t a
              destination—it's a structure you build.
            </Typography.Paragraph>
            <Space size={12} wrap className="main-ctaActions">
              <Button size="large" onClick={() => navigate('/candidate/jobs')}>
                Find Opportunities
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </section>
  )
}
