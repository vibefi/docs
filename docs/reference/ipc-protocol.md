---
title: IPC Protocol
---

The VibeFi [client](../components/client.md) bridges dapp JavaScript and the Rust host via JSON-based IPC over Wry's `window.ipc.postMessage`. Dapps have no direct network or key access — all sensitive operations go through this bridge.

## Request

```json
{
  "id": 123,
  "providerId": "vibefi-provider",
  "method": "eth_sendTransaction",
  "params": [{ "to": "0x...", "value": "0x..." }]
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `u64` | Correlation ID for matching responses |
| `providerId` | `string?` | Routes to handler — see Provider IDs below |
| `method` | `string` | RPC method or internal method name |
| `params` | `array\|object` | Method parameters |

## Response

Delivered via `evaluate_script()` calling `window.__VibefiHostDispatch()`:

```json
{
  "kind": "rpcResponse",
  "payload": { "id": 123, "result": "0x...", "error": null }
}
```

Error shape: `{ "id": 123, "result": null, "error": { "code": 4001, "message": "User rejected" } }`

## Provider Events

Push events from host (e.g., after wallet connection):

```json
{
  "kind": "providerEvent",
  "payload": { "event": "accountsChanged", "value": ["0xabc..."] }
}
```

Standard EIP-1193 events: `accountsChanged`, `chainChanged`.

## WalletConnect Pairing

When WalletConnect generates a pairing URI, the host pushes:

```json
{
  "kind": "walletconnectPairing",
  "payload": { "uri": "wc:abc123...", "qr_svg": "<svg>...</svg>" }
}
```

The wallet selector renders the SVG as a scannable QR code.

## Provider IDs

| ID | Purpose |
|---|---|
| `vibefi-provider` | Standard Ethereum JSON-RPC (EIP-1193) for dapps |
| `vibefi-wallet` | Wallet selector UI methods |
| `vibefi-launcher` | Dapp registry/launcher methods |
| `vibefi-tabbar` | Tab bar control |
| `vibefi-settings` | Settings panel |
| `vibefi-ipfs` | Capability-scoped IPFS read APIs |

## Internal Methods

Beyond standard Ethereum JSON-RPC (`eth_*`, `personal_sign`, etc.), the client handles:

### Wallet Selector (`vibefi-wallet`)

| Method | Purpose |
|---|---|
| `vibefi_connectLocal` | Set backend to local signer |
| `vibefi_connectWalletConnect` | Start WalletConnect pairing flow |
| `vibefi_connectHardware` | Detect and connect Ledger/Trezor |

### Launcher (`vibefi-launcher`)

| Method | Purpose |
|---|---|
| `vibefi_listDapps` | Fetch registry entries from contract events |
| `vibefi_launchDapp` | Download from IPFS, build, open in new tab |
| `vibefi_openSettings` | Open settings panel |

### Settings (`vibefi-settings`)

| Method | Purpose |
|---|---|
| `vibefi_getEndpoints` / `vibefi_setEndpoints` | Read/persist RPC endpoint list |
| `vibefi_getIpfsSettings` / `vibefi_setIpfsSettings` | Read/persist IPFS config |

### Tab Bar (`vibefi-tabbar`)

| Method | Purpose |
|---|---|
| `switchTab` | Bring tab to front |
| `closeTab` | Close a tab |

### IPFS (`vibefi-ipfs`)

| Method | Purpose |
|---|---|
| `vibefi_ipfsHead` | Read metadata (`size`, `contentType`) for a CID/path |
| `vibefi_ipfsList` | Read and filter `manifest.json` file listing for a bundle CID |
| `vibefi_ipfsRead` | Read content as `json`, `text`, `snippet`, or raster `image` (hex) |

`vibefi_ipfsRead` expects params: `[cid, path, options]` where `options.as` is one of `json|text|snippet|image`.

IPFS requests emit progress through provider events with `event: "vibefiIpfsProgress"` and payload fields:
`ipcId`, `method`, `phase`, `percent`, `message`, plus optional `cid` and `path`.

## Security

- **Origin validation**: only accepts IPC from `app://` protocol
- **Provider ID enforcement**: internal methods restricted to correct webview contexts
- **Strict typing**: all messages validated against Rust `enum`/`struct` definitions in `ipc_contract.rs`
