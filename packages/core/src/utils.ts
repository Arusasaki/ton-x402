import type { TonNetwork } from "./types.js";

/** Convert human-readable TON amount to nanoTON string */
export function toNano(amount: string): string {
  const [whole = "0", frac = ""] = amount.split(".");
  const padded = frac.padEnd(9, "0").slice(0, 9);
  const nano = BigInt(whole) * 1_000_000_000n + BigInt(padded);
  return nano.toString();
}

/** Convert nanoTON string to human-readable TON amount */
export function fromNano(nanoAmount: string): string {
  const nano = BigInt(nanoAmount);
  const whole = nano / 1_000_000_000n;
  const frac = nano % 1_000_000_000n;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(9, "0").replace(/0+$/, "");
  return `${whole}.${fracStr}`;
}

/** Generate a unique payment ID */
export function generatePaymentId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `pay_${timestamp}_${random}`;
}

/** Get the default TON API endpoint for a network */
export function getApiEndpoint(network: TonNetwork): string {
  return network === "testnet"
    ? "https://testnet.toncenter.com/api/v2"
    : "https://toncenter.com/api/v2";
}
