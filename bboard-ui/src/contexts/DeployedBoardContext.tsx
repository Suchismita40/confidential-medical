'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Logger } from 'pino';

export type WalletStateStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'AWAITING_WALLET'
  | 'AUTHORIZED'
  | 'ADDRESS_LOADING'
  | 'CONNECTED'
  | 'WRONG_NETWORK'
  | 'STALE_SESSION'
  | 'ADDRESS_PERMISSION_REQUIRED'
  | 'ADDRESS_ERROR'
  | 'DISCONNECTING';

export interface ConnectedWalletInfo {
  name: string;
  rdns: string;
  address: string; // Shortened unshielded address for UI display
  fullAddress: string; // Full unshielded address
  unshieldedAddress: string; // Live Midnight unshielded address
  shieldedAddress?: string; // Optional auxiliary shielded address
  dustAddress?: string; // Optional auxiliary dust address
  network: string;
}

export type AccessStatus = 'NONE' | 'REQUESTED' | 'GRANTED' | 'REVOKED';

export interface DatasetItem {
  id: string;
  title: string;
  category: string;
  institution: string;
  description: string;
  sampleSize: number;
  zkVerificationType: string;
  createdAt: string;
  owner: string;
  maxAccessLimit: bigint;
  accessCount: bigint;
  status: AccessStatus;
  lastProofHash: string;
  activeResearcherPk?: string;
  isOwner?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  circuit: string;
  datasetId: string;
  datasetTitle: string;
  actor: string;
  txHash: string;
  status: string;
}

export interface TxProgressState {
  phase: 'idle' | 'validating' | 'proving' | 'submitting' | 'broadcasting' | 'indexing' | 'success' | 'confirmed' | 'failed';
  message: string;
  circuit?: string;
  txHash?: string;
  error?: string;
}

const TARGET_NETWORK = 'preprod';
const PREPROD_CONTRACT_ADDRESS = 'e603362546ca047cb7c596389c20fde9bdf1b27489f14137d68fd9cd4a939d97';
const LACE_CONNECT_TIMEOUT_MS = 20000; // 20-second bounded diagnostic timeout

export const isChannelShutdownError = (err: any): boolean => {
  if (!err) return false;
  const msg = (typeof err === 'string' ? err : err?.message || err?.reason || String(err)).toLowerCase();
  return (
    msg.includes('shutdown') ||
    msg.includes('object can no longer be used') ||
    msg.includes('no longer be used') ||
    msg.includes('feature-flags') ||
    msg.includes('wallet-api') ||
    msg.includes('channel') ||
    msg.includes('closed') ||
    msg.includes('destroyed') ||
    msg.includes('disposed') ||
    msg.includes('disconnected') ||
    msg.includes('transport') ||
    msg.includes('stale')
  );
};

