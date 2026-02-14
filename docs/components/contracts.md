---
title: Contracts
---

The `contracts/` directory contains the Solidity smart contracts that form the VibeFi protocol's control plane. These contracts manage dapp registration, security policies, and decentralized governance.

## Core Registry: `DappRegistry.sol`

The `DappRegistry` is the canonical source of truth for all approved dapps and their versions.

### Versioning Model
Dapps in the registry progress through a multi-version lifecycle:
- **`DappPublished`**: Triggered when a new dapp is created with its initial `rootCid`.
- **`DappUpgraded`**: Triggered when a new version (new `rootCid`) is approved for an existing dapp.
- **`DappMetadata`**: Stores off-chain references like name, version string, and description.

### Version Statuses
- `Published`: The version is active and can be run by users.
- `Paused`: The version is temporarily disabled (e.g., during a security investigation).
- `Deprecated`: The version is permanently disabled.

## Governance: `VfiGovernor.sol`

VibeFi uses an OpenZeppelin-based governor for decentralized decision-making, with protocol-specific extensions.

### Security Council Veto
The protocol includes a `SecurityCouncil` role with the power to immediately `veto` any active proposal before it is executed. This serves as a safety valve against malicious or buggy proposals.

### Proposal Requirements
Proposers must meet eligibility criteria (based on `VfiToken` balance) as defined in the `IProposalRequirements` contract. This prevents spam and ensures that only invested stakeholders can propose registry changes.

## Security Policies: `ConstraintsRegistry.sol`

This registry stores CIDs pointing to the security constraints (allowlists, forbidden patterns) used by the CLI and Client. Governance can update these constraints to adapt to new security threats or library updates.

## Local Development

The `contracts/` repo includes scripts for setting up a local devnet with pre-deployed contracts and funded accounts:

```bash
cd contracts
./script/local-devnet.sh
```

### Build Profiles
- Deployment/profile must use optimizer + `via_ir` compatible settings (`FOUNDRY_PROFILE=ci`) to satisfy contract size limits.
