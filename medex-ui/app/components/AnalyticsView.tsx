'use client';

import React from 'react';
import { Activity, Database, Users, Shield, FileCheck, BarChart3, TrendingUp, Cpu, Server, CheckCircle2 } from 'lucide-react';
import { useDeployedBoardContext } from '../../src/hooks/useDeployedBoardContext';
import { Badge, Card, ProgressBar } from './ui';

export function AnalyticsView() {
  const { state } = useDeployedBoardContext();

  const totalDatasets = state.datasets.length;
  const activeGranted = state.datasets.filter((d) => d.status === 'GRANTED').length;
  const usedQuota = state.datasets.reduce((acc, d) => acc + Number(d.accessCount), 0);
  const maxQuota = state.datasets.reduce((acc, d) => acc + Number(d.maxAccessLimit || 100), 0);
  const auditLogs = state.auditLogs.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-nordic-panel border border-emerald-accent/40 text-emerald-accent shadow-emerald">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">
                Cohort Telemetry & Performance Analytics
              </h1>
              <p className="text-xs text-nordic-olive mt-0.5">
                Authoritative on-chain smart contract metrics & ZK prover benchmark distribution.
              </p>
            </div>
          </div>
        </div>

        <Badge variant="ON_CHAIN" size="md" />
      </div>

      {/* Telemetry Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card interactive glow className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-nordic-olive uppercase tracking-wider">
              On-Chain Cohorts
            </span>
            <div className="p-2 rounded-xl bg-nordic-bg text-emerald-accent border border-emerald-200">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-950 font-mono">{totalDatasets}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-accent" />
            <span>REAL ON-CHAIN STATE</span>
          </div>
        </Card>

        <Card interactive glow className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-nordic-olive uppercase tracking-wider">
              Active Permissions
            </span>
            <div className="p-2 rounded-xl bg-nordic-bg text-emerald-accent border border-emerald-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-accent font-mono">{activeGranted}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-accent" />
            <span>Granted in Compact</span>
          </div>
        </Card>

        <Card interactive glow className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-nordic-olive uppercase tracking-wider">
              Executed Queries
            </span>
            <div className="p-2 rounded-xl bg-nordic-bg text-emerald-950 border border-emerald-200">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-950 font-mono">{usedQuota}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-nordic-olive">
            <span className="w-1.5 h-1.5 rounded-full bg-nordic-olive" />
            <span>On-chain proof disclosures</span>
          </div>
        </Card>

        <Card interactive glow className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-nordic-olive uppercase tracking-wider">
              Audit Event Trace
            </span>
            <div className="p-2 rounded-xl bg-nordic-bg text-emerald-950 border border-emerald-200">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-950 font-mono">{auditLogs}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-nordic-olive">
            <span className="w-1.5 h-1.5 rounded-full bg-nordic-olive" />
            <span>Immutable log count</span>
          </div>
        </Card>
      </div>

      {/* Real vs Demo Separation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-nordic-panel rounded-2xl border border-emerald-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-accent" />
              <span>Authoritative On-Chain State</span>
            </h3>
            <Badge variant="ON_CHAIN" size="sm" />
          </div>
          <p className="text-xs text-nordic-olive leading-relaxed">
            Data backed directly by the deployed Midnight Preprod contract (<code className="font-mono text-emerald-950">c4e4778...085cc</code>). Zero synthetic metrics.
          </p>
          <div className="space-y-2 pt-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-emerald-200/50">
              <span className="text-nordic-olive">Contract Address</span>
              <span className="font-mono text-emerald-accent font-semibold">c4e4778c...88085cc</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-emerald-200/50">
              <span className="text-nordic-olive">Target Network</span>
              <span className="font-mono text-emerald-950">Midnight Preprod</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-nordic-olive">Prover WASM Runtime</span>
              <span className="font-mono text-emerald-accent">Client-Side Active</span>
            </div>
          </div>
        </div>

        <div className="bg-nordic-panel rounded-2xl border border-emerald-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-nordic-olive" />
              <span>Prover Performance Benchmarks</span>
            </h3>
            <Badge variant="DEMO" size="sm" />
          </div>
          <p className="text-xs text-nordic-olive leading-relaxed">
            Client-side ZK proof generation performance targets measured on standard desktop hardware (WASM & local proof server).
          </p>
          <div className="space-y-2 pt-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-emerald-200/50">
              <span className="text-nordic-olive">Proof Generation Time</span>
              <span className="font-mono text-emerald-950">~2.4s (avg)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-emerald-200/50">
              <span className="text-nordic-olive">Verification Time</span>
              <span className="font-mono text-emerald-950">&lt; 15ms</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-nordic-olive">Proof Size</span>
              <span className="font-mono text-emerald-950">128 bytes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Quota Capacity */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-accent" />
          <span>Aggregate Platform Quota Utilization</span>
        </h3>
        <ProgressBar used={usedQuota} max={maxQuota > 0 ? maxQuota : 100} label="Total Verified Platform ZK Queries" />
      </Card>
    </div>
  );
}
