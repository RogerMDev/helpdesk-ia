import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RequireAdmin({ children }) {
  const { isAuthenticated, isReady, user } = useAuth()
  const location = useLocation()

  if (!isReady) return null

  const roleId =
    user?.roleId ??
    user?.user_roles_id_fk ??
    user?.user_role_id_pk ??
    user?.role ??
    user?.user_role

  const isAdmin = String(roleId) === '1' || user?.role === 'admin'

  if (!isAuthenticated || !isAdmin) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  return children
}
