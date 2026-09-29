# MEDEx — FINAL PRE-TRANSFER FORENSIC GATE REPORT

**Isolated Revision Workspace**: `/home/user/midnight-projects/private-medical-research-data-exchange-revision`  
**Protected Original Baseline**: `/home/user/midnight-projects/private-medical-research-data-exchange`  
**Network Target**: Midnight Preprod Testnet  
**Deployed Contract Address**: `c4e4778c4b3d516bd43569b30f7e1ca6dbea268c5e997bb7473f77c9f88085cc`  
**Date**: September 29, 2026  
**Final Verdict**: **VERIFIED**

---

## 1. Source-Level Verification of All 6 Operations

Every single live contract operation has been traced directly from the React UI handlers down to the compiled Compact contract circuit.

### Operation Trace Matrix

| Operation | UI Handler & File | Context Dispatcher | API Layer Method | Compact Contract Circuit | Lace Signing | ZK Proof Gen | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`registerDataset`** | `DatasetWorkspace.tsx:109` | `DeployedBoardContext.tsx:611` | `MedExAPI.registerDataset()` | `export circuit registerDataset` | REQUIRED | REQUIRED | **VERIFIED** |
| **`requestAccess`** | `DatasetWorkspace.tsx:283` | `DeployedBoardContext.tsx:727` | `MedExAPI.requestAccess()` | `export circuit requestAccess` | REQUIRED | REQUIRED | **VERIFIED** |
| **`grantPermission`** | `PermissionsView.tsx:193` | `DeployedBoardContext.tsx:824` | `MedExAPI.grantPermission()` | `export circuit grantPermission` | REQUIRED | REQUIRED | **VERIFIED** |
| **`submitAccessProof`** | `PermissionsView.tsx:206` | `DeployedBoardContext.tsx:921` | `MedExAPI.submitAccessProof()` | `export circuit submitAccessProof` | REQUIRED | REQUIRED | **VERIFIED** |
| **`renewAccessQuota`** | `PermissionsView.tsx:49` | `DeployedBoardContext.tsx:1018` | `MedExAPI.renewAccessQuota()` | `export circuit renewAccessQuota` | REQUIRED | REQUIRED | **VERIFIED** |
| **`revokeAccess`** | `PermissionsView.tsx:226` | `DeployedBoardContext.tsx:1113` | `MedExAPI.revokeAccess()` | `export circuit revokeAccess` | REQUIRED | REQUIRED | **VERIFIED** |

- **Confirmation Mechanism**: Received when `callTx` promise resolves upon Substrate block inclusion on Midnight Preprod.
- **Failure Propagation**: Caught in `try...catch` blocks within `DeployedBoardContext.tsx`, updating `txLifecycleStatus = 'FAILED'` and setting error message string.

---

## 2. Zero-Synthetic-Transaction Forensics

A complete repository-wide source inspection was conducted across `app/` and `src/` for prohibited synthetic patterns.

| Pattern Scanned | Total Occurrences | Category / Location | Verdict |
| :--- | :--- | :--- | :--- |
| `Math.random` | 1 | `DeployedBoardContext.tsx:666` (Mock sample size generator for demo metadata: `sampleSize: Math.floor(Math.random() * 3000) + 2000`) | **VERIFIED (Non-Tx UI Metadata)** |
| `setTimeout` | 27 | UI copy-button feedback timers (2000ms), wallet disconnect guards, and UI lifecycle state transitions (`PREPARING` → `WALLET_REQUEST` → `PROVING` → `SUBMITTING`) | **VERIFIED (Legitimate Timers)** |
| `setInterval` | 1 | `DeployedBoardContext.tsx:586` (Lace wallet status polling loop) | **VERIFIED (Polling Loop)** |
| `demo_tx` | 0 | None found in live transaction paths | **VERIFIED (Zero Found)** |
| `fakeTx` | 0 | None found | **VERIFIED (Zero Found)** |
| `0x...` (Synthetic) | 0 | None found in transaction hash outputs | **VERIFIED (Zero Found)** |

---

## 3. Transaction Confirmation & Hash Integrity

