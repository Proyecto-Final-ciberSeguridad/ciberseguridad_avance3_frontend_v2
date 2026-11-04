# 06 - Matriz de Trazabilidad de Requerimientos

Esta matriz vincula los **Requerimientos Funcionales (RF)** y **No Funcionales (RNF)** aprobados en los Informes de Avance 1 y 2 con su estado real de implementación en el código del Avance 3.

---

## 1. Requerimientos Funcionales (RF)

| ID | Requerimiento Aprobado | Componentes / Archivos que lo Implementan | Estado Avance 3 | Observaciones / Próximo Paso |
| :--- | :--- | :--- | :--- | :--- |
| **RF-01** | Registro de agentes públicos provinciales | `src/pages/Register.jsx`<br>`backend/cmd/server/main.go` (`POST /api/auth/register`)<br>`backend/internal/auth/service.go` | **Completado** | Validación obligatoria de dominio `@santafe.gov.ar` y DNI entre 7 y 9 dígitos. |
| **RF-02** | Autenticación mediante credenciales individuales | `src/pages/Login.jsx`<br>`backend/cmd/server/main.go` (`POST /api/auth/login`)<br>`src/components/SessionGuard.jsx` | **Completado** | Contraseñas protegidas con bcrypt. Emisión de sesión con token SHA-256 en BD. |
| **RF-03** | Entrega de contenido estructurado en módulos | `src/pages/Dashboard.jsx`<br>`src/pages/ModulePage.jsx`<br>`src/moduleData.js` | **Completado** | Módulo 1 implementado al 100%. Módulos 2, 3 y 4 con estructura de navegación lista. |
| **RF-04** | Reproducción de recursos multimedia asincrónicos | `src/pages/Module1Video.jsx`<br>`public/assets/module1/` | **Completado** | Videos integrados para Módulo 1: Parte 1 (~5 min) y Parte 2 (~1:30 min) con control individual. |
| **RF-05** | Presentación de casos de estudio y ejemplos reales | `src/pages/Module1Theory.jsx`<br>`src/pages/Module1Activity.jsx` | **Completado** | Tres situaciones de simulación laboral con feedback didáctico inmediato. |
| **RF-06** | Cuestionarios o evaluaciones al finalizar módulos | `src/pages/Module1Evaluation.jsx`<br>`backend/cmd/server/main.go` (`POST /api/evaluations/{module}`) | **Completado** | 6 preguntas interactivas con revisión final y almacenamiento `JSONB`. |
| **RF-07** | Registro de calificaciones y progreso individual | `backend/migrations/002_training_progress.sql`<br>`src/progress.js`<br>`src/pages/ProgressPage.jsx` | **Completado** | Persistencia en tablas `training_progress` y `evaluation_results`. |
| **RF-08** | Generación de certificado de finalización | `src/pages/CertificatePage.jsx`<br>`backend/cmd/server/main.go` (`GET /api/certificate/status`) | **Completado** | Bloqueado si falta algún módulo; habilitado cuando los 4 están completos. |
| **RF-09** | Descarga de certificado en PDF | `backend/cmd/server/main.go` (`GET /api/certificate/pdf`) | **Completado** | Generación en backend con `gofpdf`, datos reales del usuario y fecha oficial. |
| **RF-10** | Protocolo de reporte de incidentes sospechosos | En planificación para el **Módulo 3** | *Pendiente* | Se especificará e implementará con la plantilla SDD en el Módulo 3. |

---

## 2. Requerimientos No Funcionales (RNF)

| ID | Requerimiento No Funcional | Métrica / Criterio Comprometido | Implementación en Código | Cumplimiento |
| :--- | :--- | :--- | :--- | :--- |
| **RNF-01** | Accesibilidad en 3 clics | Máximo 3 clics desde menú a cualquier recurso | Verificado en mapa de rutas (`src/App.jsx` y `Dashboard.jsx`) | **100% Cumplido** (1 a 2 clics reales) |
| **RNF-02** | Extensión de contenido escrito | < 10 carillas por módulo, adaptado a bloques web breves | `src/pages/Module1Theory.jsx` dividido en 3 tarjetas temáticas | **Cumplido** |
| **RNF-03** | Duración de videos | Videos divididos en micro-aprendizajes breves | Video Parte 1: ~5 min; Video Parte 2: ~1:30 min | **Cumplido** |
| **RNF-04** | Gamificación mínima | Mínimo 4 elementos de gamificación | 1) Puntos, 2) Barras de progreso, 3) Logros, 4) Próximo hito | **100% Cumplido** |
| **RNF-05** | Usabilidad (SUS) | Puntaje SUS ≥ 73 puntos | Pruebas formales programadas previo al cierre final | *En cronograma* |
| **RNF-06** | Tasa de éxito en tareas (TSR) | TSR ≥ 70% en tareas clave | Pruebas formales programadas previo al cierre final | *En cronograma* |
| **RNF-07** | Seguridad de datos | Cifrado de claves, HTTPS, sesiones protegidas | Bcrypt + tokens SHA-256 + consultas parametrizadas en Go | **Cumplido** |
| **RNF-08** | Escalabilidad | Capacidad para ~1000 accesos concurrentes | Backend en Go (goroutines ultralivianas) + índices compuestos en PG | **Arquitectura lista** |
