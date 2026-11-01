import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import ModuleResourceHeader from '../components/ModuleResourceHeader';
import { recordEvaluationResult, setResourceCompleted } from '../progress';

const questions=[
  {q:'¿Qué protege la seguridad digital en el ámbito laboral?',o:['Solamente las computadoras del organismo.','Información, credenciales, sistemas, servicios y dispositivos utilizados para trabajar.','Únicamente los archivos considerados confidenciales.','Solo los sistemas administrados por el área de informática.'],a:1,e:'La seguridad digital abarca información, accesos, servicios y dispositivos; no solamente la computadora.'},
  {q:'¿Qué significa confidencialidad?',o:['Que los sistemas estén disponibles todo el tiempo.','Que la información permanezca correcta.','Que la información sea conocida o utilizada solo por personas autorizadas.','Que todos los archivos estén cifrados.'],a:2,e:'La confidencialidad busca que la información sea accesible únicamente para quienes están autorizados.'},
  {q:'Recibís un archivo inesperado con el logo de una institución conocida. ¿Qué conviene hacer?',o:['Abrirlo porque el logo confirma su origen.','Detenerse y verificar remitente, contexto y origen antes de abrirlo.','Descargarlo y enviarlo a otra persona.','Abrirlo si el mensaje dice que es urgente.'],a:1,e:'La apariencia o la urgencia no confirman legitimidad. Primero se debe verificar.'},
  {q:'¿Cuál es una buena práctica con las contraseñas?',o:['Usar la misma contraseña para trabajo y servicios personales.','Compartirla con compañeros de confianza.','Mantenerla personal, no compartirla y evitar reutilizarla entre servicios.','Anotarla cerca del monitor para no olvidarla.'],a:2,e:'Las credenciales deben ser personales, confidenciales y no reutilizarse innecesariamente.'},
  {q:'Al ingresar a un sitio web laboral, ¿qué conviene revisar además de su apariencia?',o:['El dominio y el contexto del sitio.','Que tenga colores institucionales.','Que el logo tenga buena calidad.','Que el texto no tenga errores ortográficos.'],a:0,e:'Una página puede imitar la apariencia de otra. El dominio y el contexto son controles más útiles.'},
  {q:'¿Cuál es la secuencia propuesta ante una situación digital dudosa?',o:['Abrir → analizar → consultar → borrar.','Reconocer → detenerse → verificar → reportar.','Bloquear → cerrar → reiniciar → reportar.','Consultar → descargar → verificar → continuar.'],a:1,e:'El módulo utiliza la regla reconocer, detenerse, verificar y reportar.'}
];

export default function Module1Evaluation(){
  const nav=useNavigate(); const [index,setIndex]=useState(0); const [answers,setAnswers]=useState(Array(questions.length).fill(null)); const [finished,setFinished]=useState(false);
  const score=useMemo(()=>answers.reduce((s,a,i)=>s+(a===questions[i].a?1:0),0),[answers]);
  const current=questions[index];
  function choose(i){const copy=[...answers];copy[index]=i;setAnswers(copy)}
  function next(){if(index<questions.length-1)setIndex(index+1);else setFinished(true)}
  async function closeEvaluation(){setResourceCompleted(1,'evaluacion',true);await recordEvaluationResult(1,score,questions.length,answers.map((a,i)=>({question:i+1,selected:a,correct:questions[i].a}))).catch(()=>{});nav('/modulos/2')}
  return <div className="module-page"><ModuleResourceHeader/><main className="resource-page-content evaluation-page">
    <Link className="back-link" to="/modulos/1">← Volver al Módulo 1</Link>
    <div className="resource-breadcrumb">Capacitación de ciberseguridad / Módulo 1 / Evaluación</div>
    <span className="module-badge">Módulo 1 — Introducción a la Seguridad Digital</span>
    {!finished?<>
      <div className="activity-title-row"><div><h1>Evaluación del módulo</h1><p className="module-intro">Respondé las seis preguntas para verificar tu comprensión de los contenidos trabajados.</p></div><span className="outlined-pill">Pregunta {index+1} de {questions.length}</span></div>
      <div className="activity-progress"><i style={{width:`${((index+1)/questions.length)*100}%`}}/></div>
      <section className="evaluation-card"><h2>{current.q}</h2><div className="option-list">{current.o.map((o,i)=><button key={o} className={`activity-option ${answers[index]===i?'selected':''}`} onClick={()=>choose(i)}><span>{String.fromCharCode(65+i)}</span>{o}</button>)}</div><div className="evaluation-navigation"><button className="btn btn-outline" disabled={index===0} onClick={()=>setIndex(index-1)}>← Anterior</button><div className="question-dots">{questions.map((_,i)=><button key={i} className={`${i===index?'current':''} ${answers[i]!==null?'answered':''}`} onClick={()=>setIndex(i)}>{i+1}</button>)}</div><button className="btn btn-primary" disabled={answers[index]===null} onClick={next}>{index===questions.length-1?'Finalizar evaluación':'Siguiente →'}</button></div></section>
    </>:<section className="evaluation-result"><div className="result-icon">✓</div><h1>Evaluación finalizada</h1><p className="result-score">Resultado: <b>{score} de {questions.length}</b></p><p>No se definió un porcentaje mínimo de aprobación para esta capacitación. El resultado se registra como evidencia de comprensión y seguimiento.</p><div className="review-list">{questions.map((q,i)=><details key={q.q} className={answers[i]===q.a?'review-correct':'review-wrong'}><summary>{answers[i]===q.a?'✓':'•'} Pregunta {i+1}: {answers[i]===q.a?'Respuesta correcta':'Revisar respuesta'}</summary><p><b>Tu respuesta:</b> {q.o[answers[i]]}</p>{answers[i]!==q.a&&<p><b>Respuesta esperada:</b> {q.o[q.a]}</p>}<p>{q.e}</p></details>)}</div><button className="btn btn-primary" onClick={closeEvaluation}>Finalizar Módulo 1 y continuar al Módulo 2 →</button></section>}
  </main></div>
}
