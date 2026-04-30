import { apiFetch } from './api';

export const profileService = {
  async getMe(token: string) {
    return apiFetch<{ profile: any; role: string }>('/profile/me', { token });
  },

  async update(token: string, updates: Record<string, any>) {
    return apiFetch('/profile/me', {
      method: 'PUT', token,
      body: JSON.stringify(updates),
    });
  },

  async setOnline(token: string, is_online: boolean) {
    return apiFetch('/profile/companion/online', {
      method: 'PUT', token,
      body: JSON.stringify({ is_online }),
    });
  },

  async setAvailability(token: string, slots: Array<{
    day_of_week: number; start_time: string; end_time: string; is_active: boolean;
  }>) {
    return apiFetch('/profile/companion/availability', {
      method: 'PUT', token,
      body: JSON.stringify({ slots }),
    });
  },
};
