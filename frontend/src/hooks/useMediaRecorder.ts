import { useState, useRef, useCallback } from 'react'

export type MediaRecorderStatus = 'idle' | 'recording' | 'stopped' | 'error'

export function useMediaRecorder() {
  const [status, setStatus] = useState<MediaRecorderStatus>('idle')
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaChunksRef = useRef<Blob[]>([])

  const startRecording = useCallback((providedStream: MediaStream) => {
    setError(null)
    try {
      setStream(providedStream)

      // Check supported MIME types for recording
      let options = { mimeType: 'video/webm' }
      if (!MediaRecorder.isTypeSupported('video/webm')) {
         options = { mimeType: '' } // fallback to default
      }

      const recorder = new MediaRecorder(providedStream, options)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          mediaChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(mediaChunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setMediaBlobUrl(url)
        setStatus('stopped')
      }

      mediaChunksRef.current = [] // reset chunks
      recorder.start()
      setStatus('recording')
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'))
      setStatus('error')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const resetRecording = useCallback(() => {
    if (mediaBlobUrl) {
      URL.revokeObjectURL(mediaBlobUrl)
      setMediaBlobUrl(null)
    }
    mediaChunksRef.current = []
    setStatus('idle')
  }, [mediaBlobUrl])
  
  const getBlob = useCallback(() => {
    if (mediaChunksRef.current.length === 0) return null
    return new Blob(mediaChunksRef.current, { type: 'video/webm' })
  }, [])

  return {
    status,
    mediaBlobUrl,
    error,
    stream,
    startRecording,
    stopRecording,
    resetRecording,
    getBlob
  }
}
