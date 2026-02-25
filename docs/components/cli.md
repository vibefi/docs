---
title: CLI
---

The `cli/` package is a Bun/TypeScript tool for packaging dapps, interacting with governance, and managing the VibeFi registry. Built with Commander.js and Viem. See [Governance Lifecycle](../workflows/governance-lifecycle.md) for end-to-end proposal operations.

## Commands

### Global Options

Most commands accept:
- `--network <name>` — select from config (default: `defaultNetwork`)
- `--rpc <url>` — override RPC (or `VIBEFI_RPC_URL` env)
- `--devnet <path>` — override devnet JSON path
- `--pk <hex>` — override private key (or `VIBEFI_PRIVATE_KEY` env)
- `--json` — machine-readable output with `txHash` and decoded `logs`

### Status

```bash
vibefi status
```

Shows network, RPC, chain ID, contract addresses, signer info with role hints (developer, voter1, securityCouncil1, etc. when using devnet).

### Package

```bash
vibefi package --path ./my-app --name "App" --dapp-version "1.0.0" --description "..." [--json]
```

Validates and bundles a dapp directory:

1. **Layout detection** — accepts either:
   - `constrained`: `src/`, `assets/`, `abis/`, `vibefi.json`, `index.html`, `package.json`
   - `static-html`: `vibefi.json`, `index.html` plus only `.html`, `.js`, `.json` files

2. **Constrained dependency allowlist** — only pinned versions of approved packages:
   - `react` 19.2.4, `react-dom` 19.2.4, `wagmi` 3.4.1, `viem` 2.45.0, `shadcn` 3.7.0, `@tanstack/react-query` 5.90.20
   - Dev: `@vitejs/plugin-react` 5.1.2, `typescript` 5.9.3, `vite` 7.2.4, `@types/react` 19.2.4

3. **Constrained forbidden patterns** — scans `.ts`, `.tsx`, `index.html` for: `fetch(`, `XMLHttpRequest`, `WebSocket`, `import("http`, `http://`, `https://`

4. **Source properties validation** — `vibefi.json.addresses` must be present and all addresses must be valid EIP-55 checksums

5. **Constrained ABI validation** — all files in `abis/` must be valid JSON

6. **Manifest generation** — deterministic post-bundle `manifest.json` with sorted file list, byte counts, metadata, and layout (`constrained` or `static-html`)

7. **IPFS publish** — uploads bundle, returns `rootCid` (or `--no-ipfs` for keccak256 hash)

Options: `--constraints <path>` for custom constraint overrides, `--ipfs-api <url>`, `--no-ipfs`, `--no-emit-manifest`.

### Dapp Operations

```bash
vibefi dapp:propose --root-cid <cid> --name "App" --dapp-version "1.0.0" --description "..."
vibefi dapp:upgrade --dapp-id <id> --root-cid <cid> --name "App" --dapp-version "2.0.0" --description "..."
vibefi dapp:list [--json] [--from-block N] [--to-block N]
vibefi dapp:fetch --root-cid <cid> --out <dir> [--ipfs-api <url>] [--ipfs-gateway <url>] [--no-verify]
```

`dapp:propose` encodes `publishDapp()` calldata and submits a governance proposal. `dapp:list` aggregates all registry events (Published, Upgraded, Paused, Deprecated, etc.) and computes latest status per dapp.

`dapp:fetch` downloads a bundle from IPFS and verifies the CID matches.

### Governance

```bash
vibefi proposals:list [--from-block N] [--to-block N] [--limit 50]
vibefi proposals:show <proposalId> [--from-block N] [--to-block N]
vibefi proposals:queue <proposalId> [--from-block N] [--to-block N]
vibefi proposals:execute <proposalId> [--from-block N] [--to-block N]
```

### Voting

```bash
vibefi vote:cast <proposalId> --support for|against|abstain [--reason "..."]
vibefi vote:status <proposalId>
```

`vote:status` shows For/Against/Abstain counts and quorum requirement at snapshot block.

### Security Council

```bash
vibefi council:pause --dapp-id <id> --version-id <id> --reason "..."
vibefi council:unpause --dapp-id <id> --version-id <id> --reason "..."
vibefi council:deprecate --dapp-id <id> --version-id <id> --reason "..."
vibefi council:veto <proposalId> [--from-block N] [--to-block N]
```

## Configuration

On first run, CLI creates `.vibefi/config.json` from defaults:

```json
{
  "defaultNetwork": "devnet",
  "networks": {
    "mainnet": {
      "rpcUrl": "",
      "chainId": 1,
      "contracts": {
        "vfiToken": "", "vfiGovernor": "", "vfiTimelock": "",
        "dappRegistry": "", "constraintsRegistry": "", "proposalRequirements": ""
      }
    },
    "devnet": {
      "rpcUrl": "http://127.0.0.1:8545",
      "chainId": 31337,
      "devnetJson": "contracts/.devnet/devnet.json"
    }
  }
}
```

When a devnet JSON is present, the CLI auto-resolves contract addresses, test account keys, and provides role hints in output.

## ABI Refresh

Extracts ABIs from `contracts/out/` into `packages/shared/src/abis/`:

```bash
bun run refresh-abis
```

Run this after any contract changes.

## Smoke Test

```bash
bun run test:smoke
```

Spawns a local devnet, runs `status`, `proposals:list`, and `dapp:propose`, then tears down.
