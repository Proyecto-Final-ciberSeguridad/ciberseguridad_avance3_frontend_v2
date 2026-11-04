import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import { registerUser } from '../auth';

export default function Register() {
  const [form, setForm] = useState({ fullName:'', dni:'', email:'', password:'', confirm:'' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));

  async function submit(e){
    e.preventDefault();
    setError('');
    setCreated(null);
    if (!form.fullName.trim() || !form.dni.trim() || !form.email.trim() || !form.password || !form.confirm) return setError('Completá todos los campos obligatorios.');
    if (!/^\d{7,9}$/.test(form.dni.trim())) return setError('El DNI debe contener entre 7 y 9 números.');
    if (!form.email.trim().toLowerCase().endsWith('@santafe.gov.ar')) return setError('Ingresá un correo institucional terminado en @santafe.gov.ar.');
    if (form.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden.');
    setLoading(true);
    try {
      const user = await registerUser(form);
      setCreated(user);
    } catch(err){
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page public-page">
      <PublicHeader backTo="/" backLabel="Volver a la presentación" />
      <main className="auth-main register-main">
        <form className="auth-card register-card" onSubmit={submit}>
          <div className="eyebrow left">PORTAL DEL SERVIDOR PÚBLICO</div>
          <h1>Crear una cuenta</h1>
          <p>Completá tus datos para registrarte en la plataforma.</p>
          <label><span>Nombre completo <b>*</b></span><input value={form.fullName} onChange={e=>set('fullName',e.target.value)} placeholder="Nombre y apellido" autoComplete="name" /></label>
          <label><span>DNI <b>*</b></span><input inputMode="numeric" value={form.dni} onChange={e=>set('dni',e.target.value.replace(/\D/g,''))} placeholder="Solo números" /></label>
          <label><span>Correo electrónico institucional <b>*</b></span><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="nombre.apellido@santafe.gov.ar" autoComplete="email" /></label>
          <div className="info-box">ⓘ Este correo será tu credencial de acceso a Santa Fe Capacita.</div>
          <label><span>Contraseña <b>*</b></span><div className="password-wrap"><input type={showPassword?'text':'password'} value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password"/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label="Mostrar u ocultar contraseña"><span className="material-symbols-outlined">visibility</span></button></div></label>
          <label><span>Confirmar contraseña <b>*</b></span><div className="password-wrap"><input type={showConfirm?'text':'password'} value={form.confirm} onChange={e=>set('confirm',e.target.value)} placeholder="Repetí la contraseña" autoComplete="new-password"/><button type="button" onClick={()=>setShowConfirm(v=>!v)} aria-label="Mostrar u ocultar confirmación"><span className="material-symbols-outlined">visibility</span></button></div></label>
          {error && <div className="error-box">{error}</div>}
          {created && <div className="success-box"><strong>Registro realizado correctamente.</strong><span>La cuenta quedó asociada a <b>{created.email}</b>. Ahora iniciá sesión con ese correo y la contraseña que elegiste.</span><Link className="btn btn-primary full" to="/login">Ir a iniciar sesión</Link></div>}
          {!created && <button className="btn btn-primary full" disabled={loading}>{loading?'Creando cuenta...':'Registrarme →'}</button>}
          <div className="auth-bottom">¿Ya tenés una cuenta? <Link to="/login">Iniciar sesión</Link></div>
        </form>
      </main>
    </div>
  );
}
