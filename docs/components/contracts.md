---
title: Contracts
---

The `contracts/` repo is the source of truth for governance and registry behavior.

## Core contracts

- `VfiToken`: ERC20 + voting delegation.
- `VfiGovernor`: OZ Governor stack with quorum + proposal rules.
- `VfiTimelock`: timelock executor for governance actions.
- `DappRegistry`: dapp/version lifecycle with CID and status.
- `ConstraintsRegistry`: on-chain constraints root registry.
- `MinimumDelegationRequirement`: default proposer eligibility module.

## Local development

```bash
cd contracts
FOUNDRY_PROFILE=ci forge fmt --check
FOUNDRY_PROFILE=ci forge build --sizes
FOUNDRY_PROFILE=ci forge test -vvv
./script/local-devnet.sh
```

## Notes

- Deployment/profile must use optimizer + `via_ir` compatible settings (`FOUNDRY_PROFILE=ci`) to satisfy size limits.
- Security Council rotation requires explicit role updates on registry contracts; changing governor council alone is not sufficient.
- `contracts/specs/vibefi-dao-contracts-spec.md` is historical context, not canonical implementation guidance.

## Sepolia snapshot

`contracts/README.md` contains a deployment address table marked as current on **February 11, 2026**. Treat that table as point-in-time data and verify addresses before production use.
