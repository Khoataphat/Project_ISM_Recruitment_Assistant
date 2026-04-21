import { BankOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { Button, Flex, Image, Pagination, Typography, theme } from 'antd'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { JOB_HEAT_BADGE_LABELS, candidateJobs } from '@/data/candidateJobs'

const { Title, Text, Paragraph } = Typography

export function CandidateJobsPage() {
  const { token } = theme.useToken()
  const [selectedId, setSelectedId] = useState(() => candidateJobs[0]?.id ?? '')

  const selectedJob = useMemo(
    () => candidateJobs.find((j) => j.id === selectedId) ?? candidateJobs[0],
    [selectedId],
  )

  return (
    <main className="candidate-jobsMain">
      <section className="candidate-jobsHero" aria-labelledby="candidate-jobs-hero-title">
        <div className="candidate-jobsHeroOverlay" aria-hidden />
        <div className="candidate-jobsHeroContent">
          <Title id="candidate-jobs-hero-title" level={2} className="candidate-jobsHeroTitle">
            Architectural Engineering
          </Title>
          <Text className="candidate-jobsHeroSubtitle">1,248 open positions in London, UK</Text>
        </div>
      </section>

      <div className="candidate-jobsContainer">
        <div className="candidate-jobsSplit">
          <div className="candidate-jobsListCol">
            <div className="candidate-jobsListInner">
              {candidateJobs.map((job) => (
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
                          src={job.logoUrl}
                          alt={`${job.company} logo`}
                          preview={false}
                          width={84}
                          height={84}
                          style={{ objectFit: 'contain' }}
                        />
                      </div>

                      <div>
                        <div className="candidate-jobTitleRow">
                          {job.heatBadge ? (
                            <span
                              className={`candidate-jobHeatBadge candidate-jobHeatBadge--${job.heatBadge}`}
                              aria-label={JOB_HEAT_BADGE_LABELS[job.heatBadge]}
                            >
                              {JOB_HEAT_BADGE_LABELS[job.heatBadge]}
                            </span>
                          ) : null}
                          <Text className="candidate-jobTitle">{job.title}</Text>
                        </div>

                        <Flex className="candidate-jobMeta" align="center" wrap gap={10}>
                          <Text style={{ color: token.colorTextSecondary, fontWeight: 600 }}>{job.company}</Text>
                          <span className="candidate-dot" />
                          <Text style={{ color: token.colorTextSecondary, fontWeight: 600 }}>{job.location}</Text>
                          <span className="candidate-dot" />
                          <Text className="candidate-jobSalary">{job.salary}</Text>
                        </Flex>

                        <Flex className="candidate-jobTagList" wrap gap={10}>
                          {job.tags.map((t) => (
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
              <Text style={{ color: token.colorTextSecondary }}>Page 1 of 312</Text>
              <Pagination
                className="candidate-pagination"
                current={1}
                total={312 * 10}
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
                      src={selectedJob.coverImageUrl}
                      alt=""
                      preview={false}
                      width="100%"
                      style={{ height: '100%', objectFit: 'cover' }}
                    />
                    <div className="candidate-jobPreviewMediaShade" aria-hidden />
                  </div>

                  <div className="candidate-jobPreviewBody">
                    <Flex align="center" wrap gap={10} style={{ marginBottom: 10 }}>
                      {selectedJob.heatBadge ? (
                        <span
                          className={`candidate-jobHeatBadge candidate-jobHeatBadge--lg candidate-jobHeatBadge--${selectedJob.heatBadge}`}
                        >
                          {JOB_HEAT_BADGE_LABELS[selectedJob.heatBadge]}
                        </span>
                      ) : null}
                      <Title level={3} className="candidate-jobPreviewTitle" style={{ margin: 0, flex: '1 1 200px' }}>
                        {selectedJob.title}
                      </Title>
                    </Flex>

                    <Flex wrap gap={16} align="center" style={{ marginBottom: 16 }}>
                      <Flex gap={8} align="center">
                        <BankOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />
                        <Text style={{ fontWeight: 700, color: token.colorText }}>{selectedJob.company}</Text>
                      </Flex>
                      <Flex gap={8} align="center">
                        <EnvironmentOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />
                        <Text style={{ color: token.colorTextSecondary }}>{selectedJob.location}</Text>
                      </Flex>
                      <Flex gap={8} align="center">
                        <span className="candidate-moneyIcon" />
                        <Text className="candidate-jobPay">{selectedJob.salary}</Text>
                      </Flex>
                    </Flex>

                    <Flex wrap gap={8} className="candidate-jobPills" style={{ marginBottom: 16 }}>
                      {selectedJob.tags.map((t) => (
                        <span key={t} className="candidate-pill">
                          {t}
                        </span>
                      ))}
                    </Flex>

                    <Paragraph
                      style={{ marginBottom: 20, color: token.colorTextSecondary }}
                      className="candidate-jobPreviewSummary"
                    >
                      {selectedJob.summary}
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
