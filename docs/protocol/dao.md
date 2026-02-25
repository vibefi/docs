---
title: DAO
---

The DAO can support protocol operations through governance-controlled revenue mechanisms.

## Revenue paths (proposed)

### 1) Frontend fee with creator kickbacks

Per-transaction frontend fee path:

- A router contract charges a small fee in native token (example target: `0.00001 ETH` per transaction).
- The collected fee is forwarded to an onchain fee splitter.
- The fee splitter is linked to `DappRegistry` so distribution can follow currently approved vapp metadata.
- Split configuration is updated through governance, in the same proposal lifecycle as app/registry updates.
- The splitter can route shares to DAO treasury and creator recipients, with creator kickbacks based on contribution policy.

### 2) Subscription NFT (ETH-paid) with fee bypass

Subscription path:

- User pays ETH to mint or maintain a subscription NFT.
- The client checks whether the connected wallet holds a valid subscription NFT.
- If present, frontend fee is not added for that wallet.
- If absent, standard frontend fee path applies.

## Governance and policy boundaries

- Proposing governance actions requires minimum delegated `VFI` voting power (current default: `100` BPS / `1%` via `MinimumDelegationRequirement`).
- Fee rates, split percentages, and recipient sets should be DAO-controlled parameters.
- Contribution-to-kickback rules should be explicit, auditable, and versioned through governance proposals.
- Subscription NFT validity rules (duration, renewal, revocation) should be contract-defined and governance-updatable where appropriate.
- Current governance contracts support approval/rejection outcomes through Governor voting and execution flow; proposal slashing is not currently implemented.
- Stake-and-slash proposal mechanics are being explored as a potential future mechanism, but are not finalized.

## Implementation notes

- Keep fee logic onchain and deterministic to minimize off-chain trust.
- Emit events for fee collection and split distribution so indexers can produce transparent accounting.
- Align client behavior with onchain policy: client-side checks should only gate UX, not replace contract enforcement.
