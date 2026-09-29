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
  const baseClass = interactive ? 'bg-white border border-emerald-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all rounded-2xl' : 'bg-white border border-emerald-200 shadow-sm rounded-2xl';
  const glowClass = glow ? 'border-emerald-accent/40 shadow-emerald' : '';


  return (
    <div
      className={`rounded-2xl border p-6 ${baseClass} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
   );
}
