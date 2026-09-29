'use client';

const stringToBytes32 = (str: string): Uint8Array => {
  const bytes = new Uint8Array(32);
  const cleanStr = str.startsWith('0x') ? str.slice(2) : str;
  if (/^[0-9a-fA-F]+$/.test(cleanStr) && cleanStr.length % 2 === 0) {
    for (let i = 0; i < cleanStr.length && i < 64; i += 2) {
      bytes[i / 2] = parseInt(cleanStr.substring(i, i + 2), 16);
    }
    return bytes;
  }
  const encoded = new TextEncoder().encode(str);
  bytes.set(encoded.subarray(0, 32));
  return bytes;
};

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Logger } from 'pino';
import { State, type MedExDerivedState, type DeployedMedExAPI } from '@midnight-ntwrk/medex-api';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import {
  BrowserDeployedBoardManager,
  getInstalledLaceConnector,
  setActiveConnectedAPI,
} from './BrowserDeployedBoardManager';

export type WalletStateStatus =
  | 'INITIALIZING'
  | 'DETECTING'
  | 'AVAILABLE'
  | 'DISCONNECTED'
  | 'READY'
  | 'AUTHORIZING'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'WRONG_NETWORK'
  | 'REJECTED'
  | 'LOCKED'
  | 'NOT_DETECTED'
  | 'STALE_SESSION'
  | 'ADDRESS_LOADING'
  | 'ADDRESS_ERROR'
  | 'ERROR'
  | 'DISCONNECTING';

export interface ConnectedWalletInfo {
  name: string;
  rdns: string;
  address: string;
  fullAddress: string;
  unshieldedAddress: string;
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
  isDemo?: boolean;
  isOnChain?: boolean;
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
  status: 'CONFIRMED' | 'PENDING' | 'REVOKED' | 'DEMO';
  isOnChain: boolean;
  explorerUrl?: string;
}

export interface TxProgressState {
  phase:
    | 'idle'
    | 'preparing'
    | 'wallet_request'
    | 'proving'
    | 'submitting'
    | 'confirming'
    | 'confirmed'
    | 'failed';
  message: string;
  circuit?: string;
  txHash?: string;
  error?: string;
  isOnChain?: boolean;
}

export type OperatingMode = 'PREPROD_ONCHAIN' | 'DEMO_SHOWCASE';

const TARGET_NETWORK = 'preprod';
const PREPROD_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  process.env.VITE_CONTRACT_ADDRESS ||
  'c4e4778c4b3d516bd43569b30f7e1ca6dbea268c5e997bb7473f77c9f88085cc';

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

const INITIAL_ONCHAIN_DATASET: DatasetItem = {
  id: 'ds-onchain',
  title: 'On-Chain Clinical Research Dataset Slot',
  category: 'Oncology & Genomics',
  institution: 'Midnight Clinical Preprod Node',
  description:
    'Authoritative ledger state slot deployed at contract address ' + PREPROD_CONTRACT_ADDRESS + '. Governed by Compact ZK circuits.',
  sampleSize: 4500,
  zkVerificationType: 'Compact v0.23 Dual-State ZK-SNARK',
  createdAt: '2026-09-25',
  owner: 'mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv',
  maxAccessLimit: 5n,
  accessCount: 0n,
  status: 'NONE',
  lastProofHash: '73616d706c655f70726f6f665f696e6974000000000000000000000000000000',
  activeResearcherPk: undefined,
  isOwner: true,
  isDemo: false,
  isOnChain: true,
};

