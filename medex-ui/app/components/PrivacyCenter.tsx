'use client';

import React from 'react';
import { Eye, EyeOff, ShieldCheck, Lock, FileText, CheckCircle2, Layers, Cpu, Code2, KeyRound } from 'lucide-react';
import { Badge } from './ui';

export function PrivacyCenter() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-nordic-panel border border-emerald-accent/40 text-emerald-accent shadow-emerald">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">
                Zero-Knowledge Privacy Architecture
              </h1>
              <p className="text-xs text-nordic-olive mt-0.5">
                Cryptographic partition between private witness state, public ledger state, and derived ZK proofs.
              </p>
            </div>
          </div>
        </div>

        <Badge variant="ON_CHAIN" size="md" />
      </div>

      {/* 3 Privacy Categories Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Category 1: PRIVATE WITNESS STATE */}
        <div className="bg-nordic-panel rounded-2xl border border-rose-500/30 p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-emerald-200 pb-4">
            <div className="p-2 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-500/30">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wider block">
                Category 01
              </span>
              <h2 className="text-base font-bold text-emerald-950">PRIVATE WITNESS STATE</h2>
            </div>
          </div>
          <p className="text-xs text-nordic-olive leading-relaxed">
            Maintained 100% locally in investigator memory. Never transmitted across any network or logged on-chain.
          </p>

          <ul className="space-y-3 text-xs text-emerald-950">
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-nordic-bg border border-emerald-200">
              <KeyRound className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Wallet Secret Key (<code className="font-mono text-rose-300">localSecretKey</code>)</span>
                <p className="text-[11px] text-nordic-olive mt-0.5">Seed used for deterministic ZK identity proof derivation.</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-nordic-bg border border-emerald-200">
              <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Medical Credential Secret (<code className="font-mono text-rose-300">medicalCredentialSecret</code>)</span>
                <p className="text-[11px] text-nordic-olive mt-0.5">Doctor/institutional verification credentials verified in SNARK.</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-nordic-bg border border-emerald-200">
              <FileText className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Raw EHR Patient Records</span>
                <p className="text-[11px] text-nordic-olive mt-0.5">Clinical observations and raw genomic sequences remain local.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Category 2: PUBLIC / DISCLOSED LEDGER STATE */}
        <div className="bg-nordic-panel rounded-2xl border border-emerald-200 p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-emerald-200 pb-4">
            <div className="p-2 rounded-xl bg-nordic-hover text-emerald-950 border border-emerald-200">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold text-nordic-olive uppercase tracking-wider block">
                Category 02
              </span>
              <h2 className="text-base font-bold text-emerald-950">PUBLIC / DISCLOSED STATE</h2>
            </div>
          </div>
          <p className="text-xs text-nordic-olive leading-relaxed">
            Transparently recorded on Midnight Preprod Substrate nodes for global cohort indexing & discovery.
          </p>

          <ul className="space-y-3 text-xs text-emerald-950">
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-nordic-bg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-nordic-olive shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Dataset Name & Domain Category</span>
                <p className="text-[11px] text-nordic-olive mt-0.5"><code className="font-mono text-emerald-950">datasetTitle</code> & <code className="font-mono text-emerald-950">datasetCategory</code> indexed on-chain.</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-nordic-bg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-nordic-olive shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Access Quota Rate Limits</span>
                <p className="text-[11px] text-nordic-olive mt-0.5"><code className="font-mono text-emerald-950">maxAccessLimit</code> and <code className="font-mono text-emerald-950">accessCount</code> rate-limit parameters.</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-nordic-bg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-nordic-olive shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Contract Verification Key</span>
                <p className="text-[11px] text-nordic-olive mt-0.5">Compact compiled circuit verification keys (<code className="font-mono text-emerald-950">.verifier</code>).</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Category 3: DERIVED / PROVED ZK PROOFS */}
        <div className="bg-nordic-panel rounded-2xl border border-emerald-accent/40 p-6 space-y-5 shadow-emerald">
          <div className="flex items-center gap-3 border-b border-emerald-border pb-4">
            <div className="p-2 rounded-xl bg-emerald-surface text-emerald-accent border border-emerald-border">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold text-emerald-accent uppercase tracking-wider block">
                Category 03
              </span>
              <h2 className="text-base font-bold text-emerald-950">DERIVED / PROVED ZK STATE</h2>
            </div>
          </div>
          <p className="text-xs text-nordic-olive leading-relaxed">
            Zero-Knowledge SNARK proof outputs generated by WASM prover client and submitted on-chain.
          </p>

          <ul className="space-y-3 text-xs text-emerald-950">
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-nordic-bg border border-emerald-200">
              <Cpu className="w-4 h-4 text-emerald-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Proof Hash Commitment (<code className="font-mono text-emerald-accent">lastProofHash</code>)</span>
                <p className="text-[11px] text-nordic-olive mt-0.5">Disclosed via <code className="font-mono text-emerald-accent">disclose()</code> verifying query validity.</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-nordic-bg border border-emerald-200">
              <Cpu className="w-4 h-4 text-emerald-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Anti-Replay Nullifier Witnesses</span>
                <p className="text-[11px] text-nordic-olive mt-0.5">Prevents double-spending of query quota without revealing identity.</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-nordic-bg border border-emerald-200">
              <Cpu className="w-4 h-4 text-emerald-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Client-Side WASM Prover Result</span>
                <p className="text-[11px] text-nordic-olive mt-0.5">Calculated in 1.8s - 3.4s using local proof server keys.</p>
              </div>
            </li>
          </ul>
        </div>

      </div>

      {/* Technical Compact Circuit Pipeline */}
      <div className="bg-nordic-panel rounded-2xl border border-emerald-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
            <Code2 className="w-4 h-4 text-emerald-accent" />
            <span>Compact Smart Contract Circuit Mechanics (<code className="font-mono text-emerald-accent">medex.compact</code>)</span>
          </div>
          <span className="text-[11px] font-mono text-nordic-olive">v0.23 Compiler Target</span>
        </div>

        <div className="bg-nordic-bg rounded-xl border border-emerald-200 p-4 font-mono text-xs text-nordic-olive overflow-x-auto space-y-2">
          <div className="text-emerald-950 font-bold">{"// 1. Circuit export for dataset registration on-chain"}</div>
          <div><span className="text-emerald-accent">export circuit</span> registerDataset(title: Bytes[32], category: Bytes[32], quota: Uint&lt;32&gt;): Void</div>
          <div className="text-emerald-950 font-bold pt-2">{"// 2. Researcher requests access with quota limit"}</div>
          <div><span className="text-emerald-accent">export circuit</span> requestAccess(datasetId: Bytes[32]): Void</div>
          <div className="text-emerald-950 font-bold pt-2">{"// 3. Owner grants permission and sets query limit"}</div>
          <div><span className="text-emerald-accent">export circuit</span> grantPermission(researcherKey: Bytes[32], maxQueries: Uint&lt;32&gt;): Void</div>
          <div className="text-emerald-950 font-bold pt-2">{"// 4. Researcher submits ZK proof of authorized access"}</div>
          <div><span className="text-emerald-accent">export circuit</span> submitAccessProof(proofHash: Bytes[32]): Void</div>
        </div>
      </div>
    </div>
  );
}
