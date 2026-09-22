'use client';

import React, { useState } from 'react';
import {
  Key,
  Shield,
  CheckCircle2,
  Lock,
  RefreshCw,
  XCircle,
  Clock,
  Layers,
  Building2,
  UserCheck,
  AlertTriangle,
  SlidersHorizontal,
  KeyRound,
  Hash,
} from 'lucide-react';
import { useDeployedBoardContext } from '../../src/hooks/useDeployedBoardContext';
import { Button, Badge, Card, Modal, ProgressBar } from './ui';

export function PermissionsView() {
  const {
    state,
    grantPermission,
    submitAccessProof,
    renewAccessQuota,
    revokeAccess,
  } = useDeployedBoardContext();

  const [renewId, setRenewId] = useState<string | null>(null);
  const [extraQuota, setExtraQuota] = useState(15);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'REQUESTED' | 'GRANTED' | 'REVOKED'>('ALL');

  const filteredDatasets = state.datasets.filter((ds) => {
    if (filterStatus === 'ALL') return true;
    return ds.status === filterStatus;
  });

  const tx = state.txProgress;
  const isBusy = tx.phase === 'validating' || tx.phase === 'proving' || tx.phase === 'submitting';

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewId || extraQuota <= 0) return;
    const target = renewId;
    setRenewId(null);
    await renewAccessQuota(target, extraQuota);
  };

  const statusCounts = {
    ALL: state.datasets.length,
    REQUESTED: state.datasets.filter((d) => d.status === 'REQUESTED').length,
    GRANTED: state.datasets.filter((d) => d.status === 'GRANTED').length,
    REVOKED: state.datasets.filter((d) => d.status === 'REVOKED').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slateSurface-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-950/80 text-teal-400 border border-teal-500/30">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Research Permissions & Quota Governance
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 ml-11">
            Enforce Zero-Knowledge selective access policies, authorize credentialed researchers, and renew query allowances via Compact circuits.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-midnight-900 p-1.5 rounded-2xl border border-slateSurface-border shadow-subtle shrink-0">
          {(['ALL', 'REQUESTED', 'GRANTED', 'REVOKED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 select-none ${
                filterStatus === st
                  ? 'bg-gradient-to-r from-teal-500 to-teal-400 text-midnight-950 font-bold shadow-glowTeal'
                  : 'text-slate-400 hover:text-white hover:bg-midnight-800'
              }`}
            >
              <span>
                {st === 'ALL'
                  ? 'All Cohorts'
                  : st === 'REQUESTED'
                  ? 'Pending'
                  : st === 'GRANTED'
                  ? 'Active'
                  : 'Revoked'}
              </span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                  filterStatus === st
                    ? 'bg-midnight-950/20 text-midnight-950 font-bold'
                    : 'bg-midnight-800 text-slate-400'
                }`}
              >
                {statusCounts[st]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Table & Card Container */}
      <div className="glass-card rounded-2xl border border-slateSurface-border shadow-card overflow-hidden">
        <div className="p-6 border-b border-slateSurface-border flex items-center justify-between bg-midnight-850/40">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-sm text-white">
              Access Control Contracts ({filteredDatasets.length})
            </h3>
          </div>
          <Badge variant="INFO" size="sm" label="Compact Protocol v0.23" />
        </div>

        {filteredDatasets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No datasets matching status filter "{filterStatus}".
          </div>
        ) : (
          <div className="divide-y divide-slateSurface-border">
            {filteredDatasets.map((ds) => {
              const max = Number(ds.maxAccessLimit);
              const used = Number(ds.accessCount);
              const remaining = Math.max(0, max - used);
              const isExhausted = remaining === 0 && ds.status === 'GRANTED';

              return (
                <div key={ds.id} className="p-6 space-y-4 hover:bg-midnight-850/30 transition-colors">
                  {/* Top: Dataset Header & Status */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h4 className="font-bold text-sm text-white">{ds.title}</h4>
                        <Badge variant={ds.status} size="sm" />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-teal-400" />
                          <span>{ds.institution}</span>
                        </span>
                        <span>?</span>
                        <span className="text-teal-300 font-medium">Domain: {ds.category}</span>
                      </div>
                    </div>

                    {/* Quota Gauge Container */}
                    <div className="bg-midnight-950/80 p-3.5 rounded-xl border border-slateSurface-border min-w-[280px]">
                      <ProgressBar used={used} max={max} label="Active Allowance" />
                    </div>
                  </div>

                  {/* Cryptographic Key & Identifier Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="bg-midnight-950/60 p-2.5 rounded-xl border border-slateSurface-border text-[11px] font-mono text-slate-400 flex items-center justify-between truncate">
                      <span className="text-slate-500">Active Researcher PK:</span>
                      <span className="text-teal-300 truncate max-w-[220px]">
                        {ds.activeResearcherPk || '0x00000000000000000000000000000000'}
                      </span>
                    </div>

                    <div className="bg-midnight-950/60 p-2.5 rounded-xl border border-slateSurface-border text-[11px] font-mono text-slate-400 flex items-center justify-between truncate">
                      <span className="text-slate-500">Last Disclosed Proof:</span>
                      <span className="text-slate-200 truncate max-w-[220px]">
                        {ds.lastProofHash.slice(0, 16)}...{ds.lastProofHash.slice(-8)}
                      </span>
                    </div>
                  </div>

                  {/* Circuit Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <span>Smart Contract Circuit Action Binding</span>
                    </div>

                    <div role="tablist" aria-label="Permission Status Filters" className="flex flex-wrap items-center gap-2">
                      {ds.status === 'REQUESTED' && (
                        <Button
                          variant="emerald"
                          size="sm"
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          disabled={isBusy}
                          onClick={() => grantPermission(ds.id)}
                        >
                          Grant Permission (Hospital)
                        </Button>
                      )}

                      {ds.status === 'GRANTED' && (
                        <>
                          <Button
                            variant={isExhausted ? 'secondary' : 'primary'}
                            size="sm"
                            leftIcon={<Lock className="w-3.5 h-3.5" />}
                            disabled={isBusy || isExhausted}
                            onClick={() => submitAccessProof(ds.id)}
                          >
                            {isExhausted ? 'Quota Exhausted' : 'Submit Access Proof'}
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-teal-400" />}
                            disabled={isBusy}
                            onClick={() => setRenewId(ds.id)}
                          >
                            Renew Quota Limit
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<XCircle className="w-3.5 h-3.5" />}
                            disabled={isBusy}
                            onClick={() => revokeAccess(ds.id)}
                          >
                            Revoke Access
                          </Button>
                        </>
                      )}

                      {ds.status === 'REVOKED' && (
                        <Badge variant="REVOKED" size="sm" label="Access Terminated" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Renew Quota Modal */}
      {renewId && (
        <Modal
          isOpen={!!renewId}
          onClose={() => setRenewId(null)}
          title="Extend Research Access Quota"
          subtitle="Authorize additional zero-knowledge queries on Midnight Preprod"
          icon={<RefreshCw className="w-5 h-5 text-teal-400" />}
          footer={
            <>
              <Button variant="ghost" onClick={() => setRenewId(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleRenew}>
                Confirm Quota Extension
              </Button>
            </>
          }
        >
          <form onSubmit={handleRenew} className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              Extending the access quota increases <code className="font-mono text-teal-300">maxAccessLimit</code> in the Midnight contract, allowing the authorized researcher to execute additional zero-knowledge study queries.
            </p>

            <div>
              <label className="block text-slate-200 font-semibold mb-1">Additional Quota Limit (+)</label>
              <input
                type="number"
                min="1"
                max="200"
                value={extraQuota}
                onChange={(e) => setExtraQuota(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slateSurface-border bg-midnight-950 text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30"
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
