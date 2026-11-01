import { getModuleResources, getStageSummary } from './moduleData';
import { api, getToken } from './auth';

const KEY = 'sf-capacita-progress';

function emptyModule(moduleId){
  return Object.fromEntries(getModuleResources(moduleId).map(r => [r.key, false]));
}

export function getProgress(){
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return [1,2,3,4].reduce((acc,id)=>{
      acc[id] = { ...emptyModule(id), ...(raw[id] || {}) };
      return acc;
    },{});
  } catch {
    return {1:emptyModule(1),2:emptyModule(2),3:emptyModule(3),4:emptyModule(4)};
  }
}

function saveAll(all){
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('sf-progress-updated'));
}

export async function syncProgressFromServer(){
  if(!getToken()) return getProgress();
  try {
    const body = await api('/progress');
    const remote = body.progress || {};
    const all = getProgress();
    [1,2,3,4].forEach(id=>{
      all[id] = { ...emptyModule(id), ...(remote[String(id)] || remote[id] || {}) };
    });
    saveAll(all);
    return all;
  } catch {
    return getProgress();
  }
}

export function getModuleProgress(moduleId){
  const id = Number(moduleId);
  return getProgress()[id] || emptyModule(id);
}

export function setResourceCompleted(moduleId, resource, completed=true){
  const id = Number(moduleId);
  const all = getProgress();
  all[id] = { ...emptyModule(id), ...(all[id] || {}), [resource]: completed };
  saveAll(all);
  if(getToken()){
    api(`/progress/${id}/${encodeURIComponent(resource)}`, {
      method:'PUT',
      body:JSON.stringify({completed})
    }).catch(()=>{});
  }
  return all[id];
}

export function recordEvaluationResult(moduleId, score, total, answers){
  if(!getToken()) return Promise.resolve();
  return api(`/evaluations/${Number(moduleId)}`, {
    method:'POST',
    body:JSON.stringify({score,total,answers})
  });
}

export function moduleStats(moduleId){
  const id = Number(moduleId);
  const p = getModuleProgress(id);
  const resources = getModuleResources(id);
  const completed = resources.filter(r => p[r.key]).length;
  const total = resources.length || 1;
  const stages = getStageSummary(id).map(stage => {
    const stageResources = resources.filter(r => r.stage === stage.key);
    const stageCompleted = stageResources.filter(r => p[r.key]).length;
    return {...stage, completed:stageCompleted, done:stageResources.length>0 && stageCompleted===stageResources.length};
  });
  // Cada módulo pesa lo mismo. Dentro del módulo, Teoría / Video / Actividad / Evaluación
  // representan 25 % cada uno. Si la teoría tiene varios temas (Módulo 2), ese 25 %
  // se reparte proporcionalmente entre ellos.
  const stageWeight = stages.length ? 100 / stages.length : 0;
  const percent = Math.round(stages.reduce((sum,stage)=>{
    const fraction = stage.count ? stage.completed / stage.count : 0;
    return sum + Math.min(1, fraction) * stageWeight;
  },0));
  return { completed, total, percent, progress:p, stages };
}

export function overallStats(){
  const stats = [1,2,3,4].map(moduleStats);
  const completed = stats.reduce((sum,s)=>sum+s.completed,0);
  const total = stats.reduce((sum,s)=>sum+s.total,0);
  const percent = Math.round(stats.reduce((sum,s)=>sum+s.percent,0) / stats.length);
  return {completed,total,percent};
}
