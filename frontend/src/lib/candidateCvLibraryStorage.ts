import { fileToDataUrl } from '@/lib/candidateApplicationsStorage'

export type LibraryCv = {
  id: string
  fileName: string
  uploadedAt: string
  dataUrl: string
}

const STORAGE_KEY = 'ism_candidate_cv_library_v1'

function read(): LibraryCv[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is LibraryCv =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as LibraryCv).id === 'string' &&
        typeof (x as LibraryCv).dataUrl === 'string',
    )
  } catch {
    return []
  }
}

function write(list: LibraryCv[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function listLibraryCvs(): LibraryCv[] {
  return read().sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
}

export async function addLibraryCv(file: File) {
  const dataUrl = await fileToDataUrl(file)
  const row: LibraryCv = {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    fileName: file.name,
    uploadedAt: new Date().toISOString(),
    dataUrl,
  }
  write([row, ...read()])
  return row
}
