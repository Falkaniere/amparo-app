import { apiFetch } from './api';

export const reviewsService = {
  async create(
    token: string,
    payload: {
      request_id: string;
      companion_id: string;
      rating: number;
      comment?: string;
      tags?: string[];
    },
  ) {
    return apiFetch('/reviews', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },

  async getByCompanion(companion_id: string) {
    return apiFetch<{ reviews: any[]; avg_rating: number }>(
      `/reviews/companion/${companion_id}`,
    );
  },
};
