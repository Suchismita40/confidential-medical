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
  | 'CATEGORY';

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
      container: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-glowEmerald',
      dot: 'bg-emerald-400',
      defaultLabel: 'Access Granted',
    },
    CONFIRMED: {
      container: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
      dot: 'bg-emerald-400',
      defaultLabel: 'Confirmed',
    },
    SUCCESS: {
      container: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
      dot: 'bg-emerald-400',
      defaultLabel: 'Success',
    },
    REQUESTED: {
      container: 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-glowAmber',
      dot: 'bg-amber-400',
      defaultLabel: 'Permission Pending',
    },
    PENDING: {
      container: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
      dot: 'bg-amber-400',
      defaultLabel: 'Proving Witness',
    },
    REVOKED: {
      container: 'bg-red-950/80 text-red-300 border-red-500/40 shadow-glowRed',
      dot: 'bg-red-400',
      defaultLabel: 'Access Revoked',
    },
    ERROR: {
      container: 'bg-red-950/80 text-red-300 border-red-500/40',
      dot: 'bg-red-400',
      defaultLabel: 'Circuit Error',
    },
    NONE: {
      container: 'bg-midnight-800/80 text-slate-400 border-slateSurface-border',
      dot: 'bg-slate-500',
      defaultLabel: 'Unrequested',
    },
    CATEGORY: {
      container: 'bg-teal-950/70 text-teal-300 border-teal-500/40',
      dot: null,
      defaultLabel: 'Cohort',
    },
    INFO: {
      container: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40',
      dot: 'bg-cyan-400',
      defaultLabel: 'Preprod Synced',
    },
    NEUTRAL: {
      container: 'bg-midnight-800/80 text-slate-300 border-slateSurface-border',
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
