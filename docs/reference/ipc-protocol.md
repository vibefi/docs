---
title: IPC Protocol
---

The communication between the VibeFi dapp (running in the WebView) and the Rust Client host is handled via a secure Inter-Process Communication (IPC) bridge.

## Overview

Dapps do not have direct access to the network or the user's private keys. All sensitive operations are requested via `window.ethereum.request`, which is bridged to the host.

## Message Flow

### 1. Dapp to Host (Request)
The dapp calls `window.ethereum.request({ method, params })`. The injected preload script wraps this into an `IpcRequest` and sends it to the host via `window.ipc.postMessage`.

**Request Structure:**
```json
{
  "id": 123,
  "providerId": "vibefi-provider",
  "method": "eth_sendTransaction",
  "params": [...]
}
```

### 2. Host to Dapp (Response)
The Rust host processes the request (e.g., by prompting the user for approval or proxying to an RPC node). It then dispatches a response using the `__VibefiHostDispatch` function in the WebView.

**Response Structure:**
```json
{
  "kind": "RpcResponse",
  "payload": {
    "id": 123,
    "result": "0x...",
    "error": null
  }
}
```

### 3. Host to Dapp (Event)
The host can emit asynchronous events (like account or chain changes) to the dapp.

**Event Structure:**
```json
{
  "kind": "ProviderEvent",
  "payload": {
    "event": "accountsChanged",
    "value": ["0x..."]
  }
}
```

## Provider IDs

The bridge supports multiple virtual "providers" for different system responsibilities:

- `vibefi-provider`: Standard Ethereum RPC (EIP-1193).
- `vibefi-launcher`: Internal commands for the VibeFi launcher/home screen.
- `vibefi-wallet`: Commands for managing the local wallet state.
- `vibefi-tabbar`: UI synchronization for the desktop tab bar.

## Security Controls

- **Origin Validation**: The host only accepts IPC messages from dapps served over the `app://` protocol.
- **Method Filtering**: Only approved RPC methods are passed through to the underlying node or wallet backend.
- **Strict Typing**: All IPC messages are strictly validated against Rust `enum` and `struct` definitions in `ipc_contract.rs`.
