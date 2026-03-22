import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { x402 } from "../middleware.js";

// Mock @ton-x402/verify
vi.mock("@ton-x402/verify", () => ({
  verifyPayment: vi.fn(),
}));

import { verifyPayment } from "@ton-x402/verify";

const mockedVerify = vi.mocked(verifyPayment);

describe("x402 middleware", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.use(
      "/premium/*",
      x402({
        recipient: "UQDrjaLahLkMB-hMCmkzOyBuHJ186Kj3BzU3sHUecE2eEPz4",
        amount: "0.05",
        network: "testnet",
        description: "Premium access",
      }),
    );
    app.get("/premium/data", (c) => c.json({ data: "secret" }));
  });

  it("returns 402 when no payment headers", async () => {
    const res = await app.request("/premium/data");
    expect(res.status).toBe(402);
    expect(res.headers.get("X-Payment-Protocol")).toBe("x402-ton");

    const body = await res.json();
    expect(body.version).toBe("1.0");
    expect(body.network).toBe("testnet");
    expect(body.recipient).toBe(
      "UQDrjaLahLkMB-hMCmkzOyBuHJ186Kj3BzU3sHUecE2eEPz4",
    );
    expect(body.amount).toBe("50000000"); // 0.05 TON in nanoTON
    expect(body.token).toBe("TON");
    expect(body.description).toBe("Premium access");
    expect(body.paymentId).toBeTruthy();
    expect(body.expiresAt).toBeGreaterThan(0);
  });

  it("verifies payment and passes through on valid proof", async () => {
    mockedVerify.mockResolvedValue({
      valid: true,
      txHash: "abc123",
    });

    const res = await app.request("/premium/data", {
      headers: {
        "X-Payment-Proof": "base64boc",
        "X-Payment-Id": "pay_123",
        "X-Payment-Sender": "UQSenderAddress",
      },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBe("secret");

    expect(mockedVerify).toHaveBeenCalledWith({
      proof: {
        boc: "base64boc",
        paymentId: "pay_123",
        sender: "UQSenderAddress",
      },
      recipient: "UQDrjaLahLkMB-hMCmkzOyBuHJ186Kj3BzU3sHUecE2eEPz4",
      amount: "0.05",
      network: "testnet",
      apiEndpoint: undefined,
      maxAge: 300,
    });
  });

  it("returns 402 with error on invalid proof", async () => {
    mockedVerify.mockResolvedValue({
      valid: false,
      error: "No matching transaction",
    });

    const res = await app.request("/premium/data", {
      headers: {
        "X-Payment-Proof": "invalidboc",
        "X-Payment-Id": "pay_456",
        "X-Payment-Sender": "UQSenderAddress",
      },
    });

    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.error).toBe("No matching transaction");
  });

  it("does not require payment for partial header set", async () => {
    // Only proof header, missing payment-id and sender
    const res = await app.request("/premium/data", {
      headers: {
        "X-Payment-Proof": "base64boc",
      },
    });

    expect(res.status).toBe(402);
    expect(mockedVerify).not.toHaveBeenCalled();
  });
});
