import { create } from 'zustand';
import { api } from '@/shared/api/client';
import type { User } from '@/shared/types/domain';

interface AuthState {
  user: User | null;
  ready: boolean;
  bootstrap(): Promise<void>;
  setUser(user: User | null): void;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  ready: false,
  bootstrap: async () => {
    try {
      await api.csrf();
      set({ user: await api.me(), ready: true });
    } catch {
      set({ user: null, ready: true });
    }
  },
  setUser: (user) => set({ user }),
}));
