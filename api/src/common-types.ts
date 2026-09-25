// Private Medical Research Data Exchange (MedEx) Common Types

import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { State, MedExPrivateState, Contract, Witnesses } from '@midnight-ntwrk/bboard-contract';

export type ContractAddress = string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Logger = any;

export const medexPrivateStateKey = 'medexPrivateState';
export const bboardPrivateStateKey = medexPrivateStateKey;
export type PrivateStateId = typeof medexPrivateStateKey;

export type PrivateStates = {
  readonly medexPrivateState: MedExPrivateState;
};

export type MedExContract = Contract<MedExPrivateState, Witnesses<MedExPrivateState>>;
export type BBoardContract = MedExContract;

export type MedExCircuitKeys = Exclude<keyof MedExContract['impureCircuits'], number | symbol>;
export type BBoardCircuitKeys = MedExCircuitKeys;

export type MedExProviders = MidnightProviders<MedExCircuitKeys, PrivateStateId, MedExPrivateState>;
export type BBoardProviders = MedExProviders;

export type DeployedMedExContract = FoundContract<MedExContract>;
export type DeployedBBoardContract = DeployedMedExContract;

export type MedExDerivedState = {
  readonly state: State;
  readonly sequence: bigint;
  readonly datasetTitle: string | undefined;
  readonly datasetCategory: string | undefined;
  readonly datasetCount: bigint;
  readonly activeResearcherPk: Uint8Array;
  readonly auditLogCount: bigint;
  readonly lastProofHash: Uint8Array;
  readonly maxAccessLimit: bigint;
  readonly accessCount: bigint;
  readonly isOwner: boolean;
};
export type BBoardDerivedState = MedExDerivedState;
