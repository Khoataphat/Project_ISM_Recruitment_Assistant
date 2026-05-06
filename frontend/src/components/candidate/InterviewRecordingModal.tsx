import { useState, useEffect, useRef } from 'react'
import { Modal, Button, Typography, Spin, Alert, Flex, Space, message } from 'antd'
import { VideoCameraOutlined, SendOutlined } from '@ant-design/icons'
import { useMediaRecorder } from '@/hooks/useMediaRecorder'
import { getInterviewQuestions, submitInterviewVideo, type InterviewQuestion } from '@/services/interviewService'

const { Title, Text, Paragraph } = Typography

export interface InterviewRecordingModalProps {
  open: boolean
  jobId: string
  stream: MediaStream | null
  onClose: () => void
  onComplete: () => void
}

const MAX_RECORDING_TIME = 180 // 3 minutes in seconds

export function InterviewRecordingModal({ open, jobId, stream, onClose, onComplete }: InterviewRecordingModalProps) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [timeLeft, setTimeLeft] = useState(MAX_RECORDING_TIME)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const { status, mediaBlobUrl, startRecording, stopRecording, getBlob, resetRecording } = useMediaRecorder()

  // Bind stream to video element
  useEffect(() => {
    if (videoRef.current && stream && !mediaBlobUrl) {
      videoRef.current.srcObject = stream
    }
  }, [stream, mediaBlobUrl, open])

  // Fetch questions
  useEffect(() => {
    if (open && jobId) {
      setLoadingQuestions(true)
      getInterviewQuestions(jobId).then((data) => {
        setQuestions(data)
        setLoadingQuestions(false)
      }).catch(() => {
        message.error('Không thể tải câu hỏi phỏng vấn.')
        setLoadingQuestions(false)
      })
    }
  }, [open, jobId])

  // Timer logic
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (status === 'recording' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && status === 'recording') {
      stopRecording()
    }
    return () => clearInterval(timer)
  }, [status, timeLeft, stopRecording])

  const handleStart = () => {
    if (!stream) {
      message.error('Chưa có quyền truy cập camera/microphone')
      return
    }
    resetRecording()
    setTimeLeft(MAX_RECORDING_TIME)
    startRecording(stream)
  }

  const handleStop = () => {
    stopRecording()
  }

  const handleSubmit = async () => {
    const blob = getBlob()
    if (!blob) {
      message.error('Không tìm thấy dữ liệu video. Vui lòng ghi hình lại.')
      return
    }
    // Check size <= 25MB
    if (blob.size > 25 * 1024 * 1024) {
      message.error('Dung lượng video vượt quá 25MB. Vui lòng ghi hình lại ngắn hơn.')
      return
    }

    setIsSubmitting(true)
    try {
      await submitInterviewVideo(jobId, blob)
      message.success('Gửi video phỏng vấn thành công!')
      onComplete()
    } catch (err) {
      message.error('Có lỗi xảy ra khi gửi video.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleRetake = () => {
    resetRecording()
    setTimeLeft(MAX_RECORDING_TIME)
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <Modal
      open={open}
      onCancel={status === 'recording' || isSubmitting ? undefined : onClose}
      title={
        <Space>
          <VideoCameraOutlined style={{ color: '#1677ff' }} />
          <span>Phỏng Vấn AI</span>
        </Space>
      }
      footer={null}
      width={1000}
      centered
      maskClosable={false}
      closable={status !== 'recording' && !isSubmitting}
      destroyOnClose
    >
      <Flex gap={24} align="flex-start" style={{ marginTop: 16 }}>
        {/* Left side: Video & Controls */}
        <Flex vertical gap={16} style={{ flex: 1 }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: 8, overflow: 'hidden' }}>
            {mediaBlobUrl ? (
              <video src={mediaBlobUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <video 
                ref={(node) => {
                  videoRef.current = node;
                  if (node && stream && !mediaBlobUrl && node.srcObject !== stream) {
                    node.srcObject = stream;
                  }
                }} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
              />
            )}
            
            {status === 'recording' && (
              <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,0,0,0.8)', color: '#fff', padding: '4px 12px', borderRadius: 16, fontWeight: 'bold' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff', marginRight: 8, animation: 'blink 1s infinite' }} />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>

          <Flex justify="center" gap={12}>
            {status === 'idle' && !mediaBlobUrl && (
              <Button type="primary" size="large" onClick={handleStart} icon={<VideoCameraOutlined />}>
                Bắt đầu Ghi Hình
              </Button>
            )}
            {status === 'recording' && (
              <Button danger type="primary" size="large" onClick={handleStop}>
                Dừng Ghi Hình
              </Button>
            )}
            {status === 'stopped' && mediaBlobUrl && (
              <>
                <Button size="large" onClick={handleRetake} disabled={isSubmitting}>
                  Ghi hình lại
                </Button>
                <Button type="primary" size="large" onClick={handleSubmit} loading={isSubmitting} icon={<SendOutlined />}>
                  Gửi Phỏng Vấn
                </Button>
              </>
            )}
          </Flex>
          
          <style>{`
            @keyframes blink {
              0% { opacity: 1; }
              50% { opacity: 0; }
              100% { opacity: 1; }
            }
          `}</style>
        </Flex>

        {/* Right side: Questions */}
        <div style={{ width: 320 }}>
          <Title level={5}>Danh sách câu hỏi:</Title>
          {loadingQuestions ? (
            <Flex justify="center" style={{ padding: 40 }}>
              <Spin />
            </Flex>
          ) : (
            <Flex vertical gap={12}>
              {questions.map((q, idx) => (
                <div key={q.id} style={{ padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                  <Text strong>Câu {idx + 1}:</Text>
                  <Paragraph style={{ margin: 0, marginTop: 4 }}>{q.content}</Paragraph>
                </div>
              ))}
            </Flex>
          )}
          <Alert 
            type="info" 
            showIcon 
            message="Hướng dẫn" 
            description="Hãy trả lời lần lượt các câu hỏi trên. Video tối đa 3 phút. Kích thước file tối đa 25MB." 
            style={{ marginTop: 16 }}
          />
        </div>
      </Flex>
    </Modal>
  )
}
