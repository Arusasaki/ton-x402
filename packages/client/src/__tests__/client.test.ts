import { describe, it, expect, vi, beforeEach } from "vitest";
import type { X402PaymentRequest } from "@ton-x402/core";

// Mock TON SDK
vi.mock("@ton/ton", () => {
  const TonClient = vi.fn().mockImplementation(() => ({
    getBalance: vi.fn().mockResolvedValue(1000000000n),
    open: vi.fn().mockReturnValue({
      getSeqno: vi.fn().mockResolvedValue(1),
      sendTransfer: vi.fn().mockResolvedValue(undefined),
    }),
    getTransactions: vi.fn().mockResolvedValue([
      {
        inMessage: {
          body: {
            toBoc: () => Buffer.from("boc"),
          },
        },
      },
    ]),
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

import { X402Client, X402PaymentError } from "../client.js";

describe("X402Client", () => {
  let client: X402Client;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new X402Client({
      mnemonic: Array(24).fill("test"),
      network: "testnet",
      maxAutoPayAmount: "1",
    });
  });

  describe("getAddress", () => {
    it("returns the wallet address", async () => {
      const address = await client.getAddress();
      expect(address).toBe("UQTestAddress");
    });
  });

  describe("getBalance", () => {
    it("returns balance in human-readable format", async () => {
      const balance = await client.getBalance();
      expect(balance).toBe("1");
    });
  });

  describe("fetch", () => {
    it("passes through non-402 responses", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "ok" }), {
        status: 200,
      });
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse);

      const response = await client.fetch("https://example.com/api");
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBe("ok");
    });

    it("passes through 402 responses without x402-ton protocol", async () => {
      const mockResponse = new Response("{}", { status: 402 });
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse);

      const response = await client.fetch("https://example.com/api");
      expect(response.status).toBe(402);
    });

    it("throws on expired payment request", async () => {
      const paymentRequest: X402PaymentRequest = {
        version: "1.0",
        network: "testnet",
        recipient: "UQRecipient",
        amount: "50000000",
        token: "TON",
        description: "Test",
        paymentId: "pay_123",
        expiresAt: Math.floor(Date.now() / 1000) - 100, // expired
      };

      const mockResponse = new Response(JSON.stringify(paymentRequest), {
        status: 402,
        headers: { "X-Payment-Protocol": "x402-ton" },
      });
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse);

      await expect(
        client.fetch("https://example.com/api"),
      ).rejects.toThrow(X402PaymentError);
    });

    it("throws when amount exceeds max auto-pay", async () => {
      const paymentRequest: X402PaymentRequest = {
        version: "1.0",
        network: "testnet",
        recipient: "UQRecipient",
        amount: "2000000000", // 2 TON > 1 TON max
        token: "TON",
        description: "Expensive",
        paymentId: "pay_456",
        expiresAt: Math.floor(Date.now() / 1000) + 300,
      };

      const mockResponse = new Response(JSON.stringify(paymentRequest), {
        status: 402,
        headers: { "X-Payment-Protocol": "x402-ton" },
      });
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse);

      await expect(
        client.fetch("https://example.com/api"),
      ).rejects.toThrow(/exceeds max auto-pay/);
    });

    it("throws on unsupported Jetton token", async () => {
      const paymentRequest: X402PaymentRequest = {
        version: "1.0",
        network: "testnet",
        recipient: "UQRecipient",
        amount: "50000000",
        token: "EQJettonMaster",
        description: "Jetton payment",
        paymentId: "pay_789",
        expiresAt: Math.floor(Date.now() / 1000) + 300,
      };

      const mockResponse = new Response(JSON.stringify(paymentRequest), {
        status: 402,
        headers: { "X-Payment-Protocol": "x402-ton" },
      });
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse);

      await expect(
        client.fetch("https://example.com/api"),
      ).rejects.toThrow(/Jetton payments not yet supported/);
    });
  });
});

describe("X402PaymentError", () => {
  it("has correct name", () => {
    const err = new X402PaymentError("test");
    expect(err.name).toBe("X402PaymentError");
    expect(err.message).toBe("test");
    expect(err).toBeInstanceOf(Error);
  });
});
