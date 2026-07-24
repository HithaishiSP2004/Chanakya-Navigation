import React from 'react';
import { clsx } from 'clsx';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark' | 'interactive';
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'light',
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-3xl backdrop-blur-xl border transition-all duration-300 shadow-xl',
        {
          'bg-white/85 dark:bg-slate-900/85 border-white/40 dark:border-slate-800/60 text-slate-900 dark:text-slate-100':
            variant === 'light',
          'bg-slate-950/90 border-slate-800/80 text-slate-100': variant === 'dark',
          'bg-white/80 dark:bg-slate-900/80 border-white/50 dark:border-slate-700/50 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] cursor-pointer':
            variant === 'interactive',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
