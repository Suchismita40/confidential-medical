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
      xs: 'px-2.5 py-1.5 text-xs rounded-lg inline-flex items-center gap-1.5',
      sm: 'px-3.5 py-2 text-xs rounded-xl inline-flex items-center gap-2',
      md: 'px-4 py-2.5 text-sm rounded-xl inline-flex items-center gap-2 font-semibold',
      lg: 'px-6 py-3 text-base rounded-2xl inline-flex items-center gap-2.5 font-bold',
    }[size];

    const variantClasses = {
      primary:
        'bg-emerald-accent hover:bg-emerald-muted text-nordic-bg font-bold shadow-emerald border border-emerald-accent/50 active:scale-[0.98]',
      emerald:
        'bg-emerald-accent hover:bg-emerald-muted text-nordic-bg font-bold shadow-emerald border border-emerald-accent/50 active:scale-[0.98]',
      secondary:
        'bg-nordic-panel hover:bg-nordic-hover text-emerald-950 border border-emerald-200 active:scale-[0.98]',
      outline:
        'bg-transparent hover:bg-emerald-surface text-emerald-accent border border-emerald-border active:scale-[0.98]',
      danger:
        'bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border border-rose-700/50 active:scale-[0.98]',
      ghost:
        'bg-transparent hover:bg-nordic-hover text-nordic-olive hover:text-emerald-950',
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
