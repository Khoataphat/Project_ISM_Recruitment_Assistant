import { Tag, Typography } from 'antd'
import { Link, Outlet } from 'react-router-dom'
import BackgroundImage from '@/assets/images/auth-layout-background.png'
import { appEnv } from '@/config/env'

export function AuthLayout() {
  return (
    <main className="auth-shell">
      {/* Left Column: Branding */}
      <section className="auth-left" aria-hidden>
        <div className="auth-leftBg" style={{ backgroundImage: `url(${BackgroundImage})` }} />
        <div className="auth-leftOverlay" />

        <Link className="auth-logoAnchor" to="/">
          {appEnv.appName}
        </Link>

        <div className="auth-leftContent">
          <Tag color="blue" variant="outlined" style={{ fontWeight: 700, letterSpacing: '0.14em' }}>
            ENTERPRISE EDITION
          </Tag>

          <Typography.Title
            level={1}
            style={{
              marginTop: 18,
              marginBottom: 12,
              color: 'rgba(255,255,255,0.92)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              fontSize: 56,
            }}
          >
            Architecting <br />
            the future of talent.
          </Typography.Title>

          <Typography.Paragraph
            style={{
              marginBottom: 0,
              color: 'rgba(255,255,255,0.72)',
              fontSize: 16,
              maxWidth: 520,
            }}
          >
            Join a world-class hiring ecosystem built for scale, precision, and impact.
            <br />
            We connect exceptional professionals with high-performing organizations through a
            platform engineered for strategic placement.
            <br />
            Join the digital architect of careers today.
          </Typography.Paragraph>
        </div>
      </section>

      {/* Right Column: Auth Content */}
      <section className="auth-right">
        <div className="auth-rightInner">
          <Link className="auth-mobileBrand" to="/">
            {appEnv.appName}
          </Link>
          <Outlet />
        </div>
      </section>
    </main>
  )
}
