export const theme = {
  colors: {
    primary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      900: '#064e3b',
      950: '#022c22',
    },
    slate: {
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    gold: '#d97706',
    blue: '#2563eb',
    purple: '#9333ea',
  },
  radii: {
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  },
  glass: {
    panel: 'bg-slate-950/96 backdrop-blur-2xl border border-slate-800/70 shadow-2xl',
    card: 'bg-slate-900/80 backdrop-blur-md border border-slate-800/60 shadow-lg',
    pill: 'bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 shadow-xl',
  },
  animation: {
    fast: 'transition-all duration-200 ease-out',
    normal: 'transition-all duration-300 ease-out',
    bounce: 'transition-transform duration-150 active:scale-95',
  },
};
