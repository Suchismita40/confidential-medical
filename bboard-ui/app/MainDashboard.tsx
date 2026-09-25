'use client';

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Overview } from './components/Overview';
import { DatasetWorkspace } from './components/DatasetWorkspace';
import { PermissionsView } from './components/PermissionsView';
import { ActivityView } from './components/ActivityView';
import { PrivacyCenter } from './components/PrivacyCenter';
import { DocumentationView } from './components/DocumentationView';
import { AnalyticsView } from './components/AnalyticsView';
import { Shield, ExternalLink, Cpu, HeartPulse, CheckCircle2, Lock, Globe } from 'lucide-react';
import { Badge } from './components/ui';

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const PREPROD_CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || process.env.VITE_CONTRACT_ADDRESS || 'c4e4778c4b3d516bd43569b30f7e1ca6dbea268c5e997bb7473f77c9f88085cc';

  return (
    <div className="min-h-screen flex flex-col bg-midnight-950 text-slate-100 selection:bg-teal-500 selection:text-midnight-950">
      {/* Top Application Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'overview' && <Overview setActiveTab={setActiveTab} />}
        {activeTab === 'datasets' && <DatasetWorkspace />}
        {activeTab === 'permissions' && <PermissionsView />}
        {activeTab === 'activity' && <ActivityView />}
        {activeTab === 'privacy' && <PrivacyCenter />}
        {activeTab === 'docs' && <DocumentationView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Institutional Research Footer */}
      <footer className="bg-midnight-900/90 border-t border-slateSurface-border py-10 text-xs text-slate-400 mt-16 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Platform Branding */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-midnight-950 font-bold shadow-glowTeal">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">MedEx Private Medical Research Exchange</span>
                <p className="text-[11px] text-slate-500">Zero-Knowledge Decentralized Clinical Cohort Network</p>
              </div>
            </div>

            {/* Verification Links */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
              <a
                href="https://preprod.midnightexplorer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-300 inline-flex items-center gap-1.5 font-medium transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                <span>Midnight Preprod Explorer</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>

              <a
                href={`https://preprod.midnightexplorer.com/contract/${PREPROD_CONTRACT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-300 inline-flex items-center gap-1.5 font-medium transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Verified Contract</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>

              <button
                onClick={() => setActiveTab('docs')}
                className="hover:text-teal-300 font-medium transition-colors"
              >
                Technical Docs
              </button>

              <button
                onClick={() => setActiveTab('privacy')}
                className="hover:text-teal-300 font-medium transition-colors"
              >
                Privacy Model
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slateSurface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Compact Smart Contract v0.23 ? Dual-State ZK Prover Verified</span>
            </div>
            <div>
              <span>Powered by Midnight Zero-Knowledge Technology</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
