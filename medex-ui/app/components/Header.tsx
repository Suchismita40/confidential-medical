'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  ChevronDown,
  Copy,
  Check,
  LogOut,
  AlertTriangle,
  Loader2,
  Wallet,
} from 'lucide-react';
import { useDeployedBoardContext } from '../../src/hooks/useDeployedBoardContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  badge?: number;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const { state, connectWallet, disconnectWallet } = useDeployedBoardContext();
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyWallet = () => {
    if (state.connectedWallet?.unshieldedAddress) {
      navigator.clipboard.writeText(state.connectedWallet.unshieldedAddress);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

  const isConnected = state.status === 'CONNECTED' && Boolean(state.connectedWallet?.unshieldedAddress);
  const isAuthorizing = state.status === 'AUTHORIZING' || state.status === 'CONNECTING' || state.status === 'ADDRESS_LOADING';

  const primaryNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'datasets', label: 'Datasets', badge: state.datasets.length },
    { id: 'permissions', label: 'Permissions' },
    { id: 'activity', label: 'Activity', badge: state.auditLogs.length },
  ];

  const secondaryNavItems: NavItem[] = [
    { id: 'privacy', label: 'ZK Privacy Architecture' },
    { id: 'docs', label: 'Documentation & Circuits' },
    { id: 'analytics', label: 'Telemetry & Analytics' },
  ];

  const isSecondaryActive = secondaryNavItems.some((item) => item.id === activeTab);

  const getButtonLabel = () => {
    if (isAuthorizing) return 'Authorizing Wallet…';
    if (state.status === 'DETECTING') return 'Detecting Wallet…';
    if (state.status === 'LOCKED') return 'Connect Wallet';
    if (state.status === 'REJECTED') return 'Connect Wallet';
    if (state.status === 'WRONG_NETWORK') return 'Switch to Preprod';
    if (state.status === 'NOT_DETECTED') return 'Connect Wallet';
    if (state.status === 'ERROR' || state.status === 'ADDRESS_ERROR') return 'Connect Wallet';
    return 'Connect Wallet';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-emerald-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2.5 sm:gap-3 group text-left focus:outline-none"
              aria-label="MedEx Dashboard Home"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950 group-hover:text-emerald-700 transition-colors font-sans">
                    MedEx
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold font-mono tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-300">
                    MIDNIGHT ZK
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
            {primaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap select-none ${
                    isActive
                      ? 'bg-emerald-700 text-white border border-emerald-700 shadow-md shadow-emerald-700/20 font-bold'
                      : 'text-emerald-950/80 hover:text-emerald-950 hover:bg-emerald-100/80 border border-transparent font-semibold'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isActive ? 'bg-emerald-800 text-white font-bold' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Architecture & Docs Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 select-none whitespace-nowrap ${
                  isSecondaryActive
                    ? 'bg-emerald-700 text-white border border-emerald-700 shadow-md shadow-emerald-700/20 font-bold'
                    : 'text-emerald-950/80 hover:text-emerald-950 hover:bg-emerald-100/80 border border-transparent font-semibold'
                }`}
                aria-expanded={moreDropdownOpen}
                aria-haspopup="true"
              >
                <span>Architecture & Docs</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-emerald-200 rounded-xl shadow-lg p-2 space-y-1 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  {secondaryNavItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMoreDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-900 font-bold'
                            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Section: Status Badge & Wallet Connection */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Clean Professional Status Tag */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Midnight Preprod</span>
            </div>

            {/* Wallet State Controls */}
            {isConnected ? (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-emerald-200 shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] sm:text-xs font-mono text-slate-800 font-bold truncate max-w-[130px] sm:max-w-[160px]">
                  <Wallet className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>
                    {state.connectedWallet?.unshieldedAddress
                      ? `${state.connectedWallet.unshieldedAddress.slice(0, 10)}...${state.connectedWallet.unshieldedAddress.slice(-6)}`
                      : 'Connected'}
                  </span>
                </div>
                <button
                  onClick={handleCopyWallet}
                  title="Copy full unshielded wallet address"
                  className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={disconnectWallet}
                  title="Disconnect Lace Wallet session"
                  className="p-1 sm:p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isAuthorizing}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-[0.98] shrink-0 whitespace-nowrap ${
                  isAuthorizing
                    ? 'bg-emerald-800 text-white cursor-wait opacity-90'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                {isAuthorizing && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                <span>{getButtonLabel()}</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 border border-emerald-200 text-slate-700 hover:text-slate-900 shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      
      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-200 bg-white px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-md">
          <div className="flex items-center gap-2 px-3 py-1.5 mb-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Midnight Preprod</span>
          </div>
          <div className="space-y-1">
            {primaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="border-t border-slate-100 pt-1 mt-1">
              <div className="text-[10px] uppercase font-bold text-slate-600 px-3 py-1">Architecture & Docs</div>
              {secondaryNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Real Lace Extension Notification Banner */}
      {(state.error || isAuthorizing || state.status === 'LOCKED') && (
        <div className={`border-t border-b px-4 py-3 text-xs ${isAuthorizing ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              {isAuthorizing ? (
                <>
                  <Loader2 className="w-4 h-4 text-emerald-700 animate-spin shrink-0" />
                  <span className="font-bold text-emerald-950">
                    Requesting Midnight Lace authorization… Please approve the popup window in your Midnight Lace Chrome extension.
                  </span>
                </>
              ) : state.status === 'LOCKED' ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <span className="font-bold text-amber-950">Midnight Lace Extension is Locked:</span>{' '}
                    <span className="text-slate-800">
                      Chrome extension security requires you to click the <strong>Midnight Lace icon 🧩</strong> in your browser toolbar (top-right) and enter your password. Once unlocked, click <strong>Connect Wallet</strong> to view the extension approval popup!
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-bold text-amber-950">Wallet Notice:</span>
                  <span className="text-slate-800">{state.error}</span>
                </>
              )}
            </div>
            {!isAuthorizing && (
              <button
                onClick={connectWallet}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shrink-0 shadow-xs"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
