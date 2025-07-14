---
"@kittycorn-labs/sdk-core": patch
"@kittycorn-labs/v2-sdk": patch
"@kittycorn-labs/v3-sdk": patch
"@kittycorn-labs/v4-sdk": patch
"@kittycorn-labs/router-sdk": patch
"@kittycorn-labs/universal-router-sdk": patch
---

Migrate to workspace dependencies and add Changesets support

- Added comprehensive CLAUDE.md documentation with repository guidelines
- Migrated all @kittycorn-labs internal package dependencies to use workspace references
- Replaced semantic-release with Changesets for better monorepo support
- Updated GitHub Actions workflow to use Changesets for releases
- Added proper SDK export headers for better identification