'use client';

import React, { useState } from 'react';
import {
  Shield,
  Wallet,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  LayoutDashboard,
  Database,
  KeyRound,
  Activity,
  Globe,
  Lock,
  Menu,
  X,
} from 'lucide-react';
import { useDeployedBoardContext } from '../../src/hooks/useDeployedBoardContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const { state, connectWallet } = useDeployedBoardContext();
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const PREPROD_CONTRACT = 'e603362546ca047cb7c596389c20fde9bdf1b27489f14137d68fd9cd4a939d97';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'datasets', label: 'Datasets', icon: Database, badge: state.datasets.length },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: KeyRound,
      badge: state.datasets.filter((d) => d.status === 'REQUESTED').length || undefined,
    },
    { id: 'activity', label: 'Activity', icon: Activity, badge: state.auditLogs.length },
  ];

  const isConnected = state.status === 'connected';
  const isConnecting = state.status === 'connecting';

  const handleCopyContract = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(PREPROD_CONTRACT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (addr?: string) => {
    if (!addr) return 'Lace Connected';
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-midnight-950/85 backdrop-blur-xl border-b border-slateSurface-border shadow-card transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Platform Badge */}
          <div
            className="flex items-center gap-3.5 cursor-pointer group shrink-0"
            onClick={() => {
              setActiveTab('overview');
              setMobileMenuOpen(false);
            }}
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-midnight-850 p-0.5 shadow-glowTeal group-hover:shadow-hover transition-all duration-300">
                <div className="w-full h-full rounded-[14px] bg-midnight-900 flex items-center justify-center text-teal-400 group-hover:text-teal-300 transition-colors">
                  <Shield className="w-6 h-6" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-midnight-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-white tracking-tight group-hover:text-teal-300 transition-colors">
                  MedEx
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950/90 text-teal-300 font-semibold border border-teal-500/30">
                  Midnight ZK
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Private Medical Research Exchange
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-midnight-900/90 p-1.5 rounded-2xl border border-slateSurface-border shadow-subtle">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/15 text-teal-300 border border-teal-500/40 shadow-glowTeal'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                        isActive
                          ? 'bg-teal-400/20 text-teal-200 font-bold'
                          : 'bg-midnight-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Hub: Contract Pill, Network Pill, Wallet Connector */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Quick Contract Copy Button */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-midnight-900 rounded-xl border border-slateSurface-border text-xs text-slate-300">
              <span className="text-[11px] text-slate-400 font-medium">Contract:</span>
              <span className="font-mono text-teal-300 text-[11px]">
                {PREPROD_CONTRACT.slice(0, 6)}...{PREPROD_CONTRACT.slice(-4)}
              </span>
              <button
                onClick={handleCopyContract}
                title="Copy full contract address"
                className="p-1 hover:text-white text-slate-400 hover:bg-midnight-800 rounded transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Network Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-midnight-900/90 rounded-xl border border-slateSurface-border text-xs text-slate-300 font-medium shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-glowEmerald" />
              <span>Midnight Preprod</span>
            </div>

            {/* Wallet Connector Button */}
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 select-none shadow-subtle active:scale-[0.98] ${
                isConnected
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-glowEmerald hover:bg-emerald-950/90'
                  : 'bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-midnight-950 font-bold shadow-glowTeal'
              }`}
            >
              {isConnecting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-midnight-950" />
              ) : isConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Wallet className="w-4 h-4 text-midnight-950 shrink-0" />
              )}
              <span className="font-mono whitespace-nowrap">
                {isConnecting
                  ? 'Authorizing...'
                  : isConnected
                  ? formatAddress(state.connectedWallet?.address)
                  : 'Connect Wallet'}
              </span>
            </button>

            {/* Mobile Hamburger Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-midnight-900 border border-slateSurface-border text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-midnight-900 border-t border-slateSurface-border px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'text-slate-300 bg-midnight-850 border border-slateSurface-border'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-teal-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-midnight-800 text-slate-400 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slateSurface-border flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Midnight Preprod Synced</span>
            </div>
            <a
              href="https://preprod.midnightexplorer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
