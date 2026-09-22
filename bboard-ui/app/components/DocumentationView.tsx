'use client';

import React from 'react';
import { BookOpen, FileText, Code, Shield, Cpu, Terminal, ExternalLink } from 'lucide-react';
import { Badge, Card } from './ui';

export function DocumentationView() {
  return (
    <div className="glass-card rounded-2xl border border-slateSurface-border p-8 shadow-card space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slateSurface-border pb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-teal-400" />
            <span>Technical Documentation & Architecture Guide</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Private Medical Research Data Exchange on Midnight Protocol (Compact v0.23)
          </p>
        </div>
        <Badge variant="INFO" label="Preprod Verified" size="md" />
      </div>

      <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
        <div className="p-4 rounded-xl bg-midnight-950 border border-slateSurface-border space-y-2">
          <h3 className="font-bold text-sm text-teal-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span>1. Dual-State Architecture Overview</span>
          </h3>
          <p className="text-slate-400">
            Midnight smart contracts partition application state into <strong>public ledger state</strong> (stored on Substrate nodes for consensus) and <strong>private witness state</strong> (computed strictly inside the browser prover via <code className="font-mono text-teal-300">witness</code> declarations).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-midnight-950 border border-slateSurface-border space-y-3">
          <h3 className="font-bold text-sm text-teal-300 flex items-center gap-2">
            <Code className="w-4 h-4 text-teal-400" />
            <span>2. Compact Circuit Specifications (bboard.compact)</span>
          </h3>
          <ul className="space-y-2 text-slate-300">
            <li className="p-2 rounded-lg bg-midnight-900 border border-slateSurface-border">
              <strong className="text-white font-mono">registerDataset(title, category)</strong>: Registers clinical dataset with metadata categorization and sets hospital owner public key.
            </li>
            <li className="p-2 rounded-lg bg-midnight-900 border border-slateSurface-border">
              <strong className="text-white font-mono">requestAccess(datasetId)</strong>: Verifies doctor credential witness and publishes active researcher PK on-chain.
            </li>
            <li className="p-2 rounded-lg bg-midnight-900 border border-slateSurface-border">
              <strong className="text-white font-mono">grantPermission(datasetId, researcherPk)</strong>: Hospital dataset owner authorizes research access.
            </li>
            <li className="p-2 rounded-lg bg-midnight-900 border border-slateSurface-border">
              <strong className="text-white font-mono">submitAccessProof(datasetId, patientRecordHash)</strong>: Computes persistent hash proof and checks <code className="font-mono text-teal-300">accessCount &lt; maxAccessLimit</code>.
            </li>
            <li className="p-2 rounded-lg bg-midnight-900 border border-slateSurface-border">
              <strong className="text-white font-mono">renewAccessQuota(datasetId, additionalQuota)</strong>: Hospital dataset owner extends query limit dynamically.
            </li>
            <li className="p-2 rounded-lg bg-midnight-900 border border-slateSurface-border">
              <strong className="text-white font-mono">revokeAccess(datasetId)</strong>: Revokes investigator authorization immediately.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
