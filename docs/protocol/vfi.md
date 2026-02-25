---
title: VFI
---

`VFI` is the native token of VibeFi. In simple terms, it is the token people use to participate in protocol governance.

## What `VFI` is for

- `VFI` holders can vote on protocol decisions.
- `VFI` voting power is used to approve or reject governance proposals.
- `VFI` is also used to determine who can submit proposals, not just who can vote.

## How participation works (high level)

- To vote, holders must delegate voting power.
- To propose, a wallet must meet the protocol's minimum delegated voting-power requirement.
- Governance settings define quorum, vote timing, and proposal execution flow.

## Current deployment status

`VFI` is currently deployed on Sepolia testnet, with mainnet deployment intended later.

## Current onchain mechanics (technical)

- The contracts use `ERC20Votes` semantics for checkpointed voting power.
- Delegation is required for voting power to be active.
- Proposer eligibility is enforced by `VfiGovernor` through `IProposalRequirements`.
- The default requirement module is `MinimumDelegationRequirement` with `minBps = 100` (1% of total supply).
- Eligibility is evaluated from governance snapshot voting power, not raw wallet balance.
- Governance, timelock, and registry interactions are implemented in [Contracts](../components/contracts.md).

## Potential future mechanics (not implemented today)

- Proposal bond/stake lock for submission.
- Proposal slashing outcomes.
- Proposed protocol/frontend fee mechanisms (for example per-transaction frontend fees and subscription-based fee bypass), as outlined in [DAO](./dao.md).

These mechanisms are potential future governance designs and remain under active development.

## Scope

This page is a protocol-level summary. Emissions, treasury policy, fee mechanics, and long-term economic policy can be documented here as those designs are finalized.
