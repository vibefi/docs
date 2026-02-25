---
title: Governance Lifecycle
---

This is the end-to-end operational flow for publishing a new dapp version.

## 1. Start prerequisites

- Start local IPFS.
- Start contracts devnet.
- Ensure [CLI](../components/cli.md) ABIs are refreshed.

## 2. Package dapp content

```bash
cd cli
bun run src/index.ts package \
  --path ../dapp-examples/uniswap-v2 \
  --name "Uniswap V2" \
  --dapp-version "0.0.1" \
  --description "Uniswap V2 example" \
  --json
```

Capture the returned `rootCid`.

## 3. Propose publication

```bash
bun run src/index.ts dapp:propose \
  --root-cid <rootCid> \
  --name "Uniswap V2" \
  --dapp-version "0.0.1" \
  --description "Uniswap V2 example"
```

## 4. Vote and finalize

Wait for each governance phase before running the next command:

- After `dapp:propose`, wait for the proposal to become `Active` (voting delay).
- After `vote:cast`, wait for the proposal to become `Succeeded` (voting period + quorum/pass checks).
- After `proposals:queue`, wait for timelock delay before `proposals:execute`.

Current Sepolia deployment parameters:

- `votingDelay = 1` block
- `votingPeriod = 50` blocks
- `timelockDelay = 60` seconds

```bash
bun run src/index.ts vote:cast <proposalId> --support for
bun run src/index.ts proposals:queue <proposalId>
bun run src/index.ts proposals:execute <proposalId>
```

Use this to check proposal state between steps:

```bash
bun run src/index.ts proposals:show <proposalId> --network sepolia --json
```

## 5. Validate registry state

```bash
bun run src/index.ts dapp:list --json
```

## 6. Retrieve and run in client

```bash
bun run src/index.ts dapp:fetch --root-cid <rootCid> --out .vibefi/cache
cd ../client
cargo run -- --bundle ../cli/.vibefi/cache/<rootCid>
```

## Security controls in this flow

- Proposal eligibility is contract-enforced.
- Governance executes through timelock.
- Security Council can pause/deprecate and cancel queued operations.
- [Client](../components/client.md) runtime prevents arbitrary network exfiltration from frontend bundles.
