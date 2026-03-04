---
title: Dapp Examples
---

`dapp-examples/` contains four reference dapps demonstrating both supported VibeFi bundle layouts and Ethereum interaction patterns.

## Constraint Model

Examples comply with one of two [CLI packaging layouts](./cli.md#package):

- **Constrained layout** (`aave-v3`, `uniswap-v2`, `safe-admin`)
  - pinned dependency and devDependency allowlists
  - strict constrained entrypoint:
    - `src/main.tsx` is required
    - `index.html` must include `<script type="module" src="/src/main.tsx"></script>`
  - source/assets/ABI structure and extension checks
  - forbidden network patterns in source (`fetch`, XHR, WebSocket, HTTP imports/URLs)
- **Static-html layout** (`zfi/`)
  - requires `vibefi.json` and `index.html`
  - allows only `.html`, `.js`, `.json` files in the packaged tree

All examples rely on injected wallet/RPC interfaces (`window.ethereum`) at runtime.

## Aave V3

Lending protocol interface: supply, withdraw, borrow, repay across ETH/WETH/USDC/DAI.

**Key patterns:**
- ERC-20 approval flow before supply (check allowance → approve → supply)
- Native ETH handled via `WrappedTokenGateway` (separate contract path)
- Read-only account data via `Pool.getUserAccountData()` — collateral, debt, health factor
- wagmi hooks for contract reads (`useReadContract`) and writes (`useWriteContract`)

**Components:** `WalletBar`, `AccountOverview`, `AssetPanel` (multi-mode: supply/withdraw/borrow/repay)

## Uniswap V2

DEX interface: swap ETH ↔ ERC-20 tokens with quoting and slippage control.

**Key patterns:**
- `Router.getAmountsOut()` for price quotes
- Slippage: `minOut = amountOut * (10000 - slipBps) / 10000`
- Deadline: `now + 10 minutes`
- Separate flows for ETH→Token (`swapExactETHForTokens`, payable) and Token→ETH (`swapExactTokensForETH`, requires approval)
- Token metadata auto-detection via `symbol()`, `decimals()`, `name()` calls

**Custom hooks:** `useQuote`, `useEthBalance`, `useErc20Balance`, `useAllowance`, `useTokenMeta`

## Safe Admin

Read-only multisig admin interface (Phase 1). Load a Safe by address, view owners/threshold/nonce/balance, browse execution history from onchain logs.

**Key patterns:**
- Safe contract validation via `getVersion()`
- Parallel multicall for Safe state (`getOwners`, `getThreshold`, `nonce`, `getGuard`, etc.)
- Onchain history via `ExecutionSuccess` event logs with block-range pagination (50k block chunks)
- ERC-20 transfer decoding from transaction calldata
- URL param deep linking: `?safe=0x...`

**Planned phases:** Phase 2 (propose/sign/execute), Phase 3 (owner management), Phase 4 (hardening).

## zFi (Static HTML)

Multi-page static dapp packaged from the nested `zfi/` submodule under `dapp-examples/zfi/dapp`.

**Key patterns:**
- Ships prebuilt HTML/JS pages without a React/Vite build step
- Uses checked-in `vibefi.json` for addresses (no generated manifest source file)
- Validated and bundled through the CLI static-html layout path

## Common Patterns

**Contract interaction:**
```ts
// Read (RPC)
const data = await publicClient.readContract({ address, abi, functionName, args })

// Write (wallet)
const hash = await walletClient.writeContract({ account, address, abi, functionName, args, value })
const receipt = await publicClient.waitForTransactionReceipt({ hash })
```

**State management:** React hooks + wagmi hooks (`useAccount`, `useConnect`, `useReadContract`, `useWriteContract`) + React Query (via wagmi) for caching.

**Styling:** Lightweight local CSS and inline styles.

## Local Development

```bash
cd dapp-examples
git submodule sync --recursive
git submodule update --init --recursive

cd uniswap-v2  # or aave-v3, safe-admin
bun install
RPC_URL="https://mainnet.infura.io/v3/YOUR_KEY" bun vite dev
```

For `zfi`:

```bash
cd dapp-examples/zfi/dapp
# static-html app: no package manager install required
```

These examples serve as templates for new dapps. Copy the structure, swap ABIs/addresses, and adapt the UI.
