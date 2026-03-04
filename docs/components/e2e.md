---
title: E2E
---

`e2e/` validates the full integrated path: package → IPFS publish → governance proposal → vote → queue → execute → fetch → verify (see [Governance Lifecycle](../workflows/governance-lifecycle.md)).

## Infrastructure

The test runner manages:

- **Anvil** — local EVM, started fresh (kills prior instances, removes stale `devnet.json`)
- **IPFS** — Docker container via `docker-compose.ipfs.yml`
- **[Contracts](./contracts.md)** — deployed via `contracts/script/local-devnet.sh`

Health checks poll for RPC availability (30s timeout), IPFS API (8s), and contract deployment (120s, checks governor bytecode).

## Configuration

```bash
cd e2e && cp .env.example .env
```

| Variable | Default | Required |
|---|---|---|
| `MONOREPO_DIR` | — | Yes (absolute path) |
| `MAINNET_RPC_URL` | — | No (used for mainnet fork mode) |
| `SEPOLIA_RPC_URL` | — | No (required only when running `--sepolia`) |
| `ANVIL_PORT` | 8546 | No |
| `IPFS_API` | `http://127.0.0.1:5001` | No |
| `IPFS_GATEWAY` | `http://127.0.0.1:8080` | No |

## Test Flow

For each of 5 dapps (`studio`, `uniswap-v2`, `aave-v3`, `safe-admin`, `zfi`):

1. **Package** — `vibefi package` validates, bundles, publishes to IPFS → `rootCid`
2. **Propose** — `vibefi dapp:propose` creates governance proposal → `txHash`
3. **Mine** — `anvil_mine` 1 block, decode `ProposalCreated` event → `proposalId`
4. **Vote** — `vibefi vote:cast <id> --support for`
5. **Mine voting period** — `anvil_mine` 25 blocks (exceeds 20-block `VOTING_PERIOD`)
6. **Check vote** — `vibefi vote:status` verifies counts and quorum
7. **Queue** — `vibefi proposals:queue` moves to timelock
8. **Advance time** — `evm_increaseTime` 2s + mine 1 block
9. **Execute** — `vibefi proposals:execute` triggers `DappRegistry.setDapp()`
10. **Fetch & verify** — `vibefi dapp:fetch` downloads from IPFS, recomputes CID to verify integrity

`zfi` is packaged from `dapp-examples/zfi/dapp` using the `static-html` layout.

After all cycles, `vibefi dapp:list` asserts at least 5 dapps in registry.

## Utilities

| Function | Purpose |
|---|---|
| `runCmd(cmd, args, opts)` | Spawn process with stdio control |
| `runCli(args, opts)` | CLI runner with auto-injected RPC/devnet paths |
| `waitFor(label, probe, timeout)` | Poll at 250ms intervals until probe succeeds |
| `logSection(title)` | Timed log section with elapsed duration |

All CLI commands run with `--json`; output parsed with `JSON.parse()` for field validation.

## Run

```bash
cd e2e && bun install && bun run e2e
```

Sepolia fork mode:

```bash
cd e2e && bun run e2e --sepolia
```

Anvil is left running after tests for manual inspection.

## Gov-agent test bundles

You can publish targeted security fixtures to validate gov-agent review behavior without running the full E2E suite.

```bash
cd e2e
bun run publish:test-bundle red_team_vapp
bun run publish:test-bundle malicious_uniswapv2
```

This creates governance proposals designed for fast gov-agent pickup checks.
