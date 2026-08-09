// src/auth/RequireAuth.jsx
//
// C.1 Unauthorized Access Protection. Wraps every protected route; redirects
// to /login (preserving the intended destination) if there's no valid
// session, and shows a lightweight loading state while the session-restore
// check (AuthContext) is still in flight -- so a logged-in admin refreshing
// the page never sees a flash of the login screen first.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
        Checking session…
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
