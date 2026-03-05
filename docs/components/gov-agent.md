---
title: Gov Agent
---

`gov-agent/` is a Rust process that watches [`VfiGovernor`](./contracts.md) proposals, decodes dapp publish/upgrade actions, reviews proposal bundles, and emits vote recommendations or submits votes.

## Core behavior

- Watches `ProposalCreated` on `VfiGovernor`
- Decodes dapp proposal calldata (`publishDapp`, `upgradeDapp`)
- Fetches bundle files from IPFS
- Runs lightweight static checks + LLM review (OpenAI, Anthropic, Ollama)
- Enriches LLM review context with bundle file index + bounded text content snapshot
- Produces `for` / `against` / `abstain` decisions with numeric confidence thresholds
- Submits `castVoteWithReason` when auto-vote is explicitly enabled

## Bundle review signals

- Deterministic review starts from a high-trust baseline (`0.9` on the successful manifest-fetch path).
- `vibefi.json` is required and missing it lowers score.
- `manifest.json` presence is checked directly in the bundle CID directory (not inferred from `manifest.files`).
- Presence of `package.json` is treated as a critical signal and applies a heavy penalty (`-0.5`).
- Source token scanning still flags risky patterns (`eval`, `child_process`, insecure HTTP URLs).

## LLM prompt context shaping

- Bundle text included in LLM prompts is not minified by default (`review.minify_bundle_text = false`).
- Minification removes indentation and empty lines, while preserving code tokens/identifiers.
- Enable via config (`review.minify_bundle_text = true`) or env (`GOV_AGENT_MINIFY_BUNDLE_TEXT=true`).

## Run modes

```bash
cargo run -- run --profile devnet --rpc-url http://127.0.0.1:8545 --once
cargo run -- review-once --proposal-id 1 --profile sepolia --rpc-url "$SEPOLIA_RPC_URL"
cargo run -- status --profile sepolia --rpc-url "$SEPOLIA_RPC_URL"
```

Default mode is dry-run recommendation only. Auto-vote is opt-in via `--auto-vote` or `GOV_AGENT_AUTO_VOTE=true`.

When running in continuous mode (`cargo run -- run`), the agent emits periodic info logs each cycle (current scan range, no-new-blocks heartbeats, and next poll wait), so operators can confirm it is actively checking chain progress.

## Test with e2e bundles

Use the `e2e` helper to quickly publish known test bundles and verify gov-agent pickup behavior.

In one terminal, run gov-agent:

```bash
cd gov-agent
cargo run -- run --profile devnet --rpc-url http://127.0.0.1:8545
```

In another terminal, publish a test bundle proposal:

```bash
cd e2e
bun run publish:test-bundle red_team_vapp
bun run publish:test-bundle malicious_uniswapv2
```

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

- `conservative` -> approve `0.80`, reject `0.30`
- `balanced` -> approve `0.75`, reject `0.25`
- `aggressive` -> approve `0.60`, reject `0.20`

## IPFS cache behavior

By default, gov-agent stores CID bundles under `~/.cache/VibeFi`, matching the client cache root. This allows reuse when both services run on the same machine.

Why this works:

- both processes cache by root CID
- both store `manifest.json` and file paths under CID directories

Operational caveat:

- concurrent writes are possible; gov-agent uses atomic file writes to avoid partial-file corruption

## Docker and CI

- `Dockerfile` builds a non-root runtime image
- CI runs `cargo fmt --check`, `cargo clippy --all-targets --all-features -D warnings`, and `cargo test --all-targets --all-features`
- Docker workflow builds the container on pull requests and main pushes
