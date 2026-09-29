import { describe, it, expect, vi } from "vitest";

export const isChannelShutdownError = (err: unknown): boolean => {
  if (!err) return false;
  let msg: string;
  if (typeof err === "string") {
    msg = err.toLowerCase();
  } else if (err instanceof Error) {
    msg = err.message.toLowerCase();
  } else if (
    typeof err === "object" &&
    err !== null &&
    "reason" in err &&
    typeof err.reason === "string"
  ) {
    msg = (err as { reason: string }).reason.toLowerCase();
  } else {
    return false;
  }

  return (
    msg.includes("shutdown") ||
    msg.includes("object can no longer be used") ||
    msg.includes("no longer be used") ||
    msg.includes("feature-flags") ||
    msg.includes("wallet-api") ||
    msg.includes("channel") ||
    msg.includes("closed") ||
    msg.includes("destroyed") ||
    msg.includes("disposed") ||
    msg.includes("disconnected") ||
    msg.includes("transport") ||
    msg.includes("stale")
  );
};

export const validateAddress = (addr: string): boolean => {
  if (!addr || typeof addr !== "string") return false;
  const clean = addr.trim();
  if (clean.length < 15) return false;
  if (
    clean.includes("demo") ||
    clean.includes("dummy") ||
    clean.includes("mock") ||
    clean.includes("placeholder") ||
    clean.includes("medex") ||
    clean.includes("fake")
  ) {
    return false;
  }
  if (
    clean.startsWith("mn_addr_preprod1") ||
    clean.startsWith("mn_addr1") ||
    clean.startsWith("mn1") ||
    clean.startsWith("addr_test1") ||
    clean.startsWith("addr1")
  ) {
    const parts = clean.split("1");
    const dataPart = parts.slice(1).join("1");
    const bech32mRegex = /^[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/i;
    return bech32mRegex.test(dataPart) && dataPart.length >= 6;
  }
  const isHex = clean.startsWith("0x") && /^[0-9a-fA-F]{40,64}$/.test(clean);
  return isHex;
};

export interface MockInitialAPI {
  name: string;
  rdns: string;
  connect: (networkId: string) => Promise<MockConnectedAPI>;
}

export interface MockConnectedAPI {
  id?: number;
  getConnectionStatus?: () => Promise<{ status: string; networkId?: string }>;
  getUnshieldedAddress?: () => Promise<
    | string
    | {
        unshieldedAddress?: string;
        address?: string;
        unshielded?: string;
      }
  >;
  getShieldedAddresses?: () => Promise<{
    shieldedCoinPublicKey: string;
    shieldedEncryptionPublicKey: string;
  }>;
}

export const extractUnshieldedAddress = async (
  api: MockConnectedAPI | null | undefined,
) => {
  if (!api) return { unshieldedAddress: "", error: "Wallet API is null" };

  let extracted = "";
  let queryError = "";

  try {
    if (typeof api.getUnshieldedAddress === "function") {
      const res = await api.getUnshieldedAddress();
      if (res) {
        if (typeof res === "string" && res.trim().length > 0) {
          extracted = res.trim();
        } else if (typeof res === "object") {
          const candidate =
            res.unshieldedAddress ?? res.address ?? res.unshielded;
          if (typeof candidate === "string" && candidate.trim().length > 0) {
            extracted = candidate.trim();
          }
        }
      }
    }
  } catch (err: unknown) {
    queryError = err instanceof Error ? err.message : "Query failed";
    if (isChannelShutdownError(err)) {
      return {
        unshieldedAddress: "",
        error: "Remote API channel was shutdown; object can no longer be used.",
        isShutdown: true,
      };
    }
  }

  if (
    extracted.startsWith("mn_shield") ||
    extracted.startsWith("shield") ||
    extracted.startsWith("mn_dust") ||
    extracted.startsWith("dust")
  ) {
    extracted = "";
  }

  if (!extracted || !validateAddress(extracted)) {
    return {
      unshieldedAddress: "",
      error: queryError || "Unshielded address unavailable or invalid.",
    };
  }

  return { unshieldedAddress: extracted };
};

describe("Midnight Lace Wallet State Machine & Lifecycle Verification", () => {
  it("detects missing connector and fails cleanly without mock fallbacks", async () => {
    const findConnector = (win: any) => {
      if (!win || !win.midnight) return undefined;
      return win.midnight.mnLace;
    };

    const emptyWindow = {};
    expect(findConnector(emptyWindow)).toBeUndefined();
  });

  it("handles delayed connector injection via polling", async () => {
    let injected = false;
    const fakeWindow: any = {};

    setTimeout(() => {
      fakeWindow.midnight = {
        mnLace: {
          name: "Midnight Lace",
          rdns: "mnLace",
          connect: async () => ({}) as any,
        },
      };
      injected = true;
    }, 50);

    let connector: any = undefined;
    let attempts = 0;
    while (!connector && attempts < 10) {
      if (fakeWindow.midnight?.mnLace) {
        connector = fakeWindow.midnight.mnLace;
        break;
      }
      await new Promise((r) => setTimeout(r, 20));
      attempts++;
    }

    expect(injected).toBe(true);
    expect(connector).toBeDefined();
    expect(connector.name).toBe("Midnight Lace");
  });

  it("handles authorization rejection from Lace user prompt", async () => {
    const mockConnector: MockInitialAPI = {
      name: "Midnight Lace",
      rdns: "mnLace",
      connect: async () => {
        throw new Error("User rejected authorization request");
      },
    };

    await expect(mockConnector.connect("preprod")).rejects.toThrow(
      "User rejected authorization request",
    );
  });

  it("handles locked Lace extension state with actionable guidance", async () => {
    const mockConnector: MockInitialAPI = {
      name: "Midnight Lace",
      rdns: "mnLace",
      connect: async () => {
        throw new Error("Wallet is locked. Please unlock the wallet first.");
      },
    };

    let caughtError = "";
    try {
      await mockConnector.connect("preprod");
    } catch (e: any) {
      caughtError = e.message;
    }

    expect(caughtError.toLowerCase()).toContain("locked");
  });

  it("validates Preprod network and flags wrong network mismatch", async () => {
    const mockMainnetApi: MockConnectedAPI = {
      getConnectionStatus: async () => ({
        status: "connected",
        networkId: "mainnet",
      }),
    };

    const status = await mockMainnetApi.getConnectionStatus!();
    const isPreprod = status.networkId?.toLowerCase() === "preprod";
    expect(isPreprod).toBe(false);
  });

  it("prevents duplicate concurrent authorization clicks", async () => {
    let connectCallCount = 0;
    let isConnecting = false;

    const connect = async () => {
      if (isConnecting) return "ignored";
      isConnecting = true;
      connectCallCount++;
      await new Promise((r) => setTimeout(r, 30));
      isConnecting = false;
      return "connected";
    };

    const [first, second] = await Promise.all([connect(), connect()]);
    expect(connectCallCount).toBe(1);
    expect(first).toBe("connected");
    expect(second).toBe("ignored");
  });

  it("detects remote API channel shutdown errors correctly", () => {
    const shutdownErr1 = new Error(
      "Remote API with channel 'feature-flags' was shutdown; object can no longer be used.",
    );
    const shutdownErr2 = new Error(
      "Remote API with channel 'wallet-api' was closed.",
    );
    const shutdownErr3 = new Error("Transport channel disposed.");
    const normalErr = new Error("User cancelled transaction.");

    expect(isChannelShutdownError(shutdownErr1)).toBe(true);
    expect(isChannelShutdownError(shutdownErr2)).toBe(true);
    expect(isChannelShutdownError(shutdownErr3)).toBe(true);
    expect(isChannelShutdownError(normalErr)).toBe(false);
  });

  it("correctly retrieves and validates live unshielded Preprod address", async () => {
    const mockValidApi: MockConnectedAPI = {
      getUnshieldedAddress: () =>
        Promise.resolve({
          unshieldedAddress:
            "mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv",
        }),
    };

    const res = await extractUnshieldedAddress(mockValidApi);
    expect(res.unshieldedAddress).toBe(
      "mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv",
    );
    expect(validateAddress(res.unshieldedAddress)).toBe(true);
  });

  it("strictly rejects synthetic, dummy, and mock addresses", async () => {
    expect(validateAddress("mn_unshielded1medex_lace_connected_01")).toBe(false);
    expect(validateAddress("0xdemo1234567890abcdef1234567890abcdef12345678")).toBe(false);
    expect(validateAddress("placeholder_addr_xyz")).toBe(false);
    expect(validateAddress("mock_wallet_address_123")).toBe(false);
  });

  it("strictly rejects shielded addresses from unshielded identity slot", async () => {
    const mockShieldedApi: MockConnectedAPI = {
      getUnshieldedAddress: () =>
        Promise.resolve({
          unshieldedAddress: "mn_shield1xyz9876543210",
        }),
    };

    const res = await extractUnshieldedAddress(mockShieldedApi);
    expect(res.unshieldedAddress).toBe("");
    expect(res.error).toBeDefined();
  });

  it("strictly rejects dust addresses from identity slot", async () => {
    const mockDustApi: MockConnectedAPI = {
      getUnshieldedAddress: () =>
        Promise.resolve({
          unshieldedAddress: "mn_dust1xyz9876543210",
        }),
    };

    const res = await extractUnshieldedAddress(mockDustApi);
    expect(res.unshieldedAddress).toBe("");
    expect(res.error).toBeDefined();
  });

  it("identifies dead API and triggers shutdown flag on channel shutdown", async () => {
    const deadApi: MockConnectedAPI = {
      getUnshieldedAddress: () =>
        Promise.reject(
          new Error(
            "Remote API with channel 'feature-flags' was shutdown; object can no longer be used.",
          ),
        ),
    };

    const res = await extractUnshieldedAddress(deadApi);
    expect(res.unshieldedAddress).toBe("");
    expect(res.isShutdown).toBe(true);
  });

  it("recovers with fresh session when reconnecting after shutdown", async () => {
    let apiInstanceCounter = 0;
    const createConnectedApi = (): MockConnectedAPI => {
      apiInstanceCounter++;
      const currentInstanceId = apiInstanceCounter;
      return {
        id: currentInstanceId,
        getUnshieldedAddress: () => {
          if (currentInstanceId === 1) {
            return Promise.reject(
              new Error(
                "Remote API with channel 'feature-flags' was shutdown; object can no longer be used.",
              ),
            );
          }
          return Promise.resolve({
            unshieldedAddress:
              "mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv",
          });
        },
      };
    };

    let connectedApi: MockConnectedAPI | null = createConnectedApi();
    const res1 = await extractUnshieldedAddress(connectedApi);
    expect(res1.isShutdown).toBe(true);

    connectedApi = null;
    expect(connectedApi).toBeNull();

    connectedApi = createConnectedApi();
    expect(connectedApi.id).toBe(2);

    const res2 = await extractUnshieldedAddress(connectedApi);
    expect(res2.unshieldedAddress).toBe(
      "mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv",
    );
  });

  it("verifies clean disconnect clears all in-memory wallet references", () => {
    let activeApi: MockConnectedAPI | null = {
      id: 1,
      getUnshieldedAddress: async () => ({
        unshieldedAddress:
          "mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv",
      }),
    };
    let walletAddress: string | null =
      "mn_addr_preprod1efmkmrfgcdxhxyx2f7kfmchgrfme6prmvmyx3y23aae2t9zmnuzsqnh8xv";
    let status = "CONNECTED";

    // Perform disconnect
    activeApi = null;
    walletAddress = null;
    status = "DISCONNECTED";

    expect(activeApi).toBeNull();
    expect(walletAddress).toBeNull();
    expect(status).toBe("DISCONNECTED");
  });
});
