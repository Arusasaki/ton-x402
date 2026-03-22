import type { MiddlewareHandler } from "hono";
import type { X402ServerConfig, X402PaymentRequest } from "@ton-x402/core";
import {
  X402_HEADERS,
  X402_PROTOCOL,
  HTTP_402,
  toNano,
  generatePaymentId,
} from "@ton-x402/core";
import { verifyPayment } from "@ton-x402/verify";

/**
 * Hono middleware that gates routes behind x402 TON payments.
 *
 * Usage:
 * ```ts
 * app.use('/api/premium/*', x402({
 *   recipient: 'UQB...xxx',
 *   amount: '0.05',
 *   network: 'testnet',
 * }));
 * ```
 */
export function x402(config: X402ServerConfig): MiddlewareHandler {
  const {
    recipient,
    amount,
    network = "mainnet",
    ttl = 300,
    apiEndpoint,
  } = config;

  return async (c, next) => {
    // Check if request includes payment proof
    const proofBoc = c.req.header(X402_HEADERS.PROOF);
    const paymentId = c.req.header(X402_HEADERS.PAYMENT_ID);
    const sender = c.req.header(X402_HEADERS.SENDER);

    if (proofBoc && paymentId && sender) {
      // Verify the payment
      const result = await verifyPayment({
        proof: { boc: proofBoc, paymentId, sender },
        recipient,
        amount,
        network,
        apiEndpoint,
        maxAge: ttl,
      });

      if (result.valid) {
        // Payment verified — proceed to the handler
        c.set("x402TxHash", result.txHash);
        c.set("x402PaymentId", paymentId);
        await next();
        return;
      }

      // Payment invalid — return 402 with error
      const paymentRequest = buildPaymentRequest(config, ttl);
      return c.json(
        { ...paymentRequest, error: result.error },
        HTTP_402,
        { [X402_HEADERS.PROTOCOL]: X402_PROTOCOL },
      );
    }

    // No payment proof — return 402 Payment Required
    const paymentRequest = buildPaymentRequest(config, ttl);
    return c.json(paymentRequest, HTTP_402, {
      [X402_HEADERS.PROTOCOL]: X402_PROTOCOL,
    });
  };
}

function buildPaymentRequest(
  config: X402ServerConfig,
  ttl: number,
): X402PaymentRequest {
  return {
    version: "1.0",
    network: config.network ?? "mainnet",
    recipient: config.recipient,
    amount: toNano(config.amount),
    token: config.token ?? "TON",
    description: config.description ?? "Payment required for access",
    paymentId: generatePaymentId(),
    expiresAt: Math.floor(Date.now() / 1000) + ttl,
  };
}
