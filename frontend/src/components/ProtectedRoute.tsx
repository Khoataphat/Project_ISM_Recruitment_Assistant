import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

type ProtectedRouteProps = {
  /** e.g. ['HR'] or ['CANDIDATE'] */
  allowedRoles?: string[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  const userRole = user.role // 'HR' | 'CANDIDATE'

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Role mismatch — redirect to their correct home
    if (userRole === 'HR') {
      return <Navigate to="/hr/dashboard" replace />
    }
    // 'CANDIDATE'
    return <Navigate to="/candidate/jobs" replace />
  }

  return <Outlet />
}