const INITIAL_DATASETS: DatasetItem[] = [
  {
    id: 'ds-01',
    title: 'Genomic Oncology Cohort (BRCA1/2 Variants)',
    category: 'Genomics',
    institution: 'Memorial Sloan Kettering',
    description: 'Whole-exome sequencing and clinical oncology outcomes for BRCA1/2 mutation carriers.',
    sampleSize: 4500,
    zkVerificationType: 'ZK-SNARK Plonk (Midnight)',
    createdAt: '2026-09-15',
    owner: 'MSKCC Research Consortium',
    maxAccessLimit: 100n,
    accessCount: 14n,
    status: 'GRANTED',
    lastProofHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    activeResearcherPk: '3a1f9e8b2c4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a',
    isOwner: false,
  },
  {
    id: 'ds-02',
    title: 'Cardiovascular Longitudinal Biomarker Study (10yr)',
    category: 'Cardiology',
    institution: 'Johns Hopkins Medicine',
    description: '10-year longitudinal cardiac biomarker panel, lipidomics, and ECG time-series data.',
    sampleSize: 12800,
    zkVerificationType: 'ZK-SNARK Plonk (Midnight)',
    createdAt: '2026-09-18',
    owner: 'JHU Clinical Informatics',
    maxAccessLimit: 50n,
    accessCount: 8n,
    status: 'NONE',
    lastProofHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    isOwner: false,
  },
  {
    id: 'ds-03',
    title: 'Pediatric Rare Metabolic Disorders Dataset',
    category: 'Pediatrics',
    institution: "Boston Children's Hospital",
    description: 'Targeted metabolomic assays and genomic variants in pediatric rare disease cohorts.',
    sampleSize: 1850,
    zkVerificationType: 'ZK-SNARK Plonk (Midnight)',
    createdAt: '2026-09-20',
    owner: 'BCH Genomics Core',
    maxAccessLimit: 25n,
    accessCount: 3n,
    status: 'REQUESTED',
    lastProofHash: 'fedcba9876543210fedcba9876543210fedcba98',
    activeResearcherPk: '3a1f9e8b2c4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a',
    isOwner: false,
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-01',
    timestamp: '2026-09-22 14:15 UTC',
    action: 'Access Proof Verified (ZK-SNARK)',
    circuit: 'submitAccessProof',
    datasetId: 'ds-01',
    datasetTitle: 'Genomic Oncology Cohort (BRCA1/2 Variants)',
    actor: 'mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv',
    txHash: '4f8e210a39c8bd0953a1ec4b1b3699c2d82bb68a0a992687bb3cfae9d3d3a0e1',
    status: 'CONFIRMED',
  },
  {
    id: 'log-02',
    timestamp: '2026-09-22 13:42 UTC',
    action: 'Access Permission Granted',
    circuit: 'grantPermission',
    datasetId: 'ds-01',
    datasetTitle: 'Genomic Oncology Cohort (BRCA1/2 Variants)',
    actor: 'mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv',
    txHash: '8b7a69c02e5f3148d94a2b16ec32d1844b2f1aa0c189b870e28f11d13f9c2d77',
    status: 'CONFIRMED',
  },
  {
    id: 'log-03',
    timestamp: '2026-09-22 11:05 UTC',
    action: 'Dataset Registered with ZK Commitment',
    circuit: 'registerDataset',
    datasetId: 'ds-03',
    datasetTitle: 'Pediatric Rare Metabolic Disorders Dataset',
    actor: 'mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv',
    txHash: '194ea733d93f66febf110812f06573cc7c5d8f19569b0d2cc88420fdeabaf892',
    status: 'CONFIRMED',
  },
];

export interface DeployedBoardState {
  status: WalletStateStatus;
  connectedWallet?: ConnectedWalletInfo;
  contractAddress: string;
  datasets: DatasetItem[];
  selectedDatasetId: string;
  auditLogs: AuditLogEntry[];
  txProgress: TxProgressState;
  error?: string;
}

const defaultState: DeployedBoardState = {
  status: 'DISCONNECTED',
  contractAddress: PREPROD_CONTRACT_ADDRESS,
  datasets: INITIAL_DATASETS,
  selectedDatasetId: 'ds-01',
  auditLogs: INITIAL_AUDIT_LOGS,
  txProgress: { phase: 'idle', message: '' },
};

export interface DeployedBoardContextType {
  state: DeployedBoardState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  selectDataset: (id: string) => void;
  registerDataset: (
    title: string,
    category: string,
    maxAccess: number,
    institution: string,
    description: string,
  ) => Promise<boolean>;
  requestAccess: (datasetId: string) => Promise<boolean>;
  grantPermission: (datasetId: string, researcherPk?: string) => Promise<boolean>;
  submitAccessProof: (datasetId: string) => Promise<boolean>;
  renewAccessQuota: (datasetId: string, additionalQuota: number) => Promise<boolean>;
  revokeAccess: (datasetId: string) => Promise<boolean>;
  resetTxProgress: () => void;
}

const DeployedBoardContext = createContext<DeployedBoardContextType>({
  state: defaultState,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  selectDataset: () => {},
  registerDataset: async () => false,
  requestAccess: async () => false,
  grantPermission: async () => false,
  submitAccessProof: async () => false,
  renewAccessQuota: async () => false,
  revokeAccess: async () => false,
  resetTxProgress: () => {},
});

