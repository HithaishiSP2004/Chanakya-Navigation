import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none min-h-[48px] min-w-[48px] px-4 py-2.5',
        {
          'bg-emerald-700 text-white hover:bg-emerald-800 shadow-lg shadow-emerald-900/20 dark:bg-emerald-600 dark:hover:bg-emerald-500':
            variant === 'primary',
          'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700':
            variant === 'secondary',
          'bg-transparent text-slate-700 hover:bg-slate-100/50 dark:text-slate-300 dark:hover:bg-slate-800/50':
            variant === 'ghost',
          'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-900/20':
            variant === 'danger',
          'text-sm py-2 px-3': size === 'sm',
          'text-base py-3 px-5': size === 'md',
          'text-lg py-4 px-6': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2.5">{icon}</span>}
      {children}
    </button>
  );
};
