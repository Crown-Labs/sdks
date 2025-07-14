# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Yarn workspaces monorepo containing TypeScript SDKs for Uniswap protocols under the `@kittycorn-labs` namespace. The repository uses Turbo for build orchestration and follows a hierarchical dependency structure where core SDKs are built first, then protocol-specific SDKs, then routing and utility SDKs.

## Essential Commands

### Global Development Commands (run from repository root)
- `yarn g:build` - Build all SDKs in dependency order using Turbo
- `yarn g:test` - Run tests for all SDKs
- `yarn g:lint` - Lint all packages
- `yarn g:typecheck` - Type check all packages
- `yarn g:release` - Release packages using semantic-release

### Individual SDK Commands
- `yarn sdk @kittycorn-labs/{sdk-name} {command}` - Run commands for specific SDKs
- Common SDK scripts: `build`, `test`, `lint`, `start` (watch mode)

### Package Management
- `yarn g:check:deps:mismatch` - Check for dependency mismatches using manypkg
- `yarn g:upgrade` - Upgrade dependencies across packages

## Architecture and Build System

### SDK Dependencies (build order)
1. **sdk-core** - Base SDK with core entities (Currency, Token, etc.)
2. **v2-sdk, v3-sdk** - Protocol-specific implementations (depend on sdk-core)
3. **v4-sdk** - Newest protocol (depends on sdk-core and v3-sdk)
4. **router-sdk** - Mixed route trades (depends on v2-sdk)
5. **universal-router-sdk** - Comprehensive SDK (depends on all others)

### Build Tools
- **Turbo** (1.10.16) - Build orchestration with dependency management
- **TSDX** (0.14.1) - Primary build tool for most SDKs
- **TypeScript** - All packages are TypeScript with strict type checking
- **Yarn 3.2.3** - Package manager with workspaces

## Testing Approaches

### TSDX-based SDKs (sdk-core, v2-sdk, v3-sdk, v4-sdk, router-sdk)
- Use `tsdx test` command
- Jest underneath with TSDX configuration

### Custom Jest Setup (uniswapx-sdk, permit2-sdk, smart-wallet-sdk)
- Use `ts-jest` preset
- Support for unit and integration tests
- May include `yarn test:unit` and `yarn test:integration`

### Smart Contract Testing
- **Hardhat** for Ethereum contract testing
- **Foundry/Forge** for Solidity tests (universal-router-sdk)

## Code Quality and Conventions

### Linting and Formatting
- **ESLint** with TypeScript rules
- **Prettier** with settings: `printWidth: 120`, `semi: false`, `singleQuote: true`
- Import ordering enforced

### Git Hooks
- **Husky** manages pre-commit hooks
- Security scanning with `git-secrets` and `trufflehog`
- Commits fail if secrets are detected

### Release Process
- **Changesets** for version management and publishing
- Interactive changeset creation with `yarn changeset`
- Automatic NPM publishing with provenance on main branch merge via GitHub Actions

## Development Workflow

1. **Setup**: `yarn install` (installs all workspace dependencies)
2. **Build**: `yarn g:build` (builds all packages respecting dependencies)
3. **Test**: `yarn g:test` (runs comprehensive test suite)
4. **Lint**: `yarn g:lint` (enforces code quality standards)
5. **Individual work**: `yarn sdk <package-name> <command>` for specific packages

## Key Configuration Files

- `turbo.json` - Build pipeline and dependency configuration
- `package.json` - Root workspace with global scripts
- Individual SDK `package.json` files - Package-specific configurations
- `.husky/pre-commit` - Git hook security checks
- `publishing/release-rules.cjs` - Semantic release automation

## Common Development Patterns

### Adding Dependencies
- Add to individual SDK package.json files
- Run `yarn g:check:deps:mismatch` to ensure consistency
- Consider the dependency hierarchy when adding cross-SDK dependencies

### Creating New Features
- Follow existing patterns in similar SDKs
- Use TypeScript strictly with proper typing
- Add comprehensive tests following the package's testing approach
- Update documentation and examples as needed

### Testing Strategy
- Unit tests for individual functions and utilities
- Integration tests for complex interactions
- Smart contract tests for blockchain interactions
- All tests should pass before release

### Required Testing Commands
Before any code changes are considered complete, you MUST run:
- `yarn g:lint` - Check and fix linting issues across all packages
- `yarn prettier` - Format code according to project standards

Always build the entire monorepo after making changes to ensure dependency compatibility across all SDKs.

## Commit Message Guidelines

When creating git commits, use concise, descriptive messages without the following signatures:

```
🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

Use standard conventional commit format instead:

```
feat: add new feature
fix: resolve bug issue
chore: update dependencies
refactor: improve code structure
```

# Summary instructions

When you are using compact, please focus on test output and code changes
