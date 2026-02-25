const BASE = import.meta.env.VITE_API_URL ?? '/api';

let getToken = null;
export function setClerkTokenGetter(fn) {
  getToken = fn;
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (getToken) {
    try {
      const token = await getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch (_) {}
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data;
}

export const api = {
  contacts: {
    list: () => request('/contacts'),
    get: (id) => request(`/contacts/${id}`),
    create: (body) => request('/contacts', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
  },
  chat: {
    reply: (body) => request('/chat', { method: 'POST', body: JSON.stringify(body) }),
  },
};
