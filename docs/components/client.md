---
title: Client
---

The `client/` repo is a Rust/Wry desktop runtime that provides a secure, deterministic environment for VibeFi dapps.

## Local Verified Builds

To prevent supply-chain attacks and ensure dapps run exactly as proposed, the Client does not simply serve static files from IPFS. Instead, it performs a **Local Verified Build**:

1.  **Source Retrieval**: Fetches the dapp source bundle from IPFS using the `rootCid`.
2.  **Manifest Verification**: Validates every file against the `manifest.json` included in the bundle.
3.  **Environment Injection**: The client injects a standard `package.json`, `vite.config.ts`, and `tsconfig.json` into the temporary build directory. This ensures the dapp is built with the protocol's hardened configuration.
4.  **Deterministic Build**: Runs `bun install --no-save` followed by `vite build`. This produces a clean distribution bundle in a local `.vibefi/dist` directory.

## Secure Runtime & IPC Bridge

Dapps run inside a WebView served over a custom `app://` protocol. Interaction with the user's wallet and the host system is strictly mediated via an IPC bridge.

### `window.ethereum` Injection

The client's `internal-ui` includes a `preload-app.ts` script that is injected into every dapp WebView. This script:
- Defines a standard EIP-1193 `window.ethereum` provider.
- Forwards `ethereum.request` calls to the Rust host via `window.ipc.postMessage`.
- Handles host responses and events (like `accountsChanged` or `chainChanged`) through a global `__VibefiHostDispatch` function.

### CSP Enforcement

The Client enforces a strict Content Security Policy:
- `connect-src 'none'`: Dapps cannot make any direct network requests (no `fetch`, `XHR`, or `WebSockets`).
- All external data must be retrieved via the `eth_call` or other RPC methods through the injected provider.

## Build and Run

```bash
cd client
cargo run -- --config ../contracts/.devnet/devnet.json
```

### Wallet Backends
The client supports multiple wallet modes via the IPC bridge:
- **Local**: Uses deterministic devnet keys (for testing).
- **WalletConnect**: Bridges dapp requests to an external wallet via the `walletconnect-helper` (Node.js sidecar).
- **Hardware**: (Experimental) Direct interaction with hardware wallets.
