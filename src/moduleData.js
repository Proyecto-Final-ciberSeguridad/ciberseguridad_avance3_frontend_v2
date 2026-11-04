export const modules = {
  1: {
    id: 1,
    title: 'Introducción a la Seguridad Digital',
    subtitle: 'Ciberseguridad y buenas prácticas digitales en el trabajo cotidiano.',
    resources: [
      { key: 'teoria', stage: 'teoria', step: 1, icon: 'menu_book', kind: 'Documento de lectura', title: 'Material teórico — Introducción a la Seguridad Digital', short: 'Material teórico', description: 'Conceptos introductorios sobre seguridad digital y buenas prácticas aplicadas al trabajo cotidiano.' },
      { key: 'video', stage: 'video', step: 2, icon: 'play_circle', kind: 'Recurso audiovisual', title: 'Videos del módulo', short: 'Videos', description: 'Síntesis conceptual de ciberseguridad en el trabajo y pauta práctica de la regla de cuatro pasos antes de actuar.' },
      { key: 'actividad', stage: 'actividad', step: 3, icon: 'assignment', kind: 'Práctica interactiva', title: 'Actividad práctica', short: 'Actividad', description: 'Situación guiada para aplicar los conceptos del módulo a un caso cotidiano.' },
      { key: 'evaluacion', stage: 'evaluacion', step: 4, icon: 'quiz', kind: 'Evaluación', title: 'Evaluación del módulo', short: 'Evaluación', description: 'Preguntas para verificar la comprensión de los contenidos trabajados.' }
    ]
  },
  2: {
    id: 2,
    title: 'Identificación de Riesgos',
    subtitle: 'Reconocimiento de amenazas y situaciones potencialmente inseguras.',
    theoryTopics: [
      { key: 'teoria-2a', stage: 'teoria', code: '2.a', icon: 'mark_email_unread', title: 'Phishing e Ingeniería Social', description: 'Reconocimiento de engaños, comunicaciones sospechosas y señales que conviene revisar antes de actuar.' },
      { key: 'teoria-2b', stage: 'teoria', code: '2.b', icon: 'password', title: 'Contraseñas inseguras', description: 'Protección de credenciales, reutilización de contraseñas y autenticación multifactor.' },
      { key: 'teoria-2c', stage: 'teoria', code: '2.c', icon: 'bug_report', title: 'Malware', description: 'Conceptos básicos sobre software malicioso, virus, ransomware y troyanos.' },
      { key: 'teoria-2d', stage: 'teoria', code: '2.d', icon: 'language', title: 'Navegación Segura', description: 'Buenas prácticas para revisar direcciones web, enlaces, HTTPS y descargas.' },
      { key: 'teoria-2e', stage: 'teoria', code: '2.e', icon: 'desktop_windows', title: 'Seguridad física y del puesto de trabajo', description: 'Bloqueo de sesión, protección de información visible y principio de Clean Desk.' },
      { key: 'teoria-2f', stage: 'teoria', code: '2.f', icon: 'usb', title: 'Dispositivos externos y redes públicas', description: 'Precauciones con pendrives, dispositivos externos y redes Wi‑Fi públicas.' }
    ],
    resources: [
      { key: 'video', stage: 'video', step: 2, icon: 'play_circle', kind: 'Recurso audiovisual', title: 'Video del módulo', short: 'Video', description: 'Recurso audiovisual para reforzar la identificación de riesgos trabajados en los seis temas.' },
      { key: 'actividad', stage: 'actividad', step: 3, icon: 'assignment', kind: 'Práctica interactiva', title: 'Actividad práctica integrada', short: 'Actividad', description: 'Casos breves que integran phishing, contraseñas, malware, navegación, puesto de trabajo, USB y redes públicas.' },
      { key: 'evaluacion', stage: 'evaluacion', step: 4, icon: 'quiz', kind: 'Evaluación', title: 'Evaluación del módulo', short: 'Evaluación', description: 'Evaluación de los principales riesgos identificados durante el módulo.' }
    ]
  },
  3: {
    id: 3,
    title: 'Detección y respuesta ante incidentes',
    subtitle: 'Acciones iniciales frente a situaciones sospechosas o posibles incidentes.',
    resources: [
      { key: 'teoria', stage: 'teoria', step: 1, icon: 'menu_book', kind: 'Documento de lectura', title: 'Material teórico — Detección y respuesta ante incidentes', short: 'Material teórico', description: 'Qué situaciones pueden requerir un reporte y cómo actuar inicialmente sin improvisar.' },
      { key: 'video', stage: 'video', step: 2, icon: 'play_circle', kind: 'Recurso audiovisual', title: 'Video del módulo', short: 'Video', description: 'Recurso audiovisual breve sobre actuación inicial y reporte.' },
      { key: 'actividad', stage: 'actividad', step: 3, icon: 'assignment', kind: 'Práctica interactiva', title: 'Simulación de respuesta', short: 'Actividad', description: 'Situación guiada para decidir qué hacer ante un posible incidente.' },
      { key: 'evaluacion', stage: 'evaluacion', step: 4, icon: 'quiz', kind: 'Evaluación', title: 'Evaluación del módulo', short: 'Evaluación', description: 'Preguntas para verificar la comprensión del protocolo de respuesta.' }
    ]
  },
  4: {
    id: 4,
    title: 'Cierre y Verificación',
    subtitle: 'Integración de buenas prácticas y hábitos digitales.',
    resources: [
      { key: 'teoria', stage: 'teoria', step: 1, icon: 'menu_book', kind: 'Documento de lectura', title: 'Material teórico — Cierre y Verificación', short: 'Material teórico', description: 'Integración de los riesgos, hábitos y criterios trabajados durante toda la capacitación.' },
      { key: 'video', stage: 'video', step: 2, icon: 'play_circle', kind: 'Recurso audiovisual', title: 'Video de cierre', short: 'Video', description: 'Síntesis audiovisual de los principales hábitos de seguridad digital.' },
      { key: 'actividad', stage: 'actividad', step: 3, icon: 'assignment', kind: 'Práctica interactiva', title: 'Actividad integradora', short: 'Actividad', description: 'Situación final para integrar criterios de decisión trabajados en los módulos anteriores.' },
      { key: 'evaluacion', stage: 'evaluacion', step: 4, icon: 'quiz', kind: 'Evaluación', title: 'Verificación final', short: 'Evaluación', description: 'Evaluación final de los contenidos principales de la capacitación.' }
    ]
  }
};

