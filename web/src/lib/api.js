// API helper. Student and admin sessions use SEPARATE storage keys, so one
// role's token can never satisfy the other role's routes. Tokens are never
// rendered or logged.
export const TOKEN_KEYS = { student: 'examrobo_student_token', admin: 'examrobo_admin_token' };
const PROFILE_KEYS = { student: 'examrobo_student_profile', admin: 'examrobo_admin_profile' };

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status; // 0 = network failure
    this.data = data || {};
  }
}

export const auth = {
  token: (role) => { try { return localStorage.getItem(TOKEN_KEYS[role]); } catch { return null; } },
  profile: (role) => { try { return JSON.parse(localStorage.getItem(PROFILE_KEYS[role]) || 'null'); } catch { return null; } },
  set(role, token, profile) {
    try { localStorage.setItem(TOKEN_KEYS[role], token); localStorage.setItem(PROFILE_KEYS[role], JSON.stringify(profile || {})); } catch { /* storage blocked */ }
  },
  clear(role) {
    try { localStorage.removeItem(TOKEN_KEYS[role]); localStorage.removeItem(PROFILE_KEYS[role]); } catch { /* ignore */ }
  },
};

/**
 * api(path, { method, body, role, raw, headers, signal })
 * - role: 'student' | 'admin' picks which token is attached.
 * - raw: return the Response (used for CSV / binary downloads).
 * On 401 for an authenticated call the role's token is cleared and a
 * `examrobo:unauthorized` event is dispatched so the route guard can redirect.
 */
export async function api(path, { method = 'GET', body, role, raw = false, headers = {}, signal } = {}) {
  const h = { ...headers };
  const isBinary = body instanceof Blob || body instanceof ArrayBuffer;
  if (body !== undefined && !isBinary) h['Content-Type'] = 'application/json';
  const token = role ? auth.token(role) : null;
  if (token) h.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers: h, body: body === undefined ? undefined : isBinary ? body : JSON.stringify(body), signal });
  } catch (e) {
    if (e?.name === 'AbortError') throw e;
    throw new ApiError('Network error. Check your connection and try again.', 0);
  }
  if (res.status === 401 && token) {
    auth.clear(role);
    window.dispatchEvent(new CustomEvent('examrobo:unauthorized', { detail: { role } }));
  }
  if (raw && res.ok) return res;
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON */ }
  // The server locked the paper for an integrity violation: let any page on
  // screen move to the lock screen instead of showing a generic error.
  if (res.status === 409 && data?.locked) {
    window.dispatchEvent(new CustomEvent('examrobo:locked', {
      detail: { role, reason: data.lock_reason || null, label: data.lock_reason || null },
    }));
  }
  if (!res.ok) throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data);
  return data;
}

// A per-tab id. sessionStorage is scoped to one tab, so a reload keeps the
// id (the server can tell a reload from a second tab) while a new tab gets a
// new one (a second window). The id identifies the tab, the JWT sid
// identifies the sign-in - the server needs both to tell a second window
// apart from a second device.
let tabId = null;
export function tabToken() {
  if (tabId) return tabId;
  try {
    tabId = sessionStorage.getItem('examrobo:tab') || '';
    if (!tabId) {
      tabId =
        globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem('examrobo:tab', tabId);
    }
  } catch {
    // Storage is unavailable (private mode): fall back to a per-load id.
    tabId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
  return tabId;
}

export async function wsTicket(role) {
  const r = await api('/ws/ticket', { method: 'POST', role });
  return r.ticket;
}

export function wsUrl(ticket) {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${location.host}/ws?ticket=${encodeURIComponent(ticket || '')}&tab=${encodeURIComponent(tabToken())}`;
}
