---
title: Architecture Overview
---

VibeFi splits trust between governance, content addressing, and local runtime execution.

## Control plane

- Governance contracts (`VfiGovernor`, `VfiTimelock`) decide which dapp versions are approved.
- Registry contracts (`DappRegistry`, `ConstraintsRegistry`) store canonical references and policy roots.
- Security Council has emergency controls (veto/pause/deprecate).

## Data plane

- Dapp bundles are packaged deterministically by CLI.
- Content is published to IPFS and referenced by root CID.
- Human-readable metadata is emitted as events and indexed off-chain.

## Execution plane

- The Rust client fetches approved content, verifies/builds locally, and serves over `app://`.
- Runtime injects wallet provider (`window.ethereum`) and enforces restrictive CSP (`connect-src 'none'`).
- No arbitrary outbound HTTP from dapps; interaction is RPC/wallet mediated.

## Repo-level responsibilities

- `contracts/`: protocol control plane
- `cli/`: packaging/proposal operator interface
- `client/`: deterministic runtime for end users
- `e2e/`: integrated validation of governance + IPFS + runtime assumptions
- `dapp-examples/`: constrained example dapps and authoring constraints
- `studio/`: future UI-centric authoring/proposal surface
