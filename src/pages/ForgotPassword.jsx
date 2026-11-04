import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import { requestPasswordReset } from '../auth';

export default function ForgotPassword(){
  const [email,setEmail]=useState('');
  const [error,setError]=useState('');
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);

  async function submit(e){
    e.preventDefault();
    setError('');
    if(!email.trim()) return setError('Ingresá tu correo institucional.');
    if(!email.trim().toLowerCase().endsWith('@santafe.gov.ar')) return setError('Ingresá un correo institucional terminado en @santafe.gov.ar.');
    setLoading(true);
    try{
      const body=await requestPasswordReset(email);
      setResult(body);
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }

  return <div className="page public-page">
    <PublicHeader backTo="/login" backLabel="Volver a iniciar sesión" />
    <main className="auth-main">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-icon"><span className="material-symbols-outlined">key</span></div>
        {!result ? <>
          <h1>Olvidé mi contraseña</h1>
          <p>Ingresá tu correo institucional para recibir las instrucciones de recuperación.</p>
          <label><span>Correo institucional <b>*</b></span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nombre.apellido@santafe.gov.ar" /></label>
          {error && <div className="error-box">{error}</div>}
          <button className="btn btn-primary full" disabled={loading}>{loading?'Generando recuperación...':'Enviar instrucciones'}</button>
          <div className="auth-bottom"><Link to="/login">← Volver a iniciar sesión</Link></div>
        </> : <>
          <h1>Revisá tu correo</h1>
          <p>Si existe una cuenta asociada al correo ingresado, recibirás las instrucciones para restablecer tu contraseña.</p>
          <Link className="btn btn-primary full" to="/login">Volver a iniciar sesión</Link>
        </>}
      </form>
    </main>
  </div>
}
