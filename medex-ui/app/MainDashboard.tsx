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
import { useDeployedBoardContext } from '../src/hooks/useDeployedBoardContext';

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { state } = useDeployedBoardContext();

  const PREPROD_CONTRACT =
    state.contractAddress ||
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    process.env.VITE_CONTRACT_ADDRESS ||
    'c4e4778c4b3d516bd43569b30f7e1ca6dbea268c5e997bb7473f77c9f88085cc';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Application Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 bg-slate-50">
        {activeTab === 'overview' && <Overview setActiveTab={setActiveTab} />}
        {(activeTab === 'datasets' || activeTab === 'workspace') && <DatasetWorkspace />}
        {activeTab === 'permissions' && <PermissionsView />}
        {activeTab === 'activity' && <ActivityView />}
        {activeTab === 'privacy' && <PrivacyCenter />}
        {activeTab === 'docs' && <DocumentationView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Institutional Research Footer */}
      <footer className="bg-white border-t border-emerald-200 py-8 text-xs text-slate-600 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900 text-sm">MedEx</span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-600 font-medium">Private Medical Research Data Exchange</span>
            </div>
            <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px]">
              <span>Midnight Preprod Network</span>
              <span>•</span>
              <span>Contract: {PREPROD_CONTRACT.slice(0, 8)}...{PREPROD_CONTRACT.slice(-6)}</span>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between text-[11px] text-emerald-900/70">
            <p>© 2026 MedEx Private Medical Research Network. All rights reserved.</p>
            <p>Zero-Knowledge HIPAA Compliance Model</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
