import { describe, it, expect } from "vitest";
import { toNano, fromNano, generatePaymentId, getApiEndpoint } from "../utils.js";

describe("toNano", () => {
  it("converts whole numbers", () => {
    expect(toNano("1")).toBe("1000000000");
    expect(toNano("0")).toBe("0");
    expect(toNano("100")).toBe("100000000000");
  });

  it("converts decimal amounts", () => {
    expect(toNano("0.05")).toBe("50000000");
    expect(toNano("0.01")).toBe("10000000");
    expect(toNano("1.5")).toBe("1500000000");
    expect(toNano("0.000000001")).toBe("1");
  });

  it("handles trailing zeros", () => {
    expect(toNano("1.0")).toBe("1000000000");
    expect(toNano("0.10")).toBe("100000000");
  });

  it("truncates beyond 9 decimals", () => {
    expect(toNano("0.0000000019")).toBe("1");
  });
});

describe("fromNano", () => {
  it("converts whole nanoTON", () => {
    expect(fromNano("1000000000")).toBe("1");
    expect(fromNano("0")).toBe("0");
    expect(fromNano("100000000000")).toBe("100");
  });

  it("converts fractional nanoTON", () => {
    expect(fromNano("50000000")).toBe("0.05");
    expect(fromNano("10000000")).toBe("0.01");
    expect(fromNano("1500000000")).toBe("1.5");
    expect(fromNano("1")).toBe("0.000000001");
  });

  it("round-trips with toNano", () => {
    const values = ["0.05", "1", "0.000000001", "100", "0.123456789"];
    for (const v of values) {
      expect(fromNano(toNano(v))).toBe(v);
    }
  });
});

describe("generatePaymentId", () => {
  it("returns a string starting with pay_", () => {
    const id = generatePaymentId();
    expect(id).toMatch(/^pay_[a-z0-9]+_[a-z0-9]+$/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generatePaymentId()));
    expect(ids.size).toBe(100);
  });
});

describe("getApiEndpoint", () => {
  it("returns testnet endpoint", () => {
    expect(getApiEndpoint("testnet")).toBe(
      "https://testnet.toncenter.com/api/v2",
    );
  });

  it("returns mainnet endpoint", () => {
    expect(getApiEndpoint("mainnet")).toBe("https://toncenter.com/api/v2");
  });
});
