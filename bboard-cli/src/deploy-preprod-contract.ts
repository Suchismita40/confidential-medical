/* eslint-disable @typescript-eslint/no-explicit-any */
import { WebSocket } from 'ws';
(globalThis as any).WebSocket = WebSocket;

import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import {
  ZswapSecretKeys,
  DustSecretKey,
  LedgerParameters,
  unshieldedToken,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import {
  WalletFacade,
  DustWallet,
  HDWallet,
  Roles,
  ShieldedWallet,
  createKeystore,
  NoOpTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { type MedExProviders, type PrivateStateId, medexPrivateStateKey } from '../../api/src/index.js';
import {
  type MedExPrivateState,
  createMedExPrivateState,
  CompiledMedExContractContract,
} from '../../contract/src/index.js';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import https from 'node:https';
import { currentDir } from './config.js';

setNetworkId('preprod');

const ENV_FILE = path.resolve(currentDir, '..', '.env.local');

function getSeed(): string {
  if (process.env.PREPROD_WALLET_SEED) return process.env.PREPROD_WALLET_SEED;
  if (process.env.WALLET_SEED) return process.env.WALLET_SEED;

  if (fs.existsSync(ENV_FILE)) {
    const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
    const match = envContent.match(/PREPROD_WALLET_SEED=([a-f0-9]{64})/i);
    if (match && match[1]) return match[1];
  }

  const fallbackSeed = '9bc108daefc13b5875550479e540e6cf4d535459b0c3c842ea7d3e90370c434f';
  fs.writeFileSync(ENV_FILE, `PREPROD_WALLET_SEED=${fallbackSeed}\n`, { flag: 'a' });
  return fallbackSeed;
}

const SEED = getSeed();
const RESULT_FILE = path.resolve(currentDir, '..', 'preprod-deployment-result.json');
const ROOT_RESULT_FILE = path.resolve(currentDir, '..', '..', 'preprod-deployment-result.json');

const envConfiguration: EnvironmentConfiguration = {
  walletNetworkId: 'preprod',
  networkId: 'preprod',
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  nodeWS: 'wss://rpc.preprod.midnight.network',
  faucet: 'https://midnight-tmnight-preprod.nethermind.dev/',
  proofServer: 'https://proof-server.preprod.midnight.network',
};

function deriveKeys(seed: string) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdWallet.hdWallet.clear();
  return result.keys;
}

function loadState(kind: string): any {
  const file = path.resolve(currentDir, '..', '..', '.midnight-wallet-state', 'preprod', `${kind}.json`);
  if (fs.existsSync(file)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'));
      return parsed.state;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

async function saveWalletState(wallet: WalletFacade) {
  const dir = path.resolve(currentDir, '..', '..', '.midnight-wallet-state', 'preprod');
  fs.mkdirSync(dir, { recursive: true });
  try {
    const s = await (wallet.shielded as any).serializeState();
    fs.writeFileSync(path.join(dir, 'shielded.json'), JSON.stringify({ version: 1, state: s }));
  } catch {
    /* ignore state serialization error */
  }
  try {
    const u = await (wallet.unshielded as any).serializeState();
    fs.writeFileSync(path.join(dir, 'unshielded.json'), JSON.stringify({ version: 1, state: u }));
  } catch {
    /* ignore state serialization error */
  }
  try {
    const d = await (wallet.dust as any).serializeState();
    fs.writeFileSync(path.join(dir, 'dust.json'), JSON.stringify({ version: 1, state: d }));
  } catch {
    /* ignore state serialization error */
  }
}

async function queryIndexer(gqlQuery: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: gqlQuery });
    const req = https.request(
      envConfiguration.indexer,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve({ raw: body });
          }
        });
      },
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('\n============================================================');
  console.log('   MIDNIGHT PREPROD DEPLOYMENT — MEDEX SMART CONTRACT       ');
  console.log('============================================================\n');

  const keys = deriveKeys(SEED);
  const networkId = getNetworkId();
  const shieldedSecretKeys = ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);

  const walletConfig = {
    networkId,
    indexerClientConnection: {
      indexerHttpUrl: envConfiguration.indexer,
      indexerWsUrl: envConfiguration.indexerWS,
    },
    provingServerUrl: new URL(envConfiguration.proofServer),
    relayURL: new URL(envConfiguration.node.replace(/^http/, 'ws')),
    txHistoryStorage: new NoOpTransactionHistoryStorage(),
    costParameters: {
      feeBlocksMargin: 10,
      additionalFeeOverhead: 10_000_000_000_000_000n,
    },
  };

  console.log('1. Initializing Wallet Facade from synced cache...');
  const wallet = await WalletFacade.init({
    configuration: walletConfig,
    shielded: async (config) => {
      const cls = ShieldedWallet(config);
      const saved = loadState('shielded');
      if (saved) {
        try {
          return await (cls as any).restore(saved);
        } catch {
          /* ignore state serialization error */
        }
      }
      return cls.startWithSecretKeys(shieldedSecretKeys);
    },
    unshielded: async (config) => {
      const cls = UnshieldedWallet(config);
      const saved = loadState('unshielded');
      if (saved) {
        try {
          return await (cls as any).restore(saved);
        } catch {
          /* ignore state serialization error */
        }
      }
      return cls.startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));
    },
    dust: async (config) => {
      const cls = DustWallet(config);
      const saved = loadState('dust');
      if (saved) {
        try {
          return await (cls as any).restore(saved);
        } catch {
          /* ignore state serialization error */
        }
      }
      return cls.startWithSecretKey(dustSecretKey, LedgerParameters.initialParameters().dust);
    },
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);

  console.log('2. Synchronizing unshielded wallet with Midnight Preprod...');
  const unshieldedState = await wallet.unshielded.waitForSyncedState(500n);
  const dustState = await wallet.dust.waitForSyncedState(500n);
  void dustState;
  console.log('   ✓ Unshielded wallet synchronized with Preprod!');

  await saveWalletState(wallet);

  const deployerAddress = unshieldedKeystore.getBech32Address().toString();
  const nightTokenRaw = unshieldedToken().raw;
  const tNightBalance = unshieldedState.balances[nightTokenRaw] ?? 0n;

  console.log('   Deployer Address: ' + deployerAddress);
  console.log('   tNIGHT Balance:   ' + tNightBalance.toLocaleString());

  if (tNightBalance === 0n) {
    throw new Error('Deployer wallet ' + deployerAddress + ' has 0 tNIGHT. Please fund via faucet.');
  }

  console.log('3. Ready for on-chain contract deployment!');

  const zkConfigPath = path.resolve(currentDir, '..', '..', 'contract', 'src', 'managed', 'medex');
  const zkConfigProvider = new NodeZkConfigProvider<
    'registerDataset' | 'requestAccess' | 'grantPermission' | 'submitAccessProof' | 'renewAccessQuota' | 'revokeAccess'
  >(zkConfigPath);

  const accountId = crypto.createHash('sha256').update(SEED).digest('hex');
  const privateStateProvider = levelPrivateStateProvider<PrivateStateId, MedExPrivateState>({
    privateStateStoreName: `medex-private-state-preprod-${Date.now()}`,
    signingKeyStoreName: `medex-signing-keys-preprod-${Date.now()}`,
    privateStoragePasswordProvider: () => 'MedEx-Preprod-2026!',
    accountId,
  });

  const walletProvider = {
    getCoinPublicKey: () => shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => shieldedSecretKeys.encryptionPublicKey,
    balanceTx: async (tx: any, ttl?: Date) => {
      let recipe;
      try {
        recipe = await wallet.balanceUnboundTransaction(
          tx,
          { shieldedSecretKeys, dustSecretKey },
          { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
        );
      } catch (err) {
        console.log('Default dust balancing note:', err instanceof Error ? err.message : String(err));
        recipe = await wallet.balanceUnboundTransaction(
          tx,
          { shieldedSecretKeys, dustSecretKey },
          { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000), tokenKindsToBalance: ['dust', 'unshielded'] },
        );
      }
      const signed = await wallet.signRecipe(recipe, (payload) => unshieldedKeystore.signData(payload));
      return wallet.finalizeRecipe(signed);
    },
    submitTx: (tx: any) => wallet.submitTransaction(tx),
  };

  const providers: MedExProviders = {
    privateStateProvider,
    publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(envConfiguration.proofServer, zkConfigProvider),
    walletProvider: walletProvider,
    midnightProvider: walletProvider,
  };

  console.log('4. Submitting MedEx Deployment Transaction to Midnight Preprod...');
  console.log('   Deploying medex.compact on-chain (single direct attempt)...');
  const deployed = await deployContract(providers, {
    compiledContract: CompiledMedExContractContract,
    privateStateId: medexPrivateStateKey,
    initialPrivateState: createMedExPrivateState(crypto.randomBytes(32)),
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  const txHash = deployed.deployTxData.public.txHash;
  const blockHeight = deployed.deployTxData.public.blockHeight;

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║         ✅ MEDEX CONTRACT DEPLOYED ON PREPROD!               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`  Contract Name:        medex.compact`);
  console.log(`  Contract Address:     ${contractAddress}`);
  console.log(`  Deployment Tx Hash:   ${txHash}`);
  console.log(`  Deployment Block:     ${blockHeight}`);
  console.log(`  Deployer Address:     ${deployerAddress}`);
  console.log(`  Explorer URL:         https://preprod.midnightexplorer.com/contract/${contractAddress}\n`);

  console.log('5. Double Live Preprod Indexer Verification...');
  let verifiedOnIndexer = false;
  for (let i = 1; i <= 20; i++) {
    const res = await queryIndexer(`query { contractAction(address: "${contractAddress}") { address state } }`);
    const ca = res?.data?.contractAction;
    if (ca && ca.address === contractAddress) {
      console.log(`  ✓ Check ${i}: contractAction independently confirmed on live indexer!`);
      verifiedOnIndexer = true;
      break;
    }
    console.log(`  ... waiting for indexer confirmation (poll ${i}/20)`);
    await new Promise((r) => setTimeout(r, 3000));
  }

  if (!verifiedOnIndexer) {
    throw new Error(
      `Double verification failed: contractAction for ${contractAddress} could not be resolved on indexer.`,
    );
  }

  const result = {
    status: 'SUCCESS',
    networkId: 'preprod',
    contractName: 'medex',
    contractAddress: contractAddress,
    deploymentTxHash: txHash,
    deploymentBlockHeight: blockHeight,
    deployerAddress: deployerAddress,
    explorerUrl: `https://preprod.midnightexplorer.com/contract/${contractAddress}`,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(RESULT_FILE, JSON.stringify(result, null, 2));
  fs.writeFileSync(ROOT_RESULT_FILE, JSON.stringify(result, null, 2));

  // Update bboard-ui/.env.preprod
  const uiEnvPreprod = path.resolve(currentDir, '..', '..', 'bboard-ui', '.env.preprod');
  const envContent = `VITE_NETWORK_ID=preprod
VITE_INDEXER_URL=https://indexer.preprod.midnight.network/api/v4/graphql
VITE_INDEXER_WS_URL=wss://indexer.preprod.midnight.network/api/v4/graphql/ws
VITE_PROOF_SERVER_URL=https://proof-server.preprod.midnight.network
VITE_NODE_URL=https://rpc.preprod.midnight.network
VITE_CONTRACT_ADDRESS=${contractAddress}
`;
  fs.writeFileSync(uiEnvPreprod, envContent);

  console.log('  ✓ Updated preprod-deployment-result.json and bboard-ui/.env.preprod');

  await saveWalletState(wallet);
  await wallet.stop();
  console.log('\n─── MEDEX PREPROD DEPLOYMENT COMPLETE ────────────────────────\n');
}

main().catch((err: unknown) => {
  console.error('PREPROD DEPLOYMENT ERROR:', err instanceof Error ? err.message : String(err));
  fs.writeFileSync(
    RESULT_FILE,
    JSON.stringify(
      {
        status: 'ERROR',
        error: err instanceof Error ? err.message : String(err),
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
