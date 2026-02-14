---
title: Shared Packages
---

`packages/shared/` (`@vibefi/shared`) is a TypeScript utility library used by the CLI and E2E test suite. No build step — exports directly from TypeScript source via Bun workspace resolution.

## Modules

### ABIs (`abi.ts`)

Exports full ABIs and extracted event definitions for all VibeFi contracts:

- `governorAbi`, `dappRegistryAbi`, `vfiTokenAbi`
- Event extractors: `proposalCreatedEvent`, `dappPublishedEvent`, `dappUpgradedEvent`, `dappMetadataEvent`, `dappPausedEvent`, `dappUnpausedEvent`, `dappDeprecatedEvent`

ABI JSON files live in `src/abis/` and are refreshed from contract build artifacts via `bun run refresh-abis` in the CLI.

### Configuration (`config.ts`)

Types and resolution functions for VibeFi's multi-network config:

| Type | Fields |
|---|---|
| `VibefiConfig` | `defaultNetwork`, `networks` map |
| `NetworkConfig` | `rpcUrl`, `chainId`, `devnetJson`, `contracts` |
| `ContractsConfig` | `vfiToken`, `vfiGovernor`, `vfiTimelock`, `dappRegistry`, `constraintsRegistry`, `proposalRequirements` |
| `DevnetJson` | Contract addresses, test account addresses + private keys, `deployBlock`, `chainId` |

Resolution functions: `resolveRpcUrl()`, `resolveDevnetJson()`, `loadDevnetJson()`, `resolveContracts()`, `resolveChainId()`, `resolveFromBlock()`. All support environment variable and parameter overrides.

### Clients (`clients.ts`)

Viem client factories:

- `buildChain(chainId?)` — creates a `defineChain()` object
- `getPublicClient(rpcUrl, chainId?)` — read-only HTTP transport
- `getWalletClient(rpcUrl, chainId, privateKey)` — signing client
- `resolvePrivateKey(devnet?, override?)` — with `VIBEFI_PRIVATE_KEY` fallback

### IPFS (`ipfs.ts`)

- `ipfsAdd(outDir, ipfsApi, opts?)` — upload directory to IPFS, returns root CID. Supports `pin` and `onlyHash` modes.
- `computeIpfsCid(outDir, ipfsApi)` — CID without pinning (verification)
- `fetchDappManifest(rootCid, gateway)` — download `manifest.json`
- `downloadDappBundle(rootCid, outDir, gateway, manifest)` — download full bundle

### File System (`fs-utils.ts`)

- `ensureDir(dir)` — recursive mkdir
- `walkFiles(root, opts?)` — recursive directory walk, skips `node_modules`/`.git`

### Constants (`constants.ts`)

```
DEFAULT_IPFS_API     = "http://127.0.0.1:5001"
DEFAULT_IPFS_GATEWAY = "https://ipfs.io"
DEFAULT_ANVIL_PORT   = 8545
DEFAULT_RPC_URL      = "http://127.0.0.1:8545"
```

## Consumers

- **CLI**: config loading, contract interactions, IPFS operations, file utilities
- **E2E**: devnet loading, public client creation, governor ABI for event decoding
