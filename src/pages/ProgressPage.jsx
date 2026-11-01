import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../components/Brand';
import { api, getCurrentUser, logoutUser } from '../auth';
import { getModule, getModuleResources, modules } from '../moduleData';
import { getModuleProgress, moduleStats, syncProgressFromServer } from '../progress';

function formatDateTime(value){
  if(!value) return 'Sin actividad registrada';
  try {
    return new Intl.DateTimeFormat('es-AR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value));
  } catch { return 'Actividad registrada'; }
}

function stagePoints(stats){
  return stats.stages.filter(s=>s.done).length * 25;
}

function firstPendingResource(moduleId){
  const progress=getModuleProgress(moduleId);
  return getModuleResources(moduleId).find(r=>!progress[r.key]) || null;
}

export default function ProgressPage(){
  const nav=useNavigate();
  const user=getCurrentUser();
  const [version,setVersion]=useState(0);
  const [summary,setSummary]=useState({evaluations:{},lastActivity:null});
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let active=true;
    async function load(){
      setLoading(true);
      await syncProgressFromServer();
      try {
        const data=await api('/training-summary');
        if(active) setSummary({evaluations:data.evaluations || {},lastActivity:data.lastActivity || null});
      } catch {
        if(active) setSummary({evaluations:{},lastActivity:null});
      }
      if(active){setVersion(v=>v+1);setLoading(false)}
    }
    load();
    const refresh=()=>setVersion(v=>v+1);
    window.addEventListener('sf-progress-updated',refresh);
    return ()=>{active=false;window.removeEventListener('sf-progress-updated',refresh)};
  },[]);

  const stats=useMemo(()=>[1,2,3,4].map(id=>({id,...moduleStats(id)})),[version]);
  const completedModules=stats.filter(s=>s.percent===100).length;
  const overallPercent=Math.round(stats.reduce((sum,s)=>sum+s.percent,0)/4);
  const points=stats.reduce((sum,s)=>sum+stagePoints(s),0);
  const anyActivityDone=stats.some(s=>s.progress.actividad);
  const achievements=[
    {title:'Primer paso',desc:'Completaste tu primer módulo.',icon:'looks_one',unlocked:completedModules>=1},
    {title:'Buen comienzo',desc:'Completaste tu primera actividad práctica.',icon:'thumb_up',unlocked:anyActivityDone},
    {title:'En progreso',desc:'Alcanzaste el 50 % de la capacitación.',icon:'trending_up',unlocked:overallPercent>=50},
    {title:'Ciberseguridad activa',desc:'Completaste los cuatro módulos.',icon:'shield',unlocked:completedModules===4},
  ];
  const unlocked=achievements.filter(a=>a.unlocked).length;
  const pendingStats=stats.filter(s=>s.percent<100);
  const pendingModules=pendingStats.map(s=>`Módulo ${s.id}`);
  const nextPendingModule=pendingStats[0]?.id || 1;
  const certificateAvailable=completedModules===4;

  function logout(){logoutUser();nav('/login')}

  return <div className="dashboard-shell progress-shell">
    <aside className="sidebar">
      <Brand compact />
      <nav className="side-nav">
        <button className="plain-nav" onClick={()=>nav('/inicio')}>⌂ <span>Inicio</span></button>
        <div className="nav-heading">▤ <span>Módulos</span></div>
        <div className="module-links">{Object.values(modules).map(m=><button key={m.id} onClick={()=>nav(`/modulos/${m.id}`)}><i className={moduleStats(m.id).percent===100?'done-dot':''}/> <span><b>Módulo {m.id}</b><small>{m.title}</small></span></button>)}</div>
        <button className="plain-nav active" onClick={()=>nav('/progreso')}>↗ <span>Mi progreso</span></button>
        <button className="plain-nav certificate-nav" onClick={()=>nav('/progreso#certificado')}>♙ <span>Certificado</span><small>{certificateAvailable?'Disponible':'Bloqueado'}</small></button>
      </nav>
      <div className="user-box"><div className="avatar">{user?.fullName?.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase() || 'US'}</div><div><strong>{user?.fullName || 'Usuario'}</strong><small>Agente Público Provincial</small></div><button className="logout" onClick={logout}>Cerrar sesión</button></div>
    </aside>

    <main className="progress-main">
      <div className="progress-breadcrumb"><button onClick={()=>nav('/inicio')}>Inicio</button><span>›</span><b>Mi progreso</b></div>
      <section className="progress-heading-block"><h1>Mi progreso</h1><p>Consultá tu avance dentro de la capacitación.</p></section>

      <section className="overall-progress-card">
        <div className="overall-title-row"><span>PROGRESO GENERAL DE LA CAPACITACIÓN</span><strong>{overallPercent} % completado</strong></div>
        <div className="overall-track"><div style={{width:`${overallPercent}%`}}/></div>
        <div className="overall-meta">
          <div><span className="material-symbols-outlined">auto_stories</span><p><small>Módulos</small><b>{completedModules} de 4 completados</b></p></div>
          <div><span className="material-symbols-outlined">stars</span><p><small>Puntos</small><b>{points} de 400</b></p></div>
          <div><span className="material-symbols-outlined">history</span><p><small>Última actividad</small><b>{loading?'Actualizando…':formatDateTime(summary.lastActivity)}</b></p></div>
        </div>
      </section>

      <section className="module-progress-section">
        <div className="progress-section-title"><div><h2>Progreso por módulo</h2><p>Los cuatro módulos permanecen habilitados. Podés iniciarlos o retomarlos en cualquier momento.</p></div><span>4 módulos disponibles</span></div>
        <div className="progress-module-grid">
          {stats.map(s=><ProgressModuleCard key={s.id} stats={s} evaluation={summary.evaluations?.[String(s.id)] || summary.evaluations?.[s.id]} onNavigate={nav}/>) }
        </div>
      </section>

      <section className="achievements-card">
        <div className="progress-section-title"><div><h2>Tus logros</h2><p>Reconocimientos vinculados al avance y la constancia dentro de la capacitación.</p></div><span>{unlocked} de 4 obtenidos</span></div>
        <div className="achievement-metrics">
          <Metric icon="star" value={points} label="Puntos acumulados"/>
          <Metric icon="task_alt" value={completedModules} label="Módulos completados"/>
          <Metric icon="flag" value={`${overallPercent} %`} label="De la capacitación"/>
          <Metric icon="shield" value={`${unlocked} de 4`} label="Logros obtenidos"/>
        </div>
        <div className="achievement-grid">{achievements.map(a=><article key={a.title} className={`achievement ${a.unlocked?'unlocked':'locked'}`}><div className="achievement-top"><span className="achievement-icon material-symbols-outlined">{a.unlocked?a.icon:'lock'}</span><span className="achievement-state">{a.unlocked?'✓ Obtenido':'Bloqueado'}</span></div><h3>{a.title}</h3><p>{a.desc}</p><small>{a.unlocked?'Logro desbloqueado':'Continuá avanzando para desbloquearlo'}</small></article>)}</div>
      </section>

      <section id="certificado" className={`certificate-status-card ${certificateAvailable?'available':''}`}>
        <div className="certificate-icon material-symbols-outlined">workspace_premium</div>
        <div className="certificate-copy"><div><h3>Certificado de finalización</h3><span>{certificateAvailable?'✓ Disponible':'🔒 Aún no disponible'}</span></div><p>{certificateAvailable?'Completaste los requisitos de la capacitación. Ya podés acceder a la sección de certificado.':'Completá los cuatro módulos y sus evaluaciones para habilitar el certificado de finalización.'}</p>{!certificateAvailable && <small>Falta completar: {pendingModules.join(', ')}.</small>}</div>
        {certificateAvailable ? <button className="btn btn-outline" disabled>Certificado habilitado</button> : <button className="btn btn-outline" onClick={()=>nav(`/modulos/${nextPendingModule}`)}>Continuar capacitación →</button>}
      </section>
    </main>
  </div>
}

