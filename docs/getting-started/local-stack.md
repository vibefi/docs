---
title: Local Stack Quickstart
---

## 1. Start local IPFS

From monorepo root:

```bash
docker compose -f docker-compose.ipfs.yml up -d
```

Expected endpoints:

- API: `http://127.0.0.1:5001`
- Gateway: `http://127.0.0.1:8080`

## 2. Start contracts devnet

```bash
cd contracts
./script/local-devnet.sh
```

This writes `contracts/.devnet/devnet.json` used by [CLI](../components/cli.md) and [client](../components/client.md) flows.

## 3. Install and check CLI

```bash
cd ../cli
bun install
bun run refresh-abis
bun run test:smoke
```

From monorepo root, `bun run refresh-abis` is a shortcut that forwards to the CLI script.

## 4. Run e2e flow

```bash
cd ../e2e
bun install
cp .env.example .env
# set MONOREPO_DIR in .env
cd ../dapp-examples && git submodule sync --recursive && git submodule update --init --recursive
cd ../e2e
bun run e2e
```

## 5. Build and run client

```bash
cd ../client
cargo build
cargo run -- --config ../contracts/.devnet/devnet.json
```

Optional local bundle run:

```bash
cargo run -- --bundle ../cli/.vibefi/cache/<rootCid>
```
