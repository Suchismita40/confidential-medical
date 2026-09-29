'use client';

import React from 'react';
import { useDeployedBoardContext } from '../../src/hooks/useDeployedBoardContext';
import { Button, Badge, Card } from './ui';
import { AccessWorkflowStepper } from './AccessWorkflowStepper';

interface OverviewProps {
  setActiveTab: (tab: string) => void;
}

export function Overview({ setActiveTab }: OverviewProps) {
  const { state } = useDeployedBoardContext();

  const totalDatasets = state.datasets.length;
  const activeGranted = state.datasets.filter((d) => d.status === 'GRANTED').length;
  const pendingRequests = state.datasets.filter((d) => d.status === 'REQUESTED').length;
  const totalAuditLogs = state.auditLogs.length;
  const totalAccessCount = state.datasets.reduce((acc, d) => acc + Number(d.accessCount), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner - Professional Clean White Card (No Logos / No Glows) */}
      <div className="rounded-2xl border border-emerald-200 bg-white p-8 sm:p-10 shadow-xs text-slate-900">
        <div className="max-w-4xl space-y-6">

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Confidential Medical Research <br className="hidden sm:block" />
              <span className="text-teal-700">
                Data Exchange Network
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              MedEx allows healthcare providers and medical research institutions to securely register, discover, and request access to sensitive genomic and clinical datasets using Midnight zero-knowledge privacy circuits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => setActiveTab('datasets')}
            >
              Browse Medical Datasets
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setActiveTab('privacy')}
            >
              View ZK Security Architecture
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-emerald-200 shadow-xs">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Registered Datasets</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{totalDatasets}</span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Live Preprod</span>
            </div>
            <p className="text-xs text-slate-600">Available research cohorts</p>
          </div>
        </Card>

        <Card className="bg-white border-emerald-200 shadow-xs">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Active Permissions</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{activeGranted}</span>
              <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">Granted</span>
            </div>
            <p className="text-xs text-slate-600">Decrypted researcher sessions</p>
          </div>
        </Card>

        <Card className="bg-white border-emerald-200 shadow-xs">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Pending Requests</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{pendingRequests}</span>
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-mono">
                {pendingRequests > 0 ? 'Action Needed' : 'Queue Clear'}
              </span>
            </div>
            <p className="text-xs text-slate-600">Awaiting data owner approval</p>
          </div>
        </Card>

        <Card className="bg-white border-emerald-200 shadow-xs">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">On-Chain Audit Logs</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{totalAuditLogs}</span>
              <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono">Immutable</span>
            </div>
            <p className="text-xs text-slate-600">Total access transactions: {totalAccessCount}</p>
          </div>
        </Card>
      </div>

      {/* Access Workflow Stepper */}
      <AccessWorkflowStepper />
    </div>
  );
}
