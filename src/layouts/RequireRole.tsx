import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { canAccess, homeFor, type Resource } from '@/lib/access';

/**
 * Single gate for every authenticated route. Unauthenticated visitors go to
 * sign-in; a signed-in user without access is redirected to their own home
 * rather than shown an empty screen.
 */
export function RequireRole({ resource }: { resource: Resource }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!canAccess(user.role, resource)) {
    return <Navigate to={homeFor(user.role)} replace />;
  }

  return <Outlet />;
}
