import { reviewsService } from '../../services/reviews';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function mockSuccess(data: unknown) {
  return { ok: true, json: jest.fn().mockResolvedValueOnce(data) };
}

describe('reviewsService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('create', () => {
    it('POSTs to /reviews with Authorization header', async () => {
      mockFetch.mockResolvedValueOnce(mockSuccess({ review: { id: 'r1' } }));
      await reviewsService.create('my-token', {
        request_id: 'req-1', companion_id: 'c1', rating: 5,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/reviews'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
        })
      );
    });

    it('includes optional comment and tags in request body', async () => {
      mockFetch.mockResolvedValueOnce(mockSuccess({ review: { id: 'r1' } }));
      await reviewsService.create('token', {
        request_id: 'req-1', companion_id: 'c1', rating: 4,
        comment: 'Very good!', tags: ['punctual', 'kind'],
      });
      const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
      expect(body.comment).toBe('Very good!');
      expect(body.tags).toEqual(['punctual', 'kind']);
    });

    it('throws when server rejects (service not completed)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false, status: 400,
        json: jest.fn().mockResolvedValueOnce({ error: 'Só é possível avaliar serviços concluídos.' }),
      });
      await expect(
        reviewsService.create('token', { request_id: 'r1', companion_id: 'c1', rating: 5 })
      ).rejects.toThrow('Só é possível avaliar serviços concluídos.');
    });
  });

  describe('getByCompanion', () => {
    it('calls GET /reviews/companion/:id', async () => {
      mockFetch.mockResolvedValueOnce(mockSuccess({ reviews: [], avg_rating: 0 }));
      await reviewsService.getByCompanion('c1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/reviews/companion/c1'),
        expect.any(Object)
      );
    });

    it('returns reviews array and avg_rating', async () => {
      const reviews = [{ score: 5, comment: 'Great!' }, { score: 4, comment: 'Good' }];
      mockFetch.mockResolvedValueOnce(mockSuccess({ reviews, avg_rating: 4.5 }));
      const res = await reviewsService.getByCompanion('c1');
      expect(res).toEqual({ reviews, avg_rating: 4.5 });
    });

    it('does not require an auth token', async () => {
      mockFetch.mockResolvedValueOnce(mockSuccess({ reviews: [], avg_rating: 0 }));
      await reviewsService.getByCompanion('c1');
      const headers = (mockFetch.mock.calls[0][1] as { headers: Record<string, string> }).headers;
      expect(headers).not.toHaveProperty('Authorization');
    });
  });
});
