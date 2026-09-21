// Route guard — redirects to /login when the user lacks an allowed role.

import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Role } from '../types'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { role } = useAuth()
  const location = useLocation()

  if (!role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (!allow.includes(role)) {
    // Logged in but wrong area — send to the area that fits their role.
    return <Navigate to={role === 'investor' ? '/portal' : '/admin'} replace />
  }
  return <>{children}</>
}
