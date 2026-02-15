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

Cloudflare Pages publishes this site from the configured production branch.

Site URL target is configured as:

- `https://docs.vibefi.workers.dev`

If the Cloudflare Pages project domain or custom domain changes, update `docusaurus.config.ts` accordingly.
