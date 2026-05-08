import { LeftOutlined, RightOutlined, SaveOutlined } from '@ant-design/icons'
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Result,
  Row,
  Select,
  Space,
  Spin,
  Typography,
  message,
  theme,
} from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getHrJobById, updateJob, type ApiJob } from '@/services/jobsService'
import type { JobStatus } from '@/types'

type FormValues = {
  title: string
  description: string
  status: JobStatus
  location?: string
  level?: string
  type?: string
  salary_min?: number
  salary_max?: number
  application_deadline?: Dayjs
  benefits?: string[]
}

function toStr(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function toOptStr(value: unknown) {
  const s = typeof value === 'string' ? value.trim() : ''
  return s ? s : undefined
}

function deadlineToString(value: Dayjs | undefined) {
  if (!value) return undefined
  // Prefer a stable date-only string; backend expects string.
  return value.format('YYYY-MM-DD')
}

function normalizeBenefits(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((x) => typeof x === 'string')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function HrJobEditPage() {
  const { id } = useParams()
  const { token } = theme.useToken()
  const [form] = Form.useForm<FormValues>()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [job, setJob] = useState<ApiJob | null>(null)
  const initialRef = useRef<ApiJob | null>(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      if (!id) return
      try {
        setLoading(true)
        setError(null)
        const data = await getHrJobById(id)
        if (!mounted) return

        setJob(data)
        initialRef.current = data

        form.setFieldsValue({
          title: toStr(data.title),
          description: toStr(data.description),
          status: data.status,
          location: data.location ?? undefined,
          level: data.level ?? undefined,
          type: data.type ?? undefined,
          salary_min: data.salary_min ?? undefined,
          salary_max: data.salary_max ?? undefined,
          application_deadline: data.application_deadline
            ? dayjs(data.application_deadline)
            : undefined,
          benefits: Array.isArray(data.benefits) ? data.benefits : [],
        })
      } catch (err: unknown) {
        if (!mounted) return
        const msg =
          err && typeof err === 'object'
            ? ((err as { message?: unknown }).message as string | undefined)
            : undefined
        setError(typeof msg === 'string' && msg.trim() ? msg : 'Failed to load job')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()
    return () => {
      mounted = false
    }
  }, [form, id])

  const containerStyle: React.CSSProperties = useMemo(
    () => ({
      position: 'relative',
      maxWidth: 1080,
      margin: '0 auto',
    }),
    []
  )

  const bgStyle: React.CSSProperties = useMemo(
    () => ({
      position: 'absolute',
      inset: -24,
      top: -token.paddingXL * 2,
      pointerEvents: 'none',
      zIndex: 0,
      background: [
        `radial-gradient(820px 520px at 12% 10%, rgba(22, 119, 255, 0.18), transparent 62%)`,
        `radial-gradient(740px 460px at 86% 0%, rgba(56, 189, 248, 0.14), transparent 60%)`,
      ].join(','),
      filter: 'saturate(1.05)',
    }),
    [token.paddingXL]
  )

  const cardStyle: React.CSSProperties = useMemo(
    () => ({
      position: 'relative',
      zIndex: 1,
      borderRadius: token.borderRadiusLG * 2,
      background: 'rgba(255, 255, 255, 0.78)',
      backdropFilter: 'blur(14px)',
      border: '1px solid rgba(15, 23, 42, 0.08)',
      boxShadow: '0 18px 55px rgba(0, 26, 67, 0.08)',
    }),
    [token.borderRadiusLG]
  )

  const onFinish = async (values: FormValues) => {
    if (!id) return
    const initial = initialRef.current

    const nextBenefits = normalizeBenefits(values.benefits)
    const nextDeadline = deadlineToString(values.application_deadline)

    const payload: Record<string, unknown> = {
      title: toOptStr(values.title),
      description: toOptStr(values.description),
      status: values.status,
      location: toOptStr(values.location),
      level: toOptStr(values.level),
      type: toOptStr(values.type),
      salary_min: typeof values.salary_min === 'number' ? values.salary_min : undefined,
      salary_max: typeof values.salary_max === 'number' ? values.salary_max : undefined,
      application_deadline: nextDeadline,
      benefits: nextBenefits,
    }

    // Send only changed fields when possible (still valid for \"one or more fields\").
    const patch: Record<string, unknown> = {}
    if (!initial) {
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined) patch[k] = v
      })
    } else {
      const initialDeadline = initial.application_deadline
        ? dayjs(initial.application_deadline).format('YYYY-MM-DD')
        : undefined
      const initialBenefits = Array.isArray(initial.benefits) ? initial.benefits : []

      const cmp = {
        title: toOptStr(initial.title),
        description: toOptStr(initial.description),
        status: initial.status,
        location: toOptStr(initial.location),
        level: toOptStr(initial.level),
        type: toOptStr(initial.type),
        salary_min: initial.salary_min ?? undefined,
        salary_max: initial.salary_max ?? undefined,
        application_deadline: initialDeadline,
        benefits: normalizeBenefits(initialBenefits),
      }

      ;(Object.keys(payload) as (keyof typeof payload)[]).forEach((key) => {
        const next = payload[key]
        const prev = (cmp as Record<string, unknown>)[key as string]
        const same =
          Array.isArray(next) && Array.isArray(prev)
            ? next.length === prev.length && next.every((v, i) => v === prev[i])
            : next === prev
        if (!same && next !== undefined) patch[key as string] = next
      })
    }

    if (Object.keys(patch).length === 0) {
      message.info('No changes to save')
      return
    }

    try {
      setSaving(true)
      setError(null)
      const updated = await updateJob(id, patch)
      setJob(updated)
      initialRef.current = updated
      message.success('Job updated')
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object'
          ? ((err as { message?: unknown }).message as string | undefined)
          : undefined
      message.error(typeof msg === 'string' && msg.trim() ? msg : 'Failed to update job')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 520 }}>
        <Spin size="large" />
      </Flex>
    )
  }

  if (error || !job) {
    return (
      <div style={{ maxWidth: 720, margin: '48px auto' }}>
        <Result
          status="error"
          title="Could not load job"
          subTitle={error ?? 'Unknown error'}
          extra={
            <Space wrap>
              <Link to="/hr/jobs">
                <Button>Back to jobs</Button>
              </Link>
              {id && (
                <Link to={`/hr/job/${id}`}>
                  <Button type="primary">Back to details</Button>
                </Link>
              )}
            </Space>
          }
        />
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={bgStyle} />

      <Card bordered={false} style={cardStyle} bodyStyle={{ padding: token.paddingLG * 1.25 }}>
        <Flex vertical gap={token.marginLG}>
          <Flex justify="space-between" align="flex-start" wrap="wrap" gap={token.margin}>
            <div>
              <Breadcrumb
                style={{
                  marginBottom: token.marginMD,
                  fontSize: token.fontSizeSM,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
                items={[
                  {
                    title: (
                      <Link to="/hr/jobs" style={{ color: token.colorTextSecondary }}>
                        Jobs
                      </Link>
                    ),
                  },
                  {
                    title: (
                      <Link to={`/hr/job/${job.id}`} style={{ color: token.colorTextSecondary }}>
                        {job.title}
                      </Link>
                    ),
                  },
                  {
                    title: <span style={{ color: token.colorPrimary }}>Edit</span>,
                  },
                ]}
                separator={
                  <RightOutlined style={{ fontSize: 10, color: token.colorTextTertiary }} />
                }
              />
              <Typography.Title
                level={2}
                style={{ margin: 0, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.12 }}
              >
                Edit job
              </Typography.Title>
              <Typography.Text type="secondary">
                Update details and keep your pipeline aligned with the current role requirements.
              </Typography.Text>
            </div>

            <Space wrap>
              <Link to={`/hr/job/${job.id}`} style={{ textDecoration: 'none' }}>
                <Button icon={<LeftOutlined />}>Back</Button>
              </Link>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={() => form.submit()}
              >
                Save changes
              </Button>
            </Space>
          </Flex>

          <Form<FormValues> form={form} layout="vertical" onFinish={onFinish} disabled={saving}>
            <Row gutter={[token.marginLG, token.marginLG]}>
              <Col xs={24} lg={14}>
                <Form.Item
                  label="Title"
                  name="title"
                  rules={[
                    { required: true, message: 'Title is required' },
                    { min: 2, max: 256, message: 'Title must be 2–256 characters' },
                  ]}
                >
                  <Input placeholder="e.g. Senior Backend Engineer" />
                </Form.Item>
              </Col>

              <Col xs={24} lg={10}>
                <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                  <Select
                    options={[
                      { value: 'Open', label: 'Open' },
                      { value: 'Draft', label: 'Draft' },
                      { value: 'Closed', label: 'Closed' },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  label="Description"
                  name="description"
                  rules={[
                    { required: true, message: 'Description is required' },
                    { min: 10, message: 'Description must be at least 10 characters' },
                  ]}
                >
                  <Input.TextArea
                    placeholder="What will the candidate do in this role?"
                    autoSize={{ minRows: 6, maxRows: 14 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={8}>
                <Form.Item label="Location" name="location">
                  <Input placeholder="e.g. Ho Chi Minh City" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item label="Level" name="level">
                  <Input placeholder="e.g. Senior" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item label="Type" name="type">
                  <Input placeholder="e.g. Full-time" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={8}>
                <Form.Item label="Salary min" name="salary_min">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="Optional"
                    formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                    parser={(v) => (v ? Number(v.replaceAll(',', '')) : undefined)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Salary max"
                  name="salary_max"
                  dependencies={['salary_min']}
                  rules={[
                    ({ getFieldValue }) => ({
                      async validator(_, value) {
                        const min = getFieldValue('salary_min') as number | undefined
                        if (typeof min === 'number' && typeof value === 'number' && value < min) {
                          throw new Error('Salary max must be greater than or equal to salary min')
                        }
                      },
                    }),
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="Optional"
                    formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                    parser={(v) => (v ? Number(v.replaceAll(',', '')) : undefined)}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={8}>
                <Form.Item label="Application deadline" name="application_deadline">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  label="Benefits"
                  name="benefits"
                  extra="Type and press Enter to add (or select existing)."
                >
                  <Select mode="tags" placeholder="e.g. Health insurance, Remote work, Laptop" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Flex>
      </Card>
    </div>
  )
}
