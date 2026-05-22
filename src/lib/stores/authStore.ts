import { create } from 'zustand';
import { mockAuthApi, User } from '../api/auth';
import { storage } from '../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    firstName: string;
    lastName: string;
    role: User['role'];
    propertyName: string;
    region: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  init: () => Promise<void>;
  clearError: () => void;
}

const SECURE_STORE_TOKEN_KEY = 'aurasense_jwt_token';
const SECURE_STORE_USER_KEY = 'aurasense_user_profile';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  init: async () => {
    set({ isLoading: true });
    try {
      const token = await storage.getItemAsync(SECURE_STORE_TOKEN_KEY);
      const userStr = await storage.getItemAsync(SECURE_STORE_USER_KEY);
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ token, user, isLoading: false, error: null });
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError);
          await storage.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
          await storage.deleteItemAsync(SECURE_STORE_USER_KEY);
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Auth init error:', e);
      try {
        await storage.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
        await storage.deleteItemAsync(SECURE_STORE_USER_KEY);
      } catch (clearError) {
        console.error('Failed to clear storage:', clearError);
      }
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mockAuthApi.login(email, password);
      
      await storage.setItemAsync(SECURE_STORE_TOKEN_KEY, response.token);
      await storage.setItemAsync(SECURE_STORE_USER_KEY, JSON.stringify(response.user));
      
      set({ user: response.user, token: response.token, isLoading: false, error: null });
    } catch (e: any) {
      set({ error: e.message || 'Login failed', isLoading: false });
      throw e;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mockAuthApi.register(data);
      
      await storage.setItemAsync(SECURE_STORE_TOKEN_KEY, response.token);
      await storage.setItemAsync(SECURE_STORE_USER_KEY, JSON.stringify(response.user));
      
      set({ user: response.user, token: response.token, isLoading: false, error: null });
    } catch (e: any) {
      set({ error: e.message || 'Registration failed', isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await storage.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
      await storage.deleteItemAsync(SECURE_STORE_USER_KEY);
      set({ user: null, token: null, isLoading: false, error: null });
    } catch (e) {
      set({ user: null, token: null, isLoading: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));
