# Kittycorn SDKs

Fork of [Uniswap SDKs](https://github.com/Uniswap/sdks), synchronized through `8ae0425`.
Kittycorn deployment support is **Base Sepolia (84532) only**. Upstream Uniswap math and standard chain configurations remain available.

## Build and test

Use Node.js 22+ and Bun 1.3.10. No private key or RPC is required for these unit tests.

```sh
bun install --frozen-lockfile --ignore-scripts
bun run g:build
bun run g:test
bun run g:pack
```

`g:pack` writes six npm tarballs to `.sdk-packages/`. It resolves workspace versions in temporary manifests, without modifying source manifests. Both CommonJS and native Node ESM are supported. Do not use `npm link` across Bun/npm workspaces: duplicate JSBI installations break fraction identity checks.

## Packages and release

The following six `@kittycorn-labs` packages share version **2.0.0** and are released in dependency order:

1. `sdk-core`
2. `v2-sdk`
3. `v3-sdk`
4. `v4-sdk`
5. `router-sdk`
6. `universal-router-sdk`

Unused upstream workspaces have been removed from this repository. V2/V3 SDKs remain because shared trade types and the router depend on them. Permit2 uses the official `@uniswap/permit2-sdk` package. The Universal Router Solidity repository does not need its own npm release.

After building and testing, publish using an npm account/token authorized for `@kittycorn-labs`:

```sh
bun run g:release
```

This is the only command above that publishes. Alternatively, manually run **Release Kittycorn SDKs** in GitHub Actions with `NPM_TOKEN` in the `npm-release` environment. Normal pushes and PRs only validate. Package versions are immutable on npm; use `bun run g:version <next-version>` for subsequent releases, then regenerate `bun.lock` and test again. An interrupted release may partially publish; inspect npm before retrying and never republish an existing version.

## Kittycorn integration

`v4-sdk` exports `KITTYCORN_BASE_SEPOLIA`, `getTokenizePairs`, and `isTokenizeConversion`. This is the single registry for the current Bank, action router, quoter, USDC, USDT, WETH, and their Tokenize contracts. No old Kittycorn deployments are retained.

`router-sdk` exports `buildKittycornMethodParameters(trade, options, chainId)` for the existing KittycornRouter. It supports exact input/output, plain V4 pools, ERC4626 endpoint conversions, and pool-disjoint splits sharing conversion edges. Settlement uses the actual pool currency; ERC4626 assets and shares are not assumed equal. Underlying inputs/outputs are limited to the three registered ERC20s; native ETH and direct tToken user endpoints are rejected.

The direct router requires ERC20 approval to the returned `to` address and has no deadline argument. Quote against a pinned block and choose slippage explicitly.

`universal-router-sdk` exports `buildKittycornUniversalMethodParameters(trade, options, chainId)` for a **newly deployed KittycornUniversalRouter**. Options additionally require `universalRouter` and `deadline`. It encodes command `0x41`, funds through Permit2, delegates the same action plan to KittycornRouter, and refunds unused input. Approve the input token to Permit2 and grant Permit2 allowance to this new Universal Router. Do not supply an ordinary upstream Universal Router address.

Native ETH endpoints use this Universal Router builder: input encodes `WRAP_ETH → KITTYCORN_SWAP → UNWRAP_WETH` with `value = maximumAmountIn`, and refunds unused ETH to the payer (even if the output recipient differs). Native output encodes `KITTYCORN_SWAP → UNWRAP_WETH` and sends ETH to the recipient. Pool paths still use WETH/tWETH; native input needs no ERC20 or Permit2 approval. Both exact input and exact output are supported. The already deployed KittycornUniversalRouter supports these commands; no contract redeployment is required.

Standard Universal Router builders reject Kittycorn conversion edges instead of treating them as ordinary AMM pools. Conversion edges can be shared across split legs; real AMM pools cannot.

The 2026-11-10 follow-up review found a split-slippage rounding gap: independently rounding two 101-unit outputs at 1% allowed 198 units even though the aggregate minimum was 199. The builder now allocates rounding cumulatively so the encoded leg minimums add up to the reported trade minimum. This applies to both direct execution and the Universal Router wrapper, which reuses that action plan. Regression coverage includes different split sizes/slippage, intermediate-conversion rejection, and real underlying/share pool identification. The full offline suite passes 2,185 tests (4 existing skips); all six packages build and pack. This review covers the maintained integration and release path, not a guarantee about every upstream protocol or external deployment.

## Cross-repository validation and deployment

Keep sibling directories `sdks`, `smart-order-router`, and `universal-router`. Build/pack SDKs first, then install/build/test SOR against these tarballs. SOR's `npm run check:fork` deploys the new Universal Router on local Anvil, executes quotes through real Permit2 and current Kittycorn contracts, checks balances/limits/refunds, and restores its snapshots.

Publish these SDKs before publishing SOR. For on-chain deployment, follow [Universal Router instructions](https://github.com/Crown-Labs/universal-router/tree/feat/kittycorn). Existing Bank, Tokenize contracts, and pools do not need redeployment.

## Maintenance scope

Only the six packages above are maintained. Builds run in dependency order without Turbo, Babel, Changesets, or a second Solidity toolchain. Upstream Universal Router mainnet/fork tests are not maintained in this SDK repository; offline encoding tests remain, and real Kittycorn execution is checked by SOR on a Base Sepolia Anvil fork.

Runtime contract interfaces are checked-in ABI snapshots, not dependencies on complete Solidity npm packages. `scripts/abi-sources.json` records the exact source package/version/artifact and SHA-256 for every snapshot. The JSON ABI is interface data from the named Uniswap packages; consult each source package for its original license. Bytecode fixtures are test-only and excluded from published packages.

```sh
bun run g:abis
bun run g:abis --verify-upstream
```

For an upstream sync, review the six retained packages, update source versions in the manifest only when required, run `bun run g:abis --refresh`, inspect the ABI diff, then build/test/pack and run SOR integration tests. Do not restore removed workspaces/toolchains automatically. ABI verification downloads pinned artifacts without installing or executing their dependencies.

## Dependency security

Ethers v5 currently pins a vulnerable WebSocket dependency. Applications consuming these packages must put the following override in their **root** package.json (dependency-package overrides are ignored by npm):

```json
{ "overrides": { "@ethersproject/providers": { "ws": "8.21.0" } } }
```

Run `npm install` and `npm audit` after adding it. This repository already applies the override. A clean consumer install was checked with the same setting. It must remain until upstream Ethers v5 updates its pin or the integration migrates to a compatible replacement.

A Low advisory remains in Ethers v5's transitive `elliptic` dependency ([GHSA-848j-6mx2-7j84](https://github.com/advisories/GHSA-848j-6mx2-7j84)); upstream reports no patched version. Our production code builds quotes/calldata and uses external RPC signers; it does not generate ECDSA signatures from user private keys. This is a scope assessment, not a fix or a zero-vulnerability claim. Do not use Ethers v5 local-wallet signing as a workaround for deployment keystores.
