import { BankOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { Button, Flex, Image, Pagination, Typography, theme, Spin, Alert } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { apiClient } from '@/lib/api'

const { Title, Text, Paragraph } = Typography

type Job = {
  id: string
  title: string
  location: string
  salary: string
  tags: string[]
  description: string
  companies: {
    name: string
    logo_url: string
  }
}

function getApiErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object') {
    const maybe = err as { response?: { data?: { message?: unknown } } }
    const msg = maybe.response?.data?.message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return fallback
}

export function CandidateJobsPage() {
  const { token } = theme.useToken()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string>('')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const res = await apiClient.get('/jobs')
        const data = res.data.data
        setJobs(data)
        if (data.length > 0) {
          setSelectedId(data[0].id)
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to fetch jobs'))
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedId) || jobs[0],
    [jobs, selectedId]
  )

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 500 }}>
        <Spin size="large" tip="Finding matches..." />
      </Flex>
    )
  }

  return (
    <main className="candidate-jobsMain">
      <section className="candidate-jobsHero" aria-labelledby="candidate-jobs-hero-title">
        <div className="candidate-jobsHeroOverlay" aria-hidden />
        <div className="candidate-jobsHeroContent">
          <Title id="candidate-jobs-hero-title" level={2} className="candidate-jobsHeroTitle">
            Global Opportunities
          </Title>
          <Text className="candidate-jobsHeroSubtitle">
            {jobs.length} open positions available for you
          </Text>
        </div>
      </section>

      <div className="candidate-jobsContainer">
        {error && <Alert type="error" message={error} style={{ marginBottom: 24 }} />}

        <div className="candidate-jobsSplit">
          <div className="candidate-jobsListCol">
            <div className="candidate-jobsListInner">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className={`candidate-jobCard${job.id === selectedJob?.id ? ' candidate-jobCard--selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-current={job.id === selectedJob?.id ? 'true' : undefined}
                  onClick={() => setSelectedId(job.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedId(job.id)
                    }
                  }}
                >
                  <Flex align="flex-start" justify="space-between" wrap gap={12}>
                    <Flex gap={28} align="flex-start">
                      <div className="candidate-jobLogoBox">
                        <Image
                          className="candidate-jobLogo"
                          src={job.companies.logo_url}
                          alt={`${job.companies.name} logo`}
                          preview={false}
                          width={84}
                          height={84}
                          style={{ objectFit: 'contain' }}
                        />
                      </div>

                      <div>
                        <div className="candidate-jobTitleRow">
                          <Text className="candidate-jobTitle">{job.title}</Text>
                        </div>

                        <Flex className="candidate-jobMeta" align="center" wrap gap={10}>
                          <Text style={{ color: token.colorTextSecondary, fontWeight: 600 }}>
                            {job.companies.name}
                          </Text>
                          <span className="candidate-dot" />
                          <Text style={{ color: token.colorTextSecondary, fontWeight: 600 }}>
                            {job.location}
                          </Text>
                          <span className="candidate-dot" />
                          <Text className="candidate-jobSalary">{job.salary}</Text>
                        </Flex>

                        <Flex className="candidate-jobTagList" wrap gap={10}>
                          {(job.tags || []).map((t) => (
                            <span key={t} className="candidate-jobTag">
                              {t}
                            </span>
                          ))}
                        </Flex>
                      </div>
                    </Flex>

                    <Flex align="center" gap={12} onClick={(e) => e.stopPropagation()}>
                      <Link to={`/candidate/job/${job.id}`}>
                        <Button type="primary" className="candidate-applyBtn">
                          Apply
                        </Button>
                      </Link>
                    </Flex>
                  </Flex>
                </article>
              ))}
            </div>

            <div className="candidate-paginationBar">
              <Text style={{ color: token.colorTextSecondary }}>Page 1 of 1</Text>
              <Pagination
                className="candidate-pagination"
                current={1}
                total={jobs.length}
                pageSize={10}
                showSizeChanger={false}
                showQuickJumper={false}
              />
            </div>
          </div>

          <aside className="candidate-jobsPreviewCol" aria-label="Job preview">
            {selectedJob ? (
              <div className="candidate-jobPreviewSticky">
                <div className="candidate-jobPreview">
                  <div className="candidate-jobPreviewMedia">
                    <Image
                      src={selectedJob.companies.logo_url} // Placeholder for cover if missing
                      alt=""
                      preview={false}
                      width="100%"
                      style={{
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'blur(40px)',
                        opacity: 0.3,
                      }}
                    />
                    <div className="candidate-jobPreviewMediaShade" aria-hidden />
                  </div>

                  <div className="candidate-jobPreviewBody">
                    <Flex align="center" wrap gap={10} style={{ marginBottom: 10 }}>
                      <Title
                        level={3}
                        className="candidate-jobPreviewTitle"
                        style={{ margin: 0, flex: '1 1 200px' }}
                      >
                        {selectedJob.title}
                      </Title>
                    </Flex>

                    <Flex wrap gap={16} align="center" style={{ marginBottom: 16 }}>
                      <Flex gap={8} align="center">
                        <BankOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />
                        <Text style={{ fontWeight: 700, color: token.colorText }}>
                          {selectedJob.companies.name}
                        </Text>
                      </Flex>
                      <Flex gap={8} align="center">
                        <EnvironmentOutlined
                          style={{ fontSize: 16, color: token.colorTextSecondary }}
                        />
                        <Text style={{ color: token.colorTextSecondary }}>
                          {selectedJob.location}
                        </Text>
                      </Flex>
                      <Flex gap={8} align="center">
                        <span className="candidate-moneyIcon" />
                        <Text className="candidate-jobPay">{selectedJob.salary}</Text>
                      </Flex>
                    </Flex>

                    <Flex wrap gap={8} className="candidate-jobPills" style={{ marginBottom: 16 }}>
                      {(selectedJob.tags || []).map((t) => (
                        <span key={t} className="candidate-pill">
                          {t}
                        </span>
                      ))}
                    </Flex>

                    <Paragraph
                      style={{
                        marginBottom: 20,
                        color: token.colorTextSecondary,
                        maxHeight: 200,
                        overflow: 'hidden',
                      }}
                      className="candidate-jobPreviewSummary"
                    >
                      {selectedJob.description}
                    </Paragraph>

                    <Flex gap={10} wrap>
                      <Link to={`/candidate/job/${selectedJob.id}`} style={{ flex: '1 1 auto' }}>
                        <Button block className="candidate-jobPreviewSecondaryBtn">
                          View full role
                        </Button>
                      </Link>
                      <Link to={`/candidate/job/${selectedJob.id}`} style={{ flex: '1 1 auto' }}>
                        <Button type="primary" block className="candidate-applyNowBtn">
                          Apply now
                        </Button>
                      </Link>
                    </Flex>
                  </div>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  )
}
