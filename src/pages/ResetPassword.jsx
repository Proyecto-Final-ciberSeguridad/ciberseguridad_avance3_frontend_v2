import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import { resetPassword } from '../auth';

export default function ResetPassword(){
  const [params]=useSearchParams();
  const token=useMemo(()=>params.get('token')||'',[params]);
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [show,setShow]=useState(false);
  const [error,setError]=useState('');
  const [done,setDone]=useState(false);
  const [loading,setLoading]=useState(false);

  async function submit(e){
    e.preventDefault();
    setError('');
    if(!token) return setError('El enlace de recuperación no contiene un token válido.');
    if(password.length<8) return setError('La nueva contraseña debe tener al menos 8 caracteres.');
    if(password!==confirm) return setError('Las contraseñas no coinciden.');
    setLoading(true);
    try{await resetPassword(token,password);setDone(true)}catch(err){setError(err.message)}finally{setLoading(false)}
  }

  return <div className="page public-page">
    <PublicHeader backTo="/login" backLabel="Volver a iniciar sesión" />
    <main className="auth-main">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-icon"><span className="material-symbols-outlined">password</span></div>
        {!done ? <>
          <h1>Crear nueva contraseña</h1>
          <p>Definí una nueva contraseña para tu cuenta.</p>
          <label><span>Nueva contraseña <b>*</b></span><div className="password-wrap"><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 8 caracteres"/><button type="button" onClick={()=>setShow(v=>!v)}><span className="material-symbols-outlined">visibility</span></button></div></label>
          <label><span>Confirmar nueva contraseña <b>*</b></span><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repetí la nueva contraseña"/></label>
          {error && <div className="error-box">{error}</div>}
          <button className="btn btn-primary full" disabled={loading}>{loading?'Actualizando...':'Guardar nueva contraseña'}</button>
        </> : <>
          <h1>Contraseña actualizada</h1>
          <div className="success-box"><strong>El cambio se realizó correctamente.</strong><span>Ya podés ingresar con tu correo institucional y la nueva contraseña.</span></div>
          <Link className="btn btn-primary full" to="/login">Ir a iniciar sesión</Link>
        </>}
      </form>
    </main>
  </div>
}
