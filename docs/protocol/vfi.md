---
title: VFI
---

`VFI` is the protocol token used for governance participation.

## Role in governance

- `VFI` holders can vote on protocol proposals after delegation.
- Voting power and quorum are enforced by governance contracts.
- Proposal creation requires meeting minimum delegated voting requirements.
- In current contracts, proposal eligibility is based on delegated voting power snapshots, not staked/locked `VFI`.

## Current behavior in this stack

- The contracts use `ERC20Votes` semantics for checkpointed voting power.
- Delegation is required for voting power to be active.
- Proposer eligibility is checked by `VfiGovernor` through `IProposalRequirements`.
- Current default requirement module is `MinimumDelegationRequirement` with `minBps = 100` (1% of total supply).
- Eligibility is evaluated from governance snapshot voting power (not raw wallet balance).
- Governance, timelock, and registry interactions are implemented in the protocol contracts.

## Not currently implemented on-chain

- Proposal bond/stake lock for submission.
- Proposal slashing outcomes.

These mechanisms are potential future governance designs and remain under active development.

See [Contracts](../components/contracts.md) for implementation details and deployment parameters.

## Scope note

This page is a protocol-level summary. Emissions, treasury policy, fee mechanics, and long-term economic policy can be documented here as those designs are finalized.
