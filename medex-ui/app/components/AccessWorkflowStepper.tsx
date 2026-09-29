'use client';

import React from 'react';
import { Database, ShieldCheck, Lock, Activity, ArrowRight } from 'lucide-react';

export function AccessWorkflowStepper() {
  const steps = [
    {
      num: '01',
      title: 'Select Research Cohort',
      desc: 'Browse verified medical datasets registered on the Midnight Preprod smart contract.',
      icon: Database,
    },
    {
      num: '02',
      title: 'Prove Identity Privately',
      desc: 'Generate a zero-knowledge proof of medical researcher credentials locally in-browser.',
      icon: ShieldCheck,
    },
    {
      num: '03',
      title: 'Issue ZK Access Quota',
      desc: 'Smart contract issues a bounded query quota witness without revealing raw patient EHR.',
      icon: Lock,
    },
    {
      num: '04',
      title: 'Execute On-Chain Queries',
      desc: 'Submit zero-knowledge access proofs to execute authorized queries on-chain.',
      icon: Activity,
    },
  ];

  return (
    <div className="bg-nordic-panel rounded-2xl border border-emerald-200 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-accent animate-pulse" />
            <span>Zero-Knowledge Data Exchange Lifecycle</span>
          </h2>
          <p className="text-xs text-nordic-olive mt-0.5">
            End-to-end privacy-preserving workflow powered by Compact smart contracts on Midnight Preprod.
          </p>
        </div>
        <span className="text-[11px] font-mono text-emerald-accent bg-emerald-surface px-2.5 py-1 rounded-full border border-emerald-border w-fit">
          100% Client-Side ZK Witness
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="relative bg-nordic-bg rounded-xl border border-emerald-200 p-5 flex flex-col justify-between hover:border-emerald-accent/40 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-accent">
                    {step.num}
                  </span>
                  <div className="p-2 rounded-lg bg-nordic-panel text-emerald-950 border border-emerald-200 group-hover:border-emerald-accent/40 transition-colors">
                    <Icon className="w-4 h-4 text-emerald-accent" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">{step.title}</h3>
                  <p className="text-xs text-nordic-olive mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-4 h-4 text-nordic-border" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
