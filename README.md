# Kittycorn Labs SDK's

A repository for many Kittycorn Labs SDK's. All SDK's can be found in `sdks/` and have more information in their individual README's.

## Development Commands

```bash
# Clone
git clone --recurse-submodules https://github.com/Crown-Labs/sdks.git
# Install
yarn
# Build
yarn g:build
# Typecheck
yarn g:typecheck
# Lint
yarn g:lint
# Test
yarn g:test
# Run a specific package.json command for an individual SDK
yarn sdk @kittycorn-labs/{sdk-name} {command}
```

## Publishing SDK's

Publishing of each SDK is done using [Changesets](https://github.com/changesets/changesets) for version management and automated releases on merge to main.

### Creating a Release

1. **Make your changes** and ensure they pass all tests and linting:
   ```bash
   yarn g:build
   yarn g:lint
   yarn g:test
   ```

2. **Create a changeset** to document your changes:
   ```bash
   yarn changeset
   ```
   This will prompt you to:
   - Select which packages have changed
   - Choose the type of change (major, minor, patch)
   - Write a summary of the changes

3. **Commit the changeset** along with your changes:
   ```bash
   git add .changeset/
   git commit -m "feat: add new feature with changeset"
   ```

4. **Create a Pull Request** - the changeset will be included in your PR

### Version Update Process

When your PR is merged to main:
- **Changesets GitHub Action** automatically creates a "Version Packages" PR
- This PR updates all package versions and generates CHANGELOGs
- When the "Version Packages" PR is merged, packages are automatically published to npm

### Manual Release Commands

For manual releases (if needed):
```bash
# Update versions and install dependencies
yarn g:version

# Build and publish packages
yarn g:build
yarn g:release
```

### Changeset Types

- **Patch** (0.0.X): Bug fixes, small improvements
- **Minor** (0.X.0): New features, non-breaking changes  
- **Major** (X.0.0): Breaking changes

Versions are generated based on the changesets in the `.changeset/` directory and only affect the packages specified in each changeset.

