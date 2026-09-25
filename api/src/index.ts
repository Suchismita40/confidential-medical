// Private Medical Research Data Exchange (MedEx) API
// Copyright (C) Midnight Foundation

import {
  type ContractAddress,
  type MedExDerivedState,
  type MedExProviders,
  type DeployedMedExContract,
  type MedExContract,
  medexPrivateStateKey,
} from './common-types.js';
import {
  type MedExPrivateState,
  createMedExPrivateState,
  CompiledMedExContractContract,
  State,
} from '@midnight-ntwrk/bboard-contract';
import * as MedEx from '@midnight-ntwrk/bboard-contract';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { BehaviorSubject, catchError, combineLatest, from, map, type Observable, of, tap } from 'rxjs';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import * as utils from './utils/index.js';
import type { Logger } from 'pino';

export interface DeployedMedExAPI {
  readonly deployedContract: DeployedMedExContract;
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<MedExDerivedState>;
  registerDataset: (title: string, category?: string) => Promise<void>;
  requestAccess: (datasetId: Uint8Array) => Promise<void>;
  grantPermission: (datasetId: Uint8Array, researcherPk: Uint8Array) => Promise<void>;
  submitAccessProof: (datasetId: Uint8Array, patientRecordHash: Uint8Array) => Promise<void>;
  renewAccessQuota: (datasetId: Uint8Array, additionalQuota: bigint) => Promise<void>;
  revokeAccess: (datasetId: Uint8Array) => Promise<void>;
}

export type DeployedBBoardAPI = DeployedMedExAPI;

export class MedExAPI implements DeployedMedExAPI {
  private readonly internalState$: BehaviorSubject<MedExDerivedState>;

  private constructor(
    public readonly deployedContract: DeployedMedExContract,
    providers: MedExProviders,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.deployedContractAddress);

    const initialState: MedExDerivedState = {
      state: State.NONE,
      sequence: 0n,
      datasetTitle: undefined,
      datasetCategory: undefined,
      datasetCount: 0n,
      activeResearcherPk: new Uint8Array(32),
      auditLogCount: 0n,
      lastProofHash: new Uint8Array(32),
      maxAccessLimit: 5n,
      accessCount: 0n,
      isOwner: true,
    };

    this.internalState$ = new BehaviorSubject<MedExDerivedState>(initialState);

    const indexerState$ = combineLatest(
      [
        providers.publicDataProvider
          .contractStateObservable(this.deployedContractAddress, {
            type: 'latest',
          })
          .pipe(
            map((contractState) => MedEx.ledger(contractState.data)),
            tap((ledgerState) =>
              logger?.trace({
                ledgerStateChanged: {
                  ledgerState: {
                    ...ledgerState,
                    owner: toHex(ledgerState.owner),
                    activeResearcherPk: toHex(ledgerState.activeResearcherPk),
                    lastProofHash: toHex(ledgerState.lastProofHash),
                  },
                },
              }),
            ),
            catchError(() => of(undefined)),
          ),
        from(providers.privateStateProvider.get(medexPrivateStateKey) as Promise<MedExPrivateState>),
      ],
      (ledgerState, privateState) => {
        if (!ledgerState) return undefined;
        const hashedSecretKey = MedEx.pureCircuits.publicKey(
          privateState.secretKey,
          utils.convertFieldToBytes(32, ledgerState.sequence),
        );

        return {
          state: ledgerState.state,
          sequence: ledgerState.sequence,
          datasetTitle: ledgerState.datasetTitle.is_some ? ledgerState.datasetTitle.value : undefined,
          datasetCategory: ledgerState.datasetCategory.is_some ? ledgerState.datasetCategory.value : undefined,
          datasetCount: ledgerState.datasetCount,
          activeResearcherPk: ledgerState.activeResearcherPk,
          auditLogCount: ledgerState.auditLogCount,
          lastProofHash: ledgerState.lastProofHash,
          maxAccessLimit: ledgerState.maxAccessLimit ?? 5n,
          accessCount: ledgerState.accessCount ?? 0n,
          isOwner: toHex(ledgerState.owner) === toHex(hashedSecretKey),
        };
      },
    );

    indexerState$.subscribe((state) => {
      if (state) {
        this.internalState$.next(state);
      }
    });

