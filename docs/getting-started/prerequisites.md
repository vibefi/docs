---
title: Prerequisites
---

System requirements across the monorepo:

- `git`
- `bun` (latest stable)
- `node` (recommended for tool compatibility)
- `cargo` + Rust toolchain
- `docker` + `docker compose`
- Foundry: `forge`, `cast`, `anvil`

Install Foundry if missing:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Clone

```bash
git clone --recursive https://github.com/vibefi/monorepo.git
cd monorepo
bun install
```

## Repo map

- `contracts/`: Solidity governance and registry contracts.
- `cli/`: Bun/TypeScript governance and packaging CLI.
- `client/`: Wry/Rust desktop runtime for approved dapps.
- `e2e/`: end-to-end validation flow.
- `dapp-examples/`: constrained frontend examples.
- `studio/`: studio app (currently minimally documented).
- `packages/shared/`: shared TypeScript utilities.
