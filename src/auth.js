const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const SESSION_TOKEN_KEY = 'sf-capacita-token';
const CURRENT_USER_KEY = 'sf-capacita-current-user';

export class ApiError extends Error {
  constructor(message, status = 0, kind = 'api') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
  }
}

function saveSession(token, user) {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getToken() {
  return localStorage.getItem(SESSION_TOKEN_KEY) || '';
}

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      'No pudimos conectar con el servicio. Verificá que el backend y la base de datos estén disponibles e intentá nuevamente.',
      0,
      'network',
    );
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const kind = response.status >= 500 ? 'service' : 'api';
    throw new ApiError(body.error || 'No se pudo completar la operación.', response.status, kind);
  }
  return body;
}

export async function registerUser({ fullName, dni, email, password }) {
  const body = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName: fullName.trim(), dni: dni.trim(), email: email.trim().toLowerCase(), password }),
  });
  return body.user;
}

export async function loginUser(email, password) {
  const body = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  saveSession(body.token, body.user);
  return body.user;
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken() && getCurrentUser());
}

export async function refreshCurrentUser() {
  if (!getToken()) return null;
  try {
    const body = await api('/auth/me');
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(body.user));
    return body.user;
  } catch (err) {
    // Solo eliminamos la sesión cuando el backend confirma que el token ya no es válido.
    // Si el backend o PostgreSQL están caídos, conservamos la sesión local para poder
    // retomarla cuando el servicio vuelva a estar disponible.
    if (err?.status === 401 || err?.status === 403) {
      clearSession();
      return null;
    }
    throw err;
  }
}

export function logoutUser() {
  const token = getToken();
  clearSession();
  if (token) {
    fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    }).catch(() => {});
  }
}

export async function requestPasswordReset(email) {
  return api('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}

export async function resetPassword(token, newPassword) {
  return api('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}


export async function downloadAuthenticatedFile(path, filename) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'No se pudo generar el archivo.');
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
