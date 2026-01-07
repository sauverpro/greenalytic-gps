import { create } from 'zustand';
import type { MapType } from '../types';

interface AppState {
  mapType: MapType;
  language: 'cn' | 'en';
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  setMapType: (mapType: MapType) => void;
  setLanguage: (language: 'cn' | 'en') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  mapType: 'BAIDU',
  language: 'cn',
  theme: 'light',
  sidebarCollapsed: false,
  setMapType: (mapType) => set({ mapType }),
  setLanguage: (language) => set({ language }),
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
