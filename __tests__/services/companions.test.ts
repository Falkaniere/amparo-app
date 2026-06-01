import { companionsService } from '../../services/companions';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function mockSuccess(data: unknown) {
  return { ok: true, json: jest.fn().mockResolvedValueOnce(data) };
}

const BASE_PARAMS = {
  lat: -23.5,
  lng: -46.6,
  date: '2024-01-15',
  start_time: '09:00',
  duration_hours: 2,
};

describe('companionsService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getAvailable', () => {
    it('calls /companions/available with all query params', async () => {
      mockFetch.mockResolvedValueOnce(mockSuccess({ companions: [] }));
      await companionsService.getAvailable(BASE_PARAMS);
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/companions/available');
      expect(url).toContain('lat=-23.5');
      expect(url).toContain('lng=-46.6');
      expect(url).toContain('date=2024-01-15');
      expect(url).toContain('duration_hours=2');
    });

    it('returns companion list from the response', async () => {
      const companions = [{ id: 'c1', name: 'João' }, { id: 'c2', name: 'Maria' }];
      mockFetch.mockResolvedValueOnce(mockSuccess({ companions }));
      const res = await companionsService.getAvailable(BASE_PARAMS);
      expect(res).toEqual({ companions });
    });

    it('throws on server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false, status: 400,
        json: jest.fn().mockResolvedValueOnce({ error: 'lat, lng, date e start_time são obrigatórios.' }),
      });
      await expect(companionsService.getAvailable(BASE_PARAMS)).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('calls GET /companions/:id with Authorization header', async () => {
      mockFetch.mockResolvedValueOnce(mockSuccess({ companion: { id: 'c1' }, reviews: [] }));
      await companionsService.getById('c1', 'my-token');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/companions/c1'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
        })
      );
    });

    it('returns companion data and reviews', async () => {
      const companion = { id: 'c1', name: 'João', hourly_rate: 80 };
      const reviews = [{ score: 5, comment: 'Excelente!' }];
      mockFetch.mockResolvedValueOnce(mockSuccess({ companion, reviews }));
      const res = await companionsService.getById('c1', 'token');
      expect(res).toEqual({ companion, reviews });
    });

    it('throws when companion not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false, status: 404,
        json: jest.fn().mockResolvedValueOnce({ error: 'Acompanhante não encontrado.' }),
      });
      await expect(companionsService.getById('bad-id', 'token')).rejects.toThrow(
        'Acompanhante não encontrado.'
      );
    });
  });
});
