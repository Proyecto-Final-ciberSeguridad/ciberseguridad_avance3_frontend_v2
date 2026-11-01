import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import ModuleResourceHeader from '../components/ModuleResourceHeader';
import { setResourceCompleted } from '../progress';

export default function Module1Video(){
  const nav=useNavigate();
  const videoRef=useRef(null);
  const [ended,setEnded]=useState(false);
  const [seenMost,setSeenMost]=useState(false);
  function timeUpdate(){const v=videoRef.current;if(v && v.duration && v.currentTime/v.duration>=0.9) setSeenMost(true);}
  function finish(){setResourceCompleted(1,'video',true);nav('/modulos/1/actividad');}
  const ready=ended || seenMost;
  return <div className="module-page"><ModuleResourceHeader/><main className="resource-page-content video-page">
    <Link className="back-link" to="/modulos/1">← Volver al Módulo 1</Link>
    <div className="resource-breadcrumb">Capacitación de ciberseguridad / Módulo 1: Introducción a la Seguridad Digital / Video del módulo</div>
    <span className="module-badge">Módulo 1 — Introducción a la Seguridad Digital</span>
    <h1>Video del módulo</h1><p className="module-intro">Reforzá los principales conceptos del módulo mediante una síntesis audiovisual breve.</p>
    <section className="video-card">
      <video ref={videoRef} controls preload="metadata" onTimeUpdate={timeUpdate} onEnded={()=>setEnded(true)}>
        <source src="/assets/module1/modulo1-sintesis.mp4" type="video/mp4"/>
        Tu navegador no puede reproducir este video.
      </video>
      <div className="video-meta"><span>Duración aproximada: 2 minutos</span><span>{ready?'✓ Reproducción completada':'○ Pendiente de reproducción'}</span></div>
    </section>
    <div className="completion-row"><Link className="btn btn-outline" to="/modulos/1">Volver al módulo</Link><button className="btn btn-primary" disabled={!ready} onClick={finish}>{ready?'Marcar como visto y comenzar actividad →':'Reproducí el video para continuar'}</button></div>
  </main></div>
}
