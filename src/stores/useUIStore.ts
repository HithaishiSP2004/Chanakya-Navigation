import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system' | 'oled';
export type ActiveTab = 'NAVIGATE' | 'EXPLORE' | 'DEMO';

interface UIState {
  theme: ThemeMode;
  activeTab: ActiveTab;
  isStartupFinished: boolean;
  pwaInstallPrompt: any | null;
  isOffline: boolean;
  setTheme: (theme: ThemeMode) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setStartupFinished: (finished: boolean) => void;
  setPwaInstallPrompt: (prompt: any) => void;
  setIsOffline: (isOffline: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'system',
  activeTab: 'NAVIGATE',
  isStartupFinished: false,
  pwaInstallPrompt: null,
  isOffline: false,
  setTheme: (theme) => set({ theme }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setStartupFinished: (isStartupFinished) => set({ isStartupFinished }),
  setPwaInstallPrompt: (pwaInstallPrompt) => set({ pwaInstallPrompt }),
  setIsOffline: (isOffline) => set({ isOffline }),
}));
