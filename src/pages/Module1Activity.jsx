import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ModuleResourceHeader from '../components/ModuleResourceHeader';
import { setResourceCompleted } from '../progress';

const cases=[
  {title:'Un archivo inesperado',context:'Recibís un correo que aparenta ser una factura pendiente. Tiene un logo conocido, dice “URGENTE” y trae un archivo adjunto que no esperabas.',question:'¿Qué harías primero?',options:['Abrir el archivo porque el logo parece legítimo.','Responder al correo para preguntar si es verdadero.','Detenerme, revisar remitente y contexto antes de abrir o hacer clic.','Reenviarlo a un compañero para que lo pruebe.'],correct:2,feedback:'La apariencia, el logo o la urgencia no alcanzan para confiar. Ante un archivo inesperado, conviene detenerse y verificar remitente, contexto y origen antes de actuar.'},
  {title:'Te piden tu contraseña',context:'Un compañero te escribe por chat y te pide tu contraseña institucional “solo por unos minutos” para terminar una tarea mientras no estás en la oficina.',question:'¿Cuál es la conducta adecuada?',options:['Compartirla y cambiarla después.','No compartir la contraseña y buscar una alternativa autorizada para resolver la tarea.','Anotarla en un papel y dejarla en el escritorio.','Compartirla únicamente si conozco personalmente a la persona.'],correct:1,feedback:'Las credenciales son personales e intransferibles. Conocer a la persona no elimina el riesgo: la tarea debe resolverse mediante mecanismos autorizados sin compartir la contraseña.'},
  {title:'Un USB de origen desconocido',context:'Encontrás un pendrive en la oficina y necesitás mover un archivo a otra computadora. No sabés de quién es ni qué contiene.',question:'¿Qué opción es más segura?',options:['Conectarlo para ver qué contiene.','Usarlo solo si el antivirus está actualizado.','No conectarlo y utilizar un medio autorizado y conocido.','Formatearlo primero y después usarlo.'],correct:2,feedback:'Un dispositivo desconocido puede representar un riesgo. La recomendación del módulo es no conectarlo al equipo de trabajo y utilizar medios autorizados.'}
];

export default function Module1Activity(){
  const nav=useNavigate();
  const [index,setIndex]=useState(0); const [selected,setSelected]=useState(null); const [checked,setChecked]=useState(false);
  const c=cases[index]; const correct=selected===c.correct;
  function confirm(){if(selected!==null)setChecked(true)}
  function next(){if(index<cases.length-1){setIndex(index+1);setSelected(null);setChecked(false);}else{setResourceCompleted(1,'actividad',true);nav('/modulos/1/evaluacion')}}
  return <div className="module-page"><ModuleResourceHeader/><main className="resource-page-content activity-page">
    <Link className="back-link" to="/modulos/1">← Volver al Módulo 1</Link>
    <div className="resource-breadcrumb">Capacitación de ciberseguridad / Módulo 1 / Actividad práctica</div>
    <span className="module-badge">Módulo 1 — Introducción a la Seguridad Digital</span>
    <div className="activity-title-row"><div><h1>Actividad práctica</h1><p className="module-intro">Aplicá los conceptos del módulo a situaciones similares a las que pueden aparecer durante la jornada laboral.</p></div><span className="outlined-pill">Situación {index+1} de {cases.length}</span></div>
    <div className="activity-progress"><i style={{width:`${((index+(checked?1:0))/cases.length)*100}%`}}/></div>
    <section className="scenario-card">
      <div className="scenario-label">SITUACIÓN {index+1}</div><h2>{c.title}</h2><p className="scenario-context">{c.context}</p><h3>{c.question}</h3>
      <div className="option-list">{c.options.map((o,i)=><button key={o} disabled={checked} className={`activity-option ${selected===i?'selected':''} ${checked&&i===c.correct?'correct':''} ${checked&&selected===i&&i!==c.correct?'incorrect':''}`} onClick={()=>setSelected(i)}><span>{String.fromCharCode(65+i)}</span>{o}</button>)}</div>
      {!checked?<div className="scenario-actions"><button className="btn btn-primary" disabled={selected===null} onClick={confirm}>Confirmar respuesta</button></div>:
      <div className={`feedback-box ${correct?'feedback-correct':'feedback-review'}`}><h3>{correct?'✓ ¡Correcto!':'Revisemos esta situación'}</h3><p>{c.feedback}</p><div><b>Tu respuesta:</b> {selected!==null?c.options[selected]:''}</div><div><b>Respuesta esperada:</b> {c.options[c.correct]}</div><button className="btn btn-primary" onClick={next}>{index<cases.length-1?'Siguiente situación →':'Continuar a la evaluación →'}</button></div>}
    </section>
  </main></div>
}
