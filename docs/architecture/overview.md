---
title: Architecture Overview
---

VibeFi splits trust between [onchain governance](../protocol/overview.md), content addressing, and local runtime execution. No single party controls what code users run.

## End-to-End Flow

```
Developer → CLI package → IPFS publish → rootCid
    ↓
CLI dapp:propose → VfiGovernor proposal → vote → queue → execute
    ↓
DappRegistry stores rootCid onchain
    ↓
Client reads registry → fetches from IPFS → verifies manifest → builds locally → serves in sandboxed webview
```

## Control Plane (Contracts)

Onchain governance decides which dapps are approved:

- **VfiGovernor** + **VfiTimelock** — proposal → vote → queue → execute lifecycle with configurable delays
- **[DappRegistry](../components/contracts.md)** — canonical store of approved dapp versions (`rootCid`, status)
- **ConstraintsRegistry** — governance-updatable build constraint references
- **[Security Council](../protocol/network-actors.md)** — can cancel queued operations, pause, and deprecate

See [Contracts](../components/contracts.md).

## Data Plane (CLI + IPFS)

Dapp source is packaged deterministically by the [CLI](../components/cli.md):

1. Detect layout and validate rules (`constrained` dependency/pattern checks, or `static-html` file-extension allowlist)
2. Generate deterministic [manifest.json](../reference/manifest-schema.md) with file hashes
3. Publish to IPFS, receive `rootCid`

Only `rootCid` is stored onchain. Human-readable metadata emitted as events for off-chain indexing.

See [CLI](../components/cli.md).

## Execution Plane (Client)

The Rust [client](../components/client.md) provides a secure, sandboxed runtime:

1. **Fetch** approved source from IPFS by `rootCid`
2. **Verify** every file against `manifest.json`
3. **Prepare runtime assets**:
   - constrained: local Bun/Vite build with injected standard build files
   - static-html: copy validated files directly (no package manager/build step)
4. **Serve** over `app://` protocol in sandboxed webview
5. **Inject** `window.ethereum` (EIP-1193) bridged to wallet backends via [IPC](../reference/ipc-protocol.md)
6. **Enforce** CSP: no outbound network (`connect-src 'none'`), with layout-specific script policy for compatibility

All external data access is mediated through the injected provider → Rust host → RPC.

See [Client](../components/client.md).

## Repo Responsibilities

| Directory | Role | Stack |
|---|---|---|
| `contracts/` | Protocol control plane | Solidity / Foundry |
| `cli/` | Packaging + governance operator interface | Bun / TypeScript |
| `client/` | Deterministic dapp runtime | Rust / Wry |
| `packages/shared/` | Shared ABIs, config, IPFS, client utilities | TypeScript |
| `gov-agent/` | Proposal watcher/reviewer with optional automated voting | Rust |
| `e2e/` | Integrated validation of the full flow | Bun / TypeScript |
| `dapp-examples/` | Reference dapps demonstrating both constrained and static-html layouts | React / TypeScript + static HTML |
| `studio/` | Governance studio for proposing, voting, registry inspection, and bundle review | React / Vite |
| `ipfs-relay/` | Bundle upload relay with package validation, Kubo pinning, and async provider replication | Rust / Axum |
| `lander/` | Public-facing landing page | React / Vite |
| `docs/` | Documentation site and architecture/protocol reference | Docusaurus / TypeScript |
