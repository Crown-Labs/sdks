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

Other upstream workspaces are private and are not published. Permit2 uses the official `@uniswap/permit2-sdk` package. The Universal Router Solidity repository does not need its own npm release.

After building and testing, publish using an npm account/token authorized for `@kittycorn-labs`:

```sh
bun run g:release
```

This is the only command above that publishes. Alternatively, manually run **Release Kittycorn SDKs** in GitHub Actions with `NPM_TOKEN` in the `npm-release` environment. Normal pushes and PRs only validate. Package versions are immutable on npm; use `bun run changeset` and `bun run version-packages` for subsequent releases, then regenerate `bun.lock` and test again. An interrupted release may partially publish; inspect npm before retrying and never republish an existing version.

## Kittycorn integration

`v4-sdk` exports `KITTYCORN_BASE_SEPOLIA`, `getTokenizePairs`, and `isTokenizeConversion`. This is the single registry for the current Bank, action router, quoter, USDC, USDT, WETH, and their Tokenize contracts. No old Kittycorn deployments are retained.

`router-sdk` exports `buildKittycornMethodParameters(trade, options, chainId)` for the existing KittycornRouter. It supports exact input/output, plain V4 pools, ERC4626 endpoint conversions, and pool-disjoint splits sharing conversion edges. Settlement uses the actual pool currency; ERC4626 assets and shares are not assumed equal. Underlying inputs/outputs are limited to the three registered ERC20s; native ETH and direct tToken user endpoints are rejected.

The direct router requires ERC20 approval to the returned `to` address and has no deadline argument. Quote against a pinned block and choose slippage explicitly.

`universal-router-sdk` exports `buildKittycornUniversalMethodParameters(trade, options, chainId)` for a **newly deployed KittycornUniversalRouter**. Options additionally require `universalRouter` and `deadline`. It encodes command `0x41`, funds through Permit2, delegates the same action plan to KittycornRouter, and refunds unused input. Approve the input token to Permit2 and grant Permit2 allowance to this new Universal Router. Do not supply an ordinary upstream Universal Router address.

Standard Universal Router builders reject Kittycorn conversion edges instead of treating them as ordinary AMM pools. Conversion edges can be shared across split legs; real AMM pools cannot.

## Cross-repository validation and deployment

Keep sibling directories `sdks`, `smart-order-router`, and `universal-router`. Build/pack SDKs first, then install/build/test SOR against these tarballs. SOR's `npm run check:fork` deploys the new Universal Router on local Anvil, executes quotes through real Permit2 and current Kittycorn contracts, checks balances/limits/refunds, and restores its snapshots.

Publish these SDKs before publishing SOR. For on-chain deployment, follow [Universal Router instructions](https://github.com/Crown-Labs/universal-router/tree/feat/kittycorn). Existing Bank, Tokenize contracts, and pools do not need redeployment.
