const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const SESSION_TOKEN_KEY = 'sf-capacita-token';
const CURRENT_USER_KEY = 'sf-capacita-current-user';

function saveSession(token, user) {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

function getToken() {
  return localStorage.getItem(SESSION_TOKEN_KEY) || '';
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'No se pudo completar la operación.');
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
  } catch {
    clearSession();
    return null;
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
