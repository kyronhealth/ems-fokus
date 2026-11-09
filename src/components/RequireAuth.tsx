import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, user } = useAuth();
  const loc = useLocation();
  if (!ready) return <p className="muted view">Lädt …</p>;
  if (!user) return <Navigate to={`/anmelden?next=${encodeURIComponent(loc.pathname)}`} replace />;
  return <>{children}</>;
}
