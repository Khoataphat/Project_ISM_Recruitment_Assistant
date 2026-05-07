import { apiClient } from '@/lib/api'

export interface InterviewQuestion {
  id: string
  content: string
}

/**
 * API to fetch interview questions
 */
export async function getInterviewQuestions(jobId: string): Promise<InterviewQuestion[]> {
  const response = await apiClient.get(`/ai-interview/questions/${jobId}`)
  return response.data?.data || []
}

/**
 * API to upload the interview video
 */
export async function submitInterviewVideo(applicationId: string, videoBlob: Blob): Promise<{ success: boolean; message: string }> {
  const formData = new FormData()
  // Add applicationId which is expected by the backend multer config
  formData.append('applicationId', applicationId)
  // Use "video" key to match upload.single("video") in backend
  formData.append('video', videoBlob, 'interview.webm')

  // Let browser automatically set Content-Type with correct boundary
  const response = await apiClient.post('/ai-interview/submit', formData)
  return response.data
}
