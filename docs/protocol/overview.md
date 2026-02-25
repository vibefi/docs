---
title: Overview
---

The VibeFi protocol coordinates three layers:

1. Governance and policy onchain.
2. Content-addressed application distribution via IPFS.
3. Local sandboxed execution in the client runtime.

`VFI` (VibeFi) is the native protocol governance token.

This section explains who participates in that system, how incentives align, and how `VFI` supports governance and protocol operations.

## Proposal access (current onchain behavior)

Protocol change proposals require minimum delegated `VFI` voting power. On our current Sepolia deployment, this amount is 1% of total `VFI` supply. Details:

- `VfiGovernor` checks proposer eligibility through a pluggable `IProposalRequirements` module.
- Current deployments use `MinimumDelegationRequirement`.
- Default policy is `minBps = 100`, meaning proposer voting power must be at least 1% of total `VFI` supply at the governance snapshot.
- This requirement contract is itself governance-updatable (`setProposalRequirements`).

## Deployment model

VibeFi enables fast deployment of new frontend interfaces:

- Community contributors can package and propose frontends quickly, including experimental or niche protocol interfaces.
- Governance approval and sandboxed runtime enforcement are the control layer that keeps rapid iteration reviewable and auditable.

For protocol-level governance and economic policy, see:

- [Network / Actors](./network-actors.md)
- [VFI](./vfi.md)
- [DAO](./dao.md)

For component-level implementation details, see:

- [Architecture Overview](../architecture/overview.md)
- [Contracts](../components/contracts.md)
- [Governance Lifecycle](../workflows/governance-lifecycle.md)
