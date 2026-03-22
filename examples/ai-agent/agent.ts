/**
 * Example: AI agent using x402 MCP tools
 *
 * Shows how an AI agent can discover, estimate, and pay for
 * x402-protected APIs automatically.
 *
 * In practice, this runs as an MCP server that Claude/GPT connects to.
 * This file demonstrates the programmatic API.
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
  maxAutoPayAmount: "0.5",
});

async function agentWorkflow() {
  const apiUrl = process.env.API_URL ?? "http://localhost:3000";

  console.log("=== AI Agent x402 Workflow ===\n");

  // Step 1: Agent checks its wallet
  const address = await client.getAddress();
  const balance = await client.getBalance();
  console.log(`Agent wallet: ${address}`);
  console.log(`Agent balance: ${balance} TON\n`);

  // Step 2: Agent discovers an API and checks the price
  console.log("Step 1: Checking endpoint cost...");
  const probeRes = await globalThis.fetch(`${apiUrl}/premium/joke`);
  if (probeRes.status === 402) {
    const paymentReq = await probeRes.json();
    console.log(`  Cost: ${Number(paymentReq.amount) / 1e9} TON`);
    console.log(`  Description: ${paymentReq.description}`);
    console.log(`  Token: ${paymentReq.token}\n`);
  }

  // Step 3: Agent decides to pay and fetches the data
  console.log("Step 2: Paying and fetching data...");
  const response = await client.fetch(`${apiUrl}/premium/joke`);
  console.log(`  Status: ${response.status}`);
  const data = await response.json();
  console.log(`  Data: ${JSON.stringify(data)}\n`);

  console.log("=== Agent workflow complete ===");
}

agentWorkflow().catch(console.error);
