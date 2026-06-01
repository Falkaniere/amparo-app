jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
}));

import { useAuthStore } from '../../store/auth';
import * as SecureStore from 'expo-secure-store';

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

const mockUser = {
  id: 'user-123',
  email: 'test@test.com',
  name: 'Test User',
  role: 'family' as const,
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null });
    jest.clearAllMocks();
  });

  it('has null token and user by default', () => {
    const { token, user } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
  });

  describe('setAuth', () => {
    it('updates token and user in state', () => {
      useAuthStore.getState().setAuth('access-token', mockUser);
      expect(useAuthStore.getState().token).toBe('access-token');
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('persists token and user to SecureStore', () => {
      useAuthStore.getState().setAuth('access-token', mockUser);
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'access-token');
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('auth_user', JSON.stringify(mockUser));
    });

    it('overwrites a previous session', () => {
      useAuthStore.getState().setAuth('token-1', { ...mockUser, id: 'old-user' });
      useAuthStore.getState().setAuth('token-2', mockUser);
      expect(useAuthStore.getState().token).toBe('token-2');
      expect(useAuthStore.getState().user?.id).toBe('user-123');
    });
  });

  describe('clearAuth', () => {
    it('resets token and user to null', () => {
      useAuthStore.getState().setAuth('access-token', mockUser);
      useAuthStore.getState().clearAuth();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('removes both items from SecureStore', () => {
      useAuthStore.getState().clearAuth();
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_user');
    });
  });

  describe('loadFromStorage', () => {
    it('loads token and user when stored data exists', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce('stored-token')
        .mockResolvedValueOnce(JSON.stringify(mockUser));
      await useAuthStore.getState().loadFromStorage();
      expect(useAuthStore.getState().token).toBe('stored-token');
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('keeps null state when storage is empty', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);
      await useAuthStore.getState().loadFromStorage();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('keeps null state when only token exists but not user', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce('stored-token')
        .mockResolvedValueOnce(null);
      await useAuthStore.getState().loadFromStorage();
      expect(useAuthStore.getState().token).toBeNull();
    });
  });
});
