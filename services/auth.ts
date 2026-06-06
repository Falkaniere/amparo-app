import { apiFetch } from './api';

export const authService = {
  async register(payload: {
    name: string; email: string; password: string; phone: string; role: string;
  }) {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(email: string, password: string) {
    return apiFetch<{
      access_token: string;
      refresh_token: string;
      user: { id: string; email: string; name: string; role: 'family' | 'companion' };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async refresh(refresh_token: string) {
    return apiFetch<{ access_token: string; refresh_token: string }>(
      '/auth/refresh',
      { method: 'POST', body: JSON.stringify({ refresh_token }) }
    );
  },

  async googleLogin(payload: { idToken: string }) {
    return apiFetch<{
      access_token: string;
      refresh_token: string;
      user: { id: string; email: string; name: string; role: 'family' | 'companion' | null };
    }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async setRole(role: 'family' | 'companion', token: string) {
    return apiFetch<{ role: string }>('/auth/role', {
      method: 'POST',
      token,
      body: JSON.stringify({ role }),
    });
  },
};
