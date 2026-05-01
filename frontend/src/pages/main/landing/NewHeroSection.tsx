import { EnvironmentOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Flex, Input, Tag, Typography, theme } from 'antd'
import type { CSSProperties, FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import heroBackground from '../../../assets/images/background-interview.jpg'

const popularSearches = [
  'Product Designer',
  'Frontend Engineer',
  'Data Scientist',
  'DevOps',
] as const

export function NewHeroSection() {
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const [keywordInput, setKeywordInput] = useState('')
  const [locationInput, setLocationInput] = useState('')

  const submitSearch = (e?: FormEvent) => {
    e?.preventDefault()
    const params = new URLSearchParams()
    const kw = keywordInput.trim()
    const loc = locationInput.trim()
    if (kw) params.set('q', kw)
    if (loc) params.set('location', loc)
    const qs = params.toString()
    navigate(qs ? `/candidate/jobs?${qs}` : '/candidate/jobs')
  }

  const cssVars = {
    ['--landing-primary' as keyof CSSProperties]: token.colorPrimary,
    ['--landing-primary-bg' as keyof CSSProperties]: token.colorPrimaryBg,
    ['--landing-bg' as keyof CSSProperties]: token.colorBgLayout,
    ['--landing-card' as keyof CSSProperties]: token.colorBgContainer,
    ['--landing-text' as keyof CSSProperties]: token.colorText,
    ['--landing-text-secondary' as keyof CSSProperties]: token.colorTextSecondary,
    ['--landing-border' as keyof CSSProperties]: token.colorBorderSecondary,
    ['--landing-radius' as keyof CSSProperties]: `${token.borderRadius}px`,
  } satisfies CSSProperties

  return (
    <section
      className="landing-hero landing-hero--section"
      style={{
        ...cssVars,
        position: 'relative',
        overflow: 'hidden',
        background: token.colorBgLayout,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'saturate(1.05) contrast(1.05)',
          opacity: 0.3,
          transform: 'scale(1.02)',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${token.colorBgLayout} 0%, rgba(255,255,255,0.55) 60%, ${token.colorBgLayout} 100%)`,
          zIndex: 0,
        }}
      />

      <div
        className="main-container"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div className="landing-heroStack">
          <Tag
            className="landing-heroBadge"
            style={{
              marginBottom: 24,
              padding: '6px 12px',
              borderRadius: 999,
              border: 0,
              background: token.colorPrimaryBg,
              color: token.colorPrimaryText,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '0.14em',
            }}
          >
            AI-POWERED RECRUITMENT
          </Tag>

          <Typography.Title
            level={1}
            className="landing-heroDisplay"
            style={{
              marginTop: 0,
              marginBottom: 24,
              fontWeight: 950,
              letterSpacing: '-0.04em',
              color: token.colorText,
              textAlign: 'center',
            }}
          >
            Find your dream{' '}
            <span className="landing-heroAccent">
              tech <br />
              career
            </span>{' '}
            with AI Recruit
          </Typography.Title>

          <Typography.Paragraph
            className="landing-heroSubtitle"
            style={{
              color: token.colorTextSecondary,
              marginBottom: 0,
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            We connect exceptional professionals with high-performing organizations through a
            platform engineered for strategic placement.
            <br />
            Join the digital architect of careers today.
          </Typography.Paragraph>

          <form
            className="landing-searchCard shadow-soft-blue"
            onSubmit={submitSearch}
            style={{
              marginTop: 16,
              background: token.colorBgContainer,
              borderRadius: token.borderRadius,
              border: `1px solid ${token.colorBorderSecondary}`,
              padding: 8,
            }}
          >
            <Flex gap={8} wrap="wrap" align="stretch" className="landing-searchRow">
              <Input
                variant="borderless"
                size="large"
                className="landing-searchInput"
                prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
                placeholder="Job title or keywords"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                style={{
                  flex: '1 1 200px',
                  minWidth: 0,
                  borderRadius: token.borderRadiusLG,
                }}
              />

              <div className="landing-searchDivider" aria-hidden />

              <Input
                variant="borderless"
                size="large"
                className="landing-searchInput"
                prefix={<EnvironmentOutlined style={{ color: token.colorTextSecondary }} />}
                placeholder="Location or Remote"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                style={{
                  flex: '1 1 200px',
                  minWidth: 0,
                  borderRadius: token.borderRadiusLG,
                }}
              />

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="landing-searchBtn"
                style={{
                  borderRadius: token.borderRadiusLG,
                  fontWeight: 900,
                  paddingInline: 28,
                }}
              >
                Search Jobs
              </Button>
            </Flex>
          </form>

          <Flex
            gap={12}
            wrap="wrap"
            align="center"
            justify="center"
            className="landing-popularRow"
            style={{ marginTop: 18, color: token.colorTextSecondary }}
          >
            <Typography.Text style={{ fontWeight: 700, color: token.colorTextSecondary }}>
              Popular:
            </Typography.Text>
            {popularSearches.map((label) => (
              <Button
                key={label}
                className="landing-pillBtn"
                type="default"
                size="middle"
                onClick={() =>
                  navigate(`/candidate/jobs?q=${encodeURIComponent(label)}`)
                }
                style={{
                  borderRadius: 999,
                  paddingInline: 14,
                  fontWeight: 700,
                  background: token.colorFillSecondary,
                  borderColor: 'transparent',
                  color: token.colorText,
                }}
              >
                {label}
              </Button>
            ))}
          </Flex>
        </div>
      </div>

      <div className="landing-heroDeco" aria-hidden />
    </section>
  )
}
