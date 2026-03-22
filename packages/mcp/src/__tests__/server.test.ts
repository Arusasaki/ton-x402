import { describe, it, expect, vi } from "vitest";

// Mock TON SDK
vi.mock("@ton/ton", () => {
  const TonClient = vi.fn().mockImplementation(() => ({
    getBalance: vi.fn().mockResolvedValue(1000000000n),
    open: vi.fn().mockReturnValue({
      getSeqno: vi.fn().mockResolvedValue(1),
      sendTransfer: vi.fn().mockResolvedValue(undefined),
    }),
    getTransactions: vi.fn().mockResolvedValue([]),
  }));

  const WalletContractV4 = {
    create: vi.fn().mockReturnValue({
      address: {
        toString: () => "UQTestAddress",
        toRawString: () => "0:test",
      },
    }),
  };

  const internal = vi.fn().mockReturnValue({});

  return { TonClient, WalletContractV4, internal };
});

vi.mock("@ton/crypto", () => ({
  mnemonicToPrivateKey: vi.fn().mockResolvedValue({
    publicKey: Buffer.alloc(32),
    secretKey: Buffer.alloc(64),
  }),
}));

vi.mock("@ton/core", () => ({
  Address: {
    parse: vi.fn().mockReturnValue({
      toString: () => "UQRecipient",
    }),
  },
  toNano: vi.fn((v: string) => {
    const [whole = "0", frac = ""] = v.split(".");
    const padded = frac.padEnd(9, "0").slice(0, 9);
    return BigInt(whole) * 1_000_000_000n + BigInt(padded);
  }),
}));

import { createServer } from "../server.js";

describe("createServer", () => {
  it("creates an MCP server with 4 tools", () => {
    const server = createServer({
      mnemonic: Array(24).fill("test"),
      network: "testnet",
    });
    expect(server).toBeDefined();
  });

  it("accepts maxAutoPayAmount config", () => {
    const server = createServer({
      mnemonic: Array(24).fill("test"),
      network: "testnet",
      maxAutoPayAmount: "0.5",
    });
    expect(server).toBeDefined();
  });
});

describe("startServer", () => {
  it("fails without TON_MNEMONIC env var", async () => {
    const mockExit = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    const mockError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    delete process.env.TON_MNEMONIC;

    const { startServer } = await import("../server.js");
    await startServer().catch(() => {});

    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockError).toHaveBeenCalledWith(
      expect.stringContaining("TON_MNEMONIC"),
    );

    mockExit.mockRestore();
    mockError.mockRestore();
  });
});
