import { create } from 'zustand';
import { authService } from '@/services';
import type { AuthSession, User } from '@/types/user';

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

type AuthState = {
  session: AuthSession | null;
  user: User | null;
  status: AuthStatus;
  error: string | null;

  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  status: 'idle',
  error: null,

  hydrate: async () => {
    set({ status: 'loading' });
    try {
      const session = await authService.getCurrentSession();
      if (session) {
        set({
          session,
          user: session.user,
          status: 'authenticated',
          error: null,
        });
      } else {
        set({ session: null, user: null, status: 'unauthenticated' });
      }
    } catch (e) {
      set({
        status: 'error',
        error: e instanceof Error ? e.message : 'unknown error',
      });
    }
  },

  login: async (email, password) => {
    set({ status: 'loading', error: null });
    try {
      const session = await authService.login({ email, password });
      set({
        session,
        user: session.user,
        status: 'authenticated',
        error: null,
      });
    } catch (e) {
      set({
        status: 'error',
        error: e instanceof Error ? e.message : 'login failed',
      });
      throw e;
    }
  },

  register: async (email, password, displayName) => {
    set({ status: 'loading', error: null });
    try {
      const session = await authService.register({
        email,
        password,
        displayName,
      });
      set({
        session,
        user: session.user,
        status: 'authenticated',
        error: null,
      });
    } catch (e) {
      set({
        status: 'error',
        error: e instanceof Error ? e.message : 'registration failed',
      });
      throw e;
    }
  },

  requestPasswordReset: async (email) => {
    try {
      await authService.requestPasswordReset(email);
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'reset failed',
      });
      throw e;
    }
  },

  logout: async () => {
    await authService.logout();
    set({
      session: null,
      user: null,
      status: 'unauthenticated',
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
