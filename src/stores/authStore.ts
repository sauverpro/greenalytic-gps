import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginType } from '../types';

interface User {
  id: string;
  loginType: LoginType;
  grade: number;
  role?: 'admin' | 'user';
  username?: string;
  name?: string;
  email?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateToken: (token: string) => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      setAuth: (user, token) =>
        set({
          isAuthenticated: true,
          user,
          token,
        }),
      clearAuth: () =>
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        }),
      updateToken: (token) =>
        set((state) => ({
          ...state,
          token,
        })),
      isAdmin: () => {
        const state = get();
        return state.user?.role === 'admin';
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