export function getModule(moduleId){
  return modules[Number(moduleId)] || null;
}

export function getModuleResources(moduleId){
  const mod = getModule(moduleId);
  if(!mod) return [];
  return [...(mod.theoryTopics || []), ...(mod.resources || [])];
}

export function getResource(moduleId, resourceKey){
  return getModuleResources(moduleId).find(r => r.key === resourceKey) || null;
}

export function getStageSummary(moduleId){
  const mod = getModule(moduleId);
  if(!mod) return [];
  return [
    { key:'teoria', label:'Material teórico', count:(mod.theoryTopics || []).length || 1 },
    { key:'video', label:'Video', count:1 },
    { key:'actividad', label:'Actividad', count:1 },
    { key:'evaluacion', label:'Evaluación', count:1 }
  ];
}

export function getNextDestination(moduleId, resourceKey){
  const id = Number(moduleId);
  const list = getModuleResources(id);
  const idx = list.findIndex(r => r.key === resourceKey);
  if(idx >= 0 && idx < list.length - 1){
    return { type:'resource', to:`/modulos/${id}/${list[idx + 1].key}`, label:list[idx + 1].title };
  }
  if(id < 4){
    const next = getModule(id + 1);
    return { type:'module', to:`/modulos/${id + 1}`, label:`Módulo ${id + 1}: ${next.title}` };
  }
  return { type:'finish', to:'/inicio', label:'Volver al panel de capacitación' };
}
