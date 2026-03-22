/** Network type for TON blockchain */
export type TonNetwork = "mainnet" | "testnet";

/** Payment token — native TON or a Jetton master address */
export type PaymentToken = "TON" | (string & {});

/** x402 payment request returned in HTTP 402 response */
export interface X402PaymentRequest {
  /** Protocol version */
  version: "1.0";
  /** TON network */
  network: TonNetwork;
  /** Recipient wallet address (raw or friendly format) */
  recipient: string;
  /** Amount in nanoTON (for TON) or smallest unit (for Jettons) */
  amount: string;
  /** Token identifier — "TON" or Jetton master address */
  token: PaymentToken;
  /** Human-readable description of what is being paid for */
  description: string;
  /** Unique payment identifier for idempotency */
  paymentId: string;
  /** Unix timestamp after which this payment request expires */
  expiresAt: number;
}

/** Payment proof sent by client after completing payment */
export interface X402PaymentProof {
  /** Base64-encoded BOC of the transaction */
  boc: string;
  /** Payment ID matching the original request */
  paymentId: string;
  /** Sender wallet address */
  sender: string;
}

/** Result of payment verification */
export interface X402VerificationResult {
  /** Whether the payment is valid */
  valid: boolean;
  /** Transaction hash if verified */
  txHash?: string;
  /** Error message if invalid */
  error?: string;
}

/** Server middleware configuration */
export interface X402ServerConfig {
  /** Recipient wallet address */
  recipient: string;
  /** Payment amount in human-readable format (e.g., "0.05") */
  amount: string;
  /** Token — "TON" or Jetton master address. Defaults to "TON" */
  token?: PaymentToken;
  /** Human-readable description */
  description?: string;
  /** TON network. Defaults to "mainnet" */
  network?: TonNetwork;
  /** Payment validity duration in seconds. Defaults to 300 (5 min) */
  ttl?: number;
  /** TON API endpoint override */
  apiEndpoint?: string;
}

/** Client configuration */
export interface X402ClientConfig {
  /** Wallet mnemonic words */
  mnemonic: string[];
  /** TON network. Defaults to "mainnet" */
  network?: TonNetwork;
  /** Maximum amount (in human-readable format) the client will auto-pay */
  maxAutoPayAmount?: string;
  /** TON API endpoint override */
  apiEndpoint?: string;
}
