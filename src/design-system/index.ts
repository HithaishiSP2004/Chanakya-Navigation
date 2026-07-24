import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { motion } from './motion';
import { elevation } from './elevation';

export const designSystem = {
  colors,
  typography,
  spacing,
  radius,
  motion,
  elevation,
} as const;

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radius';
export * from './motion';
export * from './elevation';

export default designSystem;
