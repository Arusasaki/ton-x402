import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { X402Client } from "@ton-x402/client";
import type { TonNetwork } from "@ton-x402/core";
import { fromNano, getApiEndpoint } from "@ton-x402/core";
import { TonClient, WalletContractV4 } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";

interface McpServerConfig {
  mnemonic: string[];
  network: TonNetwork;
  maxAutoPayAmount?: string;
}

function createServer(config: McpServerConfig): McpServer {
  const server = new McpServer({
    name: "ton-x402",
    version: "0.1.0",
  });

  const client = new X402Client({
    mnemonic: config.mnemonic,
    network: config.network,
    maxAutoPayAmount: config.maxAutoPayAmount,
  });

  // Tool: x402_fetch — fetch a URL with automatic x402 payment
  server.tool(
    "x402_fetch",
    "Fetch a URL with automatic x402 payment handling. If the server responds with HTTP 402, automatically pays with TON and retries.",
    {
      url: z.string().url().describe("The URL to fetch"),
      method: z
        .enum(["GET", "POST", "PUT", "DELETE"])
        .default("GET")
        .describe("HTTP method"),
      body: z
        .string()
        .optional()
        .describe("Request body for POST/PUT requests"),
      maxAmount: z
        .string()
        .optional()
        .describe(
          "Maximum TON amount willing to pay (e.g. '0.1'). Overrides default.",
        ),
    },
    async ({ url, method, body, maxAmount }) => {
      const options: RequestInit & { maxAmount?: string } = { method };
      if (body && (method === "POST" || method === "PUT")) {
        options.body = body;
        options.headers = { "Content-Type": "application/json" };
      }
      if (maxAmount) {
        options.maxAmount = maxAmount;
      }

      const response = await client.fetch(url, options);
      const text = await response.text();

      return {
        content: [
          {
            type: "text" as const,
            text: `Status: ${response.status}\n\n${text}`,
          },
        ],
      };
    },
  );

  // Tool: x402_balance — check wallet balance
  server.tool(
    "x402_balance",
    "Check the TON wallet balance for this agent.",
    {},
    async () => {
      const balance = await client.getBalance();
      const address = await client.getAddress();

      return {
        content: [
          {
            type: "text" as const,
            text: `Address: ${address}\nBalance: ${balance} TON\nNetwork: ${config.network}`,
          },
        ],
      };
    },
  );

  // Tool: x402_estimate — preview cost of an x402 endpoint without paying
  server.tool(
    "x402_estimate",
    "Check the cost of an x402-protected endpoint without paying. Sends a request and parses the 402 response.",
    {
      url: z.string().url().describe("The URL to check"),
    },
    async ({ url }) => {
      try {
        const response = await globalThis.fetch(url);

        if (response.status !== 402) {
          return {
            content: [
              {
                type: "text" as const,
                text: `This endpoint does not require payment (status: ${response.status})`,
              },
            ],
          };
        }

        const paymentRequest = await response.json();
        const amountTon = fromNano(paymentRequest.amount);

        return {
          content: [
            {
              type: "text" as const,
              text: [
                `Endpoint: ${url}`,
                `Cost: ${amountTon} TON`,
                `Token: ${paymentRequest.token}`,
                `Recipient: ${paymentRequest.recipient}`,
                `Network: ${paymentRequest.network}`,
                `Description: ${paymentRequest.description}`,
                `Expires: ${new Date(paymentRequest.expiresAt * 1000).toISOString()}`,
              ].join("\n"),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to estimate endpoint cost: ${message}`,
            },
          ],
        };
      }
    },
  );

  // Tool: x402_history — recent transactions
  server.tool(
    "x402_history",
    "View recent transactions from this wallet.",
    {
      limit: z
        .number()
        .min(1)
        .max(20)
        .default(5)
        .describe("Number of transactions to show"),
    },
    async ({ limit }) => {
      const keyPair = await mnemonicToPrivateKey(config.mnemonic);
      const wallet = WalletContractV4.create({
        publicKey: keyPair.publicKey,
        workchain: 0,
      });

      const tonClient = new TonClient({
        endpoint: getApiEndpoint(config.network),
      });
      const transactions = await tonClient.getTransactions(wallet.address, {
        limit,
      });

      if (transactions.length === 0) {
        return {
          content: [
            { type: "text" as const, text: "No transactions found." },
          ],
        };
      }

      const lines = transactions.map((tx, i) => {
        const time = new Date(tx.now * 1000).toISOString();
        const hash = tx.hash().toString("hex").slice(0, 16);
        const value = tx.inMessage?.info.type === "internal"
          ? fromNano(tx.inMessage.info.value.coins.toString())
          : "N/A";
        return `${i + 1}. ${time} | ${hash}... | ${value} TON`;
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Recent transactions (${config.network}):\n\n${lines.join("\n")}`,
          },
        ],
      };
    },
  );

  return server;
}

export async function startServer(): Promise<void> {
  const mnemonicEnv = process.env.TON_MNEMONIC;
  if (!mnemonicEnv) {
    console.error(
      "Error: TON_MNEMONIC environment variable is required (space-separated mnemonic words)",
    );
    process.exit(1);
  }

  const mnemonic = mnemonicEnv.split(" ");
  const network = (process.env.TON_NETWORK ?? "mainnet") as TonNetwork;
  const maxAutoPayAmount = process.env.TON_MAX_AUTO_PAY;

  const server = createServer({ mnemonic, network, maxAutoPayAmount });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

export { createServer };
