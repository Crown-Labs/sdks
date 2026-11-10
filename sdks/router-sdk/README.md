> **Kittycorn / Ethers v5 dependency security**
> Applications combining these SDKs with Ethers v5 must put the following override in their root `package.json`, then run `npm install` and `npm audit`. npm does not inherit dependency-package overrides.
> 
> ```json
> { "overrides": { "@ethersproject/providers": { "ws": "8.21.0" } } }
> ```
> 
> Ethers v5 also retains an unpatched Low [elliptic advisory](https://github.com/advisories/GHSA-848j-6mx2-7j84). The Kittycorn integration builds quotes/calldata and uses external signers; it does not generate signatures from user private keys. This is a scope assessment, not a fix for elliptic.

# Alpha software

The latest version of the SDK is used in production in the Uniswap Interface,
but it is considered Alpha software and may contain bugs or change significantly between patch versions.
If you have questions about how to use the SDK, please reach out in the `#dev-chat` channel of the Discord.
Pull requests welcome!

# Uniswap Swap Router SDK

This SDK is meant to facilitate interactions with the contracts in [swap-router-contracts](https://github.com/Uniswap/swap-router-contracts).
