import { CloseOutlined, CloudUploadOutlined, FilePdfOutlined, LoadingOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Modal, Steps, Typography, Upload, message, theme } from 'antd'
import type { UploadFile } from 'antd'
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'

import { APPLICATION_MAX_RESUME_MB } from '@/services/applicationsService'

const { Title, Text } = Typography

export type JobApplyModalProps = {
  open: boolean
  onClose: () => void
  jobTitle: string
  subtitle?: string
  onSubmit?: (file: File) => void | Promise<void>
}

export function JobApplyModal({ open, onClose, jobTitle, subtitle, onSubmit }: JobApplyModalProps) {
  const { token } = theme.useToken()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const processingSteps = [
    { title: 'Extracting text from CV...', icon: <span style={{ fontSize: 18 }}>⏳</span> },
    { title: 'AI analyzing skills and experience...', icon: <span style={{ fontSize: 18 }}>🤖</span> },
    { title: 'Calculating matching score...', icon: <span style={{ fontSize: 18 }}>📊</span> },
    { title: 'Done!', icon: <span style={{ fontSize: 18 }}>✅</span> },
  ]

  useEffect(() => {
    if (open) {
      setFileList([])
      setSubmitting(false)
      setCurrentStep(0)
    }
  }, [open])

  const hasFile = Boolean(fileList[0]?.originFileObj)

  const handleSubmit = async () => {
    const file = fileList[0]?.originFileObj as File | undefined
    if (!file) {
      message.warning('Please upload your resume (PDF).')
      return
    }
    setSubmitting(true)
    setCurrentStep(0)

    try {
      // Start the real submission in the background
      const apiPromise = onSubmit?.(file)

      // Fake sequential delays for demo "alive" feel
      // Step 0 -> 1
      await new Promise((resolve) => setTimeout(resolve, 5000))
      setCurrentStep(1)

      // Step 1 -> 2
      await new Promise((resolve) => setTimeout(resolve, 5000))
      setCurrentStep(2)

      // Ensure the real API call is finished before moving to "Done"
      await apiPromise

      // Step 2 -> 3 (Done)
      setCurrentStep(3)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setFileList([])
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Try again.'
      message.error(msg)
      // On error, we allow user to try again by resetting submitting state
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (submitting) return
    setFileList([])
    onClose()
  }

  const dropzoneVars = {
    '--apply-ux-border': token.colorBorderSecondary,
    '--apply-ux-primary': token.colorPrimary,
    '--apply-ux-fill': token.colorFillAlter,
    '--apply-ux-fill-hover': `color-mix(in srgb, ${token.colorPrimary} 14%, ${token.colorFillAlter})`,
    '--apply-ux-text': token.colorText,
    '--apply-ux-text-secondary': token.colorTextSecondary,
  } as CSSProperties

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      closable={false}
      width={560}
      centered
      destroyOnHidden
      maskClosable={!submitting}
      keyboard={!submitting}
      wrapClassName="candidate-applyModalWrap"
      aria-labelledby="candidate-apply-modal-title"
      styles={{
        mask: {
          background: `color-mix(in srgb, ${token.colorText} 38%, transparent)`,
          backdropFilter: 'saturate(1.05) blur(10px)',
        },
        container: {
          padding: 0,
          overflow: 'hidden',
          borderRadius: token.borderRadiusLG * 1.25,
          background: token.colorBgElevated,
          boxShadow: token.boxShadowSecondary,
        },
        body: { padding: 0 },
      }}
    >
      <div className="candidate-applyModal">
        {!submitting ? (
          <>
            <header
              className="candidate-applyModalHeader"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
                padding: '22px 24px 18px',
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <Title
                  id="candidate-apply-modal-title"
                  level={4}
                  style={{
                    margin: 0,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: token.colorText,
                    lineHeight: 1.25,
                  }}
                >
                  Apply for this role
                </Title>
                <Text
                  ellipsis={{ tooltip: jobTitle }}
                  style={{
                    display: 'block',
                    marginTop: 6,
                    fontWeight: 700,
                    color: token.colorText,
                    fontSize: 15,
                  }}
                >
                  {jobTitle}
                </Text>
                <Text
                  style={{
                    display: 'block',
                    marginTop: 6,
                    color: token.colorTextSecondary,
                    fontSize: 14,
                    lineHeight: 1.55,
                  }}
                >
                  {subtitle ??
                    'Upload one PDF resume. Your file is sent securely with your application.'}
                </Text>
              </div>
              <Button
                type="text"
                icon={<CloseOutlined />}
                aria-label="Close dialog"
                onClick={handleCancel}
                disabled={submitting}
                className="candidate-applyModalClose"
                style={{ color: token.colorTextSecondary, flexShrink: 0 }}
              />
            </header>

            <div className="candidate-applyModalBody" style={{ padding: '20px 24px 8px' }}>
              <Alert
                type="info"
                showIcon
                icon={<FilePdfOutlined />}
                message="PDF only"
                description={`Up to ${APPLICATION_MAX_RESUME_MB} MB. Other formats are not accepted.`}
                style={{
                  marginBottom: 16,
                  borderRadius: token.borderRadiusLG,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  background: token.colorFillAlter,
                }}
              />

              <Text
                style={{
                  display: 'block',
                  marginBottom: 10,
                  fontWeight: 700,
                  color: token.colorText,
                  fontSize: 14,
                }}
              >
                Resume
              </Text>

              <div className="candidate-applyDropzone" style={dropzoneVars}>
                <Upload.Dragger
                  className="candidate-applyUpload"
                  accept=".pdf,application/pdf"
                  maxCount={1}
                  disabled={submitting}
                  fileList={fileList}
                  showUploadList={{
                    showPreviewIcon: false,
                    showRemoveIcon: true,
                  }}
                  beforeUpload={(file) => {
                    const isPdf =
                      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
                    if (!isPdf) {
                      message.error('Please upload a PDF file only.')
                      return Upload.LIST_IGNORE
                    }
                    const okSize = file.size / 1024 / 1024 <= APPLICATION_MAX_RESUME_MB
                    if (!okSize) {
                      message.error(`File must be ${APPLICATION_MAX_RESUME_MB}MB or smaller.`)
                      return Upload.LIST_IGNORE
                    }
                    return false
                  }}
                  onChange={({ fileList: fl }) => setFileList(fl)}
                >
                  <p className="ant-upload-drag-icon" style={{ marginBottom: 14 }}>
                    <span
                      className="candidate-applyUploadIconRing"
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: token.colorBgContainer,
                        boxShadow: token.boxShadowTertiary,
                        border: `1px solid ${token.colorBorderSecondary}`,
                      }}
                    >
                      <CloudUploadOutlined style={{ fontSize: 26, color: token.colorPrimary }} />
                    </span>
                  </p>
                  <Text
                    style={{
                      display: 'block',
                      fontWeight: 700,
                      color: token.colorText,
                      fontSize: 15,
                    }}
                  >
                    Drag and drop your PDF here
                  </Text>
                  <Text
                    style={{
                      display: 'block',
                      marginTop: 6,
                      fontSize: 14,
                      color: token.colorTextSecondary,
                      lineHeight: 1.5,
                    }}
                  >
                    Or <span style={{ color: token.colorPrimary, fontWeight: 600 }}>browse</span> to
                    choose a file from your device.
                  </Text>
                </Upload.Dragger>
              </div>
            </div>

            <footer
              className="candidate-applyModalFooter"
              style={{
                padding: '16px 24px 22px',
                background: token.colorFillQuaternary,
                borderTop: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Flex
                gap={12}
                justify="flex-end"
                wrap="wrap"
                className="candidate-applyModalFooterActions"
              >
                <Button
                  size="large"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="candidate-applyModalBtnSecondary"
                  style={{ fontWeight: 600, minWidth: 108, cursor: 'pointer' }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  loading={submitting}
                  disabled={!hasFile || submitting}
                  onClick={handleSubmit}
                  className="candidate-applyModalBtnPrimary"
                  style={{
                    fontWeight: 800,
                    minWidth: 168,
                    cursor: hasFile ? 'pointer' : 'not-allowed',
                    border: 'none',
                    background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
                    boxShadow: `0 8px 22px color-mix(in srgb, ${token.colorPrimary} 30%, transparent)`,
                  }}
                >
                  Submit application
                </Button>
              </Flex>
            </footer>
          </>
        ) : (
          <div
            className="candidate-applyProcessing"
            style={{
              padding: '48px 32px 56px',
              textAlign: 'center',
              background: `radial-gradient(circle at top right, color-mix(in srgb, ${token.colorPrimary} 5%, transparent), transparent)`,
            }}
          >
            <div style={{ marginBottom: 40 }}>
              <Title level={3} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
                AI is analyzing your profile
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Please wait while our engine processes your resume.
              </Text>
            </div>

            <div
              style={{
                maxWidth: 380,
                margin: '0 auto',
                textAlign: 'left',
                padding: '24px 32px',
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                border: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: token.boxShadowTertiary,
              }}
            >
              <Steps
                direction="vertical"
                current={currentStep}
                items={processingSteps.map((step, idx) => ({
                  ...step,
                  status:
                    currentStep > idx ? 'finish' : currentStep === idx ? 'process' : 'wait',
                  icon:
                    currentStep === idx && currentStep < 3 ? (
                      <LoadingOutlined style={{ color: token.colorPrimary }} />
                    ) : (
                      step.icon
                    ),
                }))}
              />
            </div>

            <div style={{ marginTop: 40 }}>
              <Text type="secondary" italic style={{ fontSize: 13 }}>
                This may take up to 20 seconds for deep analysis...
              </Text>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
