---
title: Client
---

The `client/` repo is a Rust desktop app (Wry/Tao) that fetches, verifies, builds, and runs VibeFi dapps in sandboxed webviews.

## Architecture

### Multi-Webview System

The client renders two layers of webviews inside a single native window:

- **Tab bar** (40px, top): Persistent React app managing open tabs. Communicates via `vibefi-tabbar` provider.
- **App webviews** (below tab bar): One per open dapp or internal page. Swapped in/out by `WebViewManager`.

Internal pages include: **Launcher** (dapp registry browser), **Home** (demo/debug), **Wallet Selector**, and **Settings**.

Platform differences:
- macOS/Windows: child webviews via Wry's `build_as_child()`
- Linux (Wayland): GTK `Box` containers to avoid CSD offset bugs

### Event Loop

The main thread runs a Tao event loop. All mutations flow through `UserEvent` variants sent via `EventLoopProxy::send_event()`. No async/await on the main thread — blocking work (signing, IPFS fetches, WalletConnect I/O) is spawned on `std::thread` and results routed back as events.

### IPC Flow

```
DApp JS: window.ethereum.request({method, params})
  → IpcClient.request() → window.ipc.postMessage(JSON)
  → Wry handler → UserEvent::Ipc
  → Main loop → ipc::handle_ipc() (router.rs)
  → Route by provider_id + method
  → Result → evaluate_script("window.__VibefiHostDispatch({...})")
  → JS promise resolves
```

Each IPC message carries `{id, provider_id, method, params}`. Responses are correlated by `id`.

### Provider IDs

| ID | Purpose |
|---|---|
| `vibefi-provider` | Standard Ethereum RPC (eth_*) for dapps |
| `vibefi-wallet` | Wallet selector UI |
| `vibefi-launcher` | Dapp registry/launcher |
| `vibefi-tabbar` | Tab bar control |
| `vibefi-settings` | Settings panel |
| `vibefi-ipfs` | Capability-scoped IPFS reads (`head`, `list`, `read`) |

## Configuration

Resolution order (later wins):

1. **Defaults** — hardcoded (RPC `127.0.0.1:8546`, IPFS gateway `127.0.0.1:8080`)
2. **`--config <path>`** — JSON file with `AppConfig` fields:
   - `chainId`, `rpcUrl`, `dappRegistry`, `localNetwork`, `developerPrivateKey`
   - `walletConnect: {projectId, relayUrl}`
   - `ipfsBackend`, `ipfsGateway`, `ipfsHeliaGateways`, `cacheDir`
3. **Environment variables** — `VIBEFI_RPC_URL`, `VIBEFI_WC_PROJECT_ID`, `VIBEFI_WC_RELAY_URL`, `VIBEFI_ENABLE_DEVTOOLS`

Run with a devnet config:

```bash
cargo run -- --config ../contracts/.devnet/devnet.json
```

## Wallet Backends

Three mutually exclusive backends; selected at runtime via wallet selector UI:

| Backend | Implementation | Use Case |
|---|---|---|
| **Local** | `PrivateKeySigner` (Alloy) | Devnet testing. Uses demo key when `localNetwork: true`. |
| **WalletConnect** | Out-of-process Node.js helper, stdin/stdout JSON | Production mobile/desktop wallets |
| **Hardware** | Ledger then Trezor auto-detect (Alloy) | LedgerLive(0) / TrezorLive(0) HD paths |

### Wallet Selection Flow

1. Dapp calls `eth_requestAccounts` with no backend set
2. Request queued as `PendingConnect {webview_id, ipc_id}`
3. Wallet selector tab opens (Local / WalletConnect / Hardware)
4. User picks → `vibefi_connect*` IPC sets backend in `AppState`
5. All pending connects resolved, selector tab auto-closes

Backend is set once per session. Switching requires restart.

## Bundle Mode

```bash
cargo run -- --bundle ../cli/.vibefi/cache/<rootCid>
```

1. Reads `manifest.json`, validates file list and sizes
2. Runs `bun install --no-save` + `bun x vite build` (skippable with `--no-build`)
3. Serves compiled output from `.vibefi/dist/` via `app://` protocol

## Launcher / Registry

When `--config` provides a `dappRegistry` address:
- Launcher scans contract events (`DappPublished`, `DappUpgraded`, `DappMetadata`, `DappPaused`, etc.)
- User clicks a dapp → IPFS fetch → local build → open in new tab
- Progress events (`vibefiLaunchProgress`) streamed to launcher UI
- Cache dir: `~/.cache/VibeFi/<rootCid>/`

## Security

- **CSP**: `default-src 'self' app:; connect-src 'none'` — dapps cannot make outbound HTTP
- **Navigation whitelist**: only `app://`, `about:blank` allowed
- **No external scripts**: all internal JS embedded at compile time via `include_str!()`
- **WalletConnect URI redaction** in logs (first 18 + last 6 chars)

## RPC Failover

`RpcManager` tracks multiple endpoints with health states. On transient errors: 3 retries with exponential backoff. Non-transient JSON-RPC errors returned immediately.

## IPFS Modes

Configurable via settings panel at runtime:

- **Helia** (default): public gateways (Trustless Gateway, Cloudflare, Filebase, ipfs.io, dweb.link)
- **LocalNode**: connects to `127.0.0.1:5001`

## Internal UI Build

React components in `internal-ui/` are built as IIFE bundles:

```bash
cd client/internal-ui && bun run build
```

Output JS/HTML is embedded into the Rust binary via `include_str!()` in `webview.rs`. **React must be built before `cargo build`** — `build.rs` handles this automatically.

## Devtools

Enabled automatically in debug builds. Force in release via `VIBEFI_ENABLE_DEVTOOLS=1`.
