import { requestsService } from '../../services/requests';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function mockSuccess(data: unknown) {
  return { ok: true, json: jest.fn().mockResolvedValueOnce(data) };
}

const TOKEN = 'test-token';

describe('requestsService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('create() POSTs to /requests', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccess({ request: { id: 'r1' } }));
    await requestsService.create(TOKEN, {
      companion_id: 'c1',
      type: 'medical',
      scheduled_at: '2024-01-01T10:00:00Z',
      duration_hours: 2,
      origin_address: 'Rua X, 123',
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/requests'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('getFamilyRequests() GETs /requests/family', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccess({ requests: [] }));
    const res = await requestsService.getFamilyRequests(TOKEN);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/requests/family'),
      expect.any(Object)
    );
    expect(res).toEqual({ requests: [] });
  });

  it('getCompanionRequests() GETs /requests/companion', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccess({ requests: [{ id: 'r1' }] }));
    const res = await requestsService.getCompanionRequests(TOKEN);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/requests/companion'),
      expect.any(Object)
    );
    expect(res).toMatchObject({ requests: expect.any(Array) });
  });

  it('getById() GETs /requests/:id', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccess({ request: { id: 'r1', status: 'pending' } }));
    const res = await requestsService.getById('r1', TOKEN);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/requests/r1'),
      expect.any(Object)
    );
    expect(res).toMatchObject({ request: { id: 'r1' } });
  });

  it('updateStatus() PATCHes /requests/:id/status', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccess({ request: { status: 'accepted' } }));
    await requestsService.updateStatus('r1', TOKEN, 'accepted');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/requests/r1/status'),
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('updateStatus() includes cancel_reason when provided', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccess({ request: { status: 'cancelled' } }));
    await requestsService.updateStatus('r1', TOKEN, 'cancelled', 'Changed plans');
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.cancel_reason).toBe('Changed plans');
  });

  it('sendLocation() POSTs lat/lng to /requests/:id/location', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccess({ ok: true }));
    await requestsService.sendLocation('r1', TOKEN, -23.5505, -46.6333);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/requests/r1/location'),
      expect.objectContaining({ method: 'POST' })
    );
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.lat).toBe(-23.5505);
    expect(body.lng).toBe(-46.6333);
  });
});
