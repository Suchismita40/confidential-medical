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
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  LogOut,
  AlertCircle,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { useDeployedBoardContext } from '../../src/hooks/useDeployedBoardContext';

export interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const { state, connectWallet, disconnectWallet } = useDeployedBoardContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isConnected = state.status === 'CONNECTED' && Boolean(state.connectedWallet);
  const isConnecting =
    state.status === 'CONNECTING' || state.status === 'AWAITING_WALLET' || state.status === 'AUTHORIZED' || state.status === 'ADDRESS_LOADING';
  const isPermissionRequired = state.status === 'ADDRESS_PERMISSION_REQUIRED';
  const isAddressError = state.status === 'ADDRESS_ERROR';
  const isWrongNetwork = state.status === 'WRONG_NETWORK';

  const PREPROD_CONTRACT = 'e603362546ca047cb7c596389c20fde9bdf1b27489f14137d68fd9cd4a939d97';

  const handleCopyContract = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(PREPROD_CONTRACT);
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    }
  };

  const handleCopyWallet = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const fullAddr =
      state.connectedWallet?.unshieldedAddress ||
      state.connectedWallet?.fullAddress ||
      state.connectedWallet?.address;
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
    <header
      role="banner"
      className="sticky top-0 z-40 w-full bg-midnight-950/95 backdrop-blur-md border-b border-slateSurface-border"
    >
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between min-h-[64px] sm:min-h-[68px] py-2 gap-2 sm:gap-4">
          
          {/* 1. Left: Brand Logo & Title */}
          <div
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-teal-400 via-teal-600 to-emerald-700 p-0.5 shadow-glowTeal">
                <div className="w-full h-full bg-midnight-950 rounded-[10px] flex items-center justify-center text-teal-300">
                  <Shield className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-midnight-950 animate-pulse" />
            </div>

            <div className="shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight group-hover:text-teal-300 transition-colors">
                  MedEx
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-950/90 text-teal-300 font-semibold border border-teal-500/30">
                  Midnight ZK
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden xl:block leading-none mt-0.5">
                Private Medical Research
              </p>
            </div>
          </div>

          {/* 2. Center: Desktop Navigation Hub */}
          <nav
            aria-label="Main Navigation"
            role="navigation"
            className="hidden lg:flex items-center gap-1 bg-midnight-900/90 p-1 rounded-xl border border-slateSurface-border shadow-subtle shrink min-w-0"
          >
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-200 select-none shrink-0 ${
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
                        isActive ? 'bg-teal-400/20 text-teal-200 font-bold' : 'bg-midnight-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* "More Tools" Dropdown */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-200 select-none ${
                  isSecondaryActive
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-800/60 border border-transparent'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden xl:inline">Architecture & Docs</span>
                <span className="xl:hidden">More</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    moreDropdownOpen ? 'rotate-180 text-teal-300' : 'text-slate-400'
                  }`}
                />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-midnight-900/98 backdrop-blur-xl rounded-2xl border border-slateSurface-border shadow-card z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2 py-1 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Research Architecture
                  </div>
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

                  <div className="mt-2 pt-2 border-t border-slateSurface-border px-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Preprod Contract:</span>
                      <button
                        onClick={handleCopyContract}
                        className="font-mono text-teal-300 hover:underline inline-flex items-center gap-1 text-[10px]"
                      >
                        {PREPROD_CONTRACT.slice(0, 6)}...{PREPROD_CONTRACT.slice(-4)}
                        {copiedContract ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* 3. Right: Action Hub (Wallet, Network, Drawer Toggle) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            
            {/* Network Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-midnight-900/90 rounded-xl border border-slateSurface-border text-[11px] sm:text-xs text-slate-300 font-medium shadow-subtle shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-glowEmerald" />
              <span className="whitespace-nowrap">{state.connectedWallet?.network || 'Preprod'}</span>
            </div>

            {/* Wallet State Hub (LIVE MIDNIGHT UNSHIELDED ADDRESS) */}
            {isConnected ? (
              <div className="flex items-center gap-1 p-1 bg-midnight-900 rounded-xl sm:rounded-2xl border border-emerald-500/40 shadow-glowEmerald shrink-0">
                <div
                  title={`Live Midnight Unshielded Address:
${state.connectedWallet?.unshieldedAddress || state.connectedWallet?.fullAddress}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 bg-emerald-950/80 rounded-lg sm:rounded-xl text-[11px] sm:text-xs text-emerald-300 font-mono font-medium select-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[110px] sm:max-w-[140px] md:max-w-none">
                    {state.connectedWallet?.address}
                  </span>
                </div>

                <button
                  onClick={handleCopyWallet}
                  title="Copy live unshielded address"
                  className="p-1 sm:p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-midnight-800 rounded-lg transition-colors"
                  aria-label="Copy unshielded wallet address"
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
            ) : isConnecting ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-midnight-900 border border-teal-500/40 text-teal-300 font-semibold text-xs animate-pulse shrink-0">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                <span className="whitespace-nowrap font-mono text-xs">
                  {state.status === 'ADDRESS_LOADING' ? 'Reading Address...' : state.status === 'AUTHORIZED' ? 'Authorized! Fetching...' : 'Authorizing in Lace...'}
                </span>
              </div>
            ) : isPermissionRequired ? (
              <button
                onClick={connectWallet}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 font-semibold text-xs hover:bg-amber-900/80 transition-all shrink-0 shadow-subtle"
                title="Click to approve unshielded address permissions in Midnight Lace"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">Approve in Lace</span>
              </button>
            ) : isAddressError ? (
              <button
                onClick={connectWallet}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 font-semibold text-xs hover:bg-amber-900/80 transition-all shrink-0"
                title="Click to retry wallet connection"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">Retry Lace</span>
              </button>
            ) : isWrongNetwork ? (
              <button
                onClick={connectWallet}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 font-semibold text-xs hover:bg-red-900/80 transition-all shrink-0"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="whitespace-nowrap">Switch Network</span>
              </button>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 select-none shadow-glowTeal bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-midnight-950 font-bold active:scale-[0.98] shrink-0 whitespace-nowrap"
              >
                <Wallet className="w-3.5 h-3.5 text-midnight-950 shrink-0" />
                <span>Connect Lace</span>
              </button>
            )}

            {/* Mobile / Tablet Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-midnight-900 border border-slateSurface-border text-slate-300 hover:text-white shrink-0"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {state.error && state.status !== 'CONNECTED' && (
        <div className="bg-amber-950/90 border-t border-b border-amber-500/30 px-3 sm:px-4 py-2 text-xs text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{state.error}</span>
          </div>
          <button
            onClick={() => connectWallet()}
            className="px-2.5 py-1 bg-amber-900/80 hover:bg-amber-800 rounded-lg text-amber-100 font-semibold transition-colors shrink-0 text-[11px] whitespace-nowrap"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Responsive In-App Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          role="navigation"
          aria-label="Mobile Navigation"
          className="lg:hidden bg-midnight-900/98 backdrop-blur-xl border-t border-slateSurface-border px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-card"
        >
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
                {copiedContract ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
