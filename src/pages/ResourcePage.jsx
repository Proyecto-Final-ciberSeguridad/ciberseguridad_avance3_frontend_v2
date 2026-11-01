import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentUser, logoutUser } from '../auth';
import { getModuleProgress, setResourceCompleted } from '../progress';
import { getModule, getResource, getNextDestination } from '../moduleData';

const actionLabels={
  teoria:'Marcar como leído y continuar',
  video:'Marcar como visto y continuar',
  actividad:'Completar actividad y continuar',
  evaluacion:'Finalizar evaluación y continuar'
};

export default function ResourcePage(){
  const {id,resource}=useParams();
  const moduleId=Number(id);
  const nav=useNavigate();
  const user=getCurrentUser();
  const mod=getModule(moduleId);
  const info=getResource(moduleId,resource);
  const [done,setDone]=useState(()=>!!getModuleProgress(moduleId)[resource]);
  useEffect(()=>setDone(!!getModuleProgress(moduleId)[resource]),[moduleId,resource]);
  if(!mod || !info) return null;

  function logout(){logoutUser();nav('/login')}
  function completeAndContinue(){
    setResourceCompleted(moduleId,resource,true);
    setDone(true);
    const next=getNextDestination(moduleId,resource);
    nav(next.to);
  }
  function markPending(){setResourceCompleted(moduleId,resource,false);setDone(false)}
  const next=getNextDestination(moduleId,resource);
  const isTheory=info.stage==='teoria';

  return <div className="module-page">
    <header className="resource-topbar">
      <div className="mini-brand"><span className="mini-shield">◈</span><div><b>Santa Fe Capacita</b><small>Gobierno Provincial</small></div></div>
      <nav><Link to="/inicio">Inicio</Link><Link className="active" to="/inicio">Mis Cursos</Link><span>Evaluaciones</span></nav>
      <div className="resource-user"><span>{user?.fullName || 'Usuario'}</span><button onClick={logout}>Cerrar sesión</button></div>
    </header>
    <main className="resource-page-content">
      <Link className="back-link" to={`/modulos/${moduleId}`}>← Volver al Módulo {moduleId}</Link>
      <div className="resource-breadcrumb">Capacitación de ciberseguridad / Módulo {moduleId}: {mod.title} / {info.title}</div>
      <span className="module-badge">{moduleId===2 && info.code ? `Módulo 2 — Tema ${info.code}` : `Módulo ${moduleId} — ${mod.title}`}</span>
      <h1>{info.title}</h1>
      <p className="module-intro">{info.description}</p>

      <section className="resource-placeholder-card">
        <span className="material-symbols-outlined placeholder-icon">{info.icon}</span>
        <h2>{isTheory?'Contenido teórico preparado para integrar':'Recurso funcional preparado'}</h2>
        <p>{isTheory ? 'La estructura y el recorrido ya están implementados. En el siguiente paso incorporaremos aquí el contenido definitivo del documento teórico correspondiente.' : 'La navegación y el registro de avance ya funcionan. En el siguiente incremento incorporaremos el contenido interactivo definitivo de este recurso.'}</p>
        <div className="implementation-note"><strong>Flujo automático:</strong> cuando completes este recurso, se registrará el avance y se abrirá <b>{next.label}</b>.</div>
        <div className="resource-actions">
          <button className="btn btn-primary" onClick={completeAndContinue}>{done?'Continuar al siguiente recurso':actionLabels[info.stage] || 'Completar y continuar'} →</button>
          {done && <button className="btn btn-outline" onClick={markPending}>Marcar nuevamente como pendiente</button>}
        </div>
      </section>
    </main>
  </div>
}
