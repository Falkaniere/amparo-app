import { authService } from '../../services/auth';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function mockSuccess(data: unknown) {
  return { ok: true, json: jest.fn().mockResolvedValueOnce(data) };
}

describe('authService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('login', () => {
    it('POSTs to /auth/login', async () => {
      mockFetch.mockResolvedValueOnce(mockSuccess({
        access_token: 'at', refresh_token: 'rt',
        user: { id: '1', email: 'a@b.com', name: 'A', role: 'family' },
      }));
      await authService.login('a@b.com', 'pass');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws on invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false, status: 401,
        json: jest.fn().mockResolvedValueOnce({ error: 'E-mail ou senha incorretos.' }),
      });
      await expect(authService.login('bad@email.com', 'wrong')).rejects.toThrow(
        'E-mail ou senha incorretos.'
      );
    });

    it('returns access_token and user on success', async () => {
      const expected = {
        access_token: 'at', refresh_token: 'rt',
        user: { id: '1', email: 'a@b.com', name: 'A', role: 'family' as const },
      };
      mockFetch.mockResolvedValueOnce(mockSuccess(expected));
      const result = await authService.login('a@b.com', 'pass');
      expect(result).toEqual(expected);
    });
  });

  describe('register', () => {
    it('POSTs to /auth/register', async () => {
      mockFetch.mockResolvedValueOnce(mockSuccess({ message: 'Conta criada.', user: { id: '1' } }));
      await authService.register({ name: 'Alice', email: 'a@b.com', password: 'pass', phone: '123', role: 'family' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws when server rejects invalid role', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false, status: 400,
        json: jest.fn().mockResolvedValueOnce({ error: 'Role deve ser family ou companion.' }),
      });
      await expect(
        authService.register({ name: 'X', email: 'x@x.com', password: 'p', phone: '1', role: 'admin' })
      ).rejects.toThrow('Role deve ser family ou companion.');
    });
  });

  describe('refresh', () => {
    it('POSTs to /auth/refresh', async () => {
      mockFetch.mockResolvedValueOnce(mockSuccess({ access_token: 'new-at', refresh_token: 'new-rt' }));
      await authService.refresh('old-rt');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/refresh'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws when refresh token is expired', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false, status: 401,
        json: jest.fn().mockResolvedValueOnce({ error: 'Refresh token inválido.' }),
      });
      await expect(authService.refresh('expired')).rejects.toThrow('Refresh token inválido.');
    });
  });

  describe('googleLogin', () => {
    it('POSTs to /auth/google', async () => {
      mockFetch.mockResolvedValueOnce(mockSuccess({
        access_token: 'at', refresh_token: 'rt',
        user: { id: '1', email: 'a@b.com', name: 'A', role: null },
      }));
      await authService.googleLogin({ code: 'code', redirectUri: 'exp://cb' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/google'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('setRole', () => {
    it('POSTs to /auth/role with Bearer token', async () => {
      mockFetch.mockResolvedValueOnce(mockSuccess({ role: 'family' }));
      await authService.setRole('family', 'token-123');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/role'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer token-123' }),
        })
      );
    });
  });
});
