import {
  DownloadOutlined,
  EditOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  PlusOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  SecurityScanOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Table,
  Tag,
  Typography,
  Upload,
  message,
  theme,
} from 'antd'
import type { UploadFile } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import type { ApplicationStatus } from '@/lib/candidateApplicationsStorage'
import { fileToDataUrl, listJobApplications } from '@/lib/candidateApplicationsStorage'
import { addLibraryCv, listLibraryCvs } from '@/lib/candidateCvLibraryStorage'
import {
  getCandidateProfile,
  saveCandidateProfile,
  touchPasswordChanged,
  type CandidateProfile,
} from '@/lib/candidateProfileStorage'

const { Title, Text, Paragraph } = Typography

const statusLabel: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  interviewing: 'Interviewing',
  under_review: 'Under Review',
  closed: 'Closed',
}

function statusTagStyle(status: ApplicationStatus, token: ReturnType<typeof theme.useToken>['token']) {
  switch (status) {
    case 'interviewing':
      return { background: token.colorInfoBg, color: token.colorInfo }
    case 'under_review':
      return { background: token.colorSuccessBg, color: token.colorSuccess }
    case 'closed':
      return { background: token.colorErrorBg, color: token.colorError }
    default:
      return { background: token.colorFillSecondary, color: token.colorTextSecondary }
  }
}

function formatCalendarDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))
  } catch {
    return iso
  }
}

