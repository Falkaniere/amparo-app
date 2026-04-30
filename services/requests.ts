import { apiFetch } from './api';

export const requestsService = {
  async create(token: string, payload: {
    companion_id: string; type: string; scheduled_at: string;
    duration_hours: number; origin_address: string;
    origin_lat?: number; origin_lng?: number;
    destination_address?: string; notes?: string;
  }) {
    return apiFetch('/requests', {
      method: 'POST', token,
      body: JSON.stringify(payload),
    });
  },

  async getFamilyRequests(token: string) {
    return apiFetch<{ requests: any[] }>('/requests/family', { token });
  },

  async getCompanionRequests(token: string) {
    return apiFetch<{ requests: any[] }>('/requests/companion', { token });
  },

  async getById(id: string, token: string) {
    return apiFetch<{ request: any }>(`/requests/${id}`, { token });
  },

  async updateStatus(id: string, token: string, status: string, cancel_reason?: string) {
    return apiFetch(`/requests/${id}/status`, {
      method: 'PATCH', token,
      body: JSON.stringify({ status, cancel_reason }),
    });
  },

  async sendLocation(id: string, token: string, lat: number, lng: number) {
    return apiFetch(`/requests/${id}/location`, {
      method: 'POST', token,
      body: JSON.stringify({ lat, lng }),
    });
  },
};