- **State Progression**: `IDLE` → `PREPARING` → `WALLET_REQUEST` → `PROVING` → `SUBMITTING` → `CONFIRMING` → `CONFIRMED` / `FAILED`.
- **Confirmation Integrity**: Transactions are NOT transitioned to `CONFIRMED` until actual block inclusion is returned from `callTx`.
- **Failure Invariance**: `FAILED` state cannot transition to `CONFIRMED`. Wallet cancellation, proof generation failure, or network rejection sets `phase: 'failed'` and logs the exact error message string.
- **Transaction Hash Representation**: Live transactions without finalized indexer hex hashes display `'Transaction pending'` or `'Pending indexer confirmation'`. Zero synthetic hashes (`0x...` random strings) are generated.

---

## 4. Lace Wallet Integration Forensic Check

The Lace Wallet DApp Connector v4 implementation in `BrowserDeployedBoardManager.ts` and `DeployedBoardContext.tsx` preserves all core security mechanics:
- **DApp Connector API**: Version 4 connector lookup (`window.midnight.mnLace`).
- **Network Validation**: Enforces network target `'preprod'`.
- **Address Filter**: Retrieves unshielded address (`state.unshieldedAddress`); rejects invalid or missing address structures.
- **Session Recovery & Protection**: Polling loop checks connection staleness (`STALE_SESSION`), handles window closing gracefully, and prevents duplicate-click concurrent submissions via boolean guards (`isSubmitting`).

---

## 5. Contract & Deployment Coordinate Preservation

- **Byte-for-Byte Compact Identity**:
  Command: `diff -s medex-contract/src/medex.compact /home/user/midnight-projects/private-medical-research-data-exchange/contract/src/medex.compact`  
  Output: `Files ... are identical` (**VERIFIED**).
- **Deployed Address Consistency**:
  Target Contract: `c4e4778c4b3d516bd43569b30f7e1ca6dbea268c5e997bb7473f77c9f88085cc`  
  Verified across `.env.preprod`, `.env.example`, `preprod-deployment-result.json`, `DeployedBoardContext.tsx`, `MainDashboard.tsx`, `Header.tsx`, `ActivityView.tsx`, `DocumentationView.tsx`, `README.md`. Zero address mutations.

---

## 6. Folder & Package Migration Verification

Authoritative monorepo packages:
- `medex-contract/`
- `medex-api/`
- `medex-ui/`
- `medex-cli/`

Zero stale imports or functional paths to legacy `contract/`, `bboard-ui/`, or `bboard-cli/` directories remain in application code (**VERIFIED**).

---

## 7. Frontend Design & Real vs Demo Data Separation

- **Nordic Slate & Emerald Implementation**:
  - Background: `#1A1B20` (`nordic-bg`)
  - Structural Panels: `#26292B` (`nordic-panel`), border `#363A3D` (`nordic-border`)
  - Primary Text: `#F2F4F5` (`primaryText`)
  - Secondary Text: `#A8AF92` (`nordic-olive`)
  - Emerald Accent: `#00FF85` (`emerald-accent`), used sparingly for verified/active states.
- **Truthful Data Badging**:
  - `[ON-CHAIN PREPROD]`: Emerald badge for live contract state and registered datasets.
  - `[DEMO SHOWCASE]`: Muted Nordic olive badge for preview cohorts.

---

## 8. Empirical Test & Build Results

| Verification Check | Target Command | Result | Status |
| :--- | :--- | :--- | :--- |
| **Unit Test Suite** | `npm run test` | **14/14 Passed** (wallet-lifecycle & medex tests) | **VERIFIED** |
| **UI Typecheck** | `npm --prefix medex-ui run typecheck` | **0 Errors** (`tsc -p tsconfig.json --noEmit`) | **VERIFIED** |
| **CLI Typecheck** | `npm --prefix medex-cli run typecheck` | **0 Errors** (`tsc -p tsconfig.json --noEmit`) | **VERIFIED** |
| **Production Build** | `npm run build` | **Clean Monorepo Build** (`medex-contract`, `medex-api`, `medex-ui`) | **VERIFIED** |

---

## 9. Original Repository Immutability Confirmation

Baseline Repository Path: `/home/user/midnight-projects/private-medical-research-data-exchange`

```bash
$ git status --short
# Output: (empty - 0 changes)

$ git rev-parse HEAD
57073e3c4a607ddb09873ff89489f8307e4dc31b
```

The original baseline repository is **100% clean and untouched** (**VERIFIED**).
