import { apiFetch } from '../../services/api';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('apiFetch', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('returns parsed JSON on a successful response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ message: 'ok' }),
    });
    const result = await apiFetch('/ping');
    expect(result).toEqual({ message: 'ok' });
  });

  it('sends Content-Type application/json header', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce({}) });
    await apiFetch('/ping');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('adds Authorization header when token is provided', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce({}) });
    await apiFetch('/profile/me', { token: 'my-token' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      })
    );
  });

  it('does not add Authorization header when no token', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce({}) });
    await apiFetch('/ping');
    const headers = (mockFetch.mock.calls[0][1] as { headers: Record<string, string> }).headers;
    expect(headers).not.toHaveProperty('Authorization');
  });

  it('throws error with server message on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValueOnce({ error: 'Unauthorized' }),
    });
    await expect(apiFetch('/secure')).rejects.toThrow('Unauthorized');
  });

  it('throws HTTP status string when no error message in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValueOnce({}),
    });
    await expect(apiFetch('/broken')).rejects.toThrow('HTTP 500');
  });

  it('appends path to the base API URL', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce({}) });
    await apiFetch('/auth/login');
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toMatch(/\/auth\/login$/);
  });
});
