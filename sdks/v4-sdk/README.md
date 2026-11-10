> **Kittycorn / Ethers v5 dependency security**
> Applications combining these SDKs with Ethers v5 must put the following override in their root `package.json`, then run `npm install` and `npm audit`. npm does not inherit dependency-package overrides.
> 
> ```json
> { "overrides": { "@ethersproject/providers": { "ws": "8.21.0" } } }
> ```
> 
> Ethers v5 also retains an unpatched Low [elliptic advisory](https://github.com/advisories/GHSA-848j-6mx2-7j84). The Kittycorn integration builds quotes/calldata and uses external signers; it does not generate signatures from user private keys. This is a scope assessment, not a fix for elliptic.