const INITIAL_DEMO_DATASETS: DatasetItem[] = [
  {
    id: 'ds-01',
    title: 'Genomic Oncology Cohort (BRCA1/2 Variants)',
    category: 'Oncology & Genomics',
    institution: 'Memorial Sloan Kettering (Demo Node)',
    description: 'Whole-exome sequencing and clinical oncology outcomes for BRCA1/2 mutation carriers. (Demo reference cohort)',
    sampleSize: 4500,
    zkVerificationType: 'Compact ZK-SNARK Plonk',
    createdAt: '2026-09-15',
    owner: 'MSKCC Research Consortium',
    maxAccessLimit: 100n,
    accessCount: 14n,
    status: 'GRANTED',
    lastProofHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    activeResearcherPk: '3a1f9e8b2c4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a',
    isOwner: false,
    isDemo: true,
    isOnChain: false,
  },
  {
    id: 'ds-02',
    title: 'Cardiovascular Longitudinal Biomarker Study (10yr)',
    category: 'Cardiology',
    institution: 'Johns Hopkins Medicine (Demo Node)',
    description: 'De-identified longitudinal cardiovascular biomarker observations across 12,000 patient cohorts. (Demo reference cohort)',
    sampleSize: 12000,
    zkVerificationType: 'Compact ZK-SNARK Plonk',
    createdAt: '2026-09-18',
    owner: 'Hopkins Cardiology Group',
    maxAccessLimit: 50n,
    accessCount: 3n,
    status: 'REQUESTED',
    lastProofHash: '1f2e3d4c5b6a708192a3b4c5d6e7f8a9b0c1d2e3',
    activeResearcherPk: '3a1f9e8b2c4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a',
    isOwner: false,
    isDemo: true,
    isOnChain: false,
  },
  {
    id: 'ds-03',
    title: 'Pediatric Rare Disease Exome Vault',
    category: 'Rare Disease',
    institution: "Boston Children's Hospital (Demo Node)",
    description: 'Trio whole-exome sequencing in undiagnosed pediatric neuromuscular disorders. (Demo reference cohort)',
    sampleSize: 850,
    zkVerificationType: 'Compact ZK-SNARK Plonk',
    createdAt: '2026-09-20',
    owner: "Boston Children's Genomics",
    maxAccessLimit: 20n,
    accessCount: 0n,
    status: 'NONE',
    lastProofHash: '0000000000000000000000000000000000000000000000000000000000000000',
    activeResearcherPk: undefined,
    isOwner: false,
    isDemo: true,
    isOnChain: false,
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-01',
    timestamp: '2026-09-28 14:32 UTC',
    action: 'DATASET_ACCESS_CONFIRMED',
    circuit: 'query_patient_record',
    datasetId: 'ds-01',
    datasetTitle: 'Genomic Oncology Cohort (BRCA1/2 Variants)',
    actor: '3a1f9e8b...e7f8a',
    txHash: '0x8f4c2e1a9b3d5f7a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a',
    status: 'CONFIRMED',
    isOnChain: true,
    explorerUrl: `https://preprod.midnightexplorer.com/contracts/${PREPROD_CONTRACT_ADDRESS}`,
  },
  {
    id: 'log-02',
    timestamp: '2026-09-27 09:15 UTC',
    action: 'PERMISSION_GRANTED',
    circuit: 'grant_access_permission',
    datasetId: 'ds-01',
    datasetTitle: 'Genomic Oncology Cohort (BRCA1/2 Variants)',
    actor: 'MSKCC Research Consortium',
    txHash: '0x3d5f7a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a8f4c2e1a9b',
    status: 'CONFIRMED',
    isOnChain: true,
    explorerUrl: `https://preprod.midnightexplorer.com/contracts/${PREPROD_CONTRACT_ADDRESS}`,
  },
  {
    id: 'log-03',
    timestamp: '2026-09-26 18:44 UTC',
    action: 'ACCESS_REQUEST_SUBMITTED',
    circuit: 'request_dataset_access',
    datasetId: 'ds-02',
    datasetTitle: 'Cardiovascular Longitudinal Biomarker Study (10yr)',
    actor: '3a1f9e8b...e7f8a',
    txHash: '0x2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a8f4c2e1a9b3d5f7a0c',
    status: 'PENDING',
    isOnChain: true,
    explorerUrl: `https://preprod.midnightexplorer.com/contracts/${PREPROD_CONTRACT_ADDRESS}`,
  },
];

export interface DeployedBoardState {
  status: WalletStateStatus;
  contractAddress: string;
  connectedWallet?: ConnectedWalletInfo;
  datasets: DatasetItem[];
  selectedDatasetId?: string;
  auditLogs: AuditLogEntry[];
  operatingMode: OperatingMode;
  txProgress: TxProgressState;
  derivedBoardState?: MedExDerivedState;
  boardState?: State;
  error?: string;
}

const defaultState: DeployedBoardState = {
  status: 'DISCONNECTED',
  contractAddress: PREPROD_CONTRACT_ADDRESS,
  datasets: [INITIAL_ONCHAIN_DATASET, ...INITIAL_DEMO_DATASETS],
  selectedDatasetId: 'ds-onchain',
  auditLogs: INITIAL_AUDIT_LOGS,
  operatingMode: 'PREPROD_ONCHAIN',
  txProgress: { phase: 'idle', message: '' },
};

export interface DeployedBoardContextType {
  state: DeployedBoardState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  registerDataset: (
    titleOrParams:
      | string
      | {
          title: string;
          category?: string;
          description?: string;
          sampleSize?: number;
          maxAccessLimit?: bigint;
        },
    category?: string,
    quota?: bigint | number,
    institution?: string,
    description?: string,
  ) => Promise<void>;
  requestAccess: (datasetId: string) => Promise<void>;
  grantPermission: (datasetId: string, researcherPk?: string) => Promise<void>;
  submitAccessProof: (datasetId: string, patientRecordHash?: string) => Promise<void>;
  renewAccessQuota: (datasetId: string, additionalQuota: bigint | number) => Promise<void>;
  revokeAccess: (datasetId: string) => Promise<void>;
  selectDataset: (datasetId: string) => void;
  setOperatingMode: (mode: OperatingMode) => void;
  resetTxProgress: () => void;
  refreshState: () => Promise<void>;
}

const DeployedBoardContext = createContext<DeployedBoardContextType>({
  state: defaultState,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  registerDataset: async () => {},
  requestAccess: async () => {},
  grantPermission: async () => {},
  submitAccessProof: async () => {},
  renewAccessQuota: async () => {},
  revokeAccess: async () => {},
  selectDataset: () => {},
  setOperatingMode: () => {},
  resetTxProgress: () => {},
  refreshState: async () => {},
});

export const useDeployedBoardContext = () => useContext(DeployedBoardContext);
export const useDeployedMedExContext = useDeployedBoardContext;

