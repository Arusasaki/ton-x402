import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { Address, toNano as tonCoreToNano } from "@ton/core";
import type {
  X402ClientConfig,
  X402PaymentRequest,
  TonNetwork,
} from "@ton-x402/core";
import {
  X402_HEADERS,
  X402_PROTOCOL,
  HTTP_402,
  fromNano,
  getApiEndpoint,
} from "@ton-x402/core";

export interface X402FetchOptions extends RequestInit {
  /** Override max auto-pay for this request */
  maxAmount?: string;
}

/**
 * Client that automatically handles x402 payment flows.
 *
 * When a 402 response is received, the client:
 * 1. Parses the payment request
 * 2. Sends a TON transaction
 * 3. Retries the original request with payment proof
 *
 * Usage:
 * ```ts
 * const client = new X402Client({
 *   mnemonic: ['word1', 'word2', ...],
 *   network: 'testnet',
 * });
 *
 * const response = await client.fetch('https://api.example.com/premium/data');
 * ```
 */
export class X402Client {
  private readonly mnemonic: string[];
  private readonly network: TonNetwork;
  private readonly maxAutoPayAmount: bigint;
  private readonly apiEndpoint: string;

  constructor(config: X402ClientConfig) {
    this.mnemonic = config.mnemonic;
    this.network = config.network ?? "mainnet";
    this.maxAutoPayAmount = config.maxAutoPayAmount
      ? tonCoreToNano(config.maxAutoPayAmount)
      : tonCoreToNano("1"); // Default max: 1 TON
    this.apiEndpoint = config.apiEndpoint ?? getApiEndpoint(this.network);
  }

  /**
   * Fetch a URL with automatic x402 payment handling.
   * If the server responds with 402, pays and retries.
   */
  async fetch(url: string, options?: X402FetchOptions): Promise<Response> {
    const response = await globalThis.fetch(url, options);

    if (response.status !== HTTP_402) {
      return response;
    }

    // Check protocol header
    const protocol = response.headers.get(X402_HEADERS.PROTOCOL);
    if (protocol !== X402_PROTOCOL) {
      return response;
    }

    // Parse payment request
    const paymentRequest: X402PaymentRequest = await response.json();
    const requestedAmount = BigInt(paymentRequest.amount);

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (paymentRequest.expiresAt < now) {
      throw new X402PaymentError("Payment request has expired");
    }

    // Check max amount
    const maxForRequest = options?.maxAmount
      ? tonCoreToNano(options.maxAmount)
      : this.maxAutoPayAmount;

    if (requestedAmount > maxForRequest) {
      const readable = fromNano(paymentRequest.amount);
      throw new X402PaymentError(
        `Requested amount ${readable} TON exceeds max auto-pay limit`,
      );
    }

    // Only support native TON for now
    if (paymentRequest.token !== "TON") {
      throw new X402PaymentError(
        `Jetton payments not yet supported. Requested: ${paymentRequest.token}`,
      );
    }

    // Send payment
    const { boc, senderAddress } = await this.sendPayment(paymentRequest);

    // Retry with payment proof
    const retryHeaders = new Headers(options?.headers);
    retryHeaders.set(X402_HEADERS.PROOF, boc);
    retryHeaders.set(X402_HEADERS.PAYMENT_ID, paymentRequest.paymentId);
    retryHeaders.set(X402_HEADERS.SENDER, senderAddress);

    return globalThis.fetch(url, {
      ...options,
      headers: retryHeaders,
    });
  }

  /** Get the wallet address for this client */
  async getAddress(): Promise<string> {
    const keyPair = await mnemonicToPrivateKey(this.mnemonic);
    const wallet = WalletContractV4.create({
      publicKey: keyPair.publicKey,
      workchain: 0,
    });
    return wallet.address.toString({
      bounceable: false,
      testOnly: this.network === "testnet",
    });
  }

  /** Get the wallet balance in human-readable format */
  async getBalance(): Promise<string> {
    const keyPair = await mnemonicToPrivateKey(this.mnemonic);
    const wallet = WalletContractV4.create({
      publicKey: keyPair.publicKey,
      workchain: 0,
    });
    const client = new TonClient({ endpoint: this.apiEndpoint });
    const balance = await client.getBalance(wallet.address);
    return fromNano(balance.toString());
  }

  private async sendPayment(
    request: X402PaymentRequest,
  ): Promise<{ boc: string; senderAddress: string }> {
    const keyPair = await mnemonicToPrivateKey(this.mnemonic);
    const wallet = WalletContractV4.create({
      publicKey: keyPair.publicKey,
      workchain: 0,
    });

    const client = new TonClient({ endpoint: this.apiEndpoint });
    const contract = client.open(wallet);

    const seqno = await contract.getSeqno();
    const recipientAddr = Address.parse(request.recipient);

    await contract.sendTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      messages: [
        internal({
          to: recipientAddr,
          value: BigInt(request.amount),
          body: request.paymentId, // payment ID as comment
          bounce: false,
        }),
      ],
    });

    // Wait briefly for the transaction to propagate
    await this.waitForTransaction(contract, seqno);

    // Get the transaction BOC for proof
    const transactions = await client.getTransactions(wallet.address, {
      limit: 1,
    });

    const tx = transactions[0];
    if (!tx) {
      throw new X402PaymentError("Transaction sent but not found");
    }

    const senderAddress = wallet.address.toString({
      bounceable: false,
      testOnly: this.network === "testnet",
    });

    // Encode the transaction cell as BOC
    if (!tx.inMessage?.body) {
      throw new X402PaymentError("Transaction has no message body for proof");
    }
    const boc = Buffer.from(tx.inMessage.body.toBoc()).toString("base64");

    return { boc, senderAddress };
  }

  private async waitForTransaction(
    contract: ReturnType<TonClient["open"]> &
      Record<string, unknown>,
    seqno: number,
    timeout = 30000,
  ): Promise<void> {
    const start = Date.now();
    const getSeqno = (contract as unknown as { getSeqno: () => Promise<number> }).getSeqno.bind(contract);
    while (Date.now() - start < timeout) {
      const currentSeqno = await getSeqno();
      if (currentSeqno > seqno) return;
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new X402PaymentError("Transaction confirmation timed out");
  }
}

export class X402PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "X402PaymentError";
  }
}
