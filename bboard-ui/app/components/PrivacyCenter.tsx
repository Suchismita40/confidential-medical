'use client';

import React from 'react';
import { Eye, EyeOff, ShieldCheck, Lock, FileText, CheckCircle2, Layers, Cpu, Check, AlertCircle } from 'lucide-react';
import { Badge, Card } from './ui';

export function PrivacyCenter() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slateSurface-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-950/80 text-teal-400 border border-teal-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Midnight Zero-Knowledge Privacy Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 ml-11">
            Cryptographic comparison between transparent on-chain ledger state and secret off-chain prover witness state.
          </p>
        </div>

        <Badge variant="CONFIRMED" label="Cryptographically Audited" size="md" />
      </div>

      {/* Dual State Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PUBLIC LEDGER STATE */}
        <div className="glass-card rounded-2xl border border-slateSurface-border p-6 sm:p-8 space-y-6 shadow-card">
          <div className="flex items-center gap-3.5 border-b border-slateSurface-border pb-4">
            <div className="w-11 h-11 rounded-2xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Public Ledger State (On-Chain)</h3>
              <p className="text-xs text-slate-400">Published transparently to Midnight blockchain Substrate nodes</p>
            </div>
          </div>

          <ul className="space-y-3.5 text-xs text-slate-300 font-medium">
            <li className="flex items-start gap-3 p-3.5 rounded-xl bg-midnight-950 border border-slateSurface-border">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Dataset Metadata & Domain Category</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Title and category tag (<code className="font-mono text-cyan-300">datasetTitle</code>, <code className="font-mono text-cyan-300">datasetCategory</code>) disclosed for cohort discovery.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-3.5 rounded-xl bg-midnight-950 border border-slateSurface-border">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Access Quota Governance Counters</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  <code className="font-mono text-cyan-300">maxAccessLimit</code> and <code className="font-mono text-cyan-300">accessCount</code> enforce rate-limits and prevent bulk data extraction.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-3.5 rounded-xl bg-midnight-950 border border-slateSurface-border">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Derived Proof Commitments</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cryptographic commitment (<code className="font-mono text-cyan-300">lastProofHash</code>) disclosed via <code className="font-mono text-cyan-300">disclose()</code> verifying query integrity without revealing raw patient records.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* PRIVATE WITNESS STATE */}
        <div className="bg-gradient-to-br from-teal-950/40 via-midnight-900 to-midnight-950 rounded-2xl border border-teal-500/40 p-6 sm:p-8 space-y-6 shadow-glowTeal">
          <div className="flex items-center gap-3.5 border-b border-teal-500/30 pb-4">
            <div className="w-11 h-11 rounded-2xl bg-teal-950 text-teal-300 border border-teal-500/40 flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-teal-300 text-base">Private Witness State (Off-Chain)</h3>
              <p className="text-xs text-slate-400">Maintained strictly within local browser prover client memory</p>
            </div>
          </div>

          <ul className="space-y-3.5 text-xs text-slate-300 font-medium">
            <li className="flex items-start gap-3 p-3.5 rounded-xl bg-midnight-950/90 border border-teal-500/20">
              <Lock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Local Wallet Secret Key (<code className="font-mono text-teal-300">localSecretKey</code>)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Wallet secret key used for deterministic zero-knowledge public key derivation. Never leaves browser.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-3.5 rounded-xl bg-midnight-950/90 border border-teal-500/20">
              <Lock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Medical License Credential (<code className="font-mono text-teal-300">medicalCredentialSecret</code>)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Doctor/researcher credential secret verified locally inside ZK circuit without disclosing personal identity.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-3.5 rounded-xl bg-midnight-950/90 border border-teal-500/20">
              <Lock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Patient Record Symmetric Key (<code className="font-mono text-teal-300">patientRecordKey</code>)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Patient record decryption key. Remains 100% confidential and is never sent across any network.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
