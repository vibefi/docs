---
title: CLI
---

The `cli/` package provides the operator interface for packaging dapps and interacting with governance.

## Install

```bash
cd cli
bun install
```

## ABI refresh

```bash
cd ../contracts
FOUNDRY_PROFILE=ci forge build
cd ../cli
bun run refresh-abis
```

ABIs are synced into `packages/shared/src/abis/`.

## Common commands

```bash
bun run src/index.ts status
bun run src/index.ts proposals:list
bun run src/index.ts dapp:propose --root-cid <cid> --name "My Dapp" --dapp-version "0.1.0" --description "Example"
bun run src/index.ts vote:cast <proposalId> --support for
bun run src/index.ts proposals:queue <proposalId>
bun run src/index.ts proposals:execute <proposalId>
bun run src/index.ts dapp:list
bun run src/index.ts dapp:fetch --root-cid <cid> --out .vibefi/cache
```

## Packaging flow

```bash
bun run src/index.ts package \
  --path ./my-dapp \
  --name "My Dapp" \
  --dapp-version "0.1.0" \
  --description "My first vapp"
```

Use `--no-ipfs` to compute deterministic output without publishing.

## Validation and tests

```bash
bun run typecheck
bun run test:smoke
```

`bun run test:e2e` currently exits with a pointer to the dedicated `e2e/` repo flow.
