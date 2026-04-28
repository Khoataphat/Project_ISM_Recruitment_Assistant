import { createContext, useContext } from 'react'

export type UserRole = 'HR' | 'CANDIDATE'

export type AuthUser = {
  id: string
  email: string
  role: UserRole
  full_name: string
  profile_id?: string
}

type AuthContextType = {
  user: AuthUser | null
  token: string | null
  login: (user: AuthUser, token: string) => void
  logout: () => void
  isAuthenticated: boolean
  isHR: boolean
  isCandidate: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
