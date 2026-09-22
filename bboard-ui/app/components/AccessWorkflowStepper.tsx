'use client';

import React from 'react';
import {
  Wallet,
  Key,
  Send,
  Lock,
  CheckCircle2,
  Shield,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
} from 'lucide-react';
import { Badge } from './ui';

interface StepperProps {
  boardState?: any;
}

export function AccessWorkflowStepper({ boardState }: StepperProps) {
  const stateEnum = boardState?.state ?? 0;

  const steps = [
    {
      id: 1,
      title: 'Midnight Lace Wallet Enablement',
      desc: 'Detect window.midnight provider and establish cryptographic handshake with Lace Browser Extension.',
      circuit: null,
      icon: Wallet,
      status: 'completed',
    },
    {
      id: 2,
      title: 'Dataset & Credential Selection',
      desc: 'Select clinical dataset and bind local medical credential witness secret in prover state.',
      circuit: 'witness localSecretKey()',
      icon: Key,
      status: 'completed',
    },
    {
      id: 3,
      title: 'Confidential Access Request',
      desc: 'Invoke requestAccess circuit to compute proof of medical license and publish derived researcher PK.',
      circuit: 'requestAccess(datasetId)',
      icon: Send,
      status: stateEnum >= 1 ? 'completed' : 'current',
    },
    {
      id: 4,
      title: 'Hospital Permission Grant',
      desc: 'Accredited hospital dataset owner validates credentials and authorizes research access via Compact circuit.',
      circuit: 'grantPermission(datasetId, researcherPk)',
      icon: CheckCircle2,
      status: stateEnum >= 2 ? 'completed' : 'pending',
    },
    {
      id: 5,
      title: 'ZK Access Proof & Quota Check',
      desc: 'Generate persistent proof commitment on patient record key. Enforces maxAccessLimit check without leaking data.',
      circuit: 'submitAccessProof(datasetId, hash)',
      icon: Lock,
      status: stateEnum >= 2 && (boardState?.accessCount > 0) ? 'completed' : 'pending',
    },
  ];

  return (
    <div className="glass-card rounded-2xl border border-slateSurface-border p-6 sm:p-8 shadow-card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slateSurface-border pb-5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-teal-400" />
            <span>Zero-Knowledge Verification Workflow</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end cryptographic state progression across Compact circuits and private witness generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="INFO" label="Compact v0.23" size="sm" />
          <Badge variant="CATEGORY" label="Selective Disclosure" size="sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = step.status === 'completed';
          const isCurrent = step.status === 'current';

          return (
            <div key={step.id} className="relative flex items-start gap-4 sm:gap-5 group">
              {/* Connecting vertical line */}
              {idx !== steps.length - 1 && (
                <div
                  className={`absolute left-5 sm:left-6 top-12 bottom-0 w-0.5 -ml-[1px] transition-colors duration-300 ${
                    isDone ? 'bg-gradient-to-b from-teal-500 to-teal-700/50' : 'bg-midnight-800'
                  }`}
                />
              )}

              {/* Step Icon Node */}
              <div
                className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isDone
                    ? 'bg-gradient-to-br from-teal-500 to-teal-700 text-midnight-950 font-bold shadow-glowTeal'
                    : isCurrent
                    ? 'bg-midnight-900 border-2 border-teal-400 text-teal-300 shadow-glowTeal animate-pulse'
                    : 'bg-midnight-900 border border-slateSurface-border text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                {isDone && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-midnight-900 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-midnight-950" />
                  </span>
                )}
              </div>

              {/* Step Content */}
              <div className="space-y-1.5 pt-0.5 flex-grow">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-teal-400 tracking-wider uppercase">
                    STAGE 0{step.id}
                  </span>
                  {isDone ? (
                    <Badge variant="CONFIRMED" size="sm" label="Verified" />
                  ) : isCurrent ? (
                    <Badge variant="PENDING" size="sm" label="Active Stage" pulse />
                  ) : (
                    <Badge variant="NONE" size="sm" label="Pending" />
                  )}
                  {step.circuit && (
                    <code className="text-[10px] font-mono px-2 py-0.5 rounded bg-midnight-950 text-slate-300 border border-slateSurface-border">
                      {step.circuit}
                    </code>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
