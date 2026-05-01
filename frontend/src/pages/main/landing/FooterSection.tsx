import { appEnv } from '@/config/env'
import { Col, Row, Space, Typography, theme } from 'antd'

const links = ['Privacy Policy', 'Terms of Service', 'Accessibility', 'Contact Support'] as const

export function FooterSection() {
  const { token } = theme.useToken()

  return (
    <footer
      className="landing-footer"
      style={{
        marginTop: 'auto',
        width: '100%',
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorFillQuaternary,
        paddingBlock: 'clamp(2.5rem, 6vw, 3.5rem)',
      }}
    >
      <div className="main-container">
        <Row gutter={[24, 24]} align="middle" justify="space-between" style={{ rowGap: 20 }}>
          <Col xs={24} md={10}>
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              <Typography.Text style={{ fontWeight: 950, fontSize: 16, color: token.colorText }}>
                {appEnv.appName}
              </Typography.Text>
              <Typography.Text style={{ color: token.colorTextSecondary }}>
                © 2024 {appEnv.appName}. Built for the Digital Architect.
              </Typography.Text>
            </Space>
          </Col>

          <Col xs={24} md={14}>
            <Space size={18} wrap style={{ justifyContent: 'flex-end', width: '100%' }}>
              {links.map((label) => (
                <Typography.Link
                  key={label}
                  href="#"
                  style={{ color: token.colorTextSecondary, fontWeight: 650 }}
                >
                  {label}
                </Typography.Link>
              ))}
            </Space>
          </Col>
        </Row>
      </div>
    </footer>
  )
}
