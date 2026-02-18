---
title: Studio
---

`studio/` is the governance-facing web app for proposal workflows, voting, registry visibility, and bundle review.

## Current Role

- Propose `publishDapp` and `upgradeDapp` governance actions
- Vote, queue, and execute proposals
- Inspect DappRegistry state from on-chain events
- Review bundle manifests/files via the IPFS integration
- View historical proposals

Core implementation lives under `studio/src/` (notably `App.tsx`, `features/`, `eth/`, and `ipfs/`).

## Local Run

```bash
cd studio
bun install
bun x vite dev
```

Build for production:

```bash
cd studio
bun x vite build
```

See `studio/README.md`, `studio/design.md`, and `studio/plan.md` for scope and rollout details.
