export const radius = {
  none: '0px',
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem',  // 24px (Cards & Modals)
  '3xl': '2rem',    // 32px (Bottom Sheets)
  full: '9999px',
} as const;

export type RadiusToken = typeof radius;
