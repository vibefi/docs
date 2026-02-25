---
title: Command Reference
---

Quick reference for all build/run commands across the monorepo.

Component docs: [Contracts](../components/contracts.md), [CLI](../components/cli.md), [Client](../components/client.md), and [E2E](../components/e2e.md).

## Root Monorepo

```bash
bun install                 # Install workspace dependencies
bun run refresh-abis        # Forward to CLI ABI refresh
```

## Contracts (`contracts/`)

```bash
./script/local-devnet.sh                  # Start Anvil + deploy all contracts → .devnet/devnet.json
FOUNDRY_PROFILE=ci forge build --sizes    # Build (CI profile required for size limits)
FOUNDRY_PROFILE=ci forge test -vvv        # Run tests
FOUNDRY_PROFILE=ci forge fmt --check      # Check formatting
FOUNDRY_PROFILE=ci forge script script/DeployTokenSeller.s.sol:DeployTokenSeller --rpc-url sepolia --broadcast -vvv
```

## CLI (`cli/`)

```bash
bun install                 # Install dependencies
bun run dev                 # Run CLI in dev mode
bun run refresh-abis        # Extract ABIs from contracts/out → packages/shared
bun run test:smoke          # Smoke test (spawns devnet, runs basic commands)
bun run typecheck           # TypeScript type check
```

See [CLI docs](../components/cli.md) for the full `vibefi` command reference.

## Client (`client/`)

```bash
cargo build                                              # Build binary
cargo run                                                # Run with defaults
cargo run -- --config ../contracts/.devnet/devnet.json   # Run against devnet
cargo run -- --bundle ../cli/.vibefi/cache/<rootCid>     # Run bundled dapp
cargo run -- --bundle <path> --no-build                  # Skip Vite build step
```

### Internal UI (`client/internal-ui/`)

```bash
bun install         # Install dependencies
bun run build       # Build React → IIFE bundles (must run before cargo build)
tsc --noEmit        # Type check
```

## E2E (`e2e/`)

```bash
bun install         # Install dependencies
bun run e2e         # Run full end-to-end test suite
bun run typecheck   # TypeScript type check
```

## Local IPFS

```bash
docker compose -f docker-compose.ipfs.yml up -d     # Start
docker compose -f docker-compose.ipfs.yml down       # Stop
```

Endpoints: API `http://127.0.0.1:5001`, Gateway `http://127.0.0.1:8080`
