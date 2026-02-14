---
title: Client
---

The `client/` repo is a Rust/Wry desktop runtime for approved VibeFi dapps.

## Responsibilities

- Load dapps inside a WebView with injected `window.ethereum` provider.
- Fetch and verify bundle content from IPFS.
- Build local bundles using Bun/Vite when needed.
- Enforce runtime restrictions (`app://` protocol + strict CSP).

## Build and run

```bash
cd client
cargo build
cargo run
cargo run -- --config ../contracts/.devnet/devnet.json
cargo run -- --bundle ../cli/.vibefi/cache/<rootCid>
```

## Config model

Resolution order is:

1. CLI args (`--config`, `--bundle`, `--no-build`)
2. Config JSON
3. `VIBEFI_*` env overrides
4. Compile-time/debug defaults
5. Runtime `settings.json` (applied at use sites)

## Internal UI

`client/internal-ui` is built automatically by `build.rs` during `cargo build`/`cargo run`.

Manual build:

```bash
cd client/internal-ui
bun install
bun run build
# optional type check
tsc --noEmit
```

## Wallet backends

- `local` (dev/testing)
- `walletconnect` via `client/walletconnect-helper`

Set `VIBEFI_WC_PROJECT_ID` (or config field) to use WalletConnect mode.
