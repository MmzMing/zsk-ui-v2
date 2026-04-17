import { Outlet, Navigate } from 'react-router-dom'
import { useUserStore } from '@/stores/user'

export function PublicRoute() {
  const { isLoggedIn } = useUserStore()

  if (isLoggedIn) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}