---
title: IPFS Relay
---

`ipfs-relay/` hosts the IPFS upload relay service used by VibeFi bundle workflows.

## Role

- Accepts `POST /v1/uploads` multipart bundle uploads from VibeFi tooling.
- Validates package structure (`manifest.json`, `vibefi.json`, path safety, file/byte checks, size limits).
- Pins accepted bundles to a protocol-managed Kubo node and returns `rootCid`.
- Queues async replication to configured pinning providers (Pinata / 4EVERLAND).

## Stack

- Rust + Tokio
- Axum HTTP server (`/v1/uploads`, `/health`, `/metrics`)
- `tower_governor` rate limiting
- Prometheus metrics + structured tracing

## Local Run

```bash
cd ipfs-relay
cp .env.example .env
cargo run
```
