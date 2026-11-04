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

1. **Lectura del insumo:** Consultar el apunte teórico (`Modulos de teoria/`) y cuestionarios asociados.
2. **Crear la especificación:** Copiar `specs/modules/template.spec.md` en `specs/modules/module-X.spec.md` y completar los metadatos, contenidos, actividad práctica y banco de preguntas.
3. **Validar la Spec:** Verificar que respete las pautas no funcionales (extensión concisa, video <5 min, regla de 3 clics).
4. **Implementar:** Cargar los datos y conectar los componentes de frontend o backend correspondientes.
5. **Verificar:** Aplicar el checklist de aceptación antes de realizar el commit.
