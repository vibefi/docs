---
title: CLI
---

The `cli/` package is a Bun/TypeScript tool for packaging dapps, interacting with governance, and managing the VibeFi registry. Built with Commander.js and Viem.

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

1. **Dependency allowlist** — only pinned versions of approved packages:
   - `react` 19.2.4, `react-dom` 19.2.4, `wagmi` 3.4.1, `viem` 2.45.0, `shadcn` 3.7.0, `@tanstack/react-query` 5.90.20
   - Dev: `@vitejs/plugin-react` 5.1.2, `typescript` 5.9.3, `vite` 7.2.4, `@types/react` 19.2.4

2. **Forbidden patterns** — scans `.ts`, `.tsx`, `index.html` for: `fetch(`, `XMLHttpRequest`, `WebSocket`, `import("http`, `http://`, `https://`

3. **Address validation** — all addresses in `addresses.json` must be valid EIP-55 checksums

4. **ABI validation** — all files in `abis/` must be valid JSON

5. **Manifest generation** — deterministic `manifest.json` with sorted file list, byte counts, metadata, and constraint versions

6. **IPFS publish** — uploads bundle, returns `rootCid` (or `--no-ipfs` for keccak256 hash)

Options: `--constraints <path>` for custom constraint overrides, `--ipfs-api`, `--ipfs-gateway`.

### Dapp Operations

```bash
vibefi dapp:propose --root-cid <cid> --name "App" --dapp-version "1.0.0" --description "..."
vibefi dapp:upgrade --dapp-id <id> --root-cid <cid> --name "App" --dapp-version "2.0.0" --description "..."
vibefi dapp:list [--json] [--from-block N]
vibefi dapp:fetch --root-cid <cid> --out <dir> [--ipfs-api <url>] [--ipfs-gateway <url>]
```

`dapp:propose` encodes `publishDapp()` calldata and submits a governance proposal. `dapp:list` aggregates all registry events (Published, Upgraded, Paused, Deprecated, etc.) and computes latest status per dapp.

`dapp:fetch` downloads a bundle from IPFS and verifies the CID matches.

### Governance

```bash
vibefi proposals:list [--from-block N] [--limit 50]
vibefi proposals:show <proposalId>
vibefi proposals:queue <proposalId>
vibefi proposals:execute <proposalId>
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
vibefi council:unpause --dapp-id <id> --version-id <id>
vibefi council:deprecate --dapp-id <id> --version-id <id>
vibefi council:veto <proposalId>
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
