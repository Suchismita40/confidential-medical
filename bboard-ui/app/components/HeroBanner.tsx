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
    <div className="relative overflow-hidden glass-card rounded-3xl border border-slateSurface-border p-8 sm:p-12 shadow-card">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="INFO" label="Midnight Dual-State Architecture" size="sm" pulse />
            <Badge variant="CATEGORY" label="Zero-Knowledge SNARK Proofs" size="sm" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Confidential Medical Research <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Data Exchange Network
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Enable accredited healthcare institutions and researchers to prove data access eligibility and record verification via Zero-Knowledge proofs ? without disclosing patient PII, medical credentials, or private decryption keys on-chain.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Cpu className="w-5 h-5" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={onExploreDatasets}
            >
              Dataset Workspace
            </Button>

            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Lock className="w-5 h-5 text-teal-400" />}
              onClick={onExplorePrivacy}
            >
              Privacy Architecture
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slateSurface-border text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>HIPAA / GDPR Model</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Midnight Lace Wallet</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Quota-Gated Circuits</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <Card glow className="space-y-5 bg-midnight-950/80">
            <div className="flex items-center justify-between border-b border-slateSurface-border pb-3.5">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-white text-sm">System Telemetry</h3>
              </div>
              <Badge variant="CONFIRMED" size="sm" label="Active Preprod" pulse />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-900 border border-slateSurface-border">
                <span className="text-slate-400">Network Protocol</span>
                <span className="font-semibold text-teal-300">Midnight Preprod</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-900 border border-slateSurface-border">
                <span className="text-slate-400">Compact Smart Contract</span>
                <span className="font-semibold text-slate-200">v0.23 Categorized + Quota</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-900 border border-slateSurface-border">
                <span className="text-slate-400">Dataset Quota Counter</span>
                <span className="font-mono font-bold text-emerald-400">
                  {boardState?.accessCount?.toString() || '0'} / {boardState?.maxAccessLimit?.toString() || '5'} Max
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-900 border border-slateSurface-border">
                <span className="text-slate-400">ZK Proof Engine</span>
                <span className="inline-flex items-center gap-1 font-semibold text-teal-300">
                  <EyeOff className="w-3.5 h-3.5" />
                  Prover Witness Isolated
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 text-[11px] text-teal-200 flex items-start gap-2.5">
              <Award className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                All contract circuits execute zero-knowledge proofs locally in the prover browser state. No medical credentials or private keys leave your device.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
