---
name: sdd-module-creator
description: Framework y asistente de Spec-Driven Development (SDD) para la plataforma Santa Fe Capacita. Permite iniciar, especificar, validar e implementar módulos de capacitación (Módulos 2, 3, 4) y microcursos a partir de material teórico (.docx/.md), cuestionarios y reglas de negocio, garantizando trazabilidad académica y consistencia de arquitectura.
---

# SDD Module Creator Skill (Santa Fe Capacita)

Esta skill guía y automatiza la creación e integración de módulos formativos en la plataforma **Santa Fe Capacita** siguiendo la metodología **Spec-Driven Development (SDD)**.

---

## 1. Contexto y Rutas del Entorno

* **Repositorio del Proyecto:** `/home/tomy/informe1/ciberseguridad_avance3_frontend_v2`
* **Directorio de Especificaciones:** `/home/tomy/informe1/ciberseguridad_avance3_frontend_v2/specs/`
* **Directorio de Documentación e Insumos Cátedra:** `/home/tomy/apps/documentacionpf/`
  * `Modulos de teoria/`: Apuntes teóricos de los módulos (.docx).
  * `Cuestionarios/`: Bancos de preguntas y actividades (.docx).
  * `Plan de proyecto/`: Cronograma y lineamientos académicos.

---

## 2. Flujo Operativo Estándar de la Skill

Cuando el usuario solicita: *"crear módulo X con SDD"* o *"iniciar el módulo 2 con la skill SDD"*, el agente ejecuta obligatoriamente estos 4 pasos:

### Paso 1: Ingesta del Material (.docx)
1. Localizar el archivo Word correspondiente en `/home/tomy/apps/documentacionpf/Modulos de teoria/` y el cuestionario en `/home/tomy/apps/documentacionpf/Cuestionarios/`.
2. Extraer el texto completo utilizando `python3-docx`.
3. Sintetizar el contenido para cumplir con el RNF pedagógico:
   * **Teoría:** Máximo 10 carillas en total, organizada en bloques web breves y concisos.
   * **Video:** Guion de locución para un video de menos de 5 minutos.
   * **Actividad práctica:** Al menos 3 escenarios laborales con respuesta y feedback explicativo.
   * **Evaluación:** Mínimo 5 a 6 preguntas con opciones y justificación.

### Paso 2: Creación de la Spec (`specs/modules/module-X.spec.md`)
1. Tomar como base la plantilla `specs/modules/template.spec.md`.
2. Asignar las claves de recursos (`resource_key`): ej. `teoria_2a`, `video`, `actividad`, `evaluacion`.
3. Volcar los escenarios y preguntas estructuradas en Markdown.
4. Definir los criterios de aceptación (Definition of Done - DoD).

### Paso 3: Implementación en Código
1. **Frontend (`src/moduleData.js`):** Registrar el nuevo módulo, títulos, duraciones estimadas y lista de recursos con sus claves.
2. **Componentes:** Conectar los datos a los componentes reutilizables o generar la vista del módulo.
3. **Enrutamiento (`src/App.jsx`):** Verificar que las rutas `/modulos/X/...` queden protegidas bajo `SessionGuard`.
4. **Backend:** Comprobar que no requiera nuevas migraciones SQL (el esquema `training_progress` soporta dinámicamente cualquier `resource_key` para los módulos 1 a 4).

### Paso 4: Verificación de Calidad
Ejecutar la validación:
* Compilación limpia con `npm run build`.
* Verificación de la regla de navegación de **máximo 3 clics** desde el Dashboard.
* Verificación de que la barra de "Mi Progreso" suma los 100 puntos y desbloquea el siguiente módulo.

---

## 3. Flujo para Cambios de Arquitectura o Sistema (System Spec First)

Cuando se requiera modificar un comportamiento transversal (autenticación, enrutamiento, red, base de datos o certificado):
1. **Actualizar primero la Spec del Sistema** correspondiente en `specs/system/01..06-*.md` reflejando el nuevo contrato o decisión arquitectónica.
2. **Implementar los cambios** en `src/` y/o `backend/` respetando estrictamente lo especificado.
3. **Verificar** que el build de frontend (`npm run build`), la compilación de Go (`go build ./...`) y los flujos existentes sigan funcionando sin regresiones.
