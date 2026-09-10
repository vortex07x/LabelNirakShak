// src/components/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-dim)]">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/analytics" replace />
  }

  return children
}