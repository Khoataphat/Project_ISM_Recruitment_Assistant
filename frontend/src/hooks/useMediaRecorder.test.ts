import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMediaRecorder } from './useMediaRecorder'

describe('useMediaRecorder hook', () => {
  let mockGetUserMedia: any
  
  beforeEach(() => {
    // Mock navigator.mediaDevices.getUserMedia
    mockGetUserMedia = vi.fn().mockResolvedValue({})
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      writable: true
    })

    // Mock MediaRecorder
    class MockMediaRecorder {
      state = 'inactive'
      start() { this.state = 'recording'; if (this.onstart) this.onstart(new Event('start')) }
      stop() { this.state = 'inactive'; if (this.onstop) this.onstop(new Event('stop')) }
      ondataavailable: any = null
      onstop: any = null
      onstart: any = null
      static isTypeSupported() { return true }
    }
    
    ;(window as any).MediaRecorder = MockMediaRecorder
    
    // Mock URL.createObjectURL and URL.revokeObjectURL
    URL.createObjectURL = vi.fn(() => 'mock-url')
    URL.revokeObjectURL = vi.fn()
  })

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useMediaRecorder())
    expect(result.current.status).toBe('idle')
    expect(result.current.mediaBlobUrl).toBeNull()
  })

  it('should change status to recording after startRecording', async () => {
    const { result } = renderHook(() => useMediaRecorder())
    
    const mockStream = { getTracks: () => [] } as unknown as MediaStream
    
    act(() => {
      result.current.startRecording(mockStream)
    })
    
    expect(result.current.status).toBe('recording')
    expect(result.current.stream).toBe(mockStream)
  })

  it('should change status to stopped after stopRecording and create blob url', () => {
    const { result } = renderHook(() => useMediaRecorder())
    const mockStream = { getTracks: () => [] } as unknown as MediaStream
    
    act(() => {
      result.current.startRecording(mockStream)
    })
    expect(result.current.status).toBe('recording')
    
    act(() => {
      result.current.stopRecording()
    })
    
    expect(result.current.status).toBe('stopped')
    expect(result.current.mediaBlobUrl).toBe('mock-url')
  })

  it('should clear blob when resetRecording is called', () => {
    const { result } = renderHook(() => useMediaRecorder())
    const mockStream = { getTracks: () => [] } as unknown as MediaStream
    
    act(() => {
      result.current.startRecording(mockStream)
      result.current.stopRecording()
    })
    
    expect(result.current.mediaBlobUrl).toBe('mock-url')
    
    act(() => {
      result.current.resetRecording()
    })
    
    expect(result.current.status).toBe('idle')
    expect(result.current.mediaBlobUrl).toBeNull()
  })
})
