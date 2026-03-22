# Contributing to ton-x402

Thanks for your interest in contributing to ton-x402! This guide will help you get started.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/ArusaOrg/ton-x402.git
cd ton-x402

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Type check
npm run typecheck
```

## Project Structure

```
packages/
  core/       - Shared types, constants, and utilities
  verify/     - On-chain payment verification
  server/     - Hono middleware for 402 endpoints
  client/     - Auto-paying HTTP client
  mcp/        - MCP server for AI agents
demo/
  worker/     - Live demo on Cloudflare Workers
```

## Package Dependencies

```
core  <--  verify
core  <--  server (uses verify)
core  <--  client
core + client  <--  mcp
```

When modifying `core`, run the full test suite since all packages depend on it.

## Making Changes

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run build && npm test && npm run typecheck`
4. Submit a pull request

## Code Style

- TypeScript strict mode
- No default exports
- Prefer `const` over `let`
- Keep functions under 50 lines

## Testing

Each package has its own test suite using Vitest:

```bash
# Run all tests
npm test

# Run tests for a specific package
cd packages/verify && npx vitest run
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
