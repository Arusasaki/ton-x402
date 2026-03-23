# Hackathon Submission

## Project Name
ton-x402

## Tagline
HTTP-native machine payments for the AI agent era

## Description

ton-x402 brings the x402 protocol to the TON blockchain, enabling HTTP-native machine-to-machine payments for AI agents. When an agent requests a paid API, it receives HTTP 402 with payment details, sends a TON micropayment (~$0.01, ~5s finality), and retries with on-chain proof — no API keys, no subscriptions, no humans in the loop.

**Why TON?** TON is embedded in Telegram (1B+ users), has built-in wallet infrastructure, ~5-second finality within HTTP timeout windows, and fees low enough for true micropayments. No other chain offers this combination for agent payments.

**What we built:**
- 5-package TypeScript monorepo: `@ton-x402/core` (zero-dependency types & headers), `@ton-x402/verify` (on-chain payment verification), `@ton-x402/server` (Hono middleware — one line to paywall any endpoint), `@ton-x402/client` (auto-paying HTTP client), and `@ton-x402/mcp` (4 MCP tools for AI agent integration)
- 34 tests across all packages, strict TypeScript, production-ready architecture
- Live demo with interactive payment flow on TON testnet
- Full MCP server enabling any AI agent (Claude, GPT, etc.) to discover, price, and pay for APIs autonomously

**Track: Agent Infrastructure** — ton-x402 is the missing payment layer that turns AI agents from API consumers into autonomous economic actors on TON.

## Links
- **GitHub**: https://github.com/Arusasaki/ton-x402
- **Live Demo**: https://ton-x402.pages.dev
- **Project Image**: assets/thumbnail.png (1280x640)

## Track
Track 1: Agent Infrastructure ($10,000)
