import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id:    string;
  email: string;
  name:  string;
  role:  'family' | 'companion';
}

interface AuthState {
  token:    string | null;
  user:     User | null;
  setAuth:  (token: string, user: User) => void;
  clearAuth: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user:  null,

  setAuth: (token, user) => {
    set({ token, user });
    // Persiste no SecureStore
    SecureStore.setItemAsync('auth_token', token);
    SecureStore.setItemAsync('auth_user', JSON.stringify(user));
  },

  clearAuth: () => {
    set({ token: null, user: null });
    SecureStore.deleteItemAsync('auth_token');
    SecureStore.deleteItemAsync('auth_user');
  },

  loadFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userStr = await SecureStore.getItemAsync('auth_user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr) });
      }
    } catch {}
  },
}));
