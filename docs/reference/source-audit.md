---
title: Source Audit
---

This docs pass was formed by auditing markdown files across the monorepo and validating key commands/paths against code.

## VibeFi-authored markdown reviewed

- `README.md`
- `SETUP.md`
- `cli/README.md`
- `cli/SPEC.md`
- `client/README.md`
- `contracts/README.md`
- `contracts/specs/vibefi-dao-contracts-spec.md`
- `dapp-examples/README.md`
- `dapp-examples/constraints.md`
- `dapp-examples/prompt.md`
- `dapp-examples/safe-admin/PLAN.md`
- `e2e/README.md`
- `studio/README.md`
- `vibefi 2f663174a49580e7ad1eca0b7cdb0fe8.md`

## Vendored markdown also scanned

The following are third-party docs under `contracts/lib/**` and are excluded from VibeFi product docs scope:

- Foundry `forge-std` docs
- OpenZeppelin docs/changelog/guidelines/audits
- OpenZeppelin vendored sub-lib docs (`erc4626-tests`, `halmos-cheatcodes`, etc.)

## Accuracy notes from audit

- `studio/README.md` is currently a placeholder.
- `dapp-examples` docs include TODO placeholders for scaffolding and schemas.
- `SETUP.md` references `client/scripts/install-deps-ubuntu.sh`, but that path is currently absent.
- `contracts/specs/vibefi-dao-contracts-spec.md` is historical; `contracts/README.md` is canonical for current behavior.

## Next documentation improvements

1. Add formal `manifest.json` and `addresses.json` schemas for dapp bundles.
2. Publish an authoritative Studio setup and architecture guide.
3. Replace stale/placeholder setup steps with validated script paths.
