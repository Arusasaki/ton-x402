/**
 * Example: x402-protected API server
 *
 * A simple Hono server that gates premium endpoints behind TON payments.
 *
 * Run: npx tsx examples/basic-api/server.ts
 */
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { x402 } from "@ton-x402/server";

const app = new Hono();

// Free endpoint
app.get("/", (c) => {
  return c.json({
    message: "Welcome to the x402 demo API",
    endpoints: {
      "/": "This endpoint (free)",
      "/premium/joke": "Get a premium joke (0.01 TON)",
      "/premium/fortune": "Get your fortune (0.05 TON)",
    },
  });
});

// Premium endpoints — gated by x402 payments
app.use(
  "/premium/*",
  x402({
    recipient: process.env.TON_RECIPIENT ?? "UQDrjaLahLkMB-hMCmkzOyBuHJ186Kj3BzU3sHUecE2eEPz4",
    amount: "0.01",
    network: "testnet",
    description: "Access premium content",
  }),
);

app.get("/premium/joke", (c) => {
  const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "There are 10 types of people: those who understand binary and those who don't.",
    "A SQL query walks into a bar, sees two tables, and asks: 'Can I JOIN you?'",
  ];
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  return c.json({ joke, paidWith: "TON via x402" });
});

app.get("/premium/fortune", (c) => {
  const fortunes = [
    "Your next deploy will have zero bugs.",
    "A great opportunity in blockchain awaits you.",
    "The mass adoption you seek is closer than you think.",
  ];
  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  return c.json({ fortune, paidWith: "TON via x402" });
});

const port = Number(process.env.PORT ?? 3000);
console.log(`x402 demo server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
