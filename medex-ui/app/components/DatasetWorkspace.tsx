'use client';

import React, { useState } from 'react';
import {
  Database,
  Plus,
  Search,
  Filter,
  Layers,
  Lock,
  CheckCircle2,
  Clock,
  Key,
  RefreshCw,
  XCircle,
  ExternalLink,
  Shield,
  Eye,
  AlertCircle,
  Building2,
  FileCheck,
  Check,
  Copy,
  SlidersHorizontal,
  Sparkles,
  ShieldAlert,
  Hash,
} from 'lucide-react';
import { useDeployedBoardContext, DatasetItem } from '../../src/hooks/useDeployedBoardContext';
import { Button, Badge, Card, Modal, ProgressBar } from './ui';

export function DatasetWorkspace() {
  const {
    state,
    selectDataset,
    registerDataset,
    requestAccess,
    grantPermission,
    submitAccessProof,
    renewAccessQuota,
    revokeAccess,
    resetTxProgress,
  } = useDeployedBoardContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [detailDataset, setDetailDataset] = useState<DatasetItem | null>(null);
  const [renewDataset, setRenewDataset] = useState<DatasetItem | null>(null);
  const [additionalQuota, setAdditionalQuota] = useState(15);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form fields for dataset registration
  const [regTitle, setRegTitle] = useState('');
  const [regCategory, setRegCategory] = useState<DatasetItem['category']>('Oncology & Genomics');
  const [regInstitution, setRegInstitution] = useState('');
  const [regQuota, setRegQuota] = useState(50);
  const [regDescription, setRegDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const categories = [
    'All',
    'Oncology & Genomics',
    'Cardiology',
    'Neurology',
    'Immunology',
    'Pediatrics',
    'Ophthalmology',
    'General',
  ];

  const filteredDatasets = state.datasets.filter((ds) => {
    const matchesCat = selectedCategory === 'All' || ds.category === selectedCategory;
    const matchesSearch =
      ds.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenRegister = () => {
    setRegTitle('');
    setRegCategory('Oncology & Genomics');
    setRegInstitution('');
    setRegQuota(50);
    setRegDescription('');
    setFormError(null);
    setIsRegisterModalOpen(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regTitle.trim()) {
      setFormError('Please provide a descriptive dataset title.');
      return;
    }
    if (!regInstitution.trim()) {
      setFormError('Please specify the accredited healthcare institution.');
      return;
    }
    if (regQuota <= 0) {
      setFormError('Initial access quota must be at least 1 query.');
      return;
    }

    setFormError(null);
    setIsRegisterModalOpen(false);

    await registerDataset(regTitle, regCategory, regQuota, regInstitution, regDescription);
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewDataset || additionalQuota <= 0) return;
    const targetId = renewDataset.id;
    setRenewDataset(null);
    await renewAccessQuota(targetId, additionalQuota);
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const tx = state.txProgress;
  const isBusy = tx.phase === 'preparing' || tx.phase === 'wallet_request' || tx.phase === 'proving' || tx.phase === 'submitting';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Workspace Header & Action Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border-emerald-300 border border-emerald-300">
              <Database className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-950 tracking-tight">
              Confidential Clinical Dataset Registry
            </h2>
          </div>
          <p className="text-xs text-emerald-800/80 mt-1.5 ml-11">
            Zero-knowledge indexed datasets on Midnight Preprod. Access is regulated strictly via Compact smart contract circuits.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          disabled={isBusy}
          onClick={handleOpenRegister}
        >
          Register New Clinical Dataset
        </Button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white border border-emerald-200 shadow-sm rounded-2xl rounded-2xl border border-emerald-200 p-4 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-emerald-800/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cohorts, institutions, biomarkers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-emerald-200 text-emerald-950 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 select-none ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-teal-500 to-teal-400 text-midnight-950 font-bold shadow-glowTeal'
                  : 'text-emerald-800/80 bg-emerald-50/50 hover:bg-emerald-100/80 hover:text-emerald-950 border border-emerald-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dataset Grid */}
      {filteredDatasets.length === 0 ? (
        <div className="bg-white border border-emerald-200 shadow-sm rounded-2xl rounded-2xl border border-emerald-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-800/80">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950">No Matching Datasets Found</h3>
            <p className="text-xs text-emerald-800/80 mt-1">
              Try adjusting your search terms or selecting a different category filter.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDatasets.map((dataset) => {
            const max = Number(dataset.maxAccessLimit);
            const used = Number(dataset.accessCount);
            const remaining = Math.max(0, max - used);
            const isExhausted = remaining === 0 && dataset.status === 'GRANTED';

            return (
              <div
                key={dataset.id}
                className="bg-white border border-emerald-200 shadow-sm rounded-2xl-interactive rounded-2xl border border-emerald-200 p-6 shadow-card flex flex-col justify-between space-y-5 group"
              >
                {/* Card Top: Category & Status */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant="CATEGORY" label={dataset.category} size="md" />
                    <Badge variant={dataset.status} size="md" />
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-emerald-950 group-hover:text-emerald-700 transition-colors leading-snug">
                      {dataset.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium mt-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-800/80" />
                      <span>{dataset.institution}</span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-800/80 line-clamp-2 leading-relaxed">
                    {dataset.description}
                  </p>
                </div>

                {/* Quota Progress Meter */}
                <div className="bg-white/80 p-4 rounded-xl border border-emerald-200 space-y-2">
                  <ProgressBar used={used} max={max} label="ZK Query Quota Limit" />
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-2.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5 text-emerald-800" />}
                    onClick={() => setDetailDataset(dataset)}
                  >
                    View Details
                  </Button>

                  <div className="flex items-center gap-2">
                    {dataset.status === 'NONE' || dataset.status === 'REVOKED' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Key className="w-3.5 h-3.5" />}
                        disabled={isBusy}
                        onClick={() => requestAccess(dataset.id)}
                      >
                        Request Access
                      </Button>
                    ) : dataset.status === 'REQUESTED' ? (
                      <Button
                        variant="emerald"
                        size="sm"
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        disabled={isBusy}
                        onClick={() => grantPermission(dataset.id)}
                      >
                        Grant Permission
                      </Button>
                    ) : (
                      <Button
                        variant={isExhausted ? 'secondary' : 'primary'}
                        size="sm"
                        leftIcon={<Lock className="w-3.5 h-3.5" />}
                        disabled={isBusy || isExhausted}
                        onClick={() => submitAccessProof(dataset.id)}
                      >
                        {isExhausted ? 'Quota Exhausted' : 'Submit ZK Proof'}
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<RefreshCw className="w-3.5 h-3.5 text-emerald-800" />}
                      title="Renew access quota"
                      disabled={isBusy}
                      onClick={() => setRenewDataset(dataset)}
                    >
                      Renew
                    </Button>

                    {(dataset.status === 'GRANTED' || dataset.status === 'REQUESTED') && (
                      <Button
                        variant="danger"
                        size="sm"
                        title="Revoke access"
                        disabled={isBusy}
                        onClick={() => revokeAccess(dataset.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Register Dataset */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Clinical Dataset"
        subtitle="Zero-Knowledge registration on Midnight Preprod"
        icon={<Database className="w-5 h-5 text-emerald-800" />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRegisterSubmit}>
              Register Dataset
            </Button>
          </>
        }
      >
        {formError && (
          <div className="p-3 bg-red-950/80 border border-red-500/40 text-red-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-800 font-semibold mb-1">Dataset Title</label>
            <input
              type="text"
              value={regTitle}
              onChange={(e) => setRegTitle(e.target.value)}
              placeholder="e.g. Immunotherapy Melanoma Phase III Patient Cohort"
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white text-emerald-950 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-800 font-semibold mb-1">Domain Category</label>
              <select
                value={regCategory}
                onChange={(e) => setRegCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white text-emerald-950 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30"
              >
                <option value="Oncology & Genomics">Oncology & Genomics</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Immunology">Immunology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Ophthalmology">Ophthalmology</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-1">Initial Query Limit</label>
              <input
                type="number"
                min="1"
                max="500"
                value={regQuota}
                onChange={(e) => setRegQuota(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white text-emerald-950 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-semibold mb-1">Accredited Institution</label>
            <input
              type="text"
              value={regInstitution}
              onChange={(e) => setRegInstitution(e.target.value)}
              placeholder="e.g. Johns Hopkins Medical Research Center"
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white text-emerald-950 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30"
              required
            />
          </div>

          <div>
            <label className="block text-slate-800 font-semibold mb-1">Cohort Description</label>
            <textarea
              rows={3}
              value={regDescription}
              onChange={(e) => setRegDescription(e.target.value)}
              placeholder="Detailed description of study cohort, inclusion criteria, and research scope..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white text-emerald-950 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30"
            />
          </div>
        </form>
      </Modal>

      {/* Modal 2: Quota Renewal */}
      {renewDataset && (
        <Modal
          isOpen={!!renewDataset}
          onClose={() => setRenewDataset(null)}
          title="Extend Access Quota"
          subtitle={`Compact circuit renewAccessQuota for "${renewDataset.title}"`}
          icon={<RefreshCw className="w-5 h-5 text-emerald-800" />}
          footer={
            <>
              <Button variant="ghost" onClick={() => setRenewDataset(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleRenewSubmit}>
                Extend Quota (+{additionalQuota})
              </Button>
            </>
          }
        >
          <form onSubmit={handleRenewSubmit} className="space-y-4 text-xs">
            <p className="text-slate-700 leading-relaxed">
              Authorized hospital owners can dynamically extend query allowances for accredited investigators without redeploying the contract.
            </p>

            <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
              <div className="flex justify-between text-emerald-800/80">
                <span>Current Quota:</span>
                <span className="font-mono text-emerald-950 font-bold">{Number(renewDataset.maxAccessLimit)} Queries</span>
              </div>
              <div className="flex justify-between text-emerald-800/80">
                <span>Additional Allowance:</span>
                <span className="font-mono text-emerald-700 font-bold">+{additionalQuota} Queries</span>
              </div>
              <div className="flex justify-between text-emerald-800/80 pt-1 border-t border-emerald-200 font-semibold">
                <span>New Total Allowance:</span>
                <span className="font-mono text-emerald-300">{Number(renewDataset.maxAccessLimit) + additionalQuota} Queries</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-1">Additional Quota Limit (+)</label>
              <input
                type="number"
                min="1"
                max="200"
                value={additionalQuota}
                onChange={(e) => setAdditionalQuota(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white text-emerald-950 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30"
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 3: Dataset Details & Cryptographic Inspector */}
      {detailDataset && (
        <Modal
          isOpen={!!detailDataset}
          onClose={() => setDetailDataset(null)}
          title={detailDataset.title}
          subtitle={`Clinical Cohort — ${detailDataset.category}`}
          icon={<Database className="w-5 h-5 text-emerald-800" />}
          maxWidth="2xl"
          footer={
            <Button variant="primary" onClick={() => setDetailDataset(null)}>
              Close Inspector
            </Button>
          }
        >
          <div className="space-y-5 text-xs text-slate-700">
            <p className="leading-relaxed bg-white p-4 rounded-xl border border-emerald-200">
              {detailDataset.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-emerald-800/80 font-medium">Healthcare Institution</span>
                <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-800" />
                  <span>{detailDataset.institution}</span>
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-emerald-800/80 font-medium">Cohort Sample Size</span>
                <p className="font-bold text-emerald-950">
                  {detailDataset.sampleSize.toLocaleString()} De-identified Records
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-emerald-800/80 font-medium">Zero-Knowledge Verification</span>
                <p className="font-bold text-emerald-700">{detailDataset.zkVerificationType}</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-emerald-800/80 font-medium">On-Chain Registration Date</span>
                <p className="font-bold text-emerald-950">{detailDataset.createdAt}</p>
              </div>
            </div>

            {/* Cryptographic Ledger Disclosures */}
            <div className="border border-emerald-200 rounded-xl p-4 bg-white space-y-3.5">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-800" />
                  <span>On-Chain Cryptographic Identifiers</span>
                </h4>
                <Badge variant="INFO" size="sm" label="Disclosed Hashes" />
              </div>

              <div>
                <div className="flex items-center justify-between text-emerald-800/80 mb-1">
                  <span>Hospital Owner Public Key:</span>
                  <button
                    onClick={() => copyToClipboard(detailDataset.owner, 'owner')}
                    className="text-emerald-800 hover:text-emerald-700 flex items-center gap-1 font-medium"
                  >
                    {copiedField === 'owner' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'owner' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="font-mono text-[10px] bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200 break-all text-slate-800">
                  {detailDataset.owner}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-emerald-800/80 mb-1">
                  <span>Last Disclosed Proof Hash:</span>
                  <button
                    onClick={() => copyToClipboard(detailDataset.lastProofHash, 'proof')}
                    className="text-emerald-800 hover:text-emerald-700 flex items-center gap-1 font-medium"
                  >
                    {copiedField === 'proof' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'proof' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="font-mono text-[10px] bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200 break-all text-slate-800">
                  {detailDataset.lastProofHash}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Transaction Status Toast / Proving Drawer */}
      {tx.phase !== 'idle' && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full p-5 bg-emerald-50/50/95 backdrop-blur-xl rounded-2xl border border-teal-500/40 shadow-glowTeal space-y-3.5 animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 font-bold text-sm text-emerald-950">
              {isBusy ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-800" />
              ) : tx.phase === 'confirmed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <span>{tx.circuit ? `Circuit: ${tx.circuit}` : 'ZK Transaction Status'}</span>
            </div>

            {!isBusy && (
              <button
                onClick={resetTxProgress}
                aria-label="Close transaction status"
                className="p-1 rounded-lg text-emerald-800/80 hover:text-emerald-950 hover:bg-emerald-100/80"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">{tx.message}</p>

          {tx.txHash && (
            <div className="bg-white p-2.5 rounded-xl border border-emerald-200 text-[10px] font-mono text-slate-700 break-all space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-sans text-[11px] font-medium">Transaction Hash:</span>
                <a
                  href={`https://preprod.midnightexplorer.com/transactions/${tx.txHash.startsWith("0x") ? tx.txHash : "0x" + tx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-800 hover:underline flex items-center gap-1 font-sans text-[11px]"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <span className="text-emerald-700 block select-all">{tx.txHash}</span>
            </div>
          )}

          {tx.error && (
            <p className="text-xs text-red-300 bg-red-950/80 p-2.5 rounded-xl border border-red-500/40">
              {tx.error}
            </p>
          )}

          {!isBusy && (
            <div className="flex justify-end pt-1">
              <Button variant="secondary" size="xs" onClick={resetTxProgress}>
                Dismiss Notification
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
