import { CloseOutlined, CloudUploadOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Button, Flex, Modal, Typography, Upload, message, theme } from 'antd'
import type { UploadFile } from 'antd'
import { useState } from 'react'

const { Title, Text } = Typography

export type JobApplyModalProps = {
  open: boolean
  onClose: () => void
  jobTitle: string
  subtitle?: string
  onSubmit?: (file: File) => void | Promise<void>
}

const MAX_MB = 10

export function JobApplyModal({ open, onClose, jobTitle, subtitle, onSubmit }: JobApplyModalProps) {
  const { token } = theme.useToken()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadHover, setUploadHover] = useState(false)

  const handleSubmit = async () => {
    const file = fileList[0]?.originFileObj as File | undefined
    if (!file) {
      message.warning('Please upload your resume (PDF).')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit?.(file)
      message.success('Application submitted.')
      setFileList([])
      setUploadHover(false)
      onClose()
    } catch {
      message.error('Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFileList([])
    setUploadHover(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      closable={false}
      width={576}
      centered
      destroyOnHidden
      wrapClassName="candidate-applyModalWrap"
      styles={{
        mask: {
          background: `color-mix(in srgb, ${token.colorText} 40%, transparent)`,
          backdropFilter: 'blur(8px)',
        },
        container: {
          padding: 0,
          overflow: 'hidden',
          borderRadius: token.borderRadiusLG,
          background: token.colorBgElevated,
          boxShadow: `0 12px 40px color-mix(in srgb, #001a43 12%, transparent)`,
        },
        body: { padding: 0 },
      }}
    >
      <div className="candidate-applyModal">
        <div
          className="candidate-applyModalHeader"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            padding: '24px 32px 20px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
            <Title level={4} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.02em', color: token.colorText }}>
              Apply for {jobTitle}
            </Title>
            <Text style={{ display: 'block', marginTop: 4, color: token.colorTextSecondary }}>
              {subtitle ?? 'Complete your application for the Design Systems team.'}
            </Text>
          </div>
          <Button
            type="text"
            icon={<CloseOutlined />}
            aria-label="Close"
            onClick={handleCancel}
            style={{ color: token.colorTextSecondary, flexShrink: 0 }}
          />
        </div>

        <div className="candidate-applyModalBody" style={{ padding: '0 32px 32px' }}>
          <div>
            <Text style={{ display: 'block', marginBottom: 12, fontWeight: 700, color: token.colorText }}>
              Your Resume
            </Text>
            <div onMouseEnter={() => setUploadHover(true)} onMouseLeave={() => setUploadHover(false)}>
            <Upload.Dragger
              className="candidate-applyUpload"
              accept=".pdf,application/pdf"
              maxCount={1}
              fileList={fileList}
              styles={{
                root: {
                  border: `2px dashed ${uploadHover ? token.colorPrimary : token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                  background: uploadHover
                    ? `color-mix(in srgb, ${token.colorPrimary} 12%, ${token.colorFillAlter})`
                    : token.colorFillAlter,
                  padding: '32px 20px',
                  transition: 'border-color 0.3s ease, background 0.3s ease',
                },
              }}
              beforeUpload={(file) => {
                const isPdf =
                  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
                if (!isPdf) {
                  message.error('Please upload a PDF file only.')
                  return Upload.LIST_IGNORE
                }
                const okSize = file.size / 1024 / 1024 <= MAX_MB
                if (!okSize) {
                  message.error(`File must be ${MAX_MB}MB or smaller.`)
                  return Upload.LIST_IGNORE
                }
                return false
              }}
              onChange={({ fileList: fl }) => setFileList(fl)}
            >
              <p className="ant-upload-drag-icon" style={{ marginBottom: 12 }}>
                <span
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: token.colorBgContainer,
                    boxShadow: token.boxShadowTertiary,
                  }}
                >
                  <CloudUploadOutlined style={{ fontSize: 28, color: token.colorPrimary }} />
                </span>
              </p>
              <Text style={{ display: 'block', fontWeight: 700, color: token.colorText }}>
                Upload your resume (PDF only)
              </Text>
              <Text style={{ display: 'block', marginTop: 4, fontSize: 13, color: token.colorTextSecondary }}>
                Drag and drop your file here or{' '}
                <Text style={{ color: token.colorPrimary, fontWeight: 600 }}>browse files</Text>
              </Text>
              <Flex
                align="center"
                justify="center"
                gap={6}
                style={{
                  marginTop: 14,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: token.colorFillQuaternary,
                  alignSelf: 'center',
                }}
              >
                <InfoCircleOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: token.colorTextSecondary,
                  }}
                >
                  Maximum size: {MAX_MB}MB
                </Text>
              </Flex>
            </Upload.Dragger>
            </div>
          </div>
        </div>

        <div
          className="candidate-applyModalFooter"
          style={{
            padding: '20px 32px',
            background: token.colorFillQuaternary,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Flex gap={10} justify="flex-end" wrap>
            <Button size="large" onClick={handleCancel} style={{ fontWeight: 600, color: token.colorTextSecondary }}>
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              loading={submitting}
              onClick={handleSubmit}
              style={{
                fontWeight: 800,
                border: 'none',
                background: `linear-gradient(90deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
                boxShadow: `0 8px 24px color-mix(in srgb, ${token.colorPrimary} 28%, transparent)`,
              }}
            >
              Submit Application
            </Button>
          </Flex>
        </div>
      </div>
    </Modal>
  )
}
