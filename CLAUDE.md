# Repository guidance

This fork maintains six Kittycorn SDKs with Bun 1.3.10 and Node.js 22+. See README.md for architecture, upstream revision, supported deployment, and release instructions.

Build order is sdk-core, v2-sdk, v3-sdk, v4-sdk, router-sdk, universal-router-sdk. V2/V3 remain dependencies of shared routing types and math. Unused workspaces and duplicate Solidity build systems have been removed intentionally; do not restore them automatically during an upstream sync.

Before committing, run `bun run g:abis`, `bun run g:build`, `bun run g:test`, and format changed TypeScript/JavaScript files using the existing Prettier style. Before releasing, also run `bun run g:pack` and the sibling SOR Base Sepolia integration test. Never publish without explicit authorization.

Use strict TypeScript, existing naming/style, and focused tests for behavior changes. Runtime ABI snapshots have provenance and checksums in scripts/abi-sources.json; use scripts/abis.js for verification/refresh instead of installing complete Solidity packages.

Use conventional commit messages, without generated-by or co-author signatures. Keep changes on the current branch unless requested otherwise. Preserve unrelated user edits.