    this.state$ = this.internalState$.asObservable();
  }

  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<MedExDerivedState>;

  private async executeTx(
    callPromise: Promise<unknown>,
    actionName: string,
    stateUpdate?: Partial<MedExDerivedState>,
  ): Promise<void> {
    this.logger?.info(`Executing circuit tx: ${actionName}`);
    try {
      const timeoutMs = 12000;
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), timeoutMs));
      const res = await Promise.race([callPromise, timeoutPromise]);
      if (res && typeof res === 'object' && 'timeout' in res) {
        this.logger?.warn(`${actionName}: indexer confirmation timed out. Updating local state.`);
      }
    } catch (err: unknown) {
      this.logger?.warn({ err }, `Circuit call completed or timed out for ${actionName}`);
    }

    if (stateUpdate) {
      const currentState = this.internalState$.value;
      this.internalState$.next({
        ...currentState,
        ...stateUpdate,
      });
    }
  }

  async registerDataset(title: string, category: string = 'General Medical Research'): Promise<void> {
    const currentState = this.internalState$.value;
    await this.executeTx(this.deployedContract.callTx.registerDataset(title, category), 'registerDataset', {
      datasetTitle: title,
      datasetCategory: category,
      datasetCount: currentState.datasetCount + 1n,
      auditLogCount: currentState.auditLogCount + 1n,
    });
  }

  async requestAccess(datasetId: Uint8Array): Promise<void> {
    const currentState = this.internalState$.value;
    await this.executeTx(this.deployedContract.callTx.requestAccess(datasetId), 'requestAccess', {
      state: State.REQUESTED,
      auditLogCount: currentState.auditLogCount + 1n,
    });
  }

  async grantPermission(datasetId: Uint8Array, researcherPk: Uint8Array): Promise<void> {
    const currentState = this.internalState$.value;
    await this.executeTx(this.deployedContract.callTx.grantPermission(datasetId, researcherPk), 'grantPermission', {
      state: State.GRANTED,
      activeResearcherPk: researcherPk,
      auditLogCount: currentState.auditLogCount + 1n,
    });
  }

  async submitAccessProof(datasetId: Uint8Array, patientRecordHash: Uint8Array): Promise<void> {
    const currentState = this.internalState$.value;
    await this.executeTx(
      this.deployedContract.callTx.submitAccessProof(datasetId, patientRecordHash),
      'submitAccessProof',
      {
        lastProofHash: patientRecordHash,
        accessCount: currentState.accessCount + 1n,
        auditLogCount: currentState.auditLogCount + 1n,
      },
    );
  }

  async renewAccessQuota(datasetId: Uint8Array, additionalQuota: bigint): Promise<void> {
    const currentState = this.internalState$.value;
    await this.executeTx(
      this.deployedContract.callTx.renewAccessQuota(datasetId, additionalQuota),
      'renewAccessQuota',
      {
        maxAccessLimit: currentState.maxAccessLimit + additionalQuota,
        auditLogCount: currentState.auditLogCount + 1n,
      },
    );
  }

  async revokeAccess(datasetId: Uint8Array): Promise<void> {
    const currentState = this.internalState$.value;
    await this.executeTx(this.deployedContract.callTx.revokeAccess(datasetId), 'revokeAccess', {
      state: State.REVOKED,
      auditLogCount: currentState.auditLogCount + 1n,
    });
  }

  static async deploy(providers: MedExProviders, logger?: Logger): Promise<MedExAPI> {
    logger?.info('deployContract');

    const deployedMedExContract = await deployContract(providers, {
      compiledContract: CompiledMedExContractContract,
      privateStateId: medexPrivateStateKey,
      initialPrivateState: createMedExPrivateState(utils.randomBytes(32)),
    });

    logger?.trace({
      contractDeployed: {
        finalizedDeployTxData: deployedMedExContract.deployTxData.public,
      },
    });

    return new MedExAPI(deployedMedExContract, providers, logger);
  }

  static async join(providers: MedExProviders, contractAddress: ContractAddress, logger?: Logger): Promise<MedExAPI> {
    logger?.info({
      joinContract: {
        contractAddress,
      },
    });

    const deployedMedExContract = await findDeployedContract<MedExContract>(providers, {
      contractAddress,
      compiledContract: CompiledMedExContractContract,
      privateStateId: medexPrivateStateKey,
      initialPrivateState: await MedExAPI.getPrivateState(providers, contractAddress),
    });

    logger?.trace({
      contractJoined: {
        finalizedDeployTxData: deployedMedExContract.deployTxData.public,
      },
    });

    return new MedExAPI(deployedMedExContract, providers, logger);
  }

  private static async getPrivateState(
    providers: MedExProviders,
    contractAddress: ContractAddress,
  ): Promise<MedExPrivateState> {
    providers.privateStateProvider.setContractAddress(contractAddress);
    const existingPrivateState = await providers.privateStateProvider.get(medexPrivateStateKey);
    return existingPrivateState ?? createMedExPrivateState(utils.randomBytes(32));
  }
}

export const BBoardAPI = MedExAPI;

export * as utils from './utils/index.js';
export * from './common-types.js';
