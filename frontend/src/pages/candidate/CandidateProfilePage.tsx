import { BankOutlined, FilePdfOutlined, RightOutlined } from '@ant-design/icons'
import {
  Alert,
  Avatar,
  Button,
  Empty,
  Flex,
  Image,
  Tag,
  Typography,
  theme,
  Spin,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { appEnv } from '@/config/env'
import { useAuth } from '@/context/AuthContext'
import { getMyApplications, type CandidateApplication } from '@/services/applicationsService'

const { Title, Text, Paragraph } = Typography

const HR_STATUS_COLOR: Record<string, string> = {
  Pending: 'gold',
  Shortlisted: 'blue',
  Interviewing: 'processing',
  Offered: 'orange',
  Accepted: 'success',
  Rejected: 'error',
}

const PROCESSING_STATUS_COLOR: Record<string, string> = {
  Pending: 'cyan',
  Processing: 'processing',
  Analyzed: 'success',
  Failed: 'error',
}

function tagColor(map: Record<string, string>, status: string | undefined): string {
  const raw = (status ?? '').trim()
  if (!raw) return 'geekblue'
  if (map[raw]) return map[raw]
  const pascal = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  return map[pascal] ?? 'geekblue'
}

function getApiErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object') {
    const maybe = err as { response?: { data?: { message?: unknown } } }
    const msg = maybe.response?.data?.message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return fallback
}

function formatAppliedDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function resolveResumeUrl(cvUrl: string) {
  const u = cvUrl.trim()
  if (!u) return '#'
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  const base = appEnv.apiUrl.replace(/\/$/, '')
  const path = u.startsWith('/') ? u : `/${u}`
  return `${base}${path}`
}

function resumeFileName(cvUrl: string) {
  const part = cvUrl.split('/').pop()?.split('?')[0]
  return part && part.length > 0 ? part : 'resume.pdf'
}

