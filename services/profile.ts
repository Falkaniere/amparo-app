import { apiFetch } from './api';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

async function uploadFile(
  endpoint: string,
  token: string,
  uri: string,
  extraFields?: Record<string, string>
) {
  const filename = uri.split('/').pop() || 'file.jpg';
  const formData = new FormData();
  formData.append('file', { uri, name: filename, type: 'image/jpeg' } as any);
  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      formData.append(key, value);
    }
  }
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: endpoint.includes('/photo') ? 'PUT' : 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

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

  async uploadProfilePhoto(token: string, uri: string) {
    return uploadFile('/profile/companion/photo', token, uri);
  },

  async uploadDocument(token: string, uri: string, type: string) {
    return uploadFile('/profile/companion/documents', token, uri, { type });
  },
};
