---
title: Dapp Examples
---

`dapp-examples/` contains constrained reference frontends for VibeFi packaging and governance flows.

## Constraint model

Examples are expected to stay within a strict dependency/file envelope documented in:

- `dapp-examples/constraints.md`
- `dapp-examples/prompt.md`

Notable constraints include:

- Approved dependency versions only
- Bundled source/assets/ABI/address files only
- RPC + `window.ethereum` interactions (no arbitrary HTTP fetches)

## Local run pattern

```bash
cd dapp-examples/<example>
bun install
RPC_URL="https://..." bun vite dev
```

## Known gaps in current source docs

Current markdown in this directory still includes TODO placeholders for:

- CLI scaffold command reference
- `addresses.json` schema
- `manifest.json` schema
- publishing workflow documentation

This docs pass treats those as open documentation tasks.
