---
title: Command Reference
---

## Root monorepo

```bash
bun run refresh-abis
```

Forwards to CLI ABI refresh.

## CLI (`cli/`)

```bash
bun run dev
bun run refresh-abis
bun run test:smoke
bun run typecheck
```

`bun run test:e2e` currently exits with a notice to use `e2e/`.

## E2E (`e2e/`)

```bash
bun run e2e
bun run typecheck
```

## Client (`client/`)

```bash
cargo build
cargo run
cargo run -- --config <path>
cargo run -- --bundle <path>
```

## Internal UI (`client/internal-ui/`)

```bash
bun run build
tsc --noEmit
```

## Contracts (`contracts/`)

```bash
FOUNDRY_PROFILE=ci forge fmt --check
FOUNDRY_PROFILE=ci forge build --sizes
FOUNDRY_PROFILE=ci forge test -vvv
./script/local-devnet.sh
```
