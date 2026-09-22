'use client';

import React from 'react';

export interface ProgressBarProps {
  used: number;
  max: number;
  label?: string;
  showLabels?: boolean;
}

export function ProgressBar({ used, max, label = 'ZK Query Quota', showLabels = true }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
  const remaining = Math.max(0, max - used);

  const getBarColor = () => {
    if (percentage >= 100) return 'bg-red-500 shadow-glowRed';
    if (percentage > 75) return 'bg-amber-500 shadow-glowAmber';
    return 'bg-gradient-to-r from-teal-500 to-emerald-400 shadow-glowTeal';
  };

  return (
    <div className="space-y-1.5 w-full">
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">{label}</span>
          <span className="font-mono text-slate-200">
            <strong className="text-white font-bold">{used}</strong> / {max} Queries ({remaining} left)
          </span>
        </div>
      )}

      <div className="w-full h-2 rounded-full bg-midnight-800 border border-slateSurface-border overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
