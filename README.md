# VibeFi Docs

Docusaurus documentation site for VibeFi.

## Local development

```bash
bun install
bun start
```

## Production build

```bash
bun run build
bun run serve
```

## Deployment

GitHub Actions deploys this site from `master` to GitHub Pages.

Site URL target is configured as:

- `https://vibefi.github.io`

If org-level Pages or custom domain settings change, update `docusaurus.config.ts` accordingly.
