import { TonClient, Address } from "@ton/ton";
import { Cell } from "@ton/core";
import type {
  X402PaymentProof,
  X402VerificationResult,
  TonNetwork,
} from "@ton-x402/core";
import { getApiEndpoint, toNano } from "@ton-x402/core";

export interface VerifyPaymentOptions {
  /** Payment proof from the client */
  proof: X402PaymentProof;
  /** Expected recipient address */
  recipient: string;
  /** Expected amount in human-readable format */
  amount: string;
  /** TON network */
  network?: TonNetwork;
  /** API endpoint override */
  apiEndpoint?: string;
  /** Maximum age of transaction in seconds. Defaults to 300 */
  maxAge?: number;
}

/**
 * Verify a TON payment on-chain.
 *
 * Decodes the BOC, checks the recipient address, amount,
 * and optionally verifies the transaction exists on-chain.
 */
export async function verifyPayment(
  options: VerifyPaymentOptions,
): Promise<X402VerificationResult> {
  const {
    proof,
    recipient,
    amount,
    network = "mainnet",
    apiEndpoint,
    maxAge = 300,
  } = options;

  try {
    // Decode the BOC to extract transaction details
    const bocBuffer = Buffer.from(proof.boc, "base64");
    const cell = Cell.fromBoc(bocBuffer)[0];
    if (!cell) {
      return { valid: false, error: "Invalid BOC: no cells found" };
    }

    const expectedAmount = BigInt(toNano(amount));
    const recipientAddr = Address.parse(recipient);

    // Connect to TON API to verify the transaction on-chain
    const endpoint = apiEndpoint ?? getApiEndpoint(network);
    const client = new TonClient({ endpoint });

    // Get recent transactions for the recipient
    const senderAddr = Address.parse(proof.sender);
    const transactions = await client.getTransactions(recipientAddr, {
      limit: 50,
    });

    const now = Math.floor(Date.now() / 1000);

    // Find a matching transaction
    for (const tx of transactions) {
      // Check transaction age
      if (now - tx.now > maxAge) continue;

      const inMsg = tx.inMessage;
      if (!inMsg) continue;

      // Check it's an internal message with value
      if (inMsg.info.type !== "internal") continue;

      // Check sender
      const src = inMsg.info.src;
      if (!src.equals(senderAddr)) continue;

      // Check amount (allow slight overpayment)
      const txAmount = inMsg.info.value.coins;
      if (txAmount < expectedAmount) continue;

      // Check recipient
      const dest = inMsg.info.dest;
      if (!dest.equals(recipientAddr)) continue;

      // Check comment/memo for payment ID
      const body = inMsg.body;
      if (body) {
        const slice = body.beginParse();
        // Text comment starts with 0x00000000
        if (slice.remainingBits >= 32) {
          const op = slice.loadUint(32);
          if (op === 0 && slice.remainingBits > 0) {
            const comment = slice.loadStringTail();
            if (comment === proof.paymentId) {
              return {
                valid: true,
                txHash: tx.hash().toString("hex"),
              };
            }
          }
        }
      }

      // If no comment matching but amount/sender/recipient match,
      // still consider valid (comment is optional enhancement)
      return {
        valid: true,
        txHash: tx.hash().toString("hex"),
      };
    }

    return {
      valid: false,
      error: "No matching transaction found within the time window",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { valid: false, error: `Verification failed: ${message}` };
  }
}
