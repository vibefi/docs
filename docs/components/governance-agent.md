---
title: Governance Agent
---

`governance-agent/` is a Rust process that watches `VfiGovernor` proposals, decodes dapp publish/upgrade actions, reviews proposal bundles, and emits vote recommendations or submits votes.

## Core behavior

- Watches `ProposalCreated` on `VfiGovernor`
- Decodes dapp proposal calldata (`publishDapp`, `upgradeDapp`)
- Fetches bundle files from IPFS
- Runs lightweight static checks + LLM review (OpenAI, Anthropic, OpenCode-compatible)
- Produces `for` / `against` / `abstain` decisions with numeric confidence thresholds
- Submits `castVoteWithReason` when auto-vote is explicitly enabled

## Run modes

```bash
cargo run -- run --profile devnet --rpc-url http://127.0.0.1:8545 --once
cargo run -- review-once --proposal-id 1 --profile sepolia --rpc-url "$SEPOLIA_RPC_URL"
cargo run -- doctor --profile sepolia --rpc-url "$SEPOLIA_RPC_URL"
```

Default mode is dry-run recommendation only. Auto-vote is opt-in via `--auto-vote` or `GOV_AGENT_AUTO_VOTE=true`.

## Transport and chain integration

- Uses `alloy` for chain reads and writes.
- Auto-detects transport from RPC URL:
  - `http://` / `https://` -> HTTP transport
  - `ws://` / `wss://` -> WS transport

## Vote submission safety checks

Before submitting a vote, the keystore signer path checks:

- proposal state is `Active`
- signer has not already voted
- minimum block buffer remains before `voteEnd`
- gas price and priority fee are below configured caps

## Decision thresholds

Thresholds are numeric and can be configured directly:

- `decision.approve_threshold`
- `decision.reject_threshold`

`decision.profile` is only an alias for preset numeric values:

- `conservative` -> approve `0.90`, reject `0.30`
- `balanced` -> approve `0.75`, reject `0.25`
- `aggressive` -> approve `0.60`, reject `0.20`

## IPFS cache behavior

By default, governance-agent stores CID bundles under `~/.cache/VibeFi`, matching the client cache root. This allows reuse when both services run on the same machine.

Why this works:

- both processes cache by root CID
- both store `manifest.json` and file paths under CID directories

Operational caveat:

- concurrent writes are possible; governance-agent uses atomic file writes to avoid partial-file corruption

## Docker and CI

- `Dockerfile` builds a non-root runtime image
- CI runs `cargo fmt --check`, `cargo clippy --all-targets --all-features -D warnings`, and `cargo test --all-targets --all-features`
- Docker workflow builds the container on pull requests and main pushes
