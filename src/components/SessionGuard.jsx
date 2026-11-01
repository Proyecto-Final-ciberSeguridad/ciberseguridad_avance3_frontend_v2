import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, refreshCurrentUser } from '../auth';
import { syncProgressFromServer } from '../progress';

export default function SessionGuard({ children }) {
  const [status, setStatus] = useState(getCurrentUser() ? 'checking' : 'unauthenticated');
  const [serviceMessage, setServiceMessage] = useState('');

  useEffect(() => {
    let active = true;
    if (status === 'unauthenticated') return undefined;

    (async () => {
      try {
        const user = await refreshCurrentUser();
        if (!active) return;
        if (!user) {
          setStatus('unauthenticated');
          return;
        }
        try {
          await syncProgressFromServer();
        } catch {
          // Una falla al sincronizar progreso no invalida la sesión del usuario.
        }
        if (!active) return;
        setStatus('authenticated');
      } catch (err) {
        if (!active) return;
        setServiceMessage(err?.message || 'No pudimos validar tu sesión porque el servicio no está disponible.');
        setStatus('service-error');
      }
    })();

    return () => { active = false; };
  }, []);

  if (status === 'checking') {
    return <div className="session-check"><div className="session-spinner"/><span>Validando sesión...</span></div>;
  }

  if (status === 'service-error') {
    return (
      <main className="auth-main">
        <section className="auth-card">
          <div className="auth-icon"><span className="material-symbols-outlined">cloud_off</span></div>
          <h1>Servicio temporalmente no disponible</h1>
          <p>{serviceMessage}</p>
          <div className="info-box">Tu sesión no fue eliminada. Cuando el servicio vuelva a estar disponible, podés reintentar y continuar donde estabas.</div>
          <button className="btn btn-primary full" onClick={() => window.location.reload()}>Reintentar</button>
        </section>
      </main>
    );
  }

  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  return children;
}
