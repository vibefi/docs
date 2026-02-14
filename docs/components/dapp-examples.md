---
title: Dapp Examples
---

`dapp-examples/` contains three fully functional reference dapps demonstrating VibeFi packaging constraints and Ethereum interaction patterns.

## Constraint Model

All examples comply with the [CLI packaging constraints](./cli.md#package):

- **Pinned dependencies only** — React 19.2.4, wagmi 3.4.1, viem 2.45.0, etc.
- **No network access** — no `fetch()`, `XMLHttpRequest`, `WebSocket`, or HTTP imports
- **Allowed file types** — `.ts`, `.tsx` (source), `.webp` (assets), `.json` (ABIs), plus build configs
- **RPC via `window.ethereum`** — all chain interaction goes through the injected provider

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
- Deadline: `now + 10 minutes` prevents sandwich attacks
- Separate flows for ETH→Token (`swapExactETHForTokens`, payable) and Token→ETH (`swapExactTokensForETH`, requires approval)
- Token metadata auto-detection via `symbol()`, `decimals()`, `name()` calls

**Custom hooks:** `useQuote`, `useEthBalance`, `useErc20Balance`, `useAllowance`, `useTokenMeta`

## Safe Admin

Read-only multisig admin interface (Phase 1). Load a Safe by address, view owners/threshold/nonce/balance, browse execution history from on-chain logs.

**Key patterns:**
- Safe contract validation via `getVersion()`
- Parallel multicall for Safe state (`getOwners`, `getThreshold`, `nonce`, `getGuard`, etc.)
- On-chain history via `ExecutionSuccess` event logs with block-range pagination (50k block chunks)
- ERC-20 transfer decoding from transaction calldata
- URL param deep linking: `?safe=0x...`

**Planned phases:** Phase 2 (propose/sign/execute), Phase 3 (owner management), Phase 4 (hardening).

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

**Styling:** Inline CSS (no Tailwind/Bootstrap) — Aave uses CSS variables in `index.html`, Uniswap uses React inline styles, Safe uses CSS strings in TypeScript.

## Local Development

```bash
cd dapp-examples/uniswap-v2  # or aave-v3, safe-admin
bun install
RPC_URL="https://mainnet.infura.io/v3/YOUR_KEY" bun vite dev
```

These examples serve as templates for new dapps. Copy the structure, swap ABIs/addresses, and adapt the UI.
