import { Col, Row, Space, Typography } from 'antd'

const companies = ['NOVA', 'EQUITY', 'STREAM', 'Aura', 'CYPHER', 'KINETIC']

export function CompanyMarqueeSection() {
  return (
    <section className="main-section main-marquee">
      <div className="main-container">
        <Row justify="center">
          <Col>
            <Typography.Text className="main-miniCaps main-center">
              Trusted by the Digital Elite
            </Typography.Text>
          </Col>
        </Row>

        <div style={{ marginTop: 24 }}>
          <Space size={36} wrap className="main-marqueeRow" style={{justifyContent: 'center', display: 'flex'}}>
            {companies.map((c) => (
              <Typography.Text key={c} className="main-company">
                {c}
              </Typography.Text>
            ))}
          </Space>
        </div>
      </div>
    </section>
  )
}

