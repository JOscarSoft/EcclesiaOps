import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  mode: 'light' | 'dark';
  language: 'es' | 'en';
  toggleMode: () => void;
  setLanguage: (lang: 'es' | 'en') => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      mode: 'light',
      language: 'es',
      toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'ecclesiaops-ui',
    }
  )
);
