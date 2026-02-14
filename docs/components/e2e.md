---
title: E2E
---

`e2e/` validates the integrated path: package -> publish -> propose -> vote -> execute -> fetch.

## Requirements

- Bun
- Docker + Docker Compose
- Foundry (`forge`, `anvil`, `cast`)
- Local monorepo checkout

## Setup

```bash
cd e2e
bun install
cp .env.example .env
```

Set at least:

- `MONOREPO_DIR` (absolute path)

Optional:

- `MAINNET_FORK_URL`

## Run

```bash
bun run e2e
```

The runner starts IPFS and a contracts devnet via `contracts/script/local-devnet.sh`.
