import { useNavigate } from 'react-router-dom';
import Brand from '../components/Brand';
import { getCurrentUser, logoutUser } from '../auth';

const modules = [
  {id:1,title:'Introducción a la Seguridad Digital',desc:'Conceptos básicos de seguridad digital y su importancia en el trabajo cotidiano.',accent:'blue',icon:'enhanced_encryption'},
  {id:2,title:'Identificación de Riesgos',desc:'Reconocimiento de amenazas frecuentes como phishing, contraseñas inseguras, malware y prácticas de navegación.',accent:'cyan',icon:'security_update_warning'},
  {id:3,title:'Detección y respuesta ante incidentes',desc:'Qué hacer frente a una situación sospechosa o un posible incidente de seguridad.',accent:'sky',icon:'campaign'},
  {id:4,title:'Cierre y Verificación',desc:'Integración de contenidos, repaso general y compromiso con la seguridad organizacional.',accent:'green',icon:'military_tech'}
];

export default function Dashboard(){
  const nav=useNavigate(); const user=getCurrentUser();
  function logout(){logoutUser();nav('/login');}
  return <div className="dashboard-shell">
    <aside className="sidebar">
      <Brand compact />
      <nav className="side-nav">
        <a className="active">⌂ <span>Inicio</span></a>
        <div className="nav-heading">▤ <span>Módulos</span></div>
        <div className="module-links">{modules.map(m=><button key={m.id} onClick={()=>nav(`/modulos/${m.id}`)}><i/> <span><b>Módulo {m.id}</b><small>{m.title}</small></span></button>)}</div>
        <button className="plain-nav" onClick={()=>nav('/progreso')}>↗ <span>Mi progreso</span></button>
        <button className="plain-nav" onClick={()=>nav('/certificado')}>♙ <span>Certificado</span></button>
      </nav>
      <div className="user-box"><div className="avatar">{user?.fullName?.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase() || 'US'}</div><div><strong>{user?.fullName || 'Usuario'}</strong><small>Agente Público Provincial</small></div><button className="logout" onClick={logout}>Cerrar sesión</button></div>
    </aside>
    <main className="dashboard-main">
      <section className="dashboard-hero">
        <div className="status-pill">✓ 4 de 4 módulos habilitados • Capacitación autogestionada • A tu propio ritmo</div>
        <h1>Panel de Capacitación: Módulos Disponibles</h1>
        <p>En esta plataforma vas a encontrar los módulos de capacitación en ciberseguridad. Cada módulo incluye materiales teóricos, actividades, videos y evaluaciones que acompañan tu aprendizaje.</p>
        <div className="info-strip">⌘ Podés realizar los módulos en el orden que prefieras o seguir la sugerencia recomendada del 1 al 4.</div>
      </section>
      <div className="section-heading"><div><h2>▱ Módulos de capacitación</h2><p>Seleccioná cualquier módulo para comenzar.</p></div><span className="outlined-pill">4 módulos disponibles</span></div>
      <section className="module-grid">{modules.map(m=><article key={m.id} className={`module-card ${m.accent}`}>
        <div><div className="module-meta"><span>● MÓDULO {m.id} • HABILITADO</span></div><div className="module-title-row"><div className="module-icon"><span className="material-symbols-outlined">{m.icon}</span></div><div><h3>{m.title}</h3><p>{m.desc}</p></div></div><div className="included"><small>Contenidos incluidos en este módulo:</small><div className="chip-row"><span className="chip">▤ Teoría</span><span className="chip">🖊 Actividad</span><span className="chip">▣ Video</span><span className="chip">✓ Evaluación</span></div></div></div>
        <div className="module-footer"><span>✓ Listo para iniciar</span><button className="btn btn-primary" onClick={()=>nav(`/modulos/${m.id}`)}>Ingresar al módulo →</button></div>
      </article>)}</section>
    </main>
  </div>
}
