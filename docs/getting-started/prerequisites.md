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

- [`contracts/`](../components/contracts.md): Solidity governance and registry contracts.
- [`cli/`](../components/cli.md): Bun/TypeScript governance and packaging CLI.
- [`gov-agent/`](../components/gov-agent.md): Rust governance watcher/reviewer and optional auto-voter.
- [`client/`](../components/client.md): Wry/Rust desktop runtime for approved dapps.
- [`e2e/`](../components/e2e.md): end-to-end validation flow.
- [`dapp-examples/`](../components/dapp-examples.md): frontend examples (constrained React/Vite + nested static-html `zfi` submodule).
- [`studio/`](../components/studio.md): governance studio app (see `studio/README.md`, `studio/design.md`, `studio/plan.md`).
- [`ipfs-relay/`](../components/ipfs-relay.md): Rust/Axum upload relay that validates bundles, pins to Kubo, and queues provider replication.
- [`lander/`](../components/lander.md): landing page site.
- [`docs/`](../components/docs.md): Docusaurus documentation site.
- [`packages/shared/`](../components/packages.md): shared TypeScript utilities.
