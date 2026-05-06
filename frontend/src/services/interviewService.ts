export interface InterviewQuestion {
  id: string
  content: string
}

/**
 * Mock API to fetch interview questions
 */
export async function getInterviewQuestions(jobId: string): Promise<InterviewQuestion[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 'q1', content: 'Please introduce yourself and your background.' },
        { id: 'q2', content: 'Why are you interested in this position?' },
        { id: 'q3', content: 'Describe a challenging project you worked on and how you handled it.' },
      ])
    }, 1000)
  })
}

/**
 * Mock API to upload the interview video
 */
export async function submitInterviewVideo(jobId: string, videoBlob: Blob): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Uploaded video for job ${jobId}. Size: ${videoBlob.size} bytes.`)
      resolve({ success: true, message: 'Interview submitted successfully.' })
    }, 2000)
  })
}
