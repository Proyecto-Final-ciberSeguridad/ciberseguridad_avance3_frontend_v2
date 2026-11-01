import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentUser, logoutUser } from '../auth';
import { moduleStats } from '../progress';
import { getModule } from '../moduleData';

export default function ModulePage(){
  const {id}=useParams();
  const moduleId=Number(id);
  const nav=useNavigate();
  const user=getCurrentUser();
  const mod=getModule(moduleId);
  const [stats,setStats]=useState(()=>moduleStats(moduleId));

  useEffect(()=>{
    const refresh=()=>setStats(moduleStats(moduleId));
    refresh();
    window.addEventListener('sf-progress-updated', refresh);
    window.addEventListener('storage', refresh);
    return ()=>{window.removeEventListener('sf-progress-updated',refresh);window.removeEventListener('storage',refresh)};
  },[moduleId]);

  function logout(){logoutUser();nav('/login');}
  if(!mod) return null;

  const theoryTopics=mod.theoryTopics || [];
  const regularResources=mod.resources || [];

  return <div className="module-page">
    <Header user={user} onLogout={logout}/>
    <main className="module-content module1-content">
      <section className="module-summary-card">
        <div>
          <span className="module-badge">MÓDULO {moduleId}</span>
          <h1>{mod.title}</h1>
          <p className="module-intro">{mod.subtitle}</p>
          {moduleId===2 && <p className="module-structure-note">Este módulo reúne seis temas de identificación de riesgos. Los temas 2.a a 2.f forman parte del mismo Módulo 2 y se recorren de manera secuencial.</p>}
        </div>
        <div className="module-progress-box">
          <div className="progress-heading"><span>◴ Progreso del módulo:</span><strong>{stats.percent}% completado</strong></div>
          <div className="progress-track"><div className="progress-fill" style={{width:`${stats.percent}%`}}/></div>
          <div className="progress-bottom"><span>Progreso guardado</span><strong>{stats.completed} de {stats.total} recursos completados</strong></div>
        </div>
      </section>

      <section className="module-content-card">
        <div className="module-content-heading">
          <div><h2>Recorrido del módulo</h2><p>Al completar cada recurso, la plataforma te llevará automáticamente al siguiente. Todos los módulos continúan habilitados desde el panel principal.</p></div>
          <div className="state-legend"><span><i className="dot pending"/>Pendiente</span><span><i className="dot done"/>Completado</span></div>
        </div>
        <div className="step-row">
          {stats.stages.map((s,index)=><div key={s.key} className={`step-item ${s.done?'done':''}`}>
            <span className="step-icon">{s.done?'✓':'○'}</span>
            <div><b>{index+1}. {s.label}</b><small>{s.key==='teoria' && s.count>1 ? `${s.completed} de ${s.count} temas` : s.done?'Completado':'Pendiente'}</small></div>
          </div>)}
        </div>
      </section>

      {theoryTopics.length>0 && <section className="module-two-section">
        <div className="subsection-heading"><div><span className="module-badge">PASO 1</span><h2>Material teórico — temas del Módulo 2</h2><p>Los seis contenidos pertenecen al mismo módulo. Al marcar un tema como leído, se abrirá automáticamente el siguiente.</p></div><strong>{stats.stages.find(s=>s.key==='teoria')?.completed || 0} / {theoryTopics.length}</strong></div>
        <div className="theory-topic-grid">
          {theoryTopics.map((r,index)=><TheoryCard key={r.key} resource={r} done={stats.progress[r.key]} index={index}/>) }
        </div>
      </section>}

      <section className={`resource-grid module1-grid ${theoryTopics.length?'module2-final-resources':''}`}>
        {regularResources.map((r,index)=><ResourceCard key={r.key} moduleId={moduleId} resource={r} done={stats.progress[r.key]} step={theoryTopics.length ? index+2 : r.step}/>) }
      </section>
    </main>
  </div>
}

function TheoryCard({resource,done,index}){
  return <article className={`theory-topic-card ${done?'resource-done':''}`}>
    <div className="topic-code">{resource.code}</div>
    <div className="resource-icon"><span className="material-symbols-outlined">{resource.icon}</span></div>
    <div className="topic-content"><div className="resource-tags"><span>Tema teórico</span><span className={done?'tag-done':'tag-pending'}>{done?'✓ Leído':'○ Pendiente'}</span></div><h3>{resource.title}</h3><p>{resource.description}</p></div>
    <div className="resource-card-footer"><span>Tema {index+1} de 6</span><Link className="btn btn-outline" to={`/modulos/2/${resource.key}`}>{done?'Volver a consultar':'Leer tema'} →</Link></div>
  </article>
}

function ResourceCard({moduleId,resource,done,step}){
  return <article className={`resource-card module-resource-card ${done?'resource-done':''}`}>
    <div>
      <div className="resource-card-top">
        <div className="resource-icon"><span className="material-symbols-outlined">{resource.icon}</span></div>
        <div className="resource-tags"><span>{resource.kind}</span><span className={done?'tag-done':'tag-pending'}>{done?'✓ Completado':'○ Pendiente'}</span></div>
      </div>
      <h3>{resource.title}</h3><p>{resource.description}</p>
    </div>
    <div className="resource-card-footer"><span>Paso {step}</span><Link className={`btn ${step===1?'btn-primary':'btn-outline'}`} to={`/modulos/${moduleId}/${resource.key}`}>{resource.key==='teoria'?'Ver material teórico':resource.key==='video'?'Ver video':resource.key==='actividad'?'Comenzar actividad':'Comenzar evaluación'} →</Link></div>
  </article>
}

function Header({user,onLogout}){
  const initials=user?.fullName?.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase() || 'US';
  return <header className="module-header"><div className="module-header-inner"><div className="module-header-left"><Link className="back-link header-back" to="/inicio">← Volver a mis módulos</Link><div className="header-divider"/><div className="mini-brand"><span className="mini-shield">◈</span><div><b>Santa Fe Capacita</b><small>Gobierno de la Provincia de Santa Fe</small></div></div></div><div className="header-user"><span>{user?.fullName || 'Usuario'}</span><span className="avatar small">{initials}</span><button onClick={onLogout}>↪ Cerrar sesión</button></div></div></header>
}
