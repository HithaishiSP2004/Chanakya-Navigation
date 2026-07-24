export const colors = {
  brand: {
    primary: '#0D5C3A',      // Chanakya Forest Green
    primaryDark: '#083B25',
    accent: '#10B981',       // Vibrant Emerald
    accentLight: '#6EE7B7',
    gold: '#D97706',         // Chanakya Seal Gold
  },
  navigation: {
    blue: '#1A73E8',         // Google Navigation Blue
    blueDark: '#1557B0',
    routePolyline: '#2563EB',
    userDot: '#3B82F6',
  },
  surface: {
    light: 'rgba(255, 255, 255, 0.90)',
    lightSecondary: 'rgba(248, 250, 252, 0.95)',
    dark: 'rgba(15, 23, 42, 0.92)',
    darkSecondary: 'rgba(30, 41, 59, 0.95)',
    oledDark: 'rgba(0, 0, 0, 0.95)',
    glassBorderLight: 'rgba(255, 255, 255, 0.30)',
    glassBorderDark: 'rgba(255, 255, 255, 0.12)',
  },
  text: {
    lightPrimary: '#0F172A',
    lightSecondary: '#475569',
    lightMuted: '#94A3B8',
    darkPrimary: '#F8FAFC',
    darkSecondary: '#CBD5E1',
    darkMuted: '#64748B',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  }
} as const;

export type ColorsToken = typeof colors;
