import { Link, useNavigate } from 'react-router-dom';
import ModuleResourceHeader from '../components/ModuleResourceHeader';
import { setResourceCompleted } from '../progress';

export default function Module1Theory(){
  const nav=useNavigate();
  function finish(){setResourceCompleted(1,'teoria',true);nav('/modulos/1/video');}
  return <div className="module-page">
    <ModuleResourceHeader/>
    <main className="resource-page-content theory-page">
      <Link className="back-link" to="/modulos/1">← Volver al Módulo 1</Link>
      <div className="resource-breadcrumb">Capacitación de ciberseguridad / Módulo 1: Introducción a la Seguridad Digital / Material teórico</div>
      <span className="module-badge">Módulo 1 — Introducción a la Seguridad Digital</span>
      <h1>Material teórico</h1>
      <p className="module-intro">Una introducción breve a los recursos que protegemos y a las decisiones cotidianas que ayudan a reducir riesgos.</p>

      <section className="learning-objectives">
        <h2>Al finalizar este módulo vas a poder</h2>
        <ul>
          <li>Reconocer qué tipos de información y recursos necesitan protección.</li>
          <li>Comprender que la seguridad digital también depende de las acciones de cada usuario.</li>
          <li>Aplicar buenas prácticas básicas al navegar, descargar archivos y utilizar dispositivos.</li>
          <li>Identificar situaciones cotidianas que requieren detenerse y verificar antes de actuar.</li>
          <li>Comprender cuándo una situación debería ser reportada.</li>
        </ul>
      </section>

      <article className="theory-section">
        <div><span className="theory-number">1</span><h2>La seguridad digital también es parte de tu trabajo</h2></div>
        <p>Gran parte de las tareas administrativas y operativas se realizan mediante correo electrónico, sistemas institucionales, documentos, planillas, páginas web y servicios en línea. Por eso, la seguridad digital no depende únicamente del área de informática.</p>
        <p>Cada vez que una persona abre un correo, descarga un archivo, utiliza una contraseña, comparte información, conecta un dispositivo o deja abierta una sesión, también está tomando una decisión relacionada con la seguridad.</p>
        <img className="theory-figure" src="/assets/module1/seguridad-digital.png" alt="Recursos protegidos por la seguridad digital: datos personales, credenciales, información institucional, sistemas y dispositivos"/>
      </article>

      <article className="theory-section">
        <div><span className="theory-number">2</span><h2>¿Qué es la ciberseguridad?</h2></div>
        <p>De manera sencilla, es el conjunto de medidas, prácticas y comportamientos destinados a proteger la información, los sistemas y los dispositivos frente a accesos no autorizados, pérdidas, modificaciones, engaños o interrupciones.</p>
        <div className="cia-grid">
          <div><b>Confidencialidad</b><span>Que la información solamente pueda ser conocida o utilizada por las personas autorizadas.</span></div>
          <div><b>Integridad</b><span>Que la información permanezca correcta y no sea modificada de manera indebida.</span></div>
          <div><b>Disponibilidad</b><span>Que la información y los sistemas estén accesibles cuando las personas autorizadas los necesitan.</span></div>
        </div>
      </article>

      <article className="theory-section">
        <div><span className="theory-number">3</span><h2>Riesgos y buenas prácticas cotidianas</h2></div>
        <div className="risk-list">
          <div><b>Correos, enlaces y archivos</b><span>No abras automáticamente algo inesperado solo porque parece una factura, un expediente, algo urgente o tiene el logo de una institución.</span></div>
          <div><b>Contraseñas</b><span>Usá credenciales personales, únicas y confidenciales. No las compartas ni las dejes expuestas.</span></div>
          <div><b>Malware y software</b><span>Utilizá software autorizado y evitá descargas, extensiones o programas de origen dudoso.</span></div>
          <div><b>Navegación</b><span>Revisá el dominio y el contexto. La apariencia de una página no alcanza para confirmar que sea legítima.</span></div>
          <div><b>Puesto de trabajo</b><span>Bloqueá la computadora al alejarte y evitá dejar contraseñas o documentación sensible a la vista.</span></div>
          <div><b>USB y redes públicas</b><span>No conectes dispositivos cuyo origen desconozcas y priorizá redes y herramientas autorizadas para tareas institucionales.</span></div>
        </div>
        <img className="theory-figure" src="/assets/module1/cuatro-controles.png" alt="Cuatro controles rápidos antes de seguir: sitio, USB, Wi-Fi y puesto de trabajo"/>
      </article>

      <article className="theory-section emphasis-section">
        <div><span className="theory-number">4</span><h2>Antes de actuar: cuatro pasos simples</h2></div>
        <p>Ante algo inesperado, extraño o diferente de lo habitual, lo más importante es evitar actuar por impulso y realizar una verificación sencilla antes de continuar.</p>
        <img className="theory-figure" src="/assets/module1/antes-de-actuar.png" alt="Secuencia reconocer, detenerse, verificar y reportar"/>
        <div className="four-steps">
          <span><b>1. Reconocer</b> ¿La situación es habitual? ¿Esperabas ese mensaje, archivo o solicitud?</span>
          <span><b>2. Detenerse</b> No hagas clic, descargues o entregues información automáticamente.</span>
          <span><b>3. Verificar</b> Comprobá remitente, dominio, canal y contexto.</span>
          <span><b>4. Reportar</b> Si continúa siendo sospechosa, comunicala mediante el canal establecido.</span>
        </div>
      </article>

      <section className="module-final-reminder">
        <h2>Recordatorio final</h2>
        <p>No hace falta conocer todas las amenazas. Una pausa breve, una verificación y un reporte oportuno pueden evitar que una situación dudosa se transforme en un incidente.</p>
      </section>

      {/* Tarjeta de consulta y descarga del documento teórico oficial */}
      <section className="theory-download-card">
        <div className="theory-download-content">
          <div className="theory-download-icon">
            <span className="material-symbols-outlined">menu_book</span>
          </div>
          <div className="theory-download-info">
            <span className="theory-download-badge">DOCUMENTO PEDAGÓGICO OFICIAL</span>
            <h2>Material teórico completo en PDF</h2>
            <p>
              Podés consultar o descargar el documento completo del Módulo 1 en formato PDF (9 páginas) para lectura sin conexión, impresión o archivo de consulta laboral.
            </p>
            <div className="theory-download-meta">
              <span>📄 Documento PDF oficial</span>
              <span>•</span>
              <span>9 páginas</span>
              <span>•</span>
              <span>4.4 MB</span>
            </div>
          </div>
        </div>
        <div className="theory-download-actions">
          <a
            className="btn btn-primary"
            href="/assets/module1/material-teorico-modulo-1.pdf"
            download="Modulo-1-Introduccion-a-la-Seguridad-Digital.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined">download</span>
            Descargar PDF
          </a>
          <a
            className="btn btn-outline"
            href="/assets/module1/material-teorico-modulo-1.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined">visibility</span>
            Ver en línea
          </a>
        </div>
      </section>

      <details className="source-details"><summary>Fuentes consultadas para este módulo</summary><ul>
        <li>NIST — Building an Information Technology Security Awareness and Training Program.</li>
        <li>NIST — Security Awareness and Training for the Workforce.</li>
        <li>Argentina.gob.ar — Datos personales, phishing y requisitos mínimos de seguridad para organismos públicos.</li>
        <li>Dirección Nacional de Ciberseguridad / CERT.ar.</li>
        <li>INDEC — Acceso y uso de TIC.</li>
        <li>SMARTFENSE — Plataforma de concientización en ciberseguridad.</li>
      </ul></details>

      <div className="sticky-completion"><div><b>¿Terminaste de leer?</b><span>Al continuar, el material quedará registrado como leído.</span></div><button className="btn btn-primary" onClick={finish}>Marcar como leído y ver video →</button></div>
    </main>
  </div>
}
