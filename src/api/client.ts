const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getToken(): string | null {
  return localStorage.getItem('cybershield_token');
}

async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    register: (name: string, email: string, password: string) =>
      fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),

    login: (email: string, password: string) =>
      fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    me: () => fetchApi('/api/auth/me'),

    updateProfile: (name: string, email: string) =>
      fetchApi('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, email }),
      }),
  },

  scan: {
    analyze: (type: string, content: string) =>
      fetchApi(`/api/scan/${type}`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),

    history: () => fetchApi('/api/scan/history'),

    stats: () => fetchApi('/api/scan/stats'),

    clearHistory: () =>
      fetchApi('/api/scan/history', { method: 'DELETE' }),
  },
};
