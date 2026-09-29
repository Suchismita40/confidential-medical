'use client';

import React, { useState } from 'react';
import { BookOpen, FileText, Code, Shield, Cpu, Terminal, ExternalLink, Copy, Check, Server, Lock, CheckCircle2 } from 'lucide-react';
import { Badge } from './ui';

export function DocumentationView() {
  const [copiedContract, setCopiedContract] = useState(false);
  const PREPROD_CONTRACT = 'c4e4778c4b3d516bd43569b30f7e1ca6dbea268c5e997bb7473f77c9f88085cc';

  const handleCopyContract = () => {
    navigator.clipboard.writeText(PREPROD_CONTRACT);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-nordic-panel border border-emerald-accent/40 text-emerald-accent shadow-emerald">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">
                Protocol & Compact Architecture Reference
              </h1>
              <p className="text-xs text-nordic-olive mt-0.5">
                Technical specification for MedEx smart contract circuits on Midnight Preprod Testnet.
              </p>
            </div>
          </div>
        </div>

        <Badge variant="ON_CHAIN" size="md" />
      </div>

      {/* Network & Contract Specs Banner */}
      <div className="bg-nordic-panel rounded-2xl border border-emerald-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
          <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-accent" />
            <span>Deployed Preprod Network Contract Parameters</span>
          </h3>
          <span className="text-[11px] font-mono text-emerald-accent bg-emerald-surface px-2.5 py-0.5 rounded-full border border-emerald-border">
            Compact Compiler v0.23
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-nordic-bg p-4 rounded-xl border border-emerald-200 space-y-2">
            <span className="text-nordic-olive font-medium">Deployed Smart Contract Address</span>
            <div className="flex items-center justify-between font-mono bg-nordic-panel p-2.5 rounded-lg border border-emerald-200 text-emerald-950">
              <span className="truncate">{PREPROD_CONTRACT}</span>
              <button
                onClick={handleCopyContract}
                className="ml-2 text-nordic-olive hover:text-emerald-accent transition-colors"
                title="Copy Contract Address"
              >
                {copiedContract ? <Check className="w-4 h-4 text-emerald-accent" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-nordic-bg p-4 rounded-xl border border-emerald-200 space-y-2">
            <span className="text-nordic-olive font-medium">Network Environment</span>
            <div className="flex items-center justify-between font-mono bg-nordic-panel p-2.5 rounded-lg border border-emerald-200 text-emerald-950">
              <span>Midnight Preprod Testnet</span>
              <span className="w-2 h-2 rounded-full bg-emerald-accent animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Compact Circuit Reference */}
      <div className="bg-nordic-panel rounded-2xl border border-emerald-200 p-6 sm:p-8 space-y-6">
        <div className="border-b border-emerald-200 pb-4">
          <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-accent" />
            <span>Compact Smart Contract Circuits (<code className="font-mono text-emerald-accent">medex.compact</code>)</span>
          </h3>
          <p className="text-xs text-nordic-olive mt-1">
            Explicit circuit definitions governing medical cohort registration, access requests, permissions, and zero-knowledge proof submissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-nordic-bg rounded-xl border border-emerald-200 p-4 space-y-2">
            <div className="flex items-center justify-between font-mono font-bold text-emerald-950">
              <span className="text-emerald-accent">1. registerDataset</span>
              <span className="text-[10px] text-nordic-olive font-normal">Dataset Registration</span>
            </div>
            <p className="text-nordic-olive text-[11px] leading-relaxed">
              Registers a new clinical research cohort on-chain, binding title, domain category, and maximum query quota limit.
            </p>
            <pre className="bg-nordic-panel p-2.5 rounded-lg border border-emerald-200 font-mono text-[11px] text-emerald-950 overflow-x-auto">
export circuit registerDataset(title: Bytes[32], category: Bytes[32], quota: Uint&lt;32&gt;): Void
            </pre>
          </div>

          <div className="bg-nordic-bg rounded-xl border border-emerald-200 p-4 space-y-2">
            <div className="flex items-center justify-between font-mono font-bold text-emerald-950">
              <span className="text-emerald-accent">2. requestAccess</span>
              <span className="text-[10px] text-nordic-olive font-normal">Permission Request</span>
            </div>
            <p className="text-nordic-olive text-[11px] leading-relaxed">
              Submits an access request for a cohort, providing the researcher's public identity commitment to the dataset owner.
            </p>
            <pre className="bg-nordic-panel p-2.5 rounded-lg border border-emerald-200 font-mono text-[11px] text-emerald-950 overflow-x-auto">
export circuit requestAccess(datasetId: Bytes[32]): Void
            </pre>
          </div>

          <div className="bg-nordic-bg rounded-xl border border-emerald-200 p-4 space-y-2">
            <div className="flex items-center justify-between font-mono font-bold text-emerald-950">
              <span className="text-emerald-accent">3. grantPermission</span>
              <span className="text-[10px] text-nordic-olive font-normal">Owner Authorization</span>
            </div>
            <p className="text-nordic-olive text-[11px] leading-relaxed">
              Dataset owner approves a pending access request and initializes the researcher's query quota limit.
            </p>
            <pre className="bg-nordic-panel p-2.5 rounded-lg border border-emerald-200 font-mono text-[11px] text-emerald-950 overflow-x-auto">
export circuit grantPermission(researcherPk: Bytes[32], maxQueries: Uint&lt;32&gt;): Void
            </pre>
          </div>

          <div className="bg-nordic-bg rounded-xl border border-emerald-200 p-4 space-y-2">
            <div className="flex items-center justify-between font-mono font-bold text-emerald-950">
              <span className="text-emerald-accent">4. submitAccessProof</span>
              <span className="text-[10px] text-nordic-olive font-normal">ZK Proof Query</span>
            </div>
            <p className="text-nordic-olive text-[11px] leading-relaxed">
              Executes an authorized query by disclosing a client-side zero-knowledge proof commitment while enforcing quota limits.
            </p>
            <pre className="bg-nordic-panel p-2.5 rounded-lg border border-emerald-200 font-mono text-[11px] text-emerald-950 overflow-x-auto">
export circuit submitAccessProof(proofHash: Bytes[32]): Void
            </pre>
          </div>
        </div>
      </div>

      {/* Wallet & Proof Server Prerequisites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-nordic-panel rounded-2xl border border-emerald-200 p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-accent" />
            <span>Lace Wallet DApp Connector Prerequisites</span>
          </h3>
          <ul className="space-y-2 text-xs text-nordic-olive">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-accent shrink-0" />
              <span>Midnight Lace Extension v4 installed</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-accent shrink-0" />
              <span>Unshielded address permission authorized</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-accent shrink-0" />
              <span>Network set to Midnight Preprod</span>
            </li>
          </ul>
        </div>

        <div className="bg-nordic-panel rounded-2xl border border-emerald-200 p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-accent" />
            <span>Local WASM ZK Prover Prerequisites</span>
          </h3>
          <ul className="space-y-2 text-xs text-nordic-olive">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-accent shrink-0" />
              <span>Proof Server running on localhost:6300 or WASM in-browser</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-accent shrink-0" />
              <span>Compiled Prover & Verifier keys present in public/keys</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-accent shrink-0" />
              <span>Private witness inputs stored in client memory</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