function Metric({icon,value,label}){
  return <div className="achievement-metric"><span className="material-symbols-outlined">{icon}</span><div><strong>{value}</strong><small>{label}</small></div></div>
}

function ProgressModuleCard({stats,evaluation,onNavigate}){
  const mod=getModule(stats.id);
  const pending=firstPendingResource(stats.id);
  const done=stats.percent===100;
  const started=stats.completed>0;
  const buttonLabel=done?'Repasar módulo':started?'Continuar módulo':'Iniciar módulo';
  const target=pending?`/modulos/${stats.id}/${pending.key}`:`/modulos/${stats.id}`;
  const nextLabel=pending?pending.title:'Módulo completado';

  return <article className={`progress-module-card ${done?'done':started?'started':'pending'}`}>
    <div className="progress-module-top"><div><span>Módulo {stats.id}</span><h3>{mod.title}</h3></div><b>{stats.percent} %</b></div>
    <p className="progress-module-desc">{mod.subtitle}</p>
    <div className="resource-status-list">
      {stats.stages.map(stage=><div key={stage.key} className={stage.done?'done':''}><span className="material-symbols-outlined">{stage.done?'check_circle':stage.completed>0?'timelapse':'radio_button_unchecked'}</span><p><b>{stage.label}</b><small>{stage.key==='teoria' && stage.count>1 ? `${stage.completed} de ${stage.count} temas` : stage.done?'Completado':stage.completed>0?'En progreso':'Pendiente'}</small></p></div>)}
    </div>
    {evaluation && <div className="evaluation-summary">Evaluación: <strong>{evaluation.score} de {evaluation.total} respuestas correctas</strong></div>}
    <div className="next-step"><span className="material-symbols-outlined">pending_actions</span><span>{done?'Estado: ': 'Siguiente paso: '}<strong>{nextLabel}</strong></span></div>
    <button className="btn btn-primary full" onClick={()=>onNavigate(target)}>{buttonLabel} →</button>
  </article>
}
