/** HTTP header names used in the x402 protocol on TON */
export const X402_HEADERS = {
  /** Protocol identifier header */
  PROTOCOL: "X-Payment-Protocol",
  /** Payment proof header (base64 BOC) */
  PROOF: "X-Payment-Proof",
  /** Payment ID header */
  PAYMENT_ID: "X-Payment-Id",
  /** Sender address header */
  SENDER: "X-Payment-Sender",
} as const;

/** Protocol identifier value */
export const X402_PROTOCOL = "x402-ton" as const;

/** HTTP status code for Payment Required */
export const HTTP_402 = 402 as const;
