import { Col, Layout, Row, Space, theme, Typography } from 'antd'
import { appEnv } from '@/config/env'

export function MainFooter() {
  const { token } = theme.useToken()

  return (
    <Layout.Footer
      style={{
        background: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        padding: `${token.paddingXL}px 0`,
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
              {appEnv.appName}
            </Typography.Title>
            <Typography.Paragraph style={{ marginBottom: 0, color: token.colorTextSecondary }}>
              The high-end platform for professional architects of the digital future. Precision
              hiring meets editorial authority.
            </Typography.Paragraph>
          </Col>

          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space size={18} wrap>
              <Typography.Link style={{ fontWeight: 600, color: token.colorTextSecondary }}>
                Privacy Policy
              </Typography.Link>
              <Typography.Link style={{ fontWeight: 600, color: token.colorTextSecondary }}>
                Terms of Service
              </Typography.Link>
              <Typography.Link style={{ fontWeight: 600, color: token.colorTextSecondary }}>
                Cookie Settings
              </Typography.Link>
              <Typography.Link style={{ fontWeight: 600, color: token.colorTextSecondary }}>
                Contact Support
              </Typography.Link>
            </Space>
            <div style={{ marginTop: 16 }}>
              <Typography.Text style={{ color: token.colorTextTertiary }}>
                © 2024 {appEnv.appName}. Designed for the Digital Architect.
              </Typography.Text>
            </div>
          </Col>
        </Row>
      </div>
    </Layout.Footer>
  )
}

