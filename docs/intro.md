---
slug: /
title: VibeFi Documentation
---

VibeFi is a decentralized governance and hosting protocol for DeFi frontends.

1. Contributors package frontend code under [strict build constraints](./components/cli.md#package).
2. A [governance proposal](./workflows/governance-lifecycle.md) publishes or upgrades a dapp version on-chain.
3. Approved bundle roots are stored in the [DappRegistry](./components/contracts.md) and content is fetched from IPFS.
4. End users run approved dapps in the [VibeFi client](./components/client.md) runtime — sandboxed, locally built, with no outbound HTTP.

Start with [Prerequisites](./getting-started/prerequisites.md) and [Local Stack](./getting-started/local-stack.md), then explore [Architecture](./architecture/overview.md) and component docs.
