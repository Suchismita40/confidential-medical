/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  type CoinPublicKey,
  DustSecretKey,
  type EncPublicKey,
  type FinalizedTransaction,
  LedgerParameters,
  ZswapSecretKeys,
  nativeToken,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { type MidnightProvider, type UnboundTransaction, type WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { ttlOneHour, toHex } from '@midnight-ntwrk/midnight-js-utils';
import { type WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import type { Logger } from 'pino';
import * as Rx from 'rxjs';

import { getInitialShieldedState } from './wallet-utils.js';
import { type DustWalletOptions, type EnvironmentConfiguration, FluentWalletBuilder } from '@midnight-ntwrk/testkit-js';

type UnshieldedKeystore = {
  getPublicKey(): unknown;
  signData(payload: Uint8Array): string;
};

export class MidnightWalletProvider implements MidnightProvider, WalletProvider {
  logger: Logger;
  readonly env: EnvironmentConfiguration;
  readonly wallet: WalletFacade;
  readonly unshieldedKeystore: UnshieldedKeystore;
  readonly zswapSecretKeys: ZswapSecretKeys;
  readonly dustSecretKey: DustSecretKey;

  private constructor(
    logger: Logger,
    environmentConfiguration: EnvironmentConfiguration,
    wallet: WalletFacade,
    zswapSecretKeys: ZswapSecretKeys,
    dustSecretKey: DustSecretKey,
    unshieldedKeystore: UnshieldedKeystore,
  ) {
    this.logger = logger;
    this.env = environmentConfiguration;
    this.wallet = wallet;
    this.zswapSecretKeys = zswapSecretKeys;
    this.dustSecretKey = dustSecretKey;
    this.unshieldedKeystore = unshieldedKeystore;
  }

  getCoinPublicKey(): CoinPublicKey {
    return this.zswapSecretKeys.coinPublicKey;
  }

  getEncryptionPublicKey(): EncPublicKey {
    return this.zswapSecretKeys.encryptionPublicKey;
  }

  async balanceTx(tx: UnboundTransaction, ttl: Date = ttlOneHour()): Promise<FinalizedTransaction> {
    let recipe;
    try {
      recipe = await this.wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys: this.zswapSecretKeys,
          dustSecretKey: this.dustSecretKey,
        },
        { ttl },
      );
    } catch (err: unknown) {
      this.logger.info(
        `Dust balancing note: ${err instanceof Error ? err.message : String(err)}. Balancing transaction with unshielded token coins...`,
      );
      recipe = await this.wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys: this.zswapSecretKeys,
          dustSecretKey: this.dustSecretKey,
        },
        { ttl, tokenKindsToBalance: ['shielded', 'unshielded'] },
      );
    }
    const signedRecipe = await this.wallet.signRecipe(recipe, (payload) => this.unshieldedKeystore.signData(payload));
    return this.wallet.finalizeRecipe(signedRecipe);
  }

  async registerDustIfNecessary(): Promise<string | undefined> {
    const unshieldedRaw = nativeToken().raw;
    const syncedState = await Rx.firstValueFrom(this.wallet.state());
    const availableCoins = syncedState.unshielded.availableCoins || [];
    const unregistered = availableCoins.filter(
      (coin) => coin.utxo.type === unshieldedRaw && coin.meta.registeredForDustGeneration === false,
    );
    if (unregistered.length > 0) {
      this.logger.info(`Registering ${unregistered.length} NIGHT UTXO(s) for DUST generation...`);
      try {
        const recipe = await this.wallet.registerNightUtxosForDustGeneration(
          unregistered,
          this.unshieldedKeystore.getPublicKey() as any,
          (payload) => this.unshieldedKeystore.signData(payload),
        );
        const finalized = await this.wallet.finalizeRecipe(recipe);
        const txId = await this.wallet.submitTransaction(finalized);
        this.logger.info(`Dust registration transaction submitted on-chain! TxId: ${txId}`);
        return txId;
      } catch (err: unknown) {
        this.logger.warn(`Dust registration note: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      this.logger.info(`NIGHT UTXOs already registered for dust generation.`);
    }
    return undefined;
  }

  async submitTx(tx: FinalizedTransaction): Promise<string> {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 10; attempt++) {
      try {
        const submittedId = await this.wallet.submitTransaction(tx);
        let hex = typeof submittedId === 'string' ? submittedId : toHex(submittedId);
        if (hex.length > 64) hex = hex.slice(-64);
        else if (hex.length < 64) hex = hex.padStart(64, '0');
        this.logger.info(`Transaction submitted successfully on-chain! TxHash: ${hex}`);
        return hex;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.info(`Submit attempt ${attempt}/10 note: ${msg}`);
        lastError = err instanceof Error ? err : new Error(String(err));
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
    throw lastError || new Error('Transaction submission failed on Midnight Preprod network');
  }

  async start(): Promise<void> {
    this.logger.info('Starting wallet...');
    await this.wallet.start(this.zswapSecretKeys, this.dustSecretKey);
  }

  async stop(): Promise<void> {
    return this.wallet.stop();
  }

  static async build(logger: Logger, env: EnvironmentConfiguration, seed?: string): Promise<MidnightWalletProvider> {
    const dustOptions: DustWalletOptions = {
      ledgerParams: LedgerParameters.initialParameters(),
      additionalFeeOverhead: env.walletNetworkId === 'undeployed' ? 500_000_000_000_000_000n : 1_000n,
      feeBlocksMargin: 5,
    };
    const builder = FluentWalletBuilder.forEnvironment(env).withDustOptions(dustOptions);
    const buildResult = seed
      ? await builder.withSeed(seed).buildWithoutStarting()
      : await builder.withRandomSeed().buildWithoutStarting();
    const { wallet, seeds, keystore } = buildResult as unknown as {
      wallet: WalletFacade;
      seeds: { masterSeed: string; shielded: Uint8Array; dust: Uint8Array };
      keystore: UnshieldedKeystore;
    };

    const initialState = await getInitialShieldedState(logger, wallet.shielded);
    logger.info(
      `Your wallet seed is: ${seeds.masterSeed} and your address is: ${initialState.address.coinPublicKeyString()}`,
    );

    return new MidnightWalletProvider(
      logger,
      env,
      wallet,
      ZswapSecretKeys.fromSeed(seeds.shielded),
      DustSecretKey.fromSeed(seeds.dust),
      keystore,
    );
  }
}
