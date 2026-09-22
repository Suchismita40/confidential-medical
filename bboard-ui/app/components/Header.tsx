'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Activity,
  Database,
  Lock,
  Layers,
  FileCode,
  LineChart,
  Wallet,
  Menu,
  X,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  LogOut,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { useDeployedBoardContext } from '../../src/hooks/useDeployedBoardContext';

export interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const { state, connectWallet, disconnectWallet } = useDeployedBoardContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isConnected = state.status === 'connected' && Boolean(state.connectedWallet);
  const isConnecting = state.status === 'connecting';

  const PREPROD_CONTRACT = 'e603362546ca047cb7c596389c20fde9bdf1b27489f14137d68fd9cd4a939d97';

  const handleCopyContract = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(PREPROD_CONTRACT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyWallet = () => {
    const fullAddr = state.connectedWallet?.fullAddress || state.connectedWallet?.address;
    if (fullAddr && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(fullAddr);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

  const primaryNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'datasets', label: 'Datasets', icon: Database, badge: state.datasets.length },
    { id: 'permissions', label: 'Permissions', icon: Lock },
    { id: 'activity', label: 'Activity', icon: Activity, badge: state.auditLogs.length },
  ];

  const secondaryNavItems: NavItem[] = [
    { id: 'privacy', label: 'ZK Privacy Architecture', icon: Layers },
    { id: 'docs', label: 'Documentation & Circuits', icon: FileCode },
    { id: 'analytics', label: 'Telemetry & Analytics', icon: LineChart },
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];
  const isSecondaryActive = secondaryNavItems.some((item) => item.id === activeTab);

  return (
    <header role="banner" className="sticky top-0 z-40 w-full bg-midnight-950/95 backdrop-blur-md border-b border-slateSurface-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          {/* 1. Brand Logo & Tagline */}
          <div
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-teal-400 via-teal-600 to-emerald-700 p-0.5 shadow-glowTeal">
                <div className="w-full h-full bg-midnight-950 rounded-[14px] flex items-center justify-center text-teal-300">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 border-2 border-midnight-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight group-hover:text-teal-300 transition-colors">
                  MedEx
                </span>
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-teal-950/90 text-teal-300 font-semibold border border-teal-500/30">
                  Midnight ZK
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:block">
                Private Medical Research
              </p>
            </div>
          </div>

          {/* 2. Desktop Navigation Hub (Visible on large screens) */}
          <nav aria-label="Main Navigation" role="navigation" className="hidden xl:flex items-center gap-1 bg-midnight-900/90 p-1 rounded-2xl border border-slateSurface-border shadow-subtle min-w-0">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 select-none ${
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

            {/* "More Tools" Dropdown for secondary views */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 select-none ${
                  isSecondaryActive
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-800/60 border border-transparent'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Architecture & Docs</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${moreDropdownOpen ? 'rotate-180 text-teal-300' : 'text-slate-400'}`} />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 p-2 bg-midnight-900/95 backdrop-blur-xl rounded-2xl border border-slateSurface-border shadow-card z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMoreDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                          isActive
                            ? 'bg-teal-500/20 text-teal-300 font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-midnight-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* 3. Right Action Hub: Contract Pill, Network Badge, Wallet Connector */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Contract Copy Button (Desktop only) */}
            <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 bg-midnight-900 rounded-xl border border-slateSurface-border text-xs text-slate-300">
              <span className="text-[11px] text-slate-400 font-medium">Contract:</span>
              <span className="font-mono text-teal-300 text-[11px]">
                {PREPROD_CONTRACT.slice(0, 6)}...{PREPROD_CONTRACT.slice(-4)}
              </span>
              <button
                onClick={handleCopyContract}
                title="Copy full contract address"
                className="p-1 hover:text-white text-slate-400 hover:bg-midnight-800 rounded transition-colors"
                aria-label="Copy contract address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Network Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-midnight-900/90 rounded-xl border border-slateSurface-border text-[11px] sm:text-xs text-slate-300 font-medium shadow-subtle shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-glowEmerald" />
              <span className="whitespace-nowrap">{state.connectedWallet?.network || 'Preprod'}</span>
            </div>

            {/* Wallet Connector Hub (HIGH PRIORITY - ALWAYS VISIBLE) */}
            {isConnected ? (
              <div className="flex items-center gap-1 p-1 bg-midnight-900 rounded-xl sm:rounded-2xl border border-emerald-500/40 shadow-glowEmerald shrink-0">
                <div
                  title={`Full Address: ${state.connectedWallet?.fullAddress || state.connectedWallet?.address}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 bg-emerald-950/80 rounded-lg sm:rounded-xl text-[11px] sm:text-xs text-emerald-300 font-mono font-medium select-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[100px] sm:max-w-none">{state.connectedWallet?.address}</span>
                </div>

                <button
                  onClick={handleCopyWallet}
                  title="Copy full live wallet address"
                  className="p-1 sm:p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-midnight-800 rounded-lg transition-colors"
                  aria-label="Copy wallet address"
                >
                  {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={disconnectWallet}
                  title="Disconnect Lace Wallet"
                  className="p-1 sm:p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                  aria-label="Disconnect wallet"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 select-none shadow-glowTeal bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-midnight-950 font-bold active:scale-[0.98] shrink-0 whitespace-nowrap"
              >
                {isConnecting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-midnight-950" />
                ) : (
                  <Wallet className="w-3.5 h-3.5 text-midnight-950 shrink-0" />
                )}
                <span>{isConnecting ? 'Authorizing...' : 'Connect Lace'}</span>
              </button>
            )}

            {/* Mobile / Tablet Hamburger Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-midnight-900 border border-slateSurface-border text-slate-300 hover:text-white shrink-0"
              aria-label="Toggle Navigation Menu" aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Global Error Banner when wallet connection fails */}
      {state.status === 'error' && state.error && (
        <div className="bg-amber-950/80 border-t border-b border-amber-500/30 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{state.error}</span>
          </div>
          <button
            onClick={() => connectWallet()}
            className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-900 rounded-lg text-amber-200 font-semibold transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Responsive In-App Navigation Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-menu" role="navigation" aria-label="Mobile Navigation" className="xl:hidden bg-midnight-900/98 backdrop-blur-xl border-t border-slateSurface-border px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allNavItems.map((item) => {
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
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-glowTeal'
                      : 'text-slate-300 bg-midnight-850 border border-slateSurface-border hover:bg-midnight-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
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

          <div className="pt-3 border-t border-slateSurface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Midnight Preprod Synced</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-teal-400">
                Contract: {PREPROD_CONTRACT.slice(0, 6)}...{PREPROD_CONTRACT.slice(-4)}
              </span>
              <button
                onClick={handleCopyContract}
                className="text-slate-300 hover:text-white underline inline-flex items-center gap-1"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
