import { Col, Row, Statistic } from 'antd'

const stats = [
  { title: 'Top Companies', value: '500+' },
  { title: 'Global Placements', value: '20k+' },
  { title: 'Success Rate', value: '94%' },
  { title: 'Talent Rating', value: '4.9/5' },
]

export function NetworkStatsSection() {
  return (
    <section className="main-section main-stats">
      <div className="main-container">
        <Row gutter={[24, 24]}>
          {stats.map((s) => (
            <Col key={s.title} xs={12} lg={6}>
              <div className="main-statCard">
                <Statistic title={s.title} value={s.value} />
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  )
}