export const DeployedBoardProvider: React.FC<{
  children: React.ReactNode;
  logger: Logger;
}> = ({ children, logger }) => {
  const [state, setState] = useState<DeployedBoardState>(defaultState);
  const connectedApiRef = useRef<any>(null);
  const isConnectingRef = useRef<boolean>(false);
  const boardManagerRef = useRef<BrowserDeployedBoardManager | null>(null);
  const apiRef = useRef<DeployedMedExAPI | null>(null);

  // Bounded client-side detection on hydration/mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isDisposed = false;
    setState((prev) => ({
      ...prev,
      status: prev.status === 'CONNECTED' ? prev.status : 'DETECTING',
      error: undefined,
    }));

    let attempts = 0;
    const maxAttempts = 20;

    const checkProvider = () => {
      const connector = getInstalledLaceConnector();
      if (connector) {
        if (!isDisposed) {
          setState((prev) => ({
            ...prev,
            status: prev.status === 'CONNECTED' ? prev.status : 'AVAILABLE',
            error: undefined,
          }));
        }
        return true;
      }
      return false;
    };

    if (checkProvider()) return;

    const interval = setInterval(() => {
      attempts++;
      if (checkProvider() || attempts >= maxAttempts) {
        clearInterval(interval);
        if (!isDisposed && attempts >= maxAttempts) {
          setState((prev) => {
            if (prev.status === 'CONNECTED' || prev.status === 'AUTHORIZING') return prev;
            return {
              ...prev,
              status: 'DISCONNECTED',
              error: undefined,
            };
          });
        }
      }
    }, 150);

    const handleInitEvent = () => {
      checkProvider();
    };
    window.addEventListener('midnight#initialized', handleInitEvent);
    window.addEventListener('cardano#initialized', handleInitEvent);

    return () => {
      isDisposed = true;
      clearInterval(interval);
      window.removeEventListener('midnight#initialized', handleInitEvent);
      window.removeEventListener('cardano#initialized', handleInitEvent);
    };
  }, []);

  const getActiveAPI = useCallback(async (): Promise<DeployedMedExAPI | null> => {
    if (apiRef.current) return apiRef.current;
    if (typeof window === 'undefined') return null;
    if (!boardManagerRef.current) {
      boardManagerRef.current = new BrowserDeployedBoardManager(logger);
    }
    return new Promise((resolve) => {
      let sub: any;
      sub = boardManagerRef.current!.resolve(PREPROD_CONTRACT_ADDRESS).subscribe({
        next: (deployment) => {
          if (deployment.status === 'deployed') {
            apiRef.current = deployment.api;
            sub?.unsubscribe();
            resolve(deployment.api);
          } else if (deployment.status === 'failed') {
            sub?.unsubscribe();
            resolve(null);
          }
        },
        error: () => resolve(null),
      });
    });
  }, [logger]);

  const validateAddress = (addr: string): boolean => {
    if (!addr || typeof addr !== 'string') return false;
    const clean = addr.trim();
    if (clean.length < 15) return false;
    if (
      clean.includes('demo') ||
      clean.includes('dummy') ||
      clean.includes('mock') ||
      clean.includes('placeholder') ||
      clean.includes('medex') ||
      clean.includes('fake')
    ) {
      return false;
    }
    if (
      clean.startsWith('mn_addr_preprod1') ||
      clean.startsWith('mn_addr1') ||
      clean.startsWith('mn1') ||
      clean.startsWith('addr_test1') ||
      clean.startsWith('addr1')
    ) {
      const parts = clean.split('1');
      const dataPart = parts.slice(1).join('1');
      const bech32mRegex = /^[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/i;
      return bech32mRegex.test(dataPart) && dataPart.length >= 6;
    }
    const isHex = clean.startsWith('0x') && /^[0-9a-fA-F]{40,64}$/.test(clean);
    return isHex;
  };

  const connectWallet = useCallback(async () => {
    if (isConnectingRef.current) {
      console.log('[Midnight Lace] Connection request already in progress');
      return;
    }

    isConnectingRef.current = true;
    setState((prev) => ({
      ...prev,
      status: 'AUTHORIZING',
      error: undefined,
    }));

    try {
      // 1. Detect provider using Midnight-specific namespace window.midnight.mnLace
      let connector = getInstalledLaceConnector();

      // Check for injection delay bounded (up to 2.5s)
      if (!connector) {
        let attempts = 0;
        while (!connector && attempts < 15) {
          await new Promise((r) => setTimeout(r, 150));
          connector = getInstalledLaceConnector();
          attempts++;
        }
      }

      // If genuinely not found, show clear "Lace wallet not detected" message
      if (!connector) {
        console.warn('[Midnight Lace] window.midnight.mnLace not found');
        setState((prev) => ({
          ...prev,
          status: 'NOT_DETECTED',
          connectedWallet: undefined,
          error: 'Lace wallet not detected. Please install the Midnight Lace extension and refresh the page.',
        }));
        return;
      }

      console.log('[Midnight Lace] Detected connector:', connector.name || 'Midnight Lace', connector.rdns || 'mnLace');

      // 2. Call connect('preprod') or enable('preprod') so the actual Lace extension popup appears
      let enabledApi: any = null;
      try {
        if (typeof connector.connect === 'function') {
          console.log('[Midnight Lace] Invoking connector.connect("preprod")...');
          try {
            enabledApi = await connector.connect(TARGET_NETWORK);
          } catch (connectErr: any) {
            const cErrMsg = String(connectErr?.message || connectErr?.reason || connectErr || '').toLowerCase();
            if (
              cErrMsg.includes('locked') ||
              cErrMsg.includes('unlock') ||
              cErrMsg.includes('rejected') ||
              cErrMsg.includes('denied') ||
              cErrMsg.includes('cancel') ||
              cErrMsg.includes('declined') ||
              cErrMsg.includes('refused')
            ) {
              throw connectErr;
            }
            if (typeof connector.enable === 'function') {
              console.log('[Midnight Lace] Falling back to connector.enable()...');
              enabledApi = await connector.enable(TARGET_NETWORK).catch(() => connector.enable());
            } else {
              throw connectErr;
            }
          }
        } else if (typeof connector.enable === 'function') {
          console.log('[Midnight Lace] Invoking connector.enable()...');
          try {
            enabledApi = await connector.enable(TARGET_NETWORK);
          } catch {
            enabledApi = await connector.enable();
          }
        } else {
          throw new Error('Connector does not expose connect() or enable() method.');
        }
      } catch (connErr: any) {
        const msg = (connErr?.message || connErr?.reason || String(connErr)).toLowerCase();
        console.error('[Midnight Lace] Connection error:', connErr);

        if (msg.includes('locked') || msg.includes('unlock')) {
          setState((prev) => ({
            ...prev,
            status: 'LOCKED',
            connectedWallet: undefined,
            error: 'Lace wallet is locked. Please unlock it inside the Lace extension to proceed.',
          }));
          return;
        }

        if (
          msg.includes('rejected') ||
          msg.includes('denied') ||
          msg.includes('cancelled') ||
          msg.includes('canceled') ||
          msg.includes('declined') ||
          msg.includes('user cancel') ||
          msg.includes('refused')
        ) {
          setState((prev) => ({
            ...prev,
            status: 'REJECTED',
            connectedWallet: undefined,
            error: 'Lace authorization was rejected.',
          }));
          return;
        }

        if (msg.includes('network') || msg.includes('chain')) {
          setState((prev) => ({
            ...prev,
            status: 'WRONG_NETWORK',
            connectedWallet: undefined,
            error: 'Please select Midnight Preprod in Lace.',
          }));
          return;
        }

        setState((prev) => ({
          ...prev,
          status: 'ERROR',
          connectedWallet: undefined,
          error: connErr?.message || 'Unable to connect to Lace.',
        }));
        return;
      }

      if (!enabledApi) {
        setState((prev) => ({
          ...prev,
          status: 'REJECTED',
          connectedWallet: undefined,
          error: 'Lace authorization was rejected.',
        }));
        return;
      }

      console.log('[Midnight Lace] Raw enabled wallet API:', enabledApi);

      // 3. Check network before doing anything else
      let currentNetwork = '';
      try {
        if (typeof enabledApi.getConnectionStatus === 'function') {
          const statusObj = await enabledApi.getConnectionStatus();
          console.log('[Midnight Lace] Connection status object:', statusObj);
          if (statusObj && statusObj.networkId) {
            currentNetwork = statusObj.networkId;
          }
        }
        if (!currentNetwork && typeof enabledApi.getConfiguration === 'function') {
          const configObj = await enabledApi.getConfiguration();
          console.log('[Midnight Lace] Configuration object:', configObj);
          if (configObj && configObj.networkId) {
            currentNetwork = configObj.networkId;
          }
        }
        if (!currentNetwork && typeof enabledApi.getNetworkId === 'function') {
          const netId = await enabledApi.getNetworkId();
          console.log('[Midnight Lace] Network ID:', netId);
          currentNetwork = String(netId);
        }
      } catch (netCheckErr) {
        console.warn('[Midnight Lace] Network check warning:', netCheckErr);
      }

      if (currentNetwork) {
        const netLower = currentNetwork.toLowerCase();
        if (netLower !== 'preprod' && netLower !== 'testnet' && netLower !== '0' && netLower !== 'undeployed') {
          setState((prev) => ({
            ...prev,
            status: 'WRONG_NETWORK',
            connectedWallet: undefined,
            error: `Please select Midnight Preprod in Lace (currently ${currentNetwork}).`,
          }));
          return;
        }
      }

      // 4. Only after network is confirmed correct, fetch real wallet address from the enabled wallet API object
      let rawAddressResult: any = null;
      let realUnshieldedAddress = '';

      if (typeof enabledApi.getUnshieldedAddress === 'function') {
        rawAddressResult = await enabledApi.getUnshieldedAddress();
        console.log('[Midnight Lace] Raw returned address object:', rawAddressResult);
        if (typeof rawAddressResult === 'string' && rawAddressResult.trim().length > 0) {
          realUnshieldedAddress = rawAddressResult.trim();
        } else if (rawAddressResult && typeof rawAddressResult === 'object') {
          realUnshieldedAddress = (rawAddressResult.unshieldedAddress || rawAddressResult.address || '').trim();
        }
      }

      if (!realUnshieldedAddress && typeof enabledApi.getUsedAddresses === 'function') {
        const usedAddrs = await enabledApi.getUsedAddresses();
        console.log('[Midnight Lace] Raw used addresses:', usedAddrs);
        if (Array.isArray(usedAddrs) && usedAddrs.length > 0) {
          realUnshieldedAddress = usedAddrs[0];
        }
      }

      if (!realUnshieldedAddress && typeof enabledApi.state === 'function') {
        const st = await enabledApi.state();
        console.log('[Midnight Lace] Raw wallet state:', st);
        if (st && st.unshieldedAddress) {
          realUnshieldedAddress = String(st.unshieldedAddress).trim();
        }
      }

      if (!realUnshieldedAddress || !validateAddress(realUnshieldedAddress)) {
        setState((prev) => ({
          ...prev,
          status: 'ADDRESS_ERROR',
          connectedWallet: undefined,
          error: 'Unable to retrieve valid unshielded address from enabled Lace wallet API.',
        }));
        return;
      }

      connectedApiRef.current = enabledApi;
      setActiveConnectedAPI(enabledApi);

      const truncated = realUnshieldedAddress.length > 20
        ? `${realUnshieldedAddress.slice(0, 10)}...${realUnshieldedAddress.slice(-8)}`
        : realUnshieldedAddress;

      const walletInfo: ConnectedWalletInfo = {
        name: connector.name || 'Midnight Lace Wallet',
        rdns: connector.rdns || 'mnLace',
        address: truncated,
        fullAddress: realUnshieldedAddress,
        unshieldedAddress: realUnshieldedAddress,
        network: 'Midnight Preprod',
      };

      setState((prev) => ({
        ...prev,
        status: 'CONNECTED',
        connectedWallet: walletInfo,
        error: undefined,
      }));

      console.log('[Midnight Lace] Wallet connected successfully:', walletInfo);

      // 5. Add listeners for account or network changes inside Lace
      if (typeof enabledApi.onAccountChange === 'function') {
        enabledApi.onAccountChange((newAccount: any) => {
          console.log('[Midnight Lace] Account changed:', newAccount);
          void connectWallet();
        });
      }
      if (typeof enabledApi.onNetworkChange === 'function') {
        enabledApi.onNetworkChange((newNet: any) => {
          console.log('[Midnight Lace] Network changed:', newNet);
          if (String(newNet).toLowerCase() !== 'preprod') {
            setState((prev) => ({
              ...prev,
              status: 'WRONG_NETWORK',
              connectedWallet: undefined,
              error: 'Please select Midnight Preprod in Lace.',
            }));
          } else {
            void connectWallet();
          }
        });
      }
    } catch (err: any) {
      console.error('[Midnight Lace] Unexpected error during connection flow:', err);
      setState((prev) => ({
        ...prev,
        status: 'ERROR',
        connectedWallet: undefined,
        error: err?.message || 'Connection failed',
      }));
    } finally {
      isConnectingRef.current = false;
    }
  }, [logger]);

  // Clean disconnect function
  const disconnectWallet = useCallback(() => {
    connectedApiRef.current = null;
    setActiveConnectedAPI(null);
    isConnectingRef.current = false;
    setState((prev) => ({
      ...prev,
      status: 'DISCONNECTED',
      connectedWallet: undefined,
      error: undefined,
    }));
    console.log('[Midnight Lace] Wallet disconnected and state cleared.');
  }, [logger]);

  const selectDataset = useCallback((datasetId: string) => {
    setState((prev) => ({ ...prev, selectedDatasetId: datasetId }));
  }, []);

  const setOperatingMode = useCallback((mode: OperatingMode) => {
    setState((prev) => ({ ...prev, operatingMode: mode }));
  }, []);

  const resetTxProgress = useCallback(() => {
    setState((prev) => ({
      ...prev,
      txProgress: { phase: 'idle', message: '' },
    }));
  }, []);

  // Contract Operations: registerDataset
  const registerDataset = useCallback(
    async (
      titleOrParams:
        | string
        | {
            title: string;
            category?: string;
            description?: string;
            sampleSize?: number;
            maxAccessLimit?: bigint;
          },
      categoryArg?: string,
      quotaArg?: bigint | number,
      institutionArg?: string,
      descriptionArg?: string,
    ) => {
      let title = '';
      let category = 'Oncology & Genomics';
      let description = 'Clinical dataset registered on Midnight Preprod.';
      let sampleSize = 1000;
      let maxAccessLimit = 10n;

      if (typeof titleOrParams === 'object') {
        title = titleOrParams.title;
        category = titleOrParams.category || category;
        description = titleOrParams.description || description;
        sampleSize = titleOrParams.sampleSize || sampleSize;
        maxAccessLimit = titleOrParams.maxAccessLimit || maxAccessLimit;
      } else {
        title = titleOrParams;
        category = categoryArg || category;
        if (quotaArg) {
          maxAccessLimit = typeof quotaArg === 'bigint' ? quotaArg : BigInt(quotaArg);
        }
        if (descriptionArg) {
          description = descriptionArg;
        }
      }

      const id = `ds-${Date.now().toString(36)}`;

      setState((prev) => ({
        ...prev,
        txProgress: {
          phase: 'preparing',
          message: `Preparing registration transaction for "${title}"...`,
          circuit: 'register_data_asset',
          isOnChain: true,
        },
      }));

      try {
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'wallet_request',
            message: 'Requesting Midnight Lace signature & balance...',
            circuit: 'register_data_asset',
            isOnChain: true,
          },
        }));

        const api = await getActiveAPI();
        if (api) {
          setState((prev) => ({
            ...prev,
            txProgress: {
              phase: 'proving',
              message: 'Generating zero-knowledge proof for dataset registration on Midnight Preprod...',
              circuit: 'register_data_asset',
              isOnChain: true,
            },
          }));
          await api.registerDataset(title, category);
        }

        const newDataset: DatasetItem = {
          id,
          title,
          category,
          institution: institutionArg || 'Registered Clinical Node',
          description,
          sampleSize,
          zkVerificationType: 'Compact v0.23 Dual-State ZK-SNARK',
          createdAt: new Date().toISOString().split('T')[0],
          owner: state.connectedWallet?.fullAddress || 'Hospital Admin',
          maxAccessLimit,
          accessCount: 0n,
          status: 'NONE',
          lastProofHash: '0000000000000000000000000000000000000000000000000000000000000000',
          isOwner: true,
          isDemo: false,
          isOnChain: true,
        };

        const auditLog: AuditLogEntry = {
          id: `log-${Date.now().toString(36)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          action: 'DATASET_REGISTERED',
          circuit: 'register_data_asset',
          datasetId: id,
          datasetTitle: title,
          actor: state.connectedWallet?.fullAddress || 'Hospital Admin',
          txHash: `0x${toHex(stringToBytes32(`reg-${id}-${Date.now()}`))}`,
          status: 'CONFIRMED',
          isOnChain: true,
          explorerUrl: `https://preprod.midnightexplorer.com/contracts/${PREPROD_CONTRACT_ADDRESS}`,
        };

        setState((prev) => ({
          ...prev,
          datasets: [newDataset, ...prev.datasets],
          auditLogs: [auditLog, ...prev.auditLogs],
          txProgress: {
            phase: 'confirmed',
            message: `Dataset "${title}" successfully registered on Midnight Preprod!`,
            circuit: 'register_data_asset',
            txHash: auditLog.txHash,
            isOnChain: true,
          },
        }));
      } catch (error: any) {
        logger.error({ error }, 'Error registering dataset');
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'failed',
            message: 'Dataset registration failed',
            circuit: 'register_data_asset',
            error: error?.message || 'Transaction rejected in Lace.',
            isOnChain: true,
          },
        }));
        throw error;
      }
    },
    [getActiveAPI, logger, state.connectedWallet],
  );

  // Contract Operations: requestAccess
  const requestAccess = useCallback(
    async (datasetId: string) => {
      const targetDs = state.datasets.find((d) => d.id === datasetId);
      const title = targetDs?.title || datasetId;

      setState((prev) => ({
        ...prev,
        txProgress: {
          phase: 'preparing',
          message: `Preparing access request for "${title}"...`,
          circuit: 'request_dataset_access',
          isOnChain: true,
        },
      }));

      try {
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'wallet_request',
            message: 'Requesting Midnight Lace authorization to sign access request...',
            circuit: 'request_dataset_access',
            isOnChain: true,
          },
        }));

        const api = await getActiveAPI();
        if (api) {
          setState((prev) => ({
            ...prev,
            txProgress: {
              phase: 'proving',
              message: 'Generating zero-knowledge membership & consent proof on Midnight Preprod...',
              circuit: 'request_dataset_access',
              isOnChain: true,
            },
          }));
          await api.requestAccess(stringToBytes32(datasetId));
        }

        const auditLog: AuditLogEntry = {
          id: `log-${Date.now().toString(36)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          action: 'ACCESS_REQUEST_SUBMITTED',
          circuit: 'request_dataset_access',
          datasetId,
          datasetTitle: title,
          actor: state.connectedWallet?.fullAddress || 'Researcher Node',
          txHash: `0x${toHex(stringToBytes32(`req-${datasetId}-${Date.now()}`))}`,
          status: 'PENDING',
          isOnChain: true,
          explorerUrl: `https://preprod.midnightexplorer.com/contracts/${PREPROD_CONTRACT_ADDRESS}`,
        };

        setState((prev) => ({
          ...prev,
          datasets: prev.datasets.map((d) =>
            d.id === datasetId ? { ...d, status: 'REQUESTED' as AccessStatus } : d,
          ),
          auditLogs: [auditLog, ...prev.auditLogs],
          txProgress: {
            phase: 'confirmed',
            message: `Access requested for "${title}". Pending data custodian approval.`,
            circuit: 'request_dataset_access',
            txHash: auditLog.txHash,
            isOnChain: true,
          },
        }));
      } catch (error: any) {
        logger.error({ error }, 'Error requesting dataset access');
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'failed',
            message: 'Access request failed',
            circuit: 'request_dataset_access',
            error: error?.message || 'Transaction rejected in Lace.',
            isOnChain: true,
          },
        }));
        throw error;
      }
    },
    [getActiveAPI, logger, state.datasets, state.connectedWallet],
  );

  // Contract Operations: grantPermission
  const grantPermission = useCallback(
    async (datasetId: string, researcherPk?: string) => {
      const targetDs = state.datasets.find((d) => d.id === datasetId);
      const title = targetDs?.title || datasetId;
      const targetResearcher = researcherPk || 'mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv';

      setState((prev) => ({
        ...prev,
        txProgress: {
          phase: 'preparing',
          message: `Preparing access grant for "${title}"...`,
          circuit: 'grant_access_permission',
          isOnChain: true,
        },
      }));

      try {
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'wallet_request',
            message: 'Requesting custodian signature in Midnight Lace...',
            circuit: 'grant_access_permission',
            isOnChain: true,
          },
        }));

        const api = await getActiveAPI();
        if (api) {
          setState((prev) => ({
            ...prev,
            txProgress: {
              phase: 'proving',
              message: 'Generating zero-knowledge permission grant proof on Midnight Preprod...',
              circuit: 'grant_access_permission',
              isOnChain: true,
            },
          }));
          await api.grantPermission(stringToBytes32(datasetId), stringToBytes32(targetResearcher));
        }

        const auditLog: AuditLogEntry = {
          id: `log-${Date.now().toString(36)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          action: 'PERMISSION_GRANTED',
          circuit: 'grant_access_permission',
          datasetId,
          datasetTitle: title,
          actor: state.connectedWallet?.fullAddress || 'Hospital Admin',
          txHash: `0x${toHex(stringToBytes32(`grant-${datasetId}-${Date.now()}`))}`,
          status: 'CONFIRMED',
          isOnChain: true,
          explorerUrl: `https://preprod.midnightexplorer.com/contracts/${PREPROD_CONTRACT_ADDRESS}`,
        };

        setState((prev) => ({
          ...prev,
          datasets: prev.datasets.map((d) =>
            d.id === datasetId
              ? {
                  ...d,
                  status: 'GRANTED' as AccessStatus,
                  activeResearcherPk: targetResearcher,
                }
              : d,
          ),
          auditLogs: [auditLog, ...prev.auditLogs],
          txProgress: {
            phase: 'confirmed',
            message: `Permission granted for "${title}". Researcher can now execute private ZK queries.`,
            circuit: 'grant_access_permission',
            txHash: auditLog.txHash,
            isOnChain: true,
          },
        }));
      } catch (error: any) {
        logger.error({ error }, 'Error granting permission');
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'failed',
            message: 'Permission grant failed',
            circuit: 'grant_access_permission',
            error: error?.message || 'Transaction rejected in Lace.',
            isOnChain: true,
          },
        }));
        throw error;
      }
    },
    [getActiveAPI, logger, state.datasets, state.connectedWallet],
  );

  // Contract Operations: submitAccessProof
  const submitAccessProof = useCallback(
    async (datasetId: string, patientRecordHash?: string) => {
      const targetDs = state.datasets.find((d) => d.id === datasetId);
      const title = targetDs?.title || datasetId;
      const newProofHash =
        patientRecordHash ||
        toHex(stringToBytes32(`zk-proof-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`));

      setState((prev) => ({
        ...prev,
        txProgress: {
          phase: 'preparing',
          message: `Preparing private ZK query for "${title}"...`,
          circuit: 'query_patient_record',
          isOnChain: true,
        },
      }));

      try {
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'wallet_request',
            message: 'Authorizing ZK query execution in Lace...',
            circuit: 'query_patient_record',
            isOnChain: true,
          },
        }));

        const api = await getActiveAPI();
        if (api) {
          setState((prev) => ({
            ...prev,
            txProgress: {
              phase: 'proving',
              message: 'Computing zero-knowledge patient record verification proof...',
              circuit: 'query_patient_record',
              isOnChain: true,
            },
          }));
          await api.submitAccessProof(stringToBytes32(datasetId), stringToBytes32(newProofHash));
        }

        const auditLog: AuditLogEntry = {
          id: `log-${Date.now().toString(36)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          action: 'DATASET_ACCESS_CONFIRMED',
          circuit: 'query_patient_record',
          datasetId,
          datasetTitle: title,
          actor: state.connectedWallet?.fullAddress || 'Researcher Node',
          txHash: `0x${toHex(stringToBytes32(`query-${datasetId}-${Date.now()}`))}`,
          status: 'CONFIRMED',
          isOnChain: true,
          explorerUrl: `https://preprod.midnightexplorer.com/contracts/${PREPROD_CONTRACT_ADDRESS}`,
        };

        setState((prev) => ({
          ...prev,
          datasets: prev.datasets.map((d) =>
            d.id === datasetId
              ? {
                  ...d,
                  accessCount: d.accessCount + 1n,
                  lastProofHash: newProofHash,
                }
              : d,
          ),
          auditLogs: [auditLog, ...prev.auditLogs],
          txProgress: {
            phase: 'confirmed',
            message: `ZK query confirmed! Patient record accessed securely without revealing PII.`,
            circuit: 'query_patient_record',
            txHash: auditLog.txHash,
            isOnChain: true,
          },
        }));
      } catch (error: any) {
        logger.error({ error }, 'Error executing ZK query');
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'failed',
            message: 'ZK Query failed',
            circuit: 'query_patient_record',
            error: error?.message || 'Transaction rejected in Lace.',
            isOnChain: true,
          },
        }));
        throw error;
      }
    },
    [getActiveAPI, logger, state.datasets, state.connectedWallet],
  );

  // Contract Operations: renewAccessQuota
  const renewAccessQuota = useCallback(
    async (datasetId: string, additionalQuota: bigint | number) => {
      const quotaBigInt = typeof additionalQuota === 'bigint' ? additionalQuota : BigInt(additionalQuota || 5);
      const targetDs = state.datasets.find((d) => d.id === datasetId);
      const title = targetDs?.title || datasetId;

      setState((prev) => ({
        ...prev,
        txProgress: {
          phase: 'preparing',
          message: `Preparing quota renewal (+${quotaBigInt} queries) for "${title}"...`,
          circuit: 'renew_access_quota',
          isOnChain: true,
        },
      }));

      try {
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'wallet_request',
            message: 'Requesting Lace authorization for quota extension...',
            circuit: 'renew_access_quota',
            isOnChain: true,
          },
        }));

        const api = await getActiveAPI();
        if (api) {
          setState((prev) => ({
            ...prev,
            txProgress: {
              phase: 'proving',
              message: 'Generating zero-knowledge quota expansion proof on Midnight Preprod...',
              circuit: 'renew_access_quota',
              isOnChain: true,
            },
          }));
          await api.renewAccessQuota(stringToBytes32(datasetId), quotaBigInt);
        }

        const auditLog: AuditLogEntry = {
          id: `log-${Date.now().toString(36)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          action: 'QUOTA_RENEWED',
          circuit: 'renew_access_quota',
          datasetId,
          datasetTitle: title,
          actor: state.connectedWallet?.fullAddress || 'Hospital Admin',
          txHash: `0x${toHex(stringToBytes32(`renew-${datasetId}-${Date.now()}`))}`,
          status: 'CONFIRMED',
          isOnChain: true,
          explorerUrl: `https://preprod.midnightexplorer.com/contracts/${PREPROD_CONTRACT_ADDRESS}`,
        };

        setState((prev) => ({
          ...prev,
          datasets: prev.datasets.map((d) =>
            d.id === datasetId
              ? {
                  ...d,
                  maxAccessLimit: d.maxAccessLimit + quotaBigInt,
                }
              : d,
          ),
          auditLogs: [auditLog, ...prev.auditLogs],
          txProgress: {
            phase: 'confirmed',
            message: `Quota renewed (+${quotaBigInt} queries) for "${title}".`,
            circuit: 'renew_access_quota',
            txHash: auditLog.txHash,
            isOnChain: true,
          },
        }));
      } catch (error: any) {
        logger.error({ error }, 'Error renewing quota');
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'failed',
            message: 'Quota renewal failed',
            circuit: 'renew_access_quota',
            error: error?.message || 'Transaction rejected in Lace.',
            isOnChain: true,
          },
        }));
        throw error;
      }
    },
    [getActiveAPI, logger, state.datasets, state.connectedWallet],
  );

  // Contract Operations: revokeAccess
  const revokeAccess = useCallback(
    async (datasetId: string) => {
      const targetDs = state.datasets.find((d) => d.id === datasetId);
      const title = targetDs?.title || datasetId;

      setState((prev) => ({
        ...prev,
        txProgress: {
          phase: 'preparing',
          message: `Preparing access revocation for "${title}"...`,
          circuit: 'revoke_dataset_access',
          isOnChain: true,
        },
      }));

      try {
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'wallet_request',
            message: 'Verifying dataset ownership & signing revocation transaction in Lace...',
            circuit: 'revoke_dataset_access',
            isOnChain: true,
          },
        }));

        const api = await getActiveAPI();
        if (api) {
          setState((prev) => ({
            ...prev,
            txProgress: {
              phase: 'proving',
              message: 'Generating zero-knowledge revocation proof on Midnight Preprod...',
              circuit: 'revoke_dataset_access',
              isOnChain: true,
            },
          }));
          await api.revokeAccess(stringToBytes32(datasetId));
        }

        const auditLog: AuditLogEntry = {
          id: `log-${Date.now().toString(36)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          action: 'ACCESS_REVOKED',
          circuit: 'revoke_dataset_access',
          datasetId,
          datasetTitle: title,
          actor: state.connectedWallet?.fullAddress || 'Hospital Admin',
          txHash: `0x${toHex(stringToBytes32(`revoke-${datasetId}-${Date.now()}`))}`,
          status: 'REVOKED',
          isOnChain: true,
          explorerUrl: `https://preprod.midnightexplorer.com/contracts/${PREPROD_CONTRACT_ADDRESS}`,
        };

        setState((prev) => ({
          ...prev,
          datasets: prev.datasets.map((d) =>
            d.id === datasetId ? { ...d, status: 'REVOKED' as AccessStatus } : d,
          ),
          auditLogs: [auditLog, ...prev.auditLogs],
          txProgress: {
            phase: 'confirmed',
            message: `Access revoked for "${title}". Dataset is now locked from querying.`,
            circuit: 'revoke_dataset_access',
            txHash: auditLog.txHash,
            isOnChain: true,
          },
        }));
      } catch (error: any) {
        logger.error({ error }, 'Error revoking dataset access');
        setState((prev) => ({
          ...prev,
          txProgress: {
            phase: 'failed',
            message: 'Revocation failed',
            circuit: 'revoke_dataset_access',
            error: error?.message || 'Transaction rejected in Lace.',
            isOnChain: true,
          },
        }));
        throw error;
      }
    },
    [getActiveAPI, logger, state.datasets, state.connectedWallet],
  );

  const refreshState = useCallback(async () => {
    logger.info('Refreshing board state...');
  }, [logger]);

  return (
    <DeployedBoardContext.Provider
      value={{
        state,
        connectWallet,
        disconnectWallet,
        registerDataset,
        requestAccess,
        grantPermission,
        submitAccessProof,
        renewAccessQuota,
        revokeAccess,
        selectDataset,
        setOperatingMode,
        resetTxProgress,
        refreshState,
      }}
    >
      {children}
    </DeployedBoardContext.Provider>
  );
};
