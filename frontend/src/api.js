// Debe ser la URL base del backend + /api (ej. https://tu-api.onrender.com/api). No uses la URL del front estático.
const BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const url = `${BASE}${path}`;
  const res = await fetch(url, { ...options, headers });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (res.status === 404) {
    throw new Error(
      data.error ??
        `404 en ${url}. VITE_API_URL debe apuntar al backend (API), no al sitio estático. Ej: https://<servicio-api>.onrender.com/api`,
    );
  }
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
  stripe: {
    /** Checkout: priceId opcional si está STRIPE_PRICE_BASICO en el backend. */
    checkout: async ({ priceId, successUrl, cancelUrl, mode } = {}) => {
      const { url } = await request('/stripe/checkout-session', {
        method: 'POST',
        body: JSON.stringify({ priceId, successUrl, cancelUrl, mode }),
      });
      if (url) window.location.href = url;
    },
  },
};
