// Private Medical Research Data Exchange (MedEx) Witness Provider
// Copyright (C) Midnight Foundation

import { Ledger } from "./managed/medex/contract/index.js";
import { WitnessContext } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";

export type MedExPrivateState = {
  readonly secretKey: Uint8Array;
  readonly medicalCredentialSecret: Uint8Array;
  readonly patientRecordKey: Uint8Array;
};

export type BBoardPrivateState = MedExPrivateState;

export const createMedExPrivateState = (
  secretKey: Uint8Array,
  medicalCredentialSecret?: Uint8Array,
  patientRecordKey?: Uint8Array,
): MedExPrivateState => ({
  secretKey,
  medicalCredentialSecret: medicalCredentialSecret ?? secretKey,
  patientRecordKey: patientRecordKey ?? secretKey,
});

export const createBBoardPrivateState = createMedExPrivateState;

export const witnesses = {
  localSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, MedExPrivateState>): [
    MedExPrivateState,
    Uint8Array,
  ] => [privateState, privateState.secretKey],
  medicalCredentialSecret: ({
    privateState,
  }: WitnessContext<Ledger, MedExPrivateState>): [
    MedExPrivateState,
    Uint8Array,
  ] => [privateState, privateState.medicalCredentialSecret],
  patientRecordKey: ({
    privateState,
  }: WitnessContext<Ledger, MedExPrivateState>): [
    MedExPrivateState,
    Uint8Array,
  ] => [privateState, privateState.patientRecordKey],
};
