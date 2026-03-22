/**
 * Example: x402 auto-paying client
 *
 * Fetches premium endpoints and automatically pays with TON.
 *
 * Requires: TON_MNEMONIC environment variable (space-separated 24 words)
 *
 * Run: TON_MNEMONIC="word1 word2 ..." npx tsx examples/basic-api/client.ts
 */
import { X402Client } from "@ton-x402/client";

const mnemonic = process.env.TON_MNEMONIC?.split(" ");
if (!mnemonic || mnemonic.length < 12) {
  console.error("Set TON_MNEMONIC env var (space-separated mnemonic words)");
  process.exit(1);
}

const client = new X402Client({
  mnemonic,
  network: "testnet",
  maxAutoPayAmount: "0.1", // Max 0.1 TON per auto-pay
});

async function main() {
  // Check wallet
  const address = await client.getAddress();
  const balance = await client.getBalance();
  console.log(`Wallet: ${address}`);
  console.log(`Balance: ${balance} TON`);

  const serverUrl = process.env.SERVER_URL ?? "http://localhost:3000";

  // Fetch free endpoint
  console.log("\n--- Free endpoint ---");
  const freeRes = await client.fetch(`${serverUrl}/`);
  console.log(await freeRes.json());

  // Fetch premium endpoint (auto-pays 0.01 TON)
  console.log("\n--- Premium endpoint (will auto-pay) ---");
  const premiumRes = await client.fetch(`${serverUrl}/premium/joke`);
  console.log(`Status: ${premiumRes.status}`);
  console.log(await premiumRes.json());
}

main().catch(console.error);
