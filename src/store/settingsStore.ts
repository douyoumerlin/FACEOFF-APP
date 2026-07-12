import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Settings } from '../types';

interface SettingsState extends Settings {
  update: (updates: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultTime: 300, // 5 minutes
      soundEnabled: false,
      animationsEnabled: true,
      fullscreenEnabled: false,
      update: (updates) => set((state) => ({ ...state, ...updates })),
    }),
    { name: 'goat225-settings' }
  )
);
