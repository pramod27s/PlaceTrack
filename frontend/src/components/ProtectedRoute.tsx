import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth'

/** Gate for authenticated routes — redirects to /login when there is no session. */
export function ProtectedRoute() {
  const isAuthenticated = useAuth((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
