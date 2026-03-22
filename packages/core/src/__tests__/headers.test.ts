import { describe, it, expect } from "vitest";
import { X402_HEADERS, X402_PROTOCOL, HTTP_402 } from "../headers.js";

describe("X402_HEADERS", () => {
  it("has correct header names", () => {
    expect(X402_HEADERS.PROTOCOL).toBe("X-Payment-Protocol");
    expect(X402_HEADERS.PROOF).toBe("X-Payment-Proof");
    expect(X402_HEADERS.PAYMENT_ID).toBe("X-Payment-Id");
    expect(X402_HEADERS.SENDER).toBe("X-Payment-Sender");
  });
});

describe("X402_PROTOCOL", () => {
  it("is x402-ton", () => {
    expect(X402_PROTOCOL).toBe("x402-ton");
  });
});

describe("HTTP_402", () => {
  it("is 402", () => {
    expect(HTTP_402).toBe(402);
  });
});
