import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../components/Brand';
import { api, downloadAuthenticatedFile, getCurrentUser, logoutUser } from '../auth';
import { modules } from '../moduleData';

function formatDate(value){
  if(!value) return '—';
  try { return new Intl.DateTimeFormat('es-AR',{dateStyle:'long'}).format(new Date(value)); }
  catch { return '—'; }
}

export default function CertificatePage(){
  const nav=useNavigate();
  const user=getCurrentUser();
  const [status,setStatus]=useState(null);
  const [loading,setLoading]=useState(true);
  const [downloading,setDownloading]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    let active=true;
    api('/certificate/status')
      .then(data=>{ if(active) setStatus(data); })
      .catch(err=>{ if(active) setError(err.message); })
      .finally(()=>{ if(active) setLoading(false); });
    return ()=>{active=false};
  },[]);

  const available=Boolean(status?.available);
  const pending=status?.modules?.filter(m=>!m.completed) || [];
  const firstPending=pending[0]?.id || 1;

  async function download(){
    setDownloading(true);setError('');
    try{
      await downloadAuthenticatedFile('/certificate/pdf','certificado-santa-fe-capacita.pdf');
    }catch(err){setError(err.message)}
    finally{setDownloading(false)}
  }
  function logout(){logoutUser();nav('/login')}

  return <div className="dashboard-shell certificate-page-shell">
    <aside className="sidebar">
      <Brand compact />
      <nav className="side-nav">
        <button className="plain-nav" onClick={()=>nav('/inicio')}>⌂ <span>Inicio</span></button>
        <div className="nav-heading">▤ <span>Módulos</span></div>
        <div className="module-links">{Object.values(modules).map(m=><button key={m.id} onClick={()=>nav(`/modulos/${m.id}`)}><i className={status?.modules?.find(x=>x.id===m.id)?.completed?'done-dot':''}/><span><b>Módulo {m.id}</b><small>{m.title}</small></span></button>)}</div>
        <button className="plain-nav" onClick={()=>nav('/progreso')}>↗ <span>Mi progreso</span></button>
        <button className="plain-nav active" onClick={()=>nav('/certificado')}>♙ <span>Certificado</span></button>
      </nav>
      <div className="user-box"><div className="avatar">{user?.fullName?.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase() || 'US'}</div><div><strong>{user?.fullName || 'Usuario'}</strong><small>Agente Público Provincial</small></div><button className="logout" onClick={logout}>Cerrar sesión</button></div>
    </aside>

    <main className="certificate-main">
      <div className="progress-breadcrumb"><button onClick={()=>nav('/inicio')}>Inicio</button><span>›</span><b>Certificado</b></div>
      <section className="progress-heading-block"><h1>Certificado de finalización</h1><p>Consultá el estado de los requisitos y descargá el certificado cuando completes la capacitación.</p></section>

      {error && <div className="error-box certificate-error">{error}</div>}
      {loading ? <section className="certificate-gate-card"><p>Consultando el progreso de la capacitación…</p></section> : <>
        <section className={`certificate-gate-card ${available?'available':''}`}>
          <div className="certificate-gate-icon material-symbols-outlined">{available?'workspace_premium':'lock'}</div>
          <div>
            <span className="certificate-gate-state">{available?'CERTIFICADO HABILITADO':'CERTIFICADO AÚN NO DISPONIBLE'}</span>
            <h2>{available?'¡Capacitación completada!':'Todavía quedan requisitos por completar'}</h2>
            <p>{available?'Finalizaste los cuatro módulos de la capacitación. Ya podés generar y descargar tu certificado en PDF.':'Completá los módulos pendientes para habilitar automáticamente la descarga del certificado.'}</p>
          </div>
        </section>

        <section className="certificate-requirements">
          <div className="progress-section-title"><div><h2>Estado de finalización</h2><p>El certificado se habilita únicamente cuando los cuatro módulos están completos.</p></div><span>{status?.completedModules || 0} de 4 módulos completados</span></div>
          <div className="certificate-module-list">
            {(status?.modules || []).map(m=><article key={m.id} className={m.completed?'completed':''}>
              <span className="material-symbols-outlined">{m.completed?'check_circle':'radio_button_unchecked'}</span>
              <div><b>Módulo {m.id} — {m.title}</b><small>{m.completed?'Completado':`${m.completedResources} de ${m.totalResources} recursos completados`}</small></div>
              <strong>{m.completed?'Finalizado':'Pendiente'}</strong>
            </article>)}
          </div>
        </section>

        <section className={`certificate-preview-card ${available?'enabled':'locked'}`}>
          {!available && <div className="certificate-preview-overlay"><span className="material-symbols-outlined">lock</span><b>Vista previa bloqueada</b><small>Se habilitará al completar la capacitación.</small></div>}
          <div className="certificate-paper">
            <div className="certificate-paper-brand">Santa Fe Capacita</div>
            <div className="certificate-paper-rule"/>
            <h2>Certificado de finalización</h2>
            <p>Se deja constancia de que</p>
            <h3>{user?.fullName || 'Nombre del agente'}</h3>
            <p>DNI {user?.dni || '—'}</p>
            <p className="certificate-course-copy">ha completado la</p>
            <h4>Capacitación de ciberseguridad para empleados públicos de Santa Fe</h4>
            <div className="certificate-paper-modules">Introducción a la Seguridad Digital · Identificación de Riesgos · Detección y respuesta ante incidentes · Cierre y Verificación</div>
            <div className="certificate-paper-date"><small>Fecha de finalización</small><b>{available?formatDate(status?.completionDate):'Se completará automáticamente'}</b></div>
          </div>
        </section>

        <section className="certificate-actions-card">
          {available ? <>
            <div><h3>Tu certificado está disponible</h3><p>El archivo PDF se genera con los datos registrados en tu cuenta y la fecha real de finalización.</p></div>
            <button className="btn btn-primary" onClick={download} disabled={downloading}>{downloading?'Generando PDF…':'Descargar certificado en PDF'}</button>
          </> : <>
            <div><h3>Continuá con la capacitación</h3><p>Primer módulo pendiente: <b>Módulo {firstPending}</b>.</p></div>
            <button className="btn btn-primary" onClick={()=>nav(`/modulos/${firstPending}`)}>Continuar capacitación →</button>
          </>}
        </section>
      </>}
    </main>
  </div>
}
