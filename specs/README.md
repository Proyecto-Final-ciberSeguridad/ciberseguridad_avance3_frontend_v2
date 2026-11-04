# Framework de Especificaciones (SDD) – Santa Fe Capacita

Bienvenido a la documentación de **Spec-Driven Development (SDD)** del proyecto **Santa Fe Capacita** (*Diseño e implementación de una plataforma web de concientización y capacitación en ciberseguridad para agentes de planta sin conocimientos técnicos de la provincia de Santa Fe* – UTN FR Santa Fe).

---

## 🎯 ¿Qué es Spec-Driven Development en este proyecto?

En este proyecto, **la especificación antecede y gobierna la implementación**. Ninguna funcionalidad, módulo o regla de negocio se codifica sin tener antes una especificación formal que defina:
1. Sus requerimientos pedagógicos y funcionales.
2. Su contrato de datos y API REST.
3. Sus criterios de aceptación (Definition of Done - DoD).
4. Su trazabilidad directa con los informes aprobados por la cátedra.

Esta rama (`sdd-docs`) consolida la **ingeniería inversa** de todo lo construido hasta el Avance 3 y define la estructura estándar para los módulos subsiguientes.

---

## 📂 Estructura de Especificaciones

```text
specs/
├── README.md                                  # Este documento
├── system/
│   ├── 01-architecture-overview.md            # Arquitectura global (C4, componentes y stack)
│   ├── 02-database-schema.md                  # Modelo de datos y DER en PostgreSQL
│   ├── 03-api-rest-specification.md           # Contratos de API REST, códigos HTTP y Auth
│   ├── 04-frontend-spec-and-routing.md        # Mapa de rutas, SessionGuard y usabilidad
│   ├── 05-gamification-and-certification.md   # Motor de puntos, logros y generación de PDF
│   └── 06-traceability-matrix.md              # Matriz de trazabilidad RF/RNF vs Código
└── modules/
    ├── template.spec.md                       # Plantilla estándar para nuevos módulos
    └── module-1.spec.md                       # Especificación completa del Módulo 1 (Línea Base)
```

---

## 🚀 Flujo para Crear un Nuevo Módulo (Módulo 2, 3 o 4)

### Opción A: Usando la Skill con Asistente IA (Antigravity / Gemini)
Cualquier integrante del equipo que clone el repositorio tiene la skill integrada automáticamente en el workspace (`skills/sdd-module-creator` o `.agents/skills/sdd-module-creator`).
Simplemente puede pedirle al asistente:
> *"Quiero crear el Módulo 2 usando la skill de SDD"*
El asistente:
1. Inspeccionará los documentos Word de teoría y cuestionarios correspondientes.
2. Sintetizará y verificará que cumpla con los límites acordados (<10 carillas y video <5 min).
3. Generará la especificación `specs/modules/module-2.spec.md`.
4. Guiará o implementará los componentes y rutas en el frontend.

### Opción B: Flujo Manual Asistido por Script
1. Ejecutar el asistente de análisis de insumos:
   ```bash
   python3 specs/tools/create_module_spec.py --module 2
   ```
2. Copiar `specs/modules/template.spec.md` en `specs/modules/module-2.spec.md`.
3. Completar las secciones (metadatos, escenarios de simulación, preguntas de evaluación).
4. Implementar las claves de recursos en `src/moduleData.js` y las vistas en `src/pages/`.
5. Ejecutar `npm run build` y verificar que la sección "Mi Progreso" registre el avance.

