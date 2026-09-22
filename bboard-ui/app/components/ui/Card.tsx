'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glow?: boolean;
}

export function Card({
  children,
  className = '',
  interactive = false,
  glow = false,
  ...props
}: CardProps) {
  const baseClass = interactive ? 'glass-card-interactive' : 'glass-card';
  const glowClass = glow ? 'border-teal-500/40 shadow-glowTeal' : '';

  return (
    <div
      className={`rounded-2xl border p-6 ${baseClass} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
