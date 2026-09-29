'use client';

import React from 'react';
import { ShieldCheck, Lock, ArrowRight, CheckCircle2, Server, EyeOff, Award, Sparkles, Cpu } from 'lucide-react';
import { Button, Badge, Card } from './ui';

interface HeroBannerProps {
  onExploreDatasets: () => void;
  onExplorePrivacy: () => void;
  boardState?: any;
}

export function HeroBanner({ onExploreDatasets, onExplorePrivacy, boardState }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 p-8 sm:p-12 shadow-2xl">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Midnight Dual-State Architecture
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40">
              Zero-Knowledge SNARK Proofs
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Confidential Medical Research <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              Data Exchange Network
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Enable accredited healthcare institutions and researchers to prove data access eligibility and record verification via Zero-Knowledge circuits — without disclosing patient PII, medical credentials, or private decryption keys on-chain.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={onExploreDatasets}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Cpu className="w-5 h-5" />
              <span>Explore Research Cohorts</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExplorePrivacy}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-emerald-300 border border-emerald-500/40 font-semibold text-sm transition-all"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>ZK Privacy Architecture</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>HIPAA / GDPR Model</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Midnight Lace Wallet</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Quota-Gated Circuits</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-slate-800/60 backdrop-blur-md border border-emerald-500/30 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3.5">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">System Telemetry</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active Preprod
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                <span className="text-slate-400">Network Protocol</span>
                <span className="font-semibold text-teal-300">Midnight Preprod</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                <span className="text-slate-400">Compact Smart Contract</span>
                <span className="font-semibold text-slate-200">v0.23 Categorized + Quota</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                <span className="text-slate-400">Dataset Quota Counter</span>
                <span className="font-mono font-bold text-emerald-400">
                  {boardState?.accessCount?.toString() || '0'} / {boardState?.maxAccessLimit?.toString() || '5'} Max
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                <span className="text-slate-400">ZK Proof Engine</span>
                <span className="inline-flex items-center gap-1 font-semibold text-teal-300">
                  <EyeOff className="w-3.5 h-3.5" />
                  Prover Witness Isolated
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-200/90 flex items-start gap-2.5">
              <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                All contract circuits execute zero-knowledge proofs locally in the prover browser state. No medical credentials or private keys leave your device.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
