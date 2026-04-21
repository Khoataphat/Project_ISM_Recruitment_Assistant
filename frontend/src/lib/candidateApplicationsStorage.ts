import { getCandidateProfile } from '@/lib/candidateProfileStorage'

export type ApplicationStatus = 'applied' | 'interviewing' | 'under_review' | 'closed'

export type StoredJobApplication = {
  id: string
  jobId: string
  jobTitle: string
  company: string
  logoUrl: string
  appliedAt: string
  status: ApplicationStatus
  resumeFileName: string
  /** data:application/pdf;base64,... for download / open in new tab */
  resumeDataUrl: string
  /** Snapshot from profile at apply time (optional for legacy rows) */
  applicantDisplayName?: string
  applicantEmail?: string
  applicantAvatarUrl?: string
}

const STORAGE_KEY = 'ism_candidate_job_applications_v1'

function readRaw(): StoredJobApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is StoredJobApplication =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as StoredJobApplication).id === 'string' &&
        typeof (x as StoredJobApplication).resumeDataUrl === 'string',
    )
  } catch {
    return []
  }
}

function writeRaw(list: StoredJobApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function listJobApplications(): StoredJobApplication[] {
  return readRaw().sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
}

export function getJobApplicationById(id: string | undefined): StoredJobApplication | undefined {
  if (!id) return undefined
  return readRaw().find((a) => a.id === id)
}

export function updateJobApplicationStatus(id: string, status: ApplicationStatus): StoredJobApplication | undefined {
  const list = readRaw()
  let next: StoredJobApplication | undefined
  const mapped = list.map((a) => {
    if (a.id === id) {
      next = { ...a, status }
      return next
    }
    return a
  })
  if (!next) return undefined
  writeRaw(mapped)
  return next
}

export function addJobApplication(
  entry: Omit<StoredJobApplication, 'id' | 'appliedAt'> & {
    appliedAt?: string
    applicantDisplayName?: string
    applicantEmail?: string
    applicantAvatarUrl?: string
  },
) {
  const profile = getCandidateProfile()
  const list = readRaw()
  const row: StoredJobApplication = {
    ...entry,
    applicantDisplayName: entry.applicantDisplayName ?? profile.displayName,
    applicantEmail: entry.applicantEmail ?? profile.email,
    applicantAvatarUrl: entry.applicantAvatarUrl ?? profile.avatarUrl,
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    appliedAt: entry.appliedAt ?? new Date().toISOString(),
  }
  writeRaw([row, ...list])
  return row
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