function formatRelativePast(iso: string) {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const sec = Math.floor((now - then) / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day} day${day === 1 ? '' : 's'} ago`
  const mo = Math.floor(day / 30)
  if (mo < 12) return `${mo} month${mo === 1 ? '' : 's'} ago`
  const yr = Math.floor(mo / 12)
  return `${yr} year${yr === 1 ? '' : 's'} ago`
}

type CvTableRow = {
  key: string
  fileName: string
  uploadedAt: string
  dataUrl: string
  isPdf: boolean
}

export function CandidateProfilePage() {
  const { token } = theme.useToken()
  const [profile, setProfile] = useState<CandidateProfile>(() => getCandidateProfile())
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  const applications = useMemo(() => listJobApplications(), [version])
  const libraryCvs = useMemo(() => listLibraryCvs(), [version])
  const latest = applications[0]

  const cvRows: CvTableRow[] = useMemo(() => {
    const fromApps = applications.map((a) => ({
      key: `app-${a.id}`,
      fileName: a.resumeFileName,
      uploadedAt: a.appliedAt,
      dataUrl: a.resumeDataUrl,
      isPdf: true,
    }))
    const fromLib = libraryCvs.map((l) => ({
      key: `lib-${l.id}`,
      fileName: l.fileName,
      uploadedAt: l.uploadedAt,
      dataUrl: l.dataUrl,
      isPdf:
        l.fileName.toLowerCase().endsWith('.pdf') ||
        l.dataUrl.startsWith('data:application/pdf'),
    }))
    return [...fromApps, ...fromLib].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    )
  }, [applications, libraryCvs])

  const [editOpen, setEditOpen] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editForm] = Form.useForm<{ displayName: string; email: string }>()
  const [pwdForm] = Form.useForm<{ password: string; confirm: string }>()
  const [editPhotoList, setEditPhotoList] = useState<UploadFile[]>([])
  const [cvUploadList, setCvUploadList] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  const openEdit = () => {
    editForm.setFieldsValue({ displayName: profile.displayName, email: profile.email })
    setEditOpen(true)
  }

  const handleDownloadResume = () => {
    const src = latest?.resumeDataUrl ?? cvRows[0]?.dataUrl
    if (!src) {
      message.warning('Add a CV from applications or upload one first.')
      return
    }
    const a = document.createElement('a')
    a.href = src
    a.download = latest?.resumeFileName ?? cvRows[0]?.fileName ?? 'resume.pdf'
    a.rel = 'noreferrer'
    a.click()
  }

  const st = latest ? statusTagStyle(latest.status, token) : null

  return (
    <main style={{ maxWidth: 1152, margin: '0 auto', paddingTop: 8, paddingBottom: 48 }}>
      <header style={{ marginBottom: 48 }}>
        <Flex vertical gap={24} align="center" style={{ textAlign: 'center' }}>
          <Flex
            vertical
            gap={32}
            align="center"
            style={{ width: '100%' }}
            className="candidate-profileHeader"
          >
            <Flex
              wrap
              gap={32}
              align="flex-end"
              justify="space-between"
              style={{ width: '100%', maxWidth: 1100 }}
            >
              <Flex gap={32} align="flex-end" wrap style={{ flex: 1, justifyContent: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      padding: 4,
                      borderRadius: token.borderRadiusLG * 1.25,
                      background: token.colorFillAlter,
                      boxShadow: token.boxShadowSecondary,
                    }}
                  >
                    <Avatar
                      size={128}
                      shape="square"
                      style={{ borderRadius: token.borderRadiusLG }}
                      src={profile.avatarUrl}
                    />
                  </div>
                  <Button
                    type="primary"
                    shape="circle"
                    size="small"
                    icon={<EditOutlined />}
                    aria-label="Edit photo"
                    onClick={openEdit}
                    style={{
                      position: 'absolute',
                      right: -6,
                      bottom: -6,
                      boxShadow: token.boxShadowSecondary,
                    }}
                  />
                </div>

                <div style={{ textAlign: 'left', flex: '1 1 200px', minWidth: 200 }}>
                  <Title level={2} style={{ margin: 0, marginBottom: 4, fontWeight: 900, letterSpacing: '-0.02em' }}>
                    {profile.displayName}
                  </Title>
                  <Text style={{ fontSize: 17, fontWeight: 500, color: token.colorTextSecondary }}>
                    {profile.email}
                  </Text>
                </div>
              </Flex>

              <Flex gap={12} wrap justify="center">
                <Button size="large" style={{ fontWeight: 600 }} onClick={openEdit}>
                  Edit profile
                </Button>
                <Button type="primary" size="large" style={{ fontWeight: 700 }} onClick={handleDownloadResume}>
                  Download resume
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </header>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={8}>
          <Card
            style={{
              position: 'relative',
              borderRadius: token.borderRadiusLG * 1.25,
              background: token.colorFillAlter,
              borderColor: token.colorBorderSecondary,
              overflow: 'hidden',
            }}
            styles={{ body: { padding: 32 } }}
          >
            <SafetyCertificateOutlined
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                fontSize: 56,
                color: token.colorPrimary,
                opacity: 0.06,
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Title level={4} style={{ marginTop: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <SecurityScanOutlined style={{ color: token.colorPrimary }} />
                Security
              </Title>
              <div
                style={{
                  background: token.colorBgContainer,
                  borderRadius: token.borderRadiusLG,
                  padding: 24,
                  marginBottom: 24,
                }}
              >
                <Paragraph style={{ marginBottom: 16, fontSize: 13, color: token.colorTextSecondary }}>
                  Protect your account by regularly updating your password and monitoring login activity.
                </Paragraph>
                <Flex justify="space-between" align="center" style={{ paddingTop: 12, paddingBottom: 12 }}>
                  <Text style={{ fontWeight: 500 }}>Password last changed</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatRelativePast(profile.passwordChangedAt)}
                  </Text>
                </Flex>
              </div>
              <Button
                block
                size="large"
                style={{
                  fontWeight: 700,
                  background: token.colorText,
                  color: token.colorBgContainer,
                  border: 'none',
                }}
                onClick={() => setPwdOpen(true)}
              >
                Change password
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Flex vertical gap={32}>
            <Card
              style={{
                borderRadius: token.borderRadiusLG * 1.25,
                background: token.colorFillAlter,
                borderColor: token.colorBorderSecondary,
              }}
              styles={{ body: { padding: 32 } }}
            >
              <Title level={4} style={{ marginTop: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <RocketOutlined style={{ color: token.colorPrimary }} />
                Latest application
              </Title>
              {latest ? (
                <Link to={`/candidate/job/${latest.jobId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Flex
                    vertical
                    gap={16}
                    style={{
                      background: token.colorBgContainer,
                      padding: 32,
                      borderRadius: token.borderRadiusLG * 1.25,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      boxShadow: token.boxShadowTertiary,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = token.colorPrimaryBg
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = token.colorBgContainer
                    }}
                  >
                    <Flex justify="space-between" align="flex-start" wrap gap={16}>
                      <Flex align="center" gap={24} wrap>
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: token.borderRadiusLG,
                            background: token.colorPrimaryBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Image
                            src={latest.logoUrl}
                            alt=""
                            width={36}
                            height={36}
                            preview={false}
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                        <div>
                          <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                            {latest.jobTitle}
                          </Title>
                          <Text style={{ color: token.colorTextSecondary, fontWeight: 500 }}>
                            {latest.company} • Applied role
                          </Text>
                        </div>
                      </Flex>
                      <Flex vertical align="flex-end" gap={8}>
                        {st ? (
                          <Tag
                            bordered={false}
                            style={{
                              margin: 0,
                              fontWeight: 700,
                              fontSize: 11,
                              padding: '4px 14px',
                              borderRadius: 999,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              ...st,
                            }}
                          >
                            {statusLabel[latest.status]}
                          </Tag>
                        ) : null}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Applied on {formatCalendarDate(latest.appliedAt)}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Link>
              ) : (
                <Empty description="No applications yet">
                  <Link to="/candidate/jobs">
                    <Button type="primary">Browse jobs</Button>
                  </Link>
                </Empty>
              )}
            </Card>

            <Card
              style={{
                borderRadius: token.borderRadiusLG * 1.25,
                background: token.colorFillAlter,
                borderColor: token.colorBorderSecondary,
              }}
              styles={{ body: { padding: 32 } }}
            >
              <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileTextOutlined style={{ color: token.colorPrimary }} />
                  Applied CVs
                </Title>
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  style={{ fontWeight: 700 }}
                  onClick={() => {
                    setCvUploadList([])
                    setUploadOpen(true)
                  }}
                >
                  Upload new
                </Button>
              </Flex>

              <div
                style={{
                  borderRadius: token.borderRadiusLG * 1.25,
                  overflow: 'hidden',
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <Table<CvTableRow>
                  pagination={false}
                  size="middle"
                  rowKey="key"
                  dataSource={cvRows}
                  locale={{
                    emptyText: (
                      <Empty description="No CVs yet — apply to a job or upload a file." style={{ padding: 24 }}>
                        <Flex gap={8} justify="center" wrap>
                          <Link to="/candidate/jobs">
                            <Button type="primary">Find jobs</Button>
                          </Link>
                          <Button
                            onClick={() => {
                              setCvUploadList([])
                              setUploadOpen(true)
                            }}
                          >
                            Upload
                          </Button>
                        </Flex>
                      </Empty>
                    ),
                  }}
                  columns={[
                    {
                      title: (
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: token.colorTextTertiary,
                          }}
                        >
                          Filename
                        </Text>
                      ),
                      dataIndex: 'fileName',
                      render: (name: string, row) => (
                        <Flex align="center" gap={12}>
                          {row.isPdf ? (
                            <FilePdfOutlined style={{ fontSize: 20, color: token.colorError }} />
                          ) : (
                            <FileTextOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
                          )}
                          <Text strong style={{ fontSize: 13 }}>
                            {name}
                          </Text>
                        </Flex>
                      ),
                    },
                    {
                      title: (
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: token.colorTextTertiary,
                          }}
                        >
                          Date uploaded
                        </Text>
                      ),
                      dataIndex: 'uploadedAt',
                      render: (iso: string) => (
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {formatCalendarDate(iso)}
                        </Text>
                      ),
                    },
                    {
                      title: (
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: token.colorTextTertiary,
                            textAlign: 'right',
                            display: 'block',
                          }}
                        >
                          Actions
                        </Text>
                      ),
                      align: 'right',
                      width: 100,
                      render: (_, row) => (
                        <Button
                          type="text"
                          icon={<DownloadOutlined />}
                          aria-label={`Download ${row.fileName}`}
                          href={row.dataUrl}
                          download={row.fileName}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: token.colorTextSecondary }}
                        />
                      ),
                    },
                  ]}
                />
              </div>
            </Card>
          </Flex>
        </Col>
      </Row>

      <Modal
        title="Edit profile"
        open={editOpen}
        onCancel={() => {
          setEditPhotoList([])
          setEditOpen(false)
        }}
        onOk={() => editForm.submit()}
        okText="Save"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={async (v) => {
            let avatarUrl = profile.avatarUrl
            const file = editPhotoList[0]?.originFileObj as File | undefined
            if (file) {
              avatarUrl = await fileToDataUrl(file)
            }
            const next = saveCandidateProfile({
              displayName: v.displayName.trim(),
              email: v.email.trim(),
              avatarUrl,
            })
            setProfile(next)
            setEditPhotoList([])
            setEditOpen(false)
            message.success('Profile updated.')
          }}
        >
          <Form.Item name="displayName" label="Display name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Photo">
            <Upload
              accept="image/*"
              maxCount={1}
              fileList={editPhotoList}
              beforeUpload={() => false}
              onChange={({ fileList: fl }) => setEditPhotoList(fl)}
            >
              <Button icon={<UploadOutlined />}>Change photo</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Change password"
        open={pwdOpen}
        onCancel={() => {
          pwdForm.resetFields()
          setPwdOpen(false)
        }}
        onOk={() => pwdForm.submit()}
        okText="Update"
      >
        <Form
          form={pwdForm}
          layout="vertical"
          onFinish={() => {
            touchPasswordChanged()
            setProfile(getCandidateProfile())
            pwdForm.resetFields()
            setPwdOpen(false)
            message.success('Password updated.')
          }}
        >
          <Form.Item
            name="password"
            label="New password"
            rules={[{ required: true, min: 8, message: 'At least 8 characters.' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Confirm password"
            dependencies={['password']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve()
                  return Promise.reject(new Error('Passwords do not match.'))
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Upload CV"
        open={uploadOpen}
        onCancel={() => {
          setCvUploadList([])
          setUploadOpen(false)
        }}
        okText="Add"
        confirmLoading={uploading}
        onOk={async () => {
          const file = cvUploadList[0]?.originFileObj as File | undefined
          if (!file) {
            message.warning('Choose a file to upload.')
            return
          }
          setUploading(true)
          try {
            await addLibraryCv(file)
            refresh()
            setCvUploadList([])
            setUploadOpen(false)
            message.success('CV added to your library.')
          } finally {
            setUploading(false)
          }
        }}
      >
        <Upload.Dragger
          accept=".pdf,.doc,.docx,application/pdf"
          maxCount={1}
          fileList={cvUploadList}
          beforeUpload={() => false}
          onChange={({ fileList: fl }) => setCvUploadList(fl)}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 40, color: token.colorPrimary }} />
          </p>
          <Text strong>Drop a file or click to browse</Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              PDF, DOC, or DOCX
            </Text>
          </div>
        </Upload.Dragger>
      </Modal>

    </main>
  )
}
