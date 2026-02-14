---
title: CLI
---

The `cli/` package provides the developer interface for packaging dapps, interacting with governance, and managing the VibeFi registry.

## Technical Core: Packaging Constraints

The VibeFi CLI enforces a strict security model during the `package` command. This ensures that dapps are deterministic, have no unauthorized external dependencies, and cannot make arbitrary network requests.

### Dependency Allowlist

Only specific versions of approved libraries can be used in a VibeFi dapp. The CLI validates `package.json` against a hardcoded allowlist:

| Package | Version |
| :--- | :--- |
| `react` | `19.2.4` |
| `react-dom` | `19.2.4` |
| `wagmi` | `3.4.1` |
| `viem` | `2.45.0` |
| `shadcn` | `3.7.0` |
| `@tanstack/react-query` | `5.90.20` |

**Dev Dependencies:** `@vitejs/plugin-react` (5.1.2), `@types/react` (19.2.4), `typescript` (5.9.3), `vite` (7.2.4).

### Forbidden Patterns

The CLI scans all source files (`.ts`, `.tsx`) and `index.html` for strings that indicate potential security bypasses or unauthorized networking:

- `fetch(`
- `XMLHttpRequest`
- `WebSocket`
- `import("http` (dynamic imports from external URLs)
- `http://` and `https://` (except for specific metadata fields)

### Manifest Generation

The `package` command generates a `manifest.json` that includes:
- **File Hashes**: A list of every file in the bundle with its size.
- **Metadata**: Name, version, description, and creation timestamp.
- **Constraints**: A record of the allowlist versions used during packaging.

## Commands

### Installation & Setup

```bash
cd cli
bun install
```

### ABI Refresh

Synchronize contract ABIs from the `contracts/` directory into `packages/shared/`.

```bash
cd cli
bun run refresh-abis
```

### Dapp Operations

- `vibefi package --path ./my-app`: Validates and bundles a dapp.
- `vibefi dapp:propose --root-cid <cid> --name "App" --dapp-version "1.0.0"`: Creates a governance proposal for a new dapp.
- `vibefi dapp:list`: Lists all dapps and their latest versions from the `DappRegistry`.

### Governance & Voting

- `vibefi proposals:list`: Shows active and past governance proposals.
- `vibefi vote:cast <id> --support for`: Casts a vote on a proposal.
- `vibefi proposals:execute <id>`: Executes a successful proposal after the timelock.
