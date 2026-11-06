import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { auth } from '../lib/api.js';
import { staffSession } from '../lib/session.js';

function UnauthorizedListener({ storageRole, loginPath }) {
  const nav = useNavigate();
  useEffect(() => {
    const onUnauth = (event) => {
      if (event.detail?.role !== storageRole) return;
      nav(loginPath, {
        replace: true,
        state: { message: 'Your session has expired. Please sign in again.' },
      });
    };
    window.addEventListener('examrobo:unauthorized', onUnauth);
    return () => window.removeEventListener('examrobo:unauthorized', onUnauth);
  }, [storageRole, loginPath, nav]);
  return null;
}

/** UX-only route guard. The server enforces authorization on every request. */
export function RequireAuth({ storageRole, loginPath, children }) {
  const loc = useLocation();
  if (!auth.token(storageRole)) {
    return (
      <>
        <UnauthorizedListener storageRole={storageRole} loginPath={loginPath} />
        <Navigate to={loginPath} replace state={{ from: loc.pathname }} />
      </>
    );
  }
  return (
    <>
      <UnauthorizedListener storageRole={storageRole} loginPath={loginPath} />
      {children}
    </>
  );
}

export function StaffGuard({ children }) {
  return <RequireAuth storageRole="admin" loginPath="/login">{children}</RequireAuth>;
}

export function PlatformGuard({ children }) {
  return <RequireAuth storageRole="platform" loginPath="/platform/login">{children}</RequireAuth>;
}

export function OwnerOnly({ children }) {
  const session = staffSession();
  if (!session.isOwner) return <Navigate to="/403" replace />;
  return children;
}

export function ManagersOnly({ children }) {
  const session = staffSession();
  if (!session.canManage) return <Navigate to="/403" replace />;
  return children;
}
