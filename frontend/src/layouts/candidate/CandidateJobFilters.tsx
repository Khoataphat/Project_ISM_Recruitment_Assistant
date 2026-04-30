import { Button, Checkbox, Divider, Flex, Input, InputNumber, Select, Space, Typography, theme } from 'antd'
import { useCandidateJobsFilters } from '@/layouts/candidate/CandidateJobsFiltersContext.ts'

const { Text, Title } = Typography

export function CandidateJobFilters() {
  const { token } = theme.useToken()
  const { draftFilters, setDraftFilters, apply, clear, options } = useCandidateJobsFilters()

  const sectionTitleStyle = {
    margin: 0,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: token.colorTextTertiary,
  }

  return (
    <div
      className="candidate-filters"
      style={{ display: 'flex', flexDirection: 'column', gap: 14}}
    >
      <div style={{ minHeight: 0, overflow: 'auto', paddingRight: 2 }}>
        <div>
          <Title level={5} style={sectionTitleStyle}>
            Remote
          </Title>
          <div style={{ height: 8 }} />

          <label className="candidate-filterRow">
            <Checkbox
              checked={draftFilters.remoteOnly}
              onChange={(e) =>
                setDraftFilters({
                  ...draftFilters,
                  remoteOnly: e.target.checked,
                })
              }
            />
            <Text className="candidate-filterLabel" style={{ color: token.colorTextSecondary }}>
              Remote only
            </Text>
          </label>
        </div>

        <Divider style={{ margin: '14px 0', borderColor: token.colorBorderSecondary }} />

        <div>
          <Title level={5} style={sectionTitleStyle}>
            Location
          </Title>
          <div style={{ height: 8 }} />
          <Input
            placeholder="e.g. Hồ Chí Minh"
            value={draftFilters.locationQuery}
            onChange={(e) =>
              setDraftFilters({
                ...draftFilters,
                locationQuery: e.target.value,
              })
            }
          />
        </div>

        <Divider style={{ margin: '14px 0', borderColor: token.colorBorderSecondary }} />

        <div>
          <Title level={5} style={sectionTitleStyle}>
            Level
          </Title>
          <div style={{ height: 8 }} />
          <Select
            allowClear
            placeholder="Any"
            value={draftFilters.level}
            onChange={(v) => setDraftFilters({ ...draftFilters, level: v ?? undefined })}
            style={{ width: '100%' }}
            options={options.levels.map((v) => ({ value: v, label: v }))}
          />
        </div>

        <Divider style={{ margin: '14px 0', borderColor: token.colorBorderSecondary }} />

        <div>
          <Title level={5} style={sectionTitleStyle}>
            Type
          </Title>
          <div style={{ height: 8 }} />
          <Select
            allowClear
            placeholder="Any"
            value={draftFilters.type}
            onChange={(v) => setDraftFilters({ ...draftFilters, type: v ?? undefined })}
            style={{ width: '100%' }}
            options={options.types.map((v) => ({ value: v, label: v }))}
          />
        </div>

        <Divider style={{ margin: '14px 0', borderColor: token.colorBorderSecondary }} />

        <div>
          <Flex align="center" justify="space-between">
            <Title level={5} style={sectionTitleStyle}>
              Salary
            </Title>
            <Text style={{ fontSize: 10, fontWeight: 800, color: token.colorPrimary }}>
              {draftFilters.salaryMin != null || draftFilters.salaryMax != null ? 'VND' : '—'}
            </Text>
          </Flex>
          <div style={{ height: 8 }} />

          <Flex gap={8}>
            <InputNumber
              placeholder="Min"
              value={draftFilters.salaryMin}
              onChange={(v) => setDraftFilters({ ...draftFilters, salaryMin: v ?? undefined })}
              style={{ width: '100%' }}
              min={0}
              controls={false}
            />
            <InputNumber
              placeholder="Max"
              value={draftFilters.salaryMax}
              onChange={(v) => setDraftFilters({ ...draftFilters, salaryMax: v ?? undefined })}
              style={{ width: '100%' }}
              min={0}
              controls={false}
            />
          </Flex>
        </div>

        <Divider style={{ margin: '14px 0', borderColor: token.colorBorderSecondary }} />
{/* 
        <div>
          <Title level={5} style={sectionTitleStyle}>
            Experience (years)
          </Title>
          <div style={{ height: 8 }} />

          <InputNumber
            placeholder="e.g. 2"
            value={draftFilters.minExperienceYears}
            onChange={(v) =>
              setDraftFilters({ ...draftFilters, minExperienceYears: v ?? undefined })
            }
            style={{ width: '100%' }}
            min={0}
            controls={false}
          />
        </div>

        <Divider style={{ margin: '14px 0', borderColor: token.colorBorderSecondary }} /> */}

        <div>
          <Title level={5} style={sectionTitleStyle}>
            Status
          </Title>
          <div style={{ height: 8 }} />
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {(['Open', 'Closed'] as const).map((s) => (
              <label key={s} className="candidate-filterRow">
                <Checkbox
                  checked={draftFilters.statuses.includes(s)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...draftFilters.statuses, s]
                      : draftFilters.statuses.filter((x) => x !== s)
                    setDraftFilters({ ...draftFilters, statuses: next })
                  }}
                />
                <Text className="candidate-filterLabel" style={{ color: token.colorTextSecondary }}>
                  {s}
                </Text>
              </label>
            ))}
          </Space>
        </div>
      </div>

      <Divider style={{ margin: 0, borderColor: token.colorBorderSecondary }} />

      <Flex gap={10}>
        <Button block onClick={clear}>
          Clear
        </Button>
        <Button block type="primary" onClick={apply}>
          Apply
        </Button>
      </Flex>
    </div>
  )
}