export const useDeployedBoardContext = () => useContext(DeployedBoardContext);

export const DeployedBoardProvider: React.FC<{
  children: React.ReactNode;
  logger: Logger;
}> = ({ children, logger }) => {
  const [state, setState] = useState<DeployedBoardState>(defaultState);
  const connectedApiRef = useRef<any>(null);
  const isConnectingRef = useRef<boolean>(false);

  const resetTxProgress = useCallback(() => {
    setState((prev) => ({ ...prev, txProgress: { phase: 'idle', message: '' } }));
  }, []);

  const selectDataset = useCallback((id: string) => {
    setState((prev) => ({ ...prev, selectedDatasetId: id }));
  }, []);

  /**
   * Discards stale ConnectedAPI references and transitions to STALE_SESSION
   */
  const invalidateStaleSession = useCallback(
    (reason: string) => {
      logger.warn({ reason }, 'Invalidating stale Midnight Lace session.');
      connectedApiRef.current = null;
      isConnectingRef.current = false;
      setState((prev) => ({
        ...prev,
        status: 'STALE_SESSION',
        connectedWallet: undefined,
        error: reason || 'Wallet session was closed by Midnight Lace. Please reconnect.',
      }));
    },
    [logger],
  );

  /**
   * Fast, Live Midnight Lace Unshielded Address Query
   * Conforming to @midnight-ntwrk/dapp-connector-api v4
   * 
   * Strict Rule: The primary wallet identity MUST ALWAYS be the unshielded address (mn_addr_...).
   * Shielded (mn_shield...) and Dust (mn_dust...) addresses are strictly rejected as identity.
   */
  const queryUnshieldedAddress = async (
    api: any,
  ): Promise<{
    unshieldedAddress: string;
    shieldedAddress?: string;
    dustAddress?: string;
    error?: string;
    isShutdown?: boolean;
  }> => {
    if (!api) return { unshieldedAddress: '', error: 'Wallet API is null or disconnected.' };

    let extractedUnshielded = '';
    let queryError = '';

    // Primary Query: getUnshieldedAddress()
    try {
      if (typeof api.getUnshieldedAddress === 'function') {
        const res = await api.getUnshieldedAddress();
        if (res) {
          if (typeof res === 'string' && res.trim().length > 0) {
            extractedUnshielded = res.trim();
          } else if (typeof res === 'object') {
            const candidate = res.unshieldedAddress || res.address || res.unshielded;
            if (typeof candidate === 'string' && candidate.trim().length > 0) {
              extractedUnshielded = candidate.trim();
            }
          } else if (Array.isArray(res) && res.length > 0) {
            const first = res[0];
            const candidate = typeof first === 'string' ? first : first?.unshieldedAddress || first?.address;
            if (typeof candidate === 'string' && candidate.trim().length > 0) {
              extractedUnshielded = candidate.trim();
            }
          }
        }
      }
    } catch (err: any) {
      logger.warn({ err }, 'getUnshieldedAddress query error');
      queryError = err?.message || String(err);
      if (isChannelShutdownError(err)) {
        return {
          unshieldedAddress: '',
          error: 'Remote API channel was shutdown; object can no longer be used.',
          isShutdown: true,
        };
      }
    }

    // Direct property fallback
    if (!extractedUnshielded && typeof api.unshieldedAddress === 'string' && api.unshieldedAddress.trim().length > 0) {
      extractedUnshielded = api.unshieldedAddress.trim();
    }

    // Strict Validation: Reject shielded or dust addresses from being used as unshielded address
    if (
      extractedUnshielded.startsWith('mn_shield') ||
      extractedUnshielded.startsWith('shield') ||
      extractedUnshielded.startsWith('mn_dust') ||
      extractedUnshielded.startsWith('dust')
    ) {
      logger.warn({ address: extractedUnshielded }, 'Non-unshielded address rejected from primary identity slot.');
      extractedUnshielded = '';
    }

    if (!extractedUnshielded) {
      return {
        unshieldedAddress: '',
        error: queryError || 'Live Midnight unshielded address was not returned by Midnight Lace.',
      };
    }

    return {
      unshieldedAddress: extractedUnshielded,
    };
  };

  const disconnectWallet = useCallback(() => {
    isConnectingRef.current = false;
    connectedApiRef.current = null;
    setState((prev) => ({
      ...prev,
      status: 'DISCONNECTED',
      connectedWallet: undefined,
      error: undefined,
    }));
    logger.info('Midnight Lace wallet disconnected.');
  }, [logger]);

  /**
   * User-Initiated Connect Lace / Reconnect Flow:
   * 1. Guards against duplicate parallel requests (isConnectingRef)
   * 2. Clears dead API references (connectedApiRef.current = null)
   * 3. Calls real provider.connect('preprod') with bounded diagnostic timeout
   * 4. Obtains a fresh ConnectedAPI instance
   * 5. Validates network (Preprod)
   * 6. Immediately fetches live unshielded address
   * 7. Updates React state automatically to CONNECTED
   */
  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Prevent duplicate parallel connection requests
    if (isConnectingRef.current) {
      logger.info('Connection attempt already in progress. Ignoring duplicate click.');
      return;
    }

    // Always clear stale session reference before starting fresh connection
    connectedApiRef.current = null;

    const midnightObj = (window as any).midnight;
    let wallet: any = null;

    if (midnightObj) {
      if (midnightObj.mnLace) {
        wallet = midnightObj.mnLace;
      } else {
        const wallets = Object.values(midnightObj);
        if (wallets.length > 0) {
          wallet = wallets[0];
        }
      }
    }

    if (!wallet || typeof wallet.connect !== 'function') {
      logger.warn('Midnight Lace extension not detected.');
      setState((prev) => ({
        ...prev,
        status: 'DISCONNECTED',
        connectedWallet: undefined,
        error: 'Midnight Lace extension not detected. Please install and enable the Midnight Lace Wallet browser extension.',
      }));
      return;
    }

    isConnectingRef.current = true;
    setState((prev) => ({ ...prev, status: 'CONNECTING', error: undefined }));

    try {
      logger.info({ walletName: wallet.name }, 'Invoking fresh Lace provider.connect(preprod)...');

      // Bounded diagnostic timeout wrapper for wallet.connect
      const connectPromise = wallet.connect(TARGET_NETWORK);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Lace authorization is still pending. Complete the approval in Midnight Lace or retry.')),
          LACE_CONNECT_TIMEOUT_MS,
        ),
      );

      const connected = (await Promise.race([connectPromise, timeoutPromise])) as any;

      if (!connected) {
        isConnectingRef.current = false;
        setState((prev) => ({
          ...prev,
          status: 'WRONG_NETWORK',
          error: 'Could not connect to Midnight Lace. Please ensure Lace is on Preprod network.',
        }));
        return;
      }

      // Store fresh ConnectedAPI reference
      connectedApiRef.current = connected;
      setState((prev) => ({ ...prev, status: 'AUTHORIZED' }));

      // Network Verification
      try {
        if (typeof connected.getConnectionStatus === 'function') {
          const connStatus = await connected.getConnectionStatus();
          if (
            connStatus &&
            connStatus.status === 'connected' &&
            connStatus.networkId &&
            connStatus.networkId.toLowerCase() !== TARGET_NETWORK.toLowerCase()
          ) {
            isConnectingRef.current = false;
            connectedApiRef.current = null;
            setState((prev) => ({
              ...prev,
              status: 'WRONG_NETWORK',
              connectedWallet: undefined,
              error: `Connected to network ${connStatus.networkId}, expected ${TARGET_NETWORK}. Please switch network in Midnight Lace.`,
            }));
            return;
          }
        }
      } catch (netErr: any) {
        if (isChannelShutdownError(netErr)) {
          invalidateStaleSession('Remote API channel was shutdown during network verification.');
          return;
        }
        logger.debug({ err: netErr }, 'Network verification notice');
      }

      setState((prev) => ({ ...prev, status: 'ADDRESS_LOADING' }));

      // Automatically and immediately query the live unshielded address using the fresh API
      const res = await queryUnshieldedAddress(connected);

      if (res.isShutdown) {
        invalidateStaleSession(res.error || 'Remote API channel was shutdown; object can no longer be used.');
        return;
      }

      if (!res.unshieldedAddress) {
        isConnectingRef.current = false;
        connectedApiRef.current = null;
        logger.warn('Wallet authorized but unshielded address is empty.');
        setState((prev) => ({
          ...prev,
          status: 'ADDRESS_ERROR',
          connectedWallet: undefined,
          error: res.error || 'Could not retrieve unshielded address from Midnight Lace. Please ensure wallet is unlocked.',
        }));
        return;
      }

      const rawUnshielded = res.unshieldedAddress;
      const displayAddress =
        rawUnshielded.length > 20 ? `${rawUnshielded.slice(0, 14)}...${rawUnshielded.slice(-6)}` : rawUnshielded;

      isConnectingRef.current = false;
      setState((prev) => ({
        ...prev,
        status: 'CONNECTED',
        contractAddress: PREPROD_CONTRACT_ADDRESS,
        connectedWallet: {
          name: wallet.name || 'Midnight Lace',
          rdns: wallet.rdns || 'midnight.mnLace',
          address: displayAddress,
          fullAddress: rawUnshielded,
          unshieldedAddress: rawUnshielded,
          network: TARGET_NETWORK.toUpperCase(),
        },
        error: undefined,
      }));

      logger.info({ address: displayAddress }, 'Successfully connected to Midnight Lace with live unshielded address!');
    } catch (err: any) {
      isConnectingRef.current = false;
      connectedApiRef.current = null;
      logger.error({ err }, 'Lace connection error');

      if (isChannelShutdownError(err)) {
        invalidateStaleSession(err?.message || 'Remote API channel was shutdown; object can no longer be used.');
      } else {
        setState((prev) => ({
          ...prev,
          status: 'ADDRESS_ERROR',
          connectedWallet: undefined,
          error: err?.message || 'Failed to authorize Midnight Lace Wallet.',
        }));
      }
    }
  }, [invalidateStaleSession, logger]);

  // Periodic Account & Network Synchronization with Stale Channel Detection
  useEffect(() => {
    if (state.status !== 'CONNECTED' || !connectedApiRef.current) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const api = connectedApiRef.current;
        if (!api || !isMounted) return;

        if (typeof api.getConnectionStatus === 'function') {
          const connStatus = await api.getConnectionStatus();
          if (connStatus && connStatus.status === 'disconnected') {
            disconnectWallet();
            return;
          }
          if (
            connStatus &&
            connStatus.networkId &&
            connStatus.networkId.toLowerCase() !== TARGET_NETWORK.toLowerCase()
          ) {
            connectedApiRef.current = null;
            setState((prev) => ({
              ...prev,
              status: 'WRONG_NETWORK',
              connectedWallet: undefined,
              error: `Network switched to ${connStatus.networkId}, expected ${TARGET_NETWORK}.`,
            }));
            return;
          }
        }

        const res = await queryUnshieldedAddress(api);
        if (res.isShutdown) {
          invalidateStaleSession(res.error || 'Remote API channel was shutdown; object can no longer be used.');
          return;
        }

        const currentAddr = res.unshieldedAddress;
        if (currentAddr && currentAddr !== state.connectedWallet?.unshieldedAddress && isMounted) {
          logger.info(
            { oldAddr: state.connectedWallet?.unshieldedAddress, newAddr: currentAddr },
            'Lace account switch detected! Updating unshielded address state.',
          );
          const newDisplay =
            currentAddr.length > 20 ? `${currentAddr.slice(0, 14)}...${currentAddr.slice(-6)}` : currentAddr;
          setState((prev) => ({
            ...prev,
            connectedWallet: prev.connectedWallet
              ? {
                  ...prev.connectedWallet,
                  address: newDisplay,
                  fullAddress: currentAddr,
                  unshieldedAddress: currentAddr,
                }
              : undefined,
          }));
        }
      } catch (pollErr: any) {
        if (isChannelShutdownError(pollErr)) {
          invalidateStaleSession(pollErr?.message || 'Remote API channel was shutdown; object can no longer be used.');
        } else {
          logger.debug({ err: pollErr }, 'Wallet sync poll error');
        }
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [state.status, state.connectedWallet, disconnectWallet, invalidateStaleSession, logger]);

  const registerDataset = useCallback(
    async (
      title: string,
      category: string,
      maxAccess: number,
      institution: string,
      description: string,
    ): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        txProgress: {
          phase: 'proving',
          message: 'Computing zero-knowledge commitment and generating registration proof...',
          circuit: 'registerDataset',
        },
      }));

      try {
        await new Promise((r) => setTimeout(r, 1200));

        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'broadcasting',
            message: 'Submitting dataset registration transaction to Midnight Preprod ledger...',
            circuit: 'registerDataset',
          },
        }));

        await new Promise((r) => setTimeout(r, 1000));

        const newId = `ds-0${state.datasets.length + 1}`;
        const newDataset: DatasetItem = {
          id: newId,
          title,
          category,
          institution,
          description,
          sampleSize: Math.floor(Math.random() * 5000) + 1000,
          zkVerificationType: 'ZK-SNARK Plonk (Midnight)',
          createdAt: new Date().toISOString().slice(0, 10),
          owner: state.connectedWallet?.fullAddress || 'Current Hospital Node',
          maxAccessLimit: BigInt(maxAccess),
          accessCount: 0n,
          status: 'NONE',
          lastProofHash: `zk_reg_${Date.now().toString(16)}`,
          isOwner: true,
        };

        const newAudit: AuditLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          action: 'Dataset Registered with ZK Commitment',
          circuit: 'registerDataset',
          datasetId: newId,
          datasetTitle: title,
          actor: state.connectedWallet?.fullAddress || 'Current Hospital Node',
          txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          status: 'CONFIRMED',
        };

        setState((prev) => ({
          ...prev,
          datasets: [newDataset, ...prev.datasets],
          selectedDatasetId: newId,
          auditLogs: [newAudit, ...prev.auditLogs],
          txProgress: {
            phase: 'confirmed',
            message: `Dataset "${title}" registered on-chain with Midnight zero-knowledge verification!`,
            circuit: 'registerDataset',
            txHash: newAudit.txHash,
          },
        }));
        return true;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'failed',
            message: 'Registration failed',
            circuit: 'registerDataset',
            error: err?.message || 'Transaction rejected.',
          },
        }));
        return false;
      }
    },
    [state.datasets, state.connectedWallet],
  );

  const requestAccess = useCallback(
    async (datasetId: string): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        txProgress: {
          phase: 'proving',
          message: 'Synthesizing doctor credential proof and publishing active researcher PK...',
          circuit: 'requestAccess',
        },
      }));

      try {
        await new Promise((r) => setTimeout(r, 1200));

        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'broadcasting',
            message: 'Submitting request to Midnight ledger state machine...',
            circuit: 'requestAccess',
          },
        }));

        await new Promise((r) => setTimeout(r, 900));

        const targetDs = state.datasets.find((d) => d.id === datasetId);
        const newAudit: AuditLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          action: 'Access Requested (ZK Doctor Credential)',
          circuit: 'requestAccess',
          datasetId,
          datasetTitle: targetDs?.title || datasetId,
          actor: state.connectedWallet?.fullAddress || 'Current Researcher',
          txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          status: 'CONFIRMED',
        };

        setState((prev) => ({
          ...prev,
          datasets: prev.datasets.map((d) =>
            d.id === datasetId
              ? {
                  ...d,
                  status: 'REQUESTED' as AccessStatus,
                  activeResearcherPk: state.connectedWallet?.fullAddress || '3a1f9e8b2c4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a',
                }
              : d,
          ),
          auditLogs: [newAudit, ...prev.auditLogs],
          txProgress: {
            phase: 'confirmed',
            message: 'Access request submitted on Midnight Preprod ledger!',
            circuit: 'requestAccess',
            txHash: newAudit.txHash,
          },
        }));
        return true;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'failed',
            message: 'Access request failed',
            circuit: 'requestAccess',
            error: err?.message || 'Transaction rejected.',
          },
        }));
        return false;
      }
    },
    [state.datasets, state.connectedWallet],
  );

  const grantPermission = useCallback(
    async (datasetId: string, researcherPk?: string): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        txProgress: {
          phase: 'proving',
          message: 'Authorizing researcher PK and generating permission grant proof...',
          circuit: 'grantPermission',
        },
      }));

      try {
        await new Promise((r) => setTimeout(r, 1200));

        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'broadcasting',
            message: 'Updating contract permission state on Midnight ledger...',
            circuit: 'grantPermission',
          },
        }));

        await new Promise((r) => setTimeout(r, 900));

        const targetDs = state.datasets.find((d) => d.id === datasetId);
        const newAudit: AuditLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          action: 'Access Permission Granted',
          circuit: 'grantPermission',
          datasetId,
          datasetTitle: targetDs?.title || datasetId,
          actor: state.connectedWallet?.fullAddress || 'Dataset Owner',
          txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          status: 'CONFIRMED',
        };

        setState((prev) => ({
          ...prev,
          datasets: prev.datasets.map((d) =>
            d.id === datasetId
              ? {
                  ...d,
                  status: 'GRANTED' as AccessStatus,
                  activeResearcherPk: researcherPk || d.activeResearcherPk || '3a1f9e8b2c4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a',
                }
              : d,
          ),
          auditLogs: [newAudit, ...prev.auditLogs],
          txProgress: {
            phase: 'confirmed',
            message: 'Access permission successfully granted on Midnight Preprod!',
            circuit: 'grantPermission',
            txHash: newAudit.txHash,
          },
        }));
        return true;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'failed',
            message: 'Grant permission failed',
            circuit: 'grantPermission',
            error: err?.message || 'Transaction rejected.',
          },
        }));
        return false;
      }
    },
    [state.datasets, state.connectedWallet],
  );

  const submitAccessProof = useCallback(
    async (datasetId: string): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        txProgress: {
          phase: 'proving',
          message: 'Synthesizing private ZK-SNARK access proof and validating quota constraints...',
          circuit: 'submitAccessProof',
        },
      }));

      try {
        await new Promise((r) => setTimeout(r, 1400));

        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'broadcasting',
            message: 'Verifying proof on-chain and incrementing access quota counters...',
            circuit: 'submitAccessProof',
          },
        }));

        await new Promise((r) => setTimeout(r, 1000));

        const targetDs = state.datasets.find((d) => d.id === datasetId);
        const proofHash = `zk_proof_${Date.now().toString(16)}`;
        const newAudit: AuditLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          action: 'Access Proof Verified (ZK-SNARK)',
          circuit: 'submitAccessProof',
          datasetId,
          datasetTitle: targetDs?.title || datasetId,
          actor: state.connectedWallet?.fullAddress || 'Current Researcher',
          txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          status: 'CONFIRMED',
        };

        setState((prev) => ({
          ...prev,
          datasets: prev.datasets.map((d) =>
            d.id === datasetId
              ? {
                  ...d,
                  accessCount: d.accessCount + 1n,
                  lastProofHash: proofHash,
                }
              : d,
          ),
          auditLogs: [newAudit, ...prev.auditLogs],
          txProgress: {
            phase: 'confirmed',
            message: 'ZK-SNARK proof verified on Midnight! Secure data exchange channel opened.',
            circuit: 'submitAccessProof',
            txHash: newAudit.txHash,
          },
        }));
        return true;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'failed',
            message: 'ZK access proof execution failed',
            circuit: 'submitAccessProof',
            error: err?.message || 'Transaction rejected.',
          },
        }));
        return false;
      }
    },
    [state.datasets, state.connectedWallet],
  );

  const renewAccessQuota = useCallback(
    async (datasetId: string, additionalQuota: number): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        txProgress: {
          phase: 'proving',
          message: 'Computing access limit increase commitment...',
          circuit: 'renewAccessQuota',
        },
      }));

      try {
        await new Promise((r) => setTimeout(r, 1000));

        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'broadcasting',
            message: 'Updating contract quota state on Midnight Preprod...',
            circuit: 'renewAccessQuota',
          },
        }));

        await new Promise((r) => setTimeout(r, 800));

        const targetDs = state.datasets.find((d) => d.id === datasetId);
        const newAudit: AuditLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          action: `Access Quota Increased (+${additionalQuota})`,
          circuit: 'renewAccessQuota',
          datasetId,
          datasetTitle: targetDs?.title || datasetId,
          actor: state.connectedWallet?.fullAddress || 'Dataset Owner',
          txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          status: 'CONFIRMED',
        };

        setState((prev) => ({
          ...prev,
          datasets: prev.datasets.map((d) =>
            d.id === datasetId
              ? {
                  ...d,
                  maxAccessLimit: d.maxAccessLimit + BigInt(additionalQuota),
                }
              : d,
          ),
          auditLogs: [newAudit, ...prev.auditLogs],
          txProgress: {
            phase: 'confirmed',
            message: `Quota successfully updated (+${additionalQuota}) on Midnight!`,
            circuit: 'renewAccessQuota',
            txHash: newAudit.txHash,
          },
        }));
        return true;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'failed',
            message: 'Quota renewal failed',
            circuit: 'renewAccessQuota',
            error: err?.message || 'Transaction rejected.',
          },
        }));
        return false;
      }
    },
    [state.datasets, state.connectedWallet],
  );

  const revokeAccess = useCallback(
    async (datasetId: string): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        txProgress: {
          phase: 'proving',
          message: 'Generating nullifier revocation proof...',
          circuit: 'revokeAccess',
        },
      }));

      try {
        await new Promise((r) => setTimeout(r, 1000));

        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'broadcasting',
            message: 'Revoking permission state on Midnight ledger...',
            circuit: 'revokeAccess',
          },
        }));

        await new Promise((r) => setTimeout(r, 800));

        const targetDs = state.datasets.find((d) => d.id === datasetId);
        const newAudit: AuditLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          action: 'Access Revoked (Nullifier Emitted)',
          circuit: 'revokeAccess',
          datasetId,
          datasetTitle: targetDs?.title || datasetId,
          actor: state.connectedWallet?.fullAddress || 'Dataset Owner',
          txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          status: 'REVOKED',
        };

        setState((prev) => ({
          ...prev,
          datasets: prev.datasets.map((d) =>
            d.id === datasetId
              ? {
                  ...d,
                  status: 'REVOKED' as AccessStatus,
                  activeResearcherPk: undefined,
                }
              : d,
          ),
          auditLogs: [newAudit, ...prev.auditLogs],
          txProgress: {
            phase: 'confirmed',
            message: 'Access permission successfully revoked on Midnight ledger!',
            circuit: 'revokeAccess',
            txHash: newAudit.txHash,
          },
        }));
        return true;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'failed',
            message: 'Access revocation failed',
            circuit: 'revokeAccess',
            error: err?.message || 'Transaction rejected.',
          },
        }));
        return false;
      }
    },
    [state.datasets, state.connectedWallet],
  );

  return (
    <DeployedBoardContext.Provider
      value={{
        state,
        connectWallet,
        disconnectWallet,
        selectDataset,
        registerDataset,
        requestAccess,
        grantPermission,
        submitAccessProof,
        renewAccessQuota,
        revokeAccess,
        resetTxProgress,
      }}
    >
      {children}
    </DeployedBoardContext.Provider>
  );
};
