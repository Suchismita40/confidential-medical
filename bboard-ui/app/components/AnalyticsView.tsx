'use client';

import React from 'react';
import { Activity, Database, Users, Shield, FileCheck, BarChart3, TrendingUp, Cpu } from 'lucide-react';
import { useDeployedBoardContext } from '../../src/hooks/useDeployedBoardContext';
import { Badge, Card, ProgressBar } from './ui';

export function AnalyticsView() {
  const { state } = useDeployedBoardContext();

  const totalDatasets = state.datasets.length;
  const activeGranted = state.datasets.filter((d) => d.status === 'GRANTED').length;
  const usedQuota = state.datasets.reduce((acc, d) => acc + Number(d.accessCount), 0);
  const maxQuota = state.datasets.reduce((acc, d) => acc + Number(d.maxAccessLimit), 0);
  const auditLogs = state.auditLogs.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slateSurface-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-950/80 text-teal-400 border border-teal-500/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Clinical Telemetry & Network Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 ml-11">
            Real-time aggregate cryptographic metrics on Midnight Preprod.
          </p>
        </div>

        <Badge variant="INFO" label="Preprod Verified Telemetry" size="md" />
      </div>

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card interactive glow className="space-y-2">
          <span className="text-xs text-slate-400 font-medium">Registered Cohorts</span>
          <p className="text-3xl font-extrabold text-white font-mono">{totalDatasets}</p>
        </Card>

        <Card interactive glow className="space-y-2">
          <span className="text-xs text-slate-400 font-medium">Access Proofs Verified</span>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono">{usedQuota}</p>
        </Card>

        <Card interactive glow className="space-y-2">
          <span className="text-xs text-slate-400 font-medium">Maximum Access Quota</span>
          <p className="text-3xl font-extrabold text-teal-300 font-mono">{maxQuota}</p>
        </Card>

        <Card interactive glow className="space-y-2">
          <span className="text-xs text-slate-400 font-medium">Cryptographic Audit Logs</span>
          <p className="text-3xl font-extrabold text-white font-mono">{auditLogs}</p>
        </Card>
      </div>

      {/* Quota Utilization Progress */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-teal-400" />
          <span>Aggregate Network Quota Capacity</span>
        </h3>
        <ProgressBar used={usedQuota} max={maxQuota} label="Total Platform ZK Queries" />
      </Card>
    </div>
  );
}
