'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'emerald';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      xs: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
      sm: 'px-3.5 py-2 text-xs rounded-xl gap-2',
      md: 'px-4 py-2.5 text-sm rounded-xl gap-2 font-semibold',
      lg: 'px-6 py-3 text-base rounded-2xl gap-2.5 font-bold',
    }[size];

    const variantClasses = {
      primary:
        'bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-midnight-950 font-bold shadow-glowTeal hover:shadow-hover border border-teal-300/40 active:scale-[0.98]',
      emerald:
        'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-midnight-950 font-bold shadow-glowEmerald hover:shadow-hover border border-emerald-300/40 active:scale-[0.98]',
      secondary:
        'bg-midnight-800 hover:bg-midnight-700 text-slate-200 border border-slateSurface-border hover:border-slateSurface-borderLight active:scale-[0.98]',
      outline:
        'bg-transparent hover:bg-teal-950/40 text-teal-300 border border-teal-500/40 hover:border-teal-400/70 active:scale-[0.98]',
      danger:
        'bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-700/50 shadow-glowRed active:scale-[0.98]',
      ghost:
        'bg-transparent hover:bg-midnight-800/80 text-slate-300 hover:text-white',
    }[variant];

    const disabledClasses = disabled || isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center transition-all duration-200 select-none ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
