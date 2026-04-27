import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

type ProtectedRouteProps = {
  allowedRoles?: string[];
};

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase();

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'hr') {
      return <Navigate to="/hr/dashboard" replace />;
    } else if (userRole === 'candidate') {
      return <Navigate to="/candidate/jobs" replace />;
    }
    // Default fallback
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
