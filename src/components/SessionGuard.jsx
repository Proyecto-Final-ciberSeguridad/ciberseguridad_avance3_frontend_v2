import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, refreshCurrentUser } from '../auth';
import { syncProgressFromServer } from '../progress';

export default function SessionGuard({ children }) {
  const [status, setStatus] = useState(getCurrentUser() ? 'checking' : 'unauthenticated');

  useEffect(() => {
    let active = true;
    if (status === 'unauthenticated') return undefined;
    refreshCurrentUser().then(async user => {
      if (!active) return;
      if(user) await syncProgressFromServer();
      if (!active) return;
      setStatus(user ? 'authenticated' : 'unauthenticated');
    });
    return () => { active = false; };
  }, []);

  if (status === 'checking') {
    return <div className="session-check"><div className="session-spinner"/><span>Validando sesión...</span></div>;
  }
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  return children;
}
