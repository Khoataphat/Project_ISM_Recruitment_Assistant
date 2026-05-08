import { useState } from 'react'
import type { ReactNode } from 'react'

import { AuthContext } from '@/context/AuthContext'
import type { AuthUser } from '@/context/AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? (JSON.parse(storedUser) as AuthUser) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken') || null
  })

  const login = (newUser: AuthUser, newToken: string) => {
    setUser(newUser)
    setToken(newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    localStorage.setItem('accessToken', newToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isHR: user?.role === 'HR',
        isCandidate: user?.role === 'CANDIDATE',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
