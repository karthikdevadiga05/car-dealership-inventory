const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

/** Single place that talks to the backend: adds the JWT and normalises errors. */
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  register: (email, password) =>
    request('/auth/register', { method: 'POST', body: { email, password }, auth: false }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/auth/me'),

  listVehicles: () => request('/vehicles'),
  searchVehicles: (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined) params.set(key, value);
    });
    return request(`/vehicles/search?${params}`);
  },
  createVehicle: (vehicle) => request('/vehicles', { method: 'POST', body: vehicle }),
  updateVehicle: (id, vehicle) => request(`/vehicles/${id}`, { method: 'PUT', body: vehicle }),
  deleteVehicle: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),
  purchase: (id, quantity = 1) =>
    request(`/vehicles/${id}/purchase`, { method: 'POST', body: { quantity } }),
    restock: (id, quantity) =>
    request(`/vehicles/${id}/restock`, { method: 'POST', body: { quantity } }),
};