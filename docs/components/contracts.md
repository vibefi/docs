---
title: Contracts
---

The `contracts/` directory contains Foundry/Solidity smart contracts implementing onchain governance, a dapp registry, and build constraints storage. Built on OpenZeppelin 5.4.

## Contract Inventory

### VfiToken (21 lines)

ERC20 + ERC20Votes. Constructor mints initial supply to a designated holder. Holders must self-delegate to activate voting power.

### VfiTokenSeller (102 lines)

Fixed-price testnet token seller for Sepolia:

- Accepts ETH and transfers `VFI` from contract inventory to a recipient.
- Owner can update `tokensPerEth`, withdraw collected ETH, and withdraw unsold tokens.
- Includes quote and inventory helpers for operational tooling (`quoteTokenAmount`, `tokensAvailable`).

### VfiGovernor (176 lines)

OpenZeppelin Governor stack: `GovernorSettings` + `GovernorCountingSimple` (For/Against/Abstain) + `GovernorVotes` + `GovernorVotesQuorumFraction` + `GovernorTimelockControl`.

Extensions:
- **Pluggable proposal eligibility** via `IProposalRequirements`. Governance can swap the implementation with `setProposalRequirements()`.
- **Role-based cancellation path via Timelock**: queued operations can be canceled by `CANCELLER_ROLE` on `VfiTimelock` (granted to Security Council in deploy scripts).

### VfiTimelock (10 lines)

Thin wrapper around OZ `TimelockController`.

- Governor holds `PROPOSER_ROLE`.
- Execution is open (`address(0)` has `EXECUTOR_ROLE`).
- Security Council is granted `CANCELLER_ROLE` in deployment scripts.

### DappRegistry (176 lines)

Stores dapp versions onchain. Each version holds a `rootCid` (bytes), status, proposer, and timestamp.

**Version lifecycle:**

```
Published ←→ Paused    (reversible, Council or governance)
    ↓
Deprecated              (terminal, cannot unpause)
```

Human-readable metadata (name, version, description) is emitted as `DappMetadata` events, not stored — gas efficient, indexer friendly.

**Access control:**
- `GOVERNANCE_ROLE` (held by Timelock): publish, upgrade, deprecate
- `SECURITY_COUNCIL_ROLE`: pause, unpause, deprecate

### ConstraintsRegistry (31 lines)

Maps `constraintsId (bytes32) → rootCid (bytes)`. Governance-only updates. Used by CLI and Client to anchor build constraints without onchain policy logic.

### MinimumDelegationRequirement (27 lines)

Default `IProposalRequirements` implementation. Requires proposer voting power >= `minBps` basis points of total supply (default: 100 BPS = 1%).

## Governance Flow

```
Proposer (eligible) → propose()
    ↓ voting delay (blocks)
Voting period (token holders vote For/Against/Abstain)
    ↓ voting period ends
Queue to Timelock → queue()
    ↓ timelock delay (seconds)
Execute → execute() (anyone can call)
```

After queueing and before execution, `CANCELLER_ROLE` can cancel queued timelock operations.

## Deployment

### Local Devnet

```bash
cd contracts && ./script/local-devnet.sh
```

Starts Anvil, deploys all contracts, writes `.devnet/devnet.json` with addresses, test accounts, and private keys.

**Test accounts** (from mnemonic "test test test...junk"):

| Index | Role | Allocation |
|---|---|---|
| 0 | Developer/deployer | Remaining supply |
| 1 | Voter 1 | 100k VFI |
| 2 | Voter 2 | 100k VFI |
| 3 | Security Council 1 | 50k VFI (assigned onchain) |
| 4 | Security Council 2 | 50k VFI (funded, not assigned) |

**Default devnet parameters** (configurable via env vars):

| Parameter | Default |
|---|---|
| `VOTING_DELAY` | 1 block |
| `VOTING_PERIOD` | 20 blocks |
| `QUORUM_FRACTION` | 4% |
| `TIMELOCK_DELAY` | 1 second |
| `MIN_PROPOSAL_BPS` | 100 (1%) |
| `INITIAL_SUPPLY` | 1M VFI |

### Sepolia

`DeploySepolia.s.sol` derives deployer from `SEPOLIA_MNEMONIC`, self-delegates, and outputs JSON with all addresses.

### Build Profile

`VfiGovernor` exceeds EIP-170 contract size limits without optimization. Deployment **requires** the CI profile:

```bash
FOUNDRY_PROFILE=ci forge build --sizes
FOUNDRY_PROFILE=ci forge test -vvv
```

## Testing

Three test suites:

- **DappRegistry.t.sol**: Unit tests for publish, upgrade, pause/unpause
- **VfiTokenSeller.t.sol**: Unit tests for purchase flow, slippage checks, ownership controls, and withdrawals
- **GovernanceIntegration.t.sol**: Full governance cycles — propose, vote, queue, execute, timelock cancel, upgrade, deprecate, constraints update

Tests use `DeployVibeFi.deploy()` to mirror production deployment, plus Forge cheatcodes (`vm.prank`, `vm.warp`, `vm.expectEmit`).

## Known Limitations

1. **Security Council rotation/removal** is role-based. Update `SECURITY_COUNCIL_ROLE` on `DappRegistry` and `CANCELLER_ROLE` on `VfiTimelock`. Governance can remove Security Council by revoking these roles and not granting a replacement.
2. **Deprecated is terminal** — cannot be reversed.
3. **Metadata is event-only** — must be indexed off-chain to query.
