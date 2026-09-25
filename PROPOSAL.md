# 🏥 Project Proposal: Private Medical Research Data Exchange

## 🎥 Demo Video
- **Walkthrough Video**: [https://youtu.be/kTp4SCK7wlk](https://youtu.be/kTp4SCK7wlk)

## 1. Problem Statement
Medical research institutions, pharmaceutical developers, and academic hospitals frequently need to collaborate and train machine learning models on clinical data. However, healthcare data sharing faces severe legal, ethical, and cryptographic roadblocks:
- **HIPAA, GDPR, and Common Rule Compliance**: Exposing patient records or metadata on public blockchains is illegal and violates medical privacy.
- **Credential & License Exposure**: Medical researchers must prove their qualifications without publishing their personal identities, licenses, or institutional keys publicly.
- **Unauthorized Bulk Scraping**: Traditional permission models fail to enforce cryptographic access quotas per research session.

## 2. The Solution: Private Medical Research Data Exchange
A decentralized, privacy-first clinical dataset exchange built on the **Midnight Network** using the **Compact** smart contract language.

Key Capabilities:
- **Zero-Knowledge Dataset Registration**: Hospitals publish anonymized clinical cohorts with on-chain metadata categorization (*Oncology*, *Cardiology*, *Genomics*, *Neurology*).
- **Private Witness Authentication**: Researchers prove possession of medical credentials and authorized identity keys without disclosing them on the public ledger.
- **Rate-Limited Access Quotas**: Smart contracts strictly enforce access quotas (`maxAccessLimit` / `accessCount`) per dataset to prevent bulk scraping.
- **Cryptographic Quota Renewal**: Authorized dataset owners can extend researcher quotas dynamically.
- **Selective Disclosure Engine**: Interactive transparency toggle demonstrating the exact boundary between public ledger state and private ZK witnesses.

## 3. Why Midnight?
Midnight's dual-state architecture (private witness state + public ledger state) makes it the ideal platform for regulated healthcare applications:
- **Private Witnesses**: Remain in the researcher's browser/client environment.
- **Public State**: Immutable cryptographic commitments, sequence counters, access limits, and proof hashes.
- **Proof Server**: Generates zero-knowledge SNARK proofs locally or via trusted proof servers before submitting balanced transactions to the Substrate ledger.

## 4. Smart Contract Architecture (Compact Circuits)
The contract defines 6 zero-knowledge circuits in `contract/src/medex.compact`:
1. `registerDataset(title: Opaque<"string">, category: Opaque<"string">)`: Initializes a dataset with category and default access quota.
2. `requestAccess(datasetId: Bytes[32])`: Submits researcher proof of authorization.
3. `grantPermission(datasetId: Bytes[32], researcherPk: Bytes[32])`: Dataset owner grants permission.
4. `submitAccessProof(datasetId: Bytes[32], patientRecordHash: Bytes[32])`: Enforces `accessCount < maxAccessLimit` quota check and registers proof hash on-chain.
5. `renewAccessQuota(datasetId: Bytes[32], additionalQuota: Uint<32>)`: Verified owner increases dataset quota limit.
6. `revokeAccess(datasetId: Bytes[32])`: Revokes researcher permissions immediately.

## 5. Official Midnight Preprod Deployment
- **Network**: Official Midnight Preprod (`preprod`)
- **Contract Address**: `c4e4778c4b3d516bd43569b30f7e1ca6dbea268c5e997bb7473f77c9f88085cc`
- **Deployment Transaction Hash**: `029aca25da2c63f4a7b80989088c7a18661344e6fcead0e01538eee1006474d9`
- **Deployment Block Height**: `2707342`
- **Deployer Public Address**: `mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv`
- **Explorer**: [Midnight Preprod Explorer](https://preprod.midnightexplorer.com/contracts/c4e4778c4b3d516bd43569b30f7e1ca6dbea268c5e997bb7473f77c9f88085cc)

## 6. Frontend & User Experience
- **Framework**: Next.js App Router (14.2+) with TypeScript.
- **Design System**: Refined Clinical Obsidian & Teal dark mode palette (`#040711`, `#0D9488`, `#14B8A6`), institutional glassmorphism, responsive navigation shell, and accessibility-compliant UI primitives.
- **Wallet**: Authentic Midnight Lace Wallet integration (`window.midnight.mnLace`).

## 7. Verification & Testing
- **Test Suite**: 14/14 comprehensive Vitest unit tests (wallet-lifecycle + medex) covering all circuits, quotas, and permissions.
- **Next.js Production Build**: Static export (`output: 'export'`) verified with 0 errors.
- **CI/CD**: GitHub Actions pipeline for automated compilation, linting, testing, and secret leak scanning.
