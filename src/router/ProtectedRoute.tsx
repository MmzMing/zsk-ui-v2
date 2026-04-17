import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useUserStore } from '@/stores/user'

export function ProtectedRoute() {
  const { isLoggedIn } = useUserStore()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}