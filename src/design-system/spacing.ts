export const spacing = {
  // 4px grid system
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px (Minimum touch target size)
  16: '4rem',     // 64px
  // Accessibility & touch boundaries
  minTouchTarget: '48px',
  headerHeight: '64px',
  bottomNavHeight: '72px',
} as const;

export type SpacingToken = typeof spacing;
