import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  tenantId: string | null;
  user: any | null;
  setAuth: (token: string, tenantId: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tenantId: null,
      user: null,
      setAuth: (token, tenantId, user) => {
        // Ensure permissions is always an array
        const normalizedUser = { ...user, permissions: user.permissions || [] };
        set({ token, tenantId, user: normalizedUser });
      },
      logout: () => set({ token: null, tenantId: null, user: null }),
    }),
    {
      name: 'ecclesiaops-auth',
    }
  )
);
