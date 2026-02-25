---
title: Network / Actors
---

VibeFi has a set of protocol actors with distinct responsibilities.

## Core actors

- **Contributors / DAO members** package and propose frontend bundles under protocol constraints, vote on governance proposals.
- **Delegates** token holders trusted by others to represent voting power and provide informed voting judgment; a formal nomination and delegation process is planned.
- **Security Council** is a temporary emergency role intended to be dissolved once governance is sufficiently decentralized.
- **Node operators** run [gov-agent](../components/gov-agent.md) nodes as an always-on node process that watches proposals, decodes dapp actions, reviews bundle risk, and publishes recommendations or submits votes.
- **End users** run approved dapps from onchain registry state in the local client.

## Gov-agent as a protocol node

- The gov-agent is effectively the protocol's decision-support node in production operations.
- It continuously scans `VfiGovernor` proposal events, decodes publish/upgrade calldata, and fetches referenced bundles from IPFS for review.
- In default mode, it runs dry and emits recommendations; vote submission is opt-in and guarded by signer preflight checks.
- Running multiple independent agent nodes enables diverse review policies and reduces single-operator dependence.

## Proposal access

- Proposal creation is not open to every wallet.
- `VfiGovernor` enforces an `IProposalRequirements` check at propose time.
- Current default requirement is minimum delegated voting power as BPS of total supply (`MinimumDelegationRequirement`), commonly set to `100` BPS (`1%`).
- Delegation matters: holding `VFI` without delegation does not activate voting power for governance actions.
- Proposer stake lock/slash mechanics are not implemented in the current contracts.

## Security Council lifecycle

- Current contracts give the Security Council emergency powers in two places:
- `DappRegistry`: holders of `SECURITY_COUNCIL_ROLE` can pause/unpause/deprecate dapp versions.
- `VfiTimelock`: holders of `CANCELLER_ROLE` can cancel queued timelock operations (granted to Security Council in deployment scripts).
- These powers can be phased out by DAO governance by revoking the Security Council roles via governance-controlled role admin actions.

## Trust and accountability

- Governance determines approved dapp versions and protocol parameters.
- The registry and constraints references are onchain and auditable.
- Bundles are content-addressed, so the reviewed content is the content users fetch.
- Runtime policy enforcement happens locally in the client sandbox.

## Related docs

- [Contracts](../components/contracts.md)
- [Gov Agent](../components/gov-agent.md)
- [Governance Lifecycle](../workflows/governance-lifecycle.md)
- [Architecture Overview](../architecture/overview.md)
