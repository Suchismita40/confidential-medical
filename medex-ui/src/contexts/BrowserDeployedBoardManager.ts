// Private Medical Research Data Exchange (MedEx) Browser Deployed Board Manager
// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0

import { BehaviorSubject, Observable } from 'rxjs';
import type { Logger } from 'pino';
import {
  type MedExCircuitKeys,
  type MedExProviders,
  type DeployedMedExAPI,
  MedExAPI,
} from '@midnight-ntwrk/medex-api';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { toHex, fromHex } from '@midnight-ntwrk/midnight-js-utils';
import {
  type FinalizedTransaction,
  type TransactionId,
  type SignatureEnabled,
  type Proof,
  type Binding,
  Transaction,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { type MedExPrivateState } from '@midnight-ntwrk/medex-contract';
import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';

let _activeConnectedAPI: any = null;

export const setActiveConnectedAPI = (api: any) => {
  _activeConnectedAPI = api;
};

export const getActiveConnectedAPI = (): any => {
  return _activeConnectedAPI;
};

export interface DeployedBoardManager {
  readonly resolve: (contractAddress: ContractAddress) => Observable<BoardDeployment>;
}

export type BoardDeployment =
  | {
      readonly status: 'in-progress';
    }
  | {
      readonly status: 'deployed';
      readonly api: DeployedMedExAPI;
    }
  | {
      readonly status: 'failed';
      readonly error: Error;
    };

export class BrowserDeployedBoardManager implements DeployedBoardManager {
  #providers: Promise<MedExProviders> | undefined;
  #deployments: Map<ContractAddress, Observable<BoardDeployment>>;

  constructor(private readonly logger: Logger) {
    this.#deployments = new Map();
  }

  resolve(contractAddress: ContractAddress): Observable<BoardDeployment> {
    let deployment = this.#deployments.get(contractAddress);
    if (!deployment) {
      const subject = new BehaviorSubject<BoardDeployment>({ status: 'in-progress' });
      this.#deployments.set(contractAddress, subject);
      void this.joinDeployment(subject, contractAddress);
      deployment = subject;
    }
    return deployment;
  }

  private getProviders(): Promise<MedExProviders> {
    if (!this.#providers) {
      this.#providers = initializeProviders(this.logger);
    }
    return this.#providers;
  }

  private async joinDeployment(
    deployment: BehaviorSubject<BoardDeployment>,
    contractAddress: ContractAddress,
  ): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await Promise.race([
        MedExAPI.join(providers, contractAddress, this.logger),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Contract join timed out after 45 s')), 45_000)
        ),
      ]);
      deployment.next({ status: 'deployed', api });
    } catch (error: unknown) {
      deployment.next({
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}

/** @internal Detect real Lace connector from window.midnight.mnLace (official Midnight standard) */
export const getInstalledLaceConnector = (): any => {
  if (typeof window === 'undefined') return undefined;

  // 1. Primary Midnight-specific namespace
  const midnight = (window as any).midnight;
  if (midnight) {
    if (midnight.mnLace && (typeof midnight.mnLace.connect === 'function' || typeof midnight.mnLace.enable === 'function')) {
      return midnight.mnLace;
    }
    if (midnight.lace && (typeof midnight.lace.connect === 'function' || typeof midnight.lace.enable === 'function')) {
      return midnight.lace;
    }
    if (midnight['midnight-lace'] && (typeof midnight['midnight-lace'].connect === 'function' || typeof midnight['midnight-lace'].enable === 'function')) {
      return midnight['midnight-lace'];
    }
    for (const key of Object.keys(midnight)) {
      const val = midnight[key];
      if (val && (typeof val.connect === 'function' || typeof val.enable === 'function')) {
        return val;
      }
    }
    if (typeof midnight.connect === 'function' || typeof midnight.enable === 'function') {
      return midnight;
    }
  }

  // 2. Cardano multi-chain Lace fallback
  const cardano = (window as any).cardano;
  if (cardano) {
    if (cardano.lace && (typeof cardano.lace.connect === 'function' || typeof cardano.lace.enable === 'function')) {
      return cardano.lace;
    }
    if (cardano.midnight && (typeof cardano.midnight.connect === 'function' || typeof cardano.midnight.enable === 'function')) {
      return cardano.midnight;
    }
    if (cardano['midnight-lace'] && (typeof cardano['midnight-lace'].connect === 'function' || typeof cardano['midnight-lace'].enable === 'function')) {
      return cardano['midnight-lace'];
    }
  }

  return undefined;
};

/** @internal Initialize genuine Midnight providers with authorized Lace connector */
const initializeProviders = async (logger: Logger): Promise<MedExProviders> => {
  const networkId = 'preprod' as NetworkId;
  setNetworkId(networkId);

  const zkConfigPath = window.location.origin;
  const keyMaterialProvider = new FetchZkConfigProvider<MedExCircuitKeys>(zkConfigPath, fetch.bind(window));
  const privateStateProvider = levelPrivateStateProvider<string, MedExPrivateState>({
    midnightDbName: 'medex-private-state-db',
    privateStateStoreName: 'medex-private-states',
    signingKeyStoreName: 'medex-signing-keys',
    privateStoragePasswordProvider: () => 'MedEx-Midnight-Preprod-Auth-2026!',
    accountId: 'medex-authorized-lace-account',
  });

  let connectedAPI = _activeConnectedAPI;
  if (!connectedAPI) {
    const connector = getInstalledLaceConnector();
    if (!connector) {
      throw new Error('Lace wallet not installed. Please install the Midnight Lace extension.');
    }
    if (typeof connector.connect === 'function') {
      try {
        connectedAPI = await connector.connect(networkId);
      } catch (err) {
        if (typeof connector.enable === 'function') {
          connectedAPI = await connector.enable('preprod').catch(() => connector.enable());
        } else {
          throw err;
        }
      }
    } else if (typeof connector.enable === 'function') {
      try {
        connectedAPI = await connector.enable('preprod');
      } catch {
        connectedAPI = await connector.enable();
      }
    }
    _activeConnectedAPI = connectedAPI;
  }

  const config = await connectedAPI.getConfiguration();
  const shieldedAddresses = await connectedAPI.getShieldedAddresses();

  return {
    privateStateProvider,
    zkConfigProvider: keyMaterialProvider,
    proofProvider: httpClientProofProvider(
      config.proverServerUri || (import.meta.env.VITE_PROOF_SERVER_URL as string) || 'https://prover.preprod.midnight.network',
      keyMaterialProvider
    ),
    publicDataProvider: indexerPublicDataProvider(
      config.indexerUri || (import.meta.env.VITE_INDEXER_URL as string) || 'https://indexer.preprod.midnight.network/api/v4/graphql',
      config.indexerWsUri || (import.meta.env.VITE_INDEXER_WS_URL as string) || 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws'
    ),
    walletProvider: {
      getCoinPublicKey(): string {
        return shieldedAddresses.shieldedCoinPublicKey;
      },
      getEncryptionPublicKey(): string {
        return shieldedAddresses.shieldedEncryptionPublicKey;
      },
      balanceTx: async (tx: UnboundTransaction, ttl?: Date): Promise<FinalizedTransaction> => {
        try {
          logger.info({ tx, ttl }, 'Balancing transaction via Lace wallet');
          const serializedTx = toHex(tx.serialize());
          const received = await connectedAPI!.balanceUnsealedTransaction(serializedTx);
          return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
            'signature',
            'proof',
            'binding',
            fromHex(received.tx),
          );
        } catch (e) {
          logger.error({ error: e }, 'Error balancing transaction via Lace wallet');
          throw e;
        }
      },
    },
    midnightProvider: {
      submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
        await connectedAPI!.submitTransaction(toHex(tx.serialize()));
        const txIdentifiers = tx.identifiers();
        const txId = txIdentifiers[0];
        logger.info({ txIdentifiers }, 'Submitted transaction via Lace wallet');
        return txId;
      },
    },
  };
};
