export const motion = {
  spring: {
    gentle: { type: 'spring', stiffness: 200, damping: 25 },
    responsive: { type: 'spring', stiffness: 300, damping: 30 },
    snappy: { type: 'spring', stiffness: 400, damping: 35 },
    bounce: { type: 'spring', stiffness: 500, damping: 15 },
  },
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    startupTotal: 3.5, // 3.5s maximum startup sequence
  },
  ease: {
    standard: [0.4, 0.0, 0.2, 1],
    decelerate: [0.0, 0.0, 0.2, 1],
    accelerate: [0.4, 0.0, 1, 1],
  }
} as const;

export type MotionToken = typeof motion;
