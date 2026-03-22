import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock TON SDK
const mockGetTransactions = vi.fn();
vi.mock("@ton/ton", () => {
  const Address = {
    parse: vi.fn((addr: string) => ({
      equals: (other: { _raw: string }) => addr === other._raw,
      _raw: addr,
    })),
  };

  const TonClient = vi.fn().mockImplementation(() => ({
    getTransactions: mockGetTransactions,
  }));

  return { TonClient, Address };
});

vi.mock("@ton/core", () => {
  const Cell = {
    fromBoc: vi.fn(() => [{ beginParse: () => ({}) }]),
  };
  return { Cell };
});

import { verifyPayment } from "../verify.js";

describe("verifyPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns valid when matching transaction found", async () => {
    const now = Math.floor(Date.now() / 1000);

    mockGetTransactions.mockResolvedValue([
      {
        now: now - 10,
        inMessage: {
          info: {
            type: "internal",
            src: { equals: () => true, _raw: "sender" },
            dest: { equals: () => true, _raw: "recipient" },
            value: { coins: 50000000n },
          },
          body: {
            beginParse: () => ({
              remainingBits: 32 + 8 * 7,
              loadUint: () => 0,
              loadStringTail: () => "pay_123",
            }),
          },
        },
        hash: () => Buffer.from("txhash1234567890abcdef"),
      },
    ]);

    const result = await verifyPayment({
      proof: {
        boc: Buffer.from("test").toString("base64"),
        paymentId: "pay_123",
        sender: "sender",
      },
      recipient: "recipient",
      amount: "0.05",
      network: "testnet",
    });

    expect(result.valid).toBe(true);
    expect(result.txHash).toBeTruthy();
  });

  it("returns invalid when no transactions match", async () => {
    mockGetTransactions.mockResolvedValue([]);

    const result = await verifyPayment({
      proof: {
        boc: Buffer.from("test").toString("base64"),
        paymentId: "pay_456",
        sender: "sender",
      },
      recipient: "recipient",
      amount: "0.05",
      network: "testnet",
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain("No matching transaction");
  });

  it("returns invalid when transaction amount is insufficient", async () => {
    const now = Math.floor(Date.now() / 1000);

    mockGetTransactions.mockResolvedValue([
      {
        now: now - 10,
        inMessage: {
          info: {
            type: "internal",
            src: { equals: () => true, _raw: "sender" },
            dest: { equals: () => true, _raw: "recipient" },
            value: { coins: 10000000n }, // 0.01 TON < 0.05 TON
          },
          body: null,
        },
        hash: () => Buffer.from("txhash"),
      },
    ]);

    const result = await verifyPayment({
      proof: {
        boc: Buffer.from("test").toString("base64"),
        paymentId: "pay_789",
        sender: "sender",
      },
      recipient: "recipient",
      amount: "0.05",
      network: "testnet",
    });

    expect(result.valid).toBe(false);
  });

  it("returns invalid on malformed BOC", async () => {
    const { Cell } = await import("@ton/core");
    (Cell.fromBoc as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error("Invalid BOC");
    });

    const result = await verifyPayment({
      proof: {
        boc: "not-valid-base64",
        paymentId: "pay_err",
        sender: "sender",
      },
      recipient: "recipient",
      amount: "0.05",
      network: "testnet",
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Verification failed");
  });

  it("skips external messages", async () => {
    const now = Math.floor(Date.now() / 1000);

    mockGetTransactions.mockResolvedValue([
      {
        now: now - 10,
        inMessage: {
          info: {
            type: "external-in",
            src: null,
          },
          body: null,
        },
        hash: () => Buffer.from("txhash"),
      },
    ]);

    const result = await verifyPayment({
      proof: {
        boc: Buffer.from("test").toString("base64"),
        paymentId: "pay_ext",
        sender: "sender",
      },
      recipient: "recipient",
      amount: "0.05",
      network: "testnet",
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain("No matching transaction");
  });
});
