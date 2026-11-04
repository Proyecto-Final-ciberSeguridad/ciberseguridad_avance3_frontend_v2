import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import ModuleResourceHeader from '../components/ModuleResourceHeader';
import { setResourceCompleted } from '../progress';

export default function Module1Video(){
  const nav = useNavigate();
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const [ended1, setEnded1] = useState(false);
  const [seenMost1, setSeenMost1] = useState(false);
  const [ended2, setEnded2] = useState(false);
  const [seenMost2, setSeenMost2] = useState(false);

  function timeUpdate1(){
    const v = videoRef1.current;
    if (v && v.duration && v.currentTime / v.duration >= 0.9) setSeenMost1(true);
  }

  function timeUpdate2(){
    const v = videoRef2.current;
    if (v && v.duration && v.currentTime / v.duration >= 0.9) setSeenMost2(true);
  }

  function onPlay1(){
    if (videoRef2.current && !videoRef2.current.paused) {
      videoRef2.current.pause();
    }
  }

  function onPlay2(){
    if (videoRef1.current && !videoRef1.current.paused) {
      videoRef1.current.pause();
    }
  }

  function finish(){
    setResourceCompleted(1, 'video', true);
    nav('/modulos/1/actividad');
  }

  const ready1 = ended1 || seenMost1;
  const ready2 = ended2 || seenMost2;
  const readyAny = ready1 || ready2;
  const readyAll = ready1 && ready2;
  const completedCount = (ready1 ? 1 : 0) + (ready2 ? 1 : 0);

  return (
    <div className="module-page">
      <ModuleResourceHeader />
      <main className="resource-page-content video-page">
        <Link className="back-link" to="/modulos/1">← Volver al Módulo 1</Link>
        <div className="resource-breadcrumb">Capacitación de ciberseguridad / Módulo 1: Introducción a la Seguridad Digital / Videos del módulo</div>
        <span className="module-badge">Módulo 1 — Introducción a la Seguridad Digital</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px' }}>Videos del módulo</h1>
            <p className="module-intro" style={{ margin: 0 }}>
              Reforzá los conceptos clave del módulo con la síntesis audiovisual y la pauta práctica de prevención.
            </p>
          </div>
          <div className="video-progress-pill">
            <span>📹 {completedCount} de 2 videos completados</span>
          </div>
        </div>

        {/* Video 1: Síntesis Conceptual */}
        <section className="video-card">
          <div className="video-card-header">
            <span className="video-card-badge">PARTE 1 — SÍNTESIS CONCEPTUAL</span>
            <h2>Ciberseguridad en el Trabajo</h2>
            <p>Conceptos esenciales sobre seguridad de la información, protección de activos digitales y hábitos preventivos en el ámbito laboral.</p>
          </div>
          <video
            ref={videoRef1}
            controls
            preload="metadata"
            onPlay={onPlay1}
            onTimeUpdate={timeUpdate1}
            onEnded={() => setEnded1(true)}
          >
            <source src="/assets/module1/videomodulo1.mp4" type="video/mp4" />
            Tu navegador no puede reproducir este video.
          </video>
          <div className="video-meta">
            <span>⏱ Duración aproximada: 5 minutos</span>
            <span className={ready1 ? 'meta-done' : ''}>
              {ready1 ? '✓ Reproducción completada' : '○ Pendiente de reproducción'}
            </span>
          </div>
        </section>

        {/* Video 2: Pauta Práctica (videomodulo1despues) */}
        <section className="video-card" style={{ marginTop: '28px' }}>
          <div className="video-card-header">
            <span className="video-card-badge">PARTE 2 — PAUTA PRÁCTICA</span>
            <h2>Regla de los Cuatro Pasos: Antes de actuar</h2>
            <p>Guía de verificación rápida en cuatro pasos para identificar señales sospechosas antes de abrir un enlace, descargar un archivo o responder un mensaje.</p>
          </div>
          <video
            ref={videoRef2}
            controls
            preload="metadata"
            onPlay={onPlay2}
            onTimeUpdate={timeUpdate2}
            onEnded={() => setEnded2(true)}
          >
            <source src="/assets/module1/videomodulo1despues.mp4" type="video/mp4" />
            Tu navegador no puede reproducir este video.
          </video>
          <div className="video-meta">
            <span>⏱ Duración aproximada: 1 minuto y medio</span>
            <span className={ready2 ? 'meta-done' : ''}>
              {ready2 ? '✓ Reproducción completada' : '○ Pendiente de reproducción'}
            </span>
          </div>
        </section>

        <div className="completion-row" style={{ marginTop: '28px' }}>
          <Link className="btn btn-outline" to="/modulos/1">Volver al módulo</Link>
          <button
            className="btn btn-primary"
            disabled={!readyAny}
            onClick={finish}
          >
            {readyAll
              ? 'Marcar ambos como vistos y comenzar actividad →'
              : readyAny
              ? 'Continuar a la actividad práctica →'
              : 'Reproducí el video para continuar'}
          </button>
        </div>
      </main>
    </div>
  );
}
