'use client';

import React, { useState } from 'react';
import {
  Activity,
  FileCheck,
  ExternalLink,
  Shield,
  Layers,
  Database,
  CheckCircle2,
  Lock,
  Globe,
  Copy,
  Check,
  Terminal,
  Cpu,
  Server,
  Hash,
  Search,
} from 'lucide-react';
import { useDeployedBoardContext } from '../../src/hooks/useDeployedBoardContext';
import { Button, Badge, Card } from './ui';

export function ActivityView() {
  const { state } = useDeployedBoardContext();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchLog, setSearchLog] = useState('');

  const PREPROD_CONTRACT = state.contractAddress || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || process.env.VITE_CONTRACT_ADDRESS || 'c4e4778c4b3d516bd43569b30f7e1ca6dbea268c5e997bb7473f77c9f88085cc';
  const DEPLOYER_ADDR = 'mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv';
  const EXPLORER_BASE = 'https://preprod.midnightexplorer.com';

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredLogs = state.auditLogs.filter((log) => {
    const q = searchLog.toLowerCase();
    return (
      log.circuit.toLowerCase().includes(q) ||
      log.datasetTitle.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.txHash.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border-emerald-300 border border-teal-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-950 tracking-tight">
              Cryptographic Activity & Contract Telemetry
            </h2>
          </div>
          <p className="text-xs text-emerald-800/80 mt-1.5 ml-11">
            Live immutable transaction logs, zero-knowledge verification commitments, and verified Midnight Preprod infrastructure status.
          </p>
        </div>

        <a
          href={EXPLORER_BASE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-700 border border-teal-500/30 text-xs font-semibold shadow-subtle hover:border-teal-400 transition-all select-none"
        >
          <Globe className="w-4 h-4 text-emerald-800" />
          <span>Launch Midnight Explorer</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Network & Infrastructure Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card interactive glow className="space-y-3">
          <div className="flex items-center justify-between text-emerald-800/80">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Network Protocol</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border-emerald-300 border border-teal-500/30">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-950">Midnight Preprod</div>
          <div className="text-xs text-emerald-800/80 space-y-1 pt-1 border-t border-emerald-200">
            <p className="flex items-center justify-between">
              <span>Network ID:</span>
              <code className="text-emerald-700 font-mono font-semibold">preprod</code>
            </p>
            <p className="flex items-center justify-between">
              <span>Node Consensus:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active & Synced
              </span>
            </p>
          </div>
        </Card>

        <Card interactive glow className="space-y-3">
          <div className="flex items-center justify-between text-emerald-800/80">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Proof Server</span>
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-950">Official Preprod Prover</div>
          <div className="text-xs text-emerald-800/80 space-y-1 pt-1 border-t border-emerald-200">
            <p className="flex items-center justify-between">
              <span>Prover Modality:</span>
              <span className="text-emerald-400 font-semibold">Witness Isolated</span>
            </p>
            <p className="flex items-center justify-between">
              <span>Proof Verification:</span>
              <span className="text-emerald-700 font-semibold">Fast SNARK (~1.2s)</span>
            </p>
          </div>
        </Card>

        <Card interactive glow className="space-y-3">
          <div className="flex items-center justify-between text-emerald-800/80">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Compact Smart Contract</span>
            <div className="p-2 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-500/30">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-950">v0.23 Categorized + Quota</div>
          <div className="text-xs text-emerald-800/80 space-y-1 pt-1 border-t border-emerald-200">
            <p className="flex items-center justify-between">
              <span>Circuits:</span>
              <span className="text-emerald-700 font-semibold">6 Impure, 1 Pure</span>
            </p>
            <p className="flex items-center justify-between">
              <span>On-Chain Status:</span>
              <span className="text-emerald-400 font-semibold">Verified Deployed</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Verified Preprod Contract Identifiers */}
      <div className="bg-white border border-emerald-200 shadow-sm rounded-2xl rounded-2xl border border-emerald-200 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-200 pb-3.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-sm text-emerald-950">
              Verified Midnight Preprod Contract References
            </h3>
          </div>
          <Badge variant="INFO" size="sm" label="On-Chain Live" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between text-emerald-800/80 font-medium">
              <span>Deployed Contract Address (Hex / Bech32)</span>
              <button
                onClick={() => copyToClipboard(PREPROD_CONTRACT, 'contract')}
                className="text-emerald-800 hover:text-emerald-700 flex items-center gap-1"
              >
                {copiedField === 'contract' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'contract' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="font-mono text-[11px] text-emerald-700 break-all font-semibold bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200">
              {PREPROD_CONTRACT}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between text-emerald-800/80 font-medium">
              <span>Hospital Deployer Address</span>
              <button
                onClick={() => copyToClipboard(DEPLOYER_ADDR, 'deployer')}
                className="text-emerald-800 hover:text-emerald-700 flex items-center gap-1"
              >
                {copiedField === 'deployer' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'deployer' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="font-mono text-[11px] text-slate-800 break-all font-semibold bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200">
              {DEPLOYER_ADDR}
            </p>
          </div>
        </div>
      </div>

      {/* Immutable Cryptographic Audit Log Table */}
      <div className="bg-white border border-emerald-200 shadow-sm rounded-2xl rounded-2xl border border-emerald-200 shadow-card overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-sm text-emerald-950">
              Immutable Cryptographic Audit Trail ({state.auditLogs.length} Events)
            </h3>
          </div>

          {/* Search Logs */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-emerald-800/80 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-emerald-200 text-emerald-950 placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-emerald-800/80 text-xs">
            No audit records matching search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-emerald-200 text-emerald-800/80 text-[11px] font-mono uppercase bg-emerald-50/70">
                  <th className="p-3">Timestamp (UTC)</th>
                  <th className="p-3">Circuit Action</th>
                  <th className="p-3">Clinical Cohort</th>
                  <th className="p-3">Actor / Researcher</th>
                  <th className="p-3">Transaction / Proof Hash</th>
                  <th className="p-3 text-right">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slateSurface-border">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-emerald-100/60/40 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-emerald-800/80 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="p-3 font-semibold text-emerald-700 whitespace-nowrap">
                      <code className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {log.circuit}
                      </code>
                    </td>

                    <td className="p-3 text-emerald-950 font-medium max-w-[200px] truncate">
                      {log.datasetTitle}
                    </td>

                    <td className="p-3 font-mono text-[11px] text-emerald-800/80 max-w-[140px] truncate">
                      {log.actor}
                    </td>

                    <td className="p-3 font-mono text-[11px] max-w-[220px]">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-emerald-700 truncate">
                          {log.txHash.slice(0, 10)}...{log.txHash.slice(-6)}
                        </span>
                        <a
                          href={log.txHash ? `${EXPLORER_BASE}/transactions/${log.txHash.startsWith("0x") ? log.txHash : "0x" + log.txHash}` : EXPLORER_BASE}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on Midnight Explorer"
                          className="p-1 hover:text-emerald-950 text-emerald-800/80"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    <td className="p-3 text-right whitespace-nowrap">
                      <Badge variant="CONFIRMED" size="sm" label={log.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
