import { Modal, Button, Typography, Alert } from 'antd'
import { VideoCameraOutlined, AudioOutlined, WarningOutlined } from '@ant-design/icons'
import { useState } from 'react'

const { Text, Paragraph } = Typography

export interface InterviewPopupModalProps {
  open: boolean
  onClose: () => void
  onAccept: (stream: MediaStream) => void
}

export function InterviewPopupModal({ open, onClose, onAccept }: InterviewPopupModalProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleAccept = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      onAccept(stream)
    } catch (err: unknown) {
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'NotFoundError')) {
        setErrorMsg('Bạn cần cấp quyền truy cập Camera và Microphone để tiếp tục phỏng vấn.')
      } else {
        setErrorMsg('Không thể truy cập thiết bị. Vui lòng kiểm tra lại Camera/Microphone.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <VideoCameraOutlined style={{ color: '#1677ff' }} />
          <span>Bước Tiếp Theo: Phỏng Vấn Video AI</span>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Để sau
        </Button>,
        <Button key="accept" type="primary" onClick={handleAccept} loading={loading}>
          Accept & Tiếp tục
        </Button>,
      ]}
      centered
      maskClosable={false}
      closable={!loading}
    >
      <div style={{ padding: '16px 0' }}>
        <Paragraph>
          Chúc mừng bạn đã nộp CV thành công! Để tăng cơ hội trúng tuyển, bạn cần thực hiện một bài phỏng vấn ngắn với AI.
        </Paragraph>
        
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message="Lưu ý Quan Trọng"
          description={
            <Text>
              Hệ thống AI sẽ đánh giá cả kỹ năng giao tiếp, biểu cảm khuôn mặt và môi trường xung quanh. 
              <strong> Vui lòng đảm bảo ánh sáng tốt và nhìn thẳng vào camera.</strong>
            </Text>
          }
          style={{ marginBottom: 16 }}
        />

        <Paragraph>
          Khi nhấn <strong>"Accept & Tiếp tục"</strong>, hệ thống sẽ yêu cầu quyền truy cập <Text strong><VideoCameraOutlined /> Camera</Text> và <Text strong><AudioOutlined /> Microphone</Text>. Đây là yêu cầu <strong>bắt buộc</strong> để ghi hình phỏng vấn.
        </Paragraph>

        {errorMsg && (
          <Alert
            type="error"
            showIcon
            message="Lỗi Quyền Truy Cập"
            description={errorMsg}
            style={{ marginTop: 16 }}
          />
        )}
      </div>
    </Modal>
  )
}
