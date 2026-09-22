import { describe, it, expect } from 'vitest';

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

export const extractUnshieldedAddress = async (api: any) => {
  if (!api) return { unshieldedAddress: '', error: 'Wallet API is null' };

  let extracted = '';
  let queryError = '';

  try {
    if (typeof api.getUnshieldedAddress === 'function') {
      const res = await api.getUnshieldedAddress();
      if (res) {
        if (typeof res === 'string' && res.trim().length > 0) {
          extracted = res.trim();
        } else if (typeof res === 'object') {
          const candidate = res.unshieldedAddress || res.address || res.unshielded;
          if (typeof candidate === 'string' && candidate.trim().length > 0) {
            extracted = candidate.trim();
          }
        }
      }
    }
  } catch (err: any) {
    queryError = err?.message || String(err);
    if (isChannelShutdownError(err)) {
      return {
        unshieldedAddress: '',
        error: 'Remote API channel was shutdown; object can no longer be used.',
        isShutdown: true,
      };
    }
  }

  if (
    extracted.startsWith('mn_shield') ||
    extracted.startsWith('shield') ||
    extracted.startsWith('mn_dust') ||
    extracted.startsWith('dust')
  ) {
    extracted = '';
  }

  if (!extracted) {
    return {
      unshieldedAddress: '',
      error: queryError || 'Unshielded address unavailable.',
    };
  }

  return { unshieldedAddress: extracted };
};

describe('Midnight Lace Wallet Session & Remote API Lifecycle', () => {
  it('detects remote API channel shutdown errors correctly', () => {
    const shutdownErr1 = new Error("Remote API with channel 'feature-flags' was shutdown; object can no longer be used.");
    const shutdownErr2 = new Error("Remote API with channel 'wallet-api' was closed.");
    const shutdownErr3 = new Error("Transport channel disposed.");
    const normalErr = new Error("User cancelled transaction.");

    expect(isChannelShutdownError(shutdownErr1)).toBe(true);
    expect(isChannelShutdownError(shutdownErr2)).toBe(true);
    expect(isChannelShutdownError(shutdownErr3)).toBe(true);
    expect(isChannelShutdownError(normalErr)).toBe(false);
  });

  it('correctly retrieves and validates live unshielded address', async () => {
    const mockValidApi = {
      getUnshieldedAddress: async () => ({
        unshieldedAddress: 'mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv',
      }),
    };

    const res = await extractUnshieldedAddress(mockValidApi);
    expect(res.unshieldedAddress).toBe('mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv');
    expect(res.isShutdown).toBeUndefined();
  });

  it('strictly rejects shielded addresses from identity slot', async () => {
    const mockShieldedApi = {
      getUnshieldedAddress: async () => ({
        unshieldedAddress: 'mn_shield1xyz9876543210',
      }),
    };

    const res = await extractUnshieldedAddress(mockShieldedApi);
    expect(res.unshieldedAddress).toBe('');
    expect(res.error).toBeDefined();
  });

  it('strictly rejects dust addresses from identity slot', async () => {
    const mockDustApi = {
      getUnshieldedAddress: async () => ({
        unshieldedAddress: 'mn_dust1xyz9876543210',
      }),
    };

    const res = await extractUnshieldedAddress(mockDustApi);
    expect(res.unshieldedAddress).toBe('');
    expect(res.error).toBeDefined();
  });

  it('identifies dead API and triggers shutdown flag on channel shutdown', async () => {
    const deadApi = {
      getUnshieldedAddress: async () => {
        throw new Error("Remote API with channel 'feature-flags' was shutdown; object can no longer be used.");
      },
    };

    const res = await extractUnshieldedAddress(deadApi);
    expect(res.unshieldedAddress).toBe('');
    expect(res.isShutdown).toBe(true);
  });

  it('recovers with fresh session when reconnecting after shutdown', async () => {
    let apiInstanceCounter = 0;
    const createConnectedApi = () => {
      apiInstanceCounter++;
      const currentInstanceId = apiInstanceCounter;
      return {
        id: currentInstanceId,
        getUnshieldedAddress: async () => {
          if (currentInstanceId === 1) {
            throw new Error("Remote API with channel 'feature-flags' was shutdown; object can no longer be used.");
          }
          return { unshieldedAddress: 'mn_addr_preprod1freshAddressAfterReconnection' };
        },
      };
    };

    // First attempt gets instance 1 which fails due to shutdown
    let connectedApi: any = createConnectedApi();
    const res1 = await extractUnshieldedAddress(connectedApi);
    expect(res1.isShutdown).toBe(true);

    // Invalidate stale session
    connectedApi = null;
    expect(connectedApi).toBeNull();

    // Reconnection creates fresh instance (instance 2)
    connectedApi = createConnectedApi();
    expect(connectedApi.id).toBe(2);

    // Fresh instance succeeds
    const res2 = await extractUnshieldedAddress(connectedApi);
    expect(res2.unshieldedAddress).toBe('mn_addr_preprod1freshAddressAfterReconnection');
    expect(res2.isShutdown).toBeUndefined();
  });
});
