'use client';

import React from 'react';
import {
  Shield,
  Database,
  Users,
  Activity,
  FileCheck,
  Key,
  ArrowRight,
  Layers,
  Lock,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Building2,
  Cpu,
  Eye,
  EyeOff,
} from 'lucide-react';
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
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Hero Banner with Biomedical Glass Accent */}
      <div className="relative overflow-hidden rounded-3xl border border-slateSurface-border bg-gradient-to-br from-midnight-900 via-midnight-850 to-midnight-950 p-8 sm:p-12 shadow-card">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="INFO" label="Verified Midnight Preprod" size="md" pulse />
            <Badge variant="CATEGORY" label="Compact Circuit Architecture" size="md" />
            <Badge variant="CONFIRMED" label="Zero-Knowledge HIPAA Model" size="md" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Confidential Medical Research <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Data Exchange Network
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Empowering healthcare institutions, academic hospitals, and research labs to discover clinical cohorts,
              verify investigator credentials, and execute zero-knowledge study queries — without disclosing sensitive patient
              PII, private keys, or raw medical data on-chain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Database className="w-5 h-5" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setActiveTab('datasets')}
            >
              Explore Clinical Datasets ({totalDatasets})
            </Button>

            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Key className="w-5 h-5 text-teal-400" />}
              onClick={() => setActiveTab('permissions')}
            >
              Permissions & Quotas ({pendingRequests} Pending)
            </Button>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card interactive glow className="space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Registered Cohorts</span>
            <div className="p-2 rounded-xl bg-teal-950/80 text-teal-400 border border-teal-500/30">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalDatasets}</div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span>Indexed on Midnight Preprod</span>
          </p>
        </Card>

        <Card interactive glow className="space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Active Permissions</span>
            <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{activeGranted}</div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Granted via Compact circuits</span>
          </p>
        </Card>

        <Card interactive glow className="space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">ZK Proof Queries</span>
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalAccessCount}</div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Disclosed proof commitments</span>
          </p>
        </Card>

        <Card interactive glow className="space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Cryptographic Logs</span>
            <div className="p-2 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-500/30">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalAuditLogs}</div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Immutable audit trace</span>
          </p>
        </Card>
      </div>

      {/* Interactive ZK Workflow Stepper */}
      <AccessWorkflowStepper />

      {/* Privacy Architecture Dual-State Matrix */}
      <div className="glass-card rounded-3xl border border-slateSurface-border p-6 sm:p-10 shadow-card space-y-8">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-teal-400" />
            <span>Midnight Zero-Knowledge Privacy Architecture</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Strict cryptographic partition between transparent on-chain public ledger state and confidential off-chain prover witness state.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Public Ledger State */}
          <div className="bg-midnight-900/90 rounded-2xl border border-slateSurface-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slateSurface-border pb-3.5">
              <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Public Ledger State (Transparent On-Chain)</span>
              </div>
              <Badge variant="INFO" size="sm" label="Substrate Nodes" />
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-midnight-950 border border-slateSurface-border">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Dataset Title & Domain Category:</span>
                  <p className="text-slate-400 mt-0.5">
                    Categorized metadata (<code className="font-mono text-cyan-300">datasetTitle</code>, <code className="font-mono text-cyan-300">datasetCategory</code>) published for global multi-institutional discovery.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-midnight-950 border border-slateSurface-border">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Access Quota Rate-Limit Counters:</span>
                  <p className="text-slate-400 mt-0.5">
                    Enforces maximum query limit (<code className="font-mono text-cyan-300">maxAccessLimit</code>) and verified query count (<code className="font-mono text-cyan-300">accessCount</code>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-midnight-950 border border-slateSurface-border">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Disclosed ZK Proof Commitments:</span>
                  <p className="text-slate-400 mt-0.5">
                    Cryptographic proof hash (<code className="font-mono text-cyan-300">lastProofHash</code>) disclosed via <code className="font-mono text-cyan-300">disclose()</code> verifying query legitimacy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Private Witness State */}
          <div className="bg-gradient-to-br from-teal-950/40 via-midnight-900 to-midnight-950 rounded-2xl border border-teal-500/40 p-6 space-y-4 shadow-glowTeal">
            <div className="flex items-center justify-between border-b border-teal-500/30 pb-3.5">
              <div className="flex items-center gap-2 font-bold text-sm text-teal-300">
                <EyeOff className="w-4 h-4 text-teal-400" />
                <span>Private Witness State (Secret Off-Chain in Prover)</span>
              </div>
              <Badge variant="GRANTED" size="sm" label="100% Confidential" />
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-midnight-950/90 border border-teal-500/20">
                <Lock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">
                    Local Wallet Secret Key (<code className="font-mono text-teal-300">localSecretKey</code>):
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    Never leaves the investigator's browser memory; used exclusively for deterministic ZK identity generation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-midnight-950/90 border border-teal-500/20">
                <Lock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">
                    Medical Credential Secret (<code className="font-mono text-teal-300">medicalCredentialSecret</code>):
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    Doctor/researcher credentials verified locally inside SNARK circuits without publishing identity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-midnight-950/90 border border-teal-500/20">
                <Lock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">
                    Patient Record Symmetric Key (<code className="font-mono text-teal-300">patientRecordKey</code>):
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    Clinical record decryption key. Stays 100% secret in client memory and is never transmitted over any network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
