const BEMADY_LOCAL_API_BASE = window.BEMADY_API_BASE_URL || 'http://localhost:5000/api';
/* Bemady production API client.
   API domain: https://api.bemady.com
   Public site: https://bemady.com
*/
window.AURUM_CONFIG = window.AURUM_CONFIG || {
  API_BASE: 'https://api.bemady.com'
};

const API_BASE = window.AURUM_CONFIG.API_BASE;
let CSRF_TOKEN = '';

async function getCsrfToken() {
  const res = await fetch(`${API_BASE}/api/security/csrf`, { credentials: 'include' });
  if (!res.ok) throw new Error('Could not get CSRF token');
  const data = await res.json();
  CSRF_TOKEN = data.csrfToken;
  return CSRF_TOKEN;
}

async function secureFetch(path, options = {}) {
  if (!CSRF_TOKEN) await getCsrfToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': CSRF_TOKEN,
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    let message = 'API request failed';
    try { message = (await res.json()).message || message; } catch {}
    throw new Error(message);
  }
  return res.json();
}

const BemadyAPI = {
  health: () => fetch(`${API_BASE}/health`).then(r => r.json()),
  csrf: getCsrfToken,
  adminLogin: (email, password, twoFactorCode = '') => secureFetch('/api/auth/admin-login', { method:'POST', body: JSON.stringify({ email, password, twoFactorCode }) }),
  adminMe: () => secureFetch('/api/auth/me', { method:'GET' }),
  adminLogout: () => secureFetch('/api/auth/logout', { method:'POST', body: JSON.stringify({}) }),
  products: () => secureFetch('/api/products', { method:'GET' }),
  trackVisit: (payload) => fetch(`${API_BASE}/api/track`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload || {}) }).then(r => r.json()),
  trackProductEvent: (payload) => fetch(`${API_BASE}/api/track/product-event`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload || {}) }).then(r => r.json()),
  createOrder: (payload) => secureFetch('/api/orders', { method:'POST', body: JSON.stringify(payload) }),
  createSignup: (payload) => secureFetch('/api/signups', { method:'POST', body: JSON.stringify(payload) }),
  admin: (path, options={}) => secureFetch(`/api/portal-bemady-9f2a7c${path}`, options)
};
