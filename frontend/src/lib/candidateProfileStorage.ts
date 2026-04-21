export type CandidateProfile = {
  displayName: string
  email: string
  /** Public image URL or data URL */
  avatarUrl: string
  /** ISO timestamp — used for “password last changed” copy */
  passwordChangedAt: string
}

const STORAGE_KEY = 'ism_candidate_profile_v1'

const defaultAvatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBqusM5z_NjBEcsTIs6mQh7qOQAUAl5-WVjM-TD4wPvbwEevFZxmJ80gYF-Z-hUVlMCAXeBZemm31QUDKiT77wDNGiU0Ch09628GyuA1x-SK5-e826NEFNqZiltHYtxPvOgv9X9KxbuMh9C0WI-KAVsD5AQN7hFznNMLWTYWjNbWbfNymepmcj8sG90fDoVwhhhCa4G-XZ_rMvnfACDyA-RvHeiXVc2MfZPXigxnyziO33wnCz-AX8FHXtIQQvRJrHA2xJEiPfyLA'

const defaultProfile: CandidateProfile = {
  displayName: 'Alex Rivera',
  email: 'alex.rivera@editorial.talent',
  avatarUrl: defaultAvatar,
  passwordChangedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
}

function read(): CandidateProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultProfile }
    const parsed = JSON.parse(raw) as Partial<CandidateProfile>
    return {
      ...defaultProfile,
      ...parsed,
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : defaultProfile.displayName,
      email: typeof parsed.email === 'string' ? parsed.email : defaultProfile.email,
      avatarUrl: typeof parsed.avatarUrl === 'string' ? parsed.avatarUrl : defaultProfile.avatarUrl,
      passwordChangedAt:
        typeof parsed.passwordChangedAt === 'string' ? parsed.passwordChangedAt : defaultProfile.passwordChangedAt,
    }
  } catch {
    return { ...defaultProfile }
  }
}

function write(profile: CandidateProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function getCandidateProfile(): CandidateProfile {
  return read()
}

export function saveCandidateProfile(patch: Partial<CandidateProfile>) {
  const next = { ...read(), ...patch }
  write(next)
  return next
}

export function touchPasswordChanged() {
  saveCandidateProfile({ passwordChangedAt: new Date().toISOString() })
}
