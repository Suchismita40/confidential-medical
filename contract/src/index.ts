// Private Medical Research Data Exchange (MedEx) Smart Contract
// Copyright (C) Midnight Foundation

import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";

export * from "./managed/medex/contract/index.js";
export * from "./witnesses.js";

import * as CompiledMedExContract from "./managed/medex/contract/index.js";
import * as Witnesses from "./witnesses.js";

export const CompiledMedExContractContract = CompiledContract.make<
  CompiledMedExContract.Contract<Witnesses.MedExPrivateState>
>("MedEx", CompiledMedExContract.Contract<Witnesses.MedExPrivateState>).pipe(
  CompiledContract.withWitnesses(Witnesses.witnesses),
  CompiledContract.withCompiledFileAssets("./managed/medex"),
);

export const CompiledBBoardContractContract = CompiledMedExContractContract;
export type MedExContract =
  CompiledMedExContract.Contract<Witnesses.MedExPrivateState>;
export type BBoardContract = MedExContract;
