import { apiFetch } from './api';

export const companionsService = {
  async getAvailable(params: {
    lat: number; lng: number; date: string; start_time: string; duration_hours: number;
  }) {
    const q = new URLSearchParams({
      lat:            String(params.lat),
      lng:            String(params.lng),
      date:           params.date,
      start_time:     params.start_time,
      duration_hours: String(params.duration_hours),
    });
    return apiFetch<{ companions: any[] }>(`/companions/available?${q}`);
  },

  async getById(id: string, token: string) {
    return apiFetch<{ companion: any; reviews: any[] }>(
      `/companions/${id}`,
      { token }
    );
  },
};
