import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import { loginUser } from '../auth';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) return setError('Completá correo institucional y contraseña.');
    if (!email.trim().toLowerCase().endsWith('@santafe.gov.ar')) return setError('Ingresá tu correo institucional @santafe.gov.ar.');
    setLoading(true);
    try {
      await loginUser(email, password);
      nav('/inicio');
    } catch (err) {
      if (err?.status === 401) {
        setError('Correo o contraseña incorrectos.');
      } else if (err?.kind === 'network' || err?.kind === 'service' || err?.status >= 500) {
        setError('No pudimos conectarnos al servicio de acceso. Verificá que el servidor esté disponible e intentá nuevamente.');
      } else {
        setError(err?.message || 'No se pudo iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page public-page">
      <PublicHeader backTo="/" backLabel="Volver a la presentación" />
      <main className="auth-main">
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-icon"><span className="material-symbols-outlined">lock_person</span></div>
          <h1>Iniciar sesión</h1>
          <p>Ingresá tus datos para continuar con tu capacitación.</p>
          <label>Correo institucional <b>*</b>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nombre.apellido@santafe.gov.ar" autoComplete="email" />
          </label>
          <label>Contraseña <b>*</b>
            <div className="password-wrap">
              <input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Ingresá tu contraseña" autoComplete="current-password" />
              <button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label="Mostrar u ocultar contraseña"><span className="material-symbols-outlined">visibility</span></button>
            </div>
          </label>
          <div className="forgot-row"><Link to="/olvide-contrasena">¿Olvidaste tu contraseña?</Link></div>
          {error && <div className="error-box">{error}</div>}
          <button className="btn btn-primary full" disabled={loading}>{loading?'Validando...':'Ingresar →'}</button>
          <div className="auth-separator" />
          <div className="auth-bottom">¿Todavía no tenés una cuenta? <Link to="/registro">Registrate</Link></div>
        </form>
      </main>
    </div>
  );
}
