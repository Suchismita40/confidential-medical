'use client';

import dynamic from 'next/dynamic';
import { Loader2, Shield } from 'lucide-react';

const MainDashboard = dynamic(() => import('./MainDashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-midnight-950 flex items-center justify-center p-4">
      <div className="flex items-center gap-3.5 px-7 py-4 rounded-2xl bg-midnight-900 border border-teal-500/30 shadow-glowTeal animate-pulse">
        <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
        <span className="text-sm font-bold text-white tracking-tight">
          Initializing Midnight Zero-Knowledge Engine...
        </span>
      </div>
    </div>
  ),
});

export default function Page() {
  return <MainDashboard />;
}
