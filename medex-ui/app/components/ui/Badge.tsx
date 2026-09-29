'use client';

import React from 'react';

export type BadgeVariant =
  | 'GRANTED'
  | 'REQUESTED'
  | 'REVOKED'
  | 'NONE'
  | 'SUCCESS'
  | 'CONFIRMED'
  | 'PENDING'
  | 'ERROR'
  | 'INFO'
  | 'NEUTRAL'
  | 'CATEGORY'
  | 'ON_CHAIN'
  | 'DEMO';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export function Badge({
  variant = 'NEUTRAL',
  label,
  children,
  size = 'md',
  pulse = false,
  className = '',
  ...props
}: BadgeProps) {
  const content = label || children;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-medium tracking-wide',
    md: 'px-2.5 py-1 text-xs font-semibold',
  }[size];

  const variantStyles = {
    GRANTED: {
      container: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-600',
      defaultLabel: 'Access Granted',
    },
    CONFIRMED: {
      container: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-600',
      defaultLabel: 'Confirmed',
    },
    SUCCESS: {
      container: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-600',
      defaultLabel: 'Success',
    },
    REQUESTED: {
      container: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      defaultLabel: 'Permission Pending',
    },
    PENDING: {
      container: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      defaultLabel: 'Proving Witness',
    },
    REVOKED: {
      container: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-600',
      defaultLabel: 'Access Revoked',
    },
    ERROR: {
      container: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-600',
      defaultLabel: 'Circuit Error',
    },
    NONE: {
      container: 'bg-slate-100 text-slate-700 border-emerald-200',
      dot: 'bg-slate-400',
      defaultLabel: 'Unrequested',
    },
    CATEGORY: {
      container: 'bg-slate-100 text-slate-700 border-emerald-200',
      dot: null,
      defaultLabel: 'Cohort',
    },
    INFO: {
      container: 'bg-teal-50 text-teal-800 border-teal-200',
      dot: 'bg-teal-600',
      defaultLabel: 'Preprod Synced',
    },
    ON_CHAIN: {
      container: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-mono',
      dot: 'bg-emerald-600',
      defaultLabel: '[ON-CHAIN PREPROD]',
    },
    DEMO: {
      container: 'bg-slate-100 text-slate-700 border-emerald-200 font-mono',
      dot: 'bg-slate-400',
      defaultLabel: '[DEMO SHOWCASE]',
    },
    NEUTRAL: {
      container: 'bg-slate-100 text-slate-800 border-emerald-200',
      dot: null,
      defaultLabel: 'Standard',
    },
  }[variant];

  const displayText = content || variantStyles.defaultLabel;
  const shouldPulse = pulse || variant === 'REQUESTED' || variant === 'PENDING';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border select-none ${sizeClasses} ${variantStyles.container} ${className}`}
      {...props}
    >
      {variantStyles.dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${variantStyles.dot} ${
            shouldPulse ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span>{displayText}</span>
    </span>
  );
}