export function CandidateProfilePage() {
  const { token } = theme.useToken()
  const { user } = useAuth()
  const [applications, setApplications] = useState<CandidateApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const data = await getMyApplications()
        setApplications(Array.isArray(data) ? data : [])
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to load your applications.'))
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const sorted = useMemo(() => {
    return [...applications].sort(
      (a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
    )
  }, [applications])

  const initials = useMemo(() => {
    const name = user?.full_name?.trim() || user?.email?.trim() || '?'
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }, [user?.full_name, user?.email])

  if (loading) {
    return (
      <Flex justify="center" align="center" className="candidate-jobsMain" style={{ minHeight: 500 }}>
        <Spin size="large" tip="Loading profile…" />
      </Flex>
    )
  }

  const heroSubtitle = [
    user?.email?.trim(),
    `${sorted.length} application${sorted.length === 1 ? '' : 's'} on file`,
  ]
    .filter((p): p is string => Boolean(p))
    .join(' · ')

  return (
    <main className="candidate-jobsMain">
      <section className="candidate-jobsHero" aria-labelledby="candidate-profile-hero-title">
        <div className="candidate-jobsHeroOverlay" aria-hidden />
        <div className="candidate-jobsHeroContent">
          <Title id="candidate-profile-hero-title" level={2} className="candidate-jobsHeroTitle">
            Your profile
          </Title>
          <Text className="candidate-jobsHeroSubtitle">{heroSubtitle}</Text>
        </div>
      </section>

      <div className="candidate-jobsContainer">
        {error ? (
          <Alert type="error" message={error} showIcon className="candidate-profileAlert" />
        ) : null}

        <div className="candidate-profileToolbar">
          <Flex justify="space-between" align="flex-start" gap={20} wrap>
            <Flex align="center" gap={20} wrap style={{ minWidth: 0 }}>
              <Avatar
                size={72}
                className="candidate-profileToolbarAvatar"
                style={{
                  backgroundColor: token.colorPrimary,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 22,
                }}
              >
                {initials}
              </Avatar>
              <div style={{ minWidth: 0 }}>
                <Title level={4} className="candidate-profileToolbarName">
                  {user?.full_name ?? 'Candidate'}
                </Title>
                <Flex gap={10} wrap align="center" style={{ marginTop: 8 }}>
                  <Tag className="candidate-profileRoleTag">{user?.role ?? 'CANDIDATE'}</Tag>
                  {user?.email ? (
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {user.email}
                    </Text>
                  ) : null}
                </Flex>
              </div>
            </Flex>
            <Flex gap={12} wrap className="candidate-profileToolbarActions">
              <Link to="/candidate/jobs">
                <Button type="primary" size="large" className="candidate-profileCta">
                  Browse jobs
                </Button>
              </Link>
              <Link to="/candidate/your-applications">
                <Button size="large" className="candidate-profileCta">
                  Your applications
                </Button>
              </Link>
            </Flex>
          </Flex>
        </div>

        <div className="candidate-profileGrid">
          <section className="candidate-profileCard candidate-profileCard--account">
            <Title level={4} className="candidate-profileCardTitle">
              Account
            </Title>
            <Paragraph type="secondary" className="candidate-profileCardLead">
              This is what we have on file for your signed-in account. Editing your name, email, or
              password is not supported in the product API yet.
            </Paragraph>
            <dl className="candidate-profileDl">
              <div>
                <dt>Full name</dt>
                <dd>{user?.full_name ?? '—'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user?.email ?? '—'}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{user?.role ?? '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="candidate-profileCard candidate-profileCard--wide">
            <Flex justify="space-between" align="center" wrap gap={12} className="candidate-profileSectionHead">
              <Title level={4} className="candidate-profileCardTitle" style={{ margin: 0 }}>
                Applications
              </Title>
              {sorted.length > 0 ? (
                <Link to="/candidate/your-applications" className="candidate-profileTextLink">
                  View all
                  <RightOutlined style={{ fontSize: 11, marginLeft: 4 }} />
                </Link>
              ) : null}
            </Flex>

            {sorted.length === 0 ? (
              <Empty
                className="candidate-profileEmpty"
                description="You have not applied to any roles yet."
              >
                <Link to="/candidate/jobs">
                  <Button type="primary">Find a job</Button>
                </Link>
              </Empty>
            ) : (
              <div className="candidate-profileAppListWrap">
                <ul className="candidate-profileAppList">
                  {sorted.map((app) => (
                    <li key={app.id}>
                      <Link
                        to={`/candidate/job/${app.job_id}`}
                        className="candidate-profileAppRow"
                      >
                        <div className="candidate-profileAppLogo">
                          {app.jobs?.companies?.logo_url ? (
                            <Image
                              src={app.jobs.companies.logo_url}
                              alt=""
                              preview={false}
                              width={40}
                              height={40}
                              style={{ objectFit: 'contain' }}
                            />
                          ) : (
                            <BankOutlined style={{ fontSize: 20, color: token.colorTextSecondary }} />
                          )}
                        </div>
                        <div className="candidate-profileAppBody">
                          <Text strong className="candidate-profileAppTitle">
                            {app.jobs?.title ?? '—'}
                          </Text>
                          <Text type="secondary" className="candidate-profileAppMeta">
                            {app.jobs?.companies?.name ?? '—'} · Applied{' '}
                            {formatAppliedDate(app.applied_at)}
                          </Text>
                          <Flex gap={8} wrap className="candidate-profileAppTags">
                            <Tag
                              bordered={false}
                              color={tagColor(HR_STATUS_COLOR, app.hr_status)}
                              style={{ margin: 0, fontWeight: 600, fontSize: 11, borderRadius: 999 }}
                            >
                              HR: {app.hr_status}
                            </Tag>
                            <Tag
                              bordered={false}
                              color={tagColor(PROCESSING_STATUS_COLOR, app.processing_status)}
                              style={{ margin: 0, fontWeight: 600, fontSize: 11, borderRadius: 999 }}
                            >
                              AI: {app.processing_status}
                            </Tag>
                          </Flex>
                        </div>
                        <RightOutlined className="candidate-profileAppChevron" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="candidate-profileCard candidate-profileCard--wide candidate-profileCard--resumes">
            <Title level={4} className="candidate-profileCardTitle">
              Resumes submitted
            </Title>
            <Paragraph type="secondary" className="candidate-profileCardLead">
              Each resume is stored when you submit an application. To use a new file, apply again and
              attach the PDF there.
            </Paragraph>

            {sorted.length === 0 ? (
              <Empty className="candidate-profileEmpty" description="No resumes yet." />
            ) : (
              <ul className="candidate-profileResumeList">
                {sorted.map((app) => (
                  <li key={`cv-${app.id}`}>
                    <Flex
                      align="center"
                      justify="space-between"
                      gap={16}
                      wrap
                      className="candidate-profileResumeRow"
                    >
                      <Flex align="center" gap={12} className="candidate-profileResumeInfo">
                        <FilePdfOutlined className="candidate-profilePdfIcon" />
                        <div>
                          <Text strong>{resumeFileName(app.cv_url)}</Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {app.jobs?.title ?? 'Application'} · {formatAppliedDate(app.applied_at)}
                            </Text>
                          </div>
                        </div>
                      </Flex>
                      <Button
                        type="link"
                        href={resolveResumeUrl(app.cv_url)}
                        target="_blank"
                        rel="noreferrer"
                        icon={<FilePdfOutlined />}
                        className="candidate-profileResumeOpen"
                      >
                        Open
                      </Button>
                    </Flex>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
