import { ChainId, Token } from '@kittycorn-labs/sdk-core'

// Kittycorn: Tokenize Token

// Mainnet
export const TUSDC_MAINNET = new Token(
  ChainId.MAINNET,
  '0x39826E09f8efb9df4C56Aeb9eEC0D2B8164d3B36',
  6,
  'Kittycorn Tokenize USDC',
  'tUSDC'
)
export const TUSDT_MAINNET = new Token(
  ChainId.MAINNET,
  '0xACB5b53F9F193b99bcd8EF8544ddF4c398DE24a3',
  6,
  'Kittycorn Tokenize USDT',
  'tUSDT'
)
export const TWETH_MAINNET = new Token(
  ChainId.MAINNET,
  '0x6C3F7ed79b9D75486D0250946f7a20BDA74844Ba',
  6,
  'Kittycorn Tokenize WETH',
  'tWETH'
)
export const TWBTC_MAINNET = new Token(
  ChainId.MAINNET,
  '0x90A3B384F62f43Ba07938EA43aEEc35c2aBfeCa2',
  6,
  'Kittycorn Tokenize WBTC',
  'tWBTC'
)

// Sepolia
export const TUSDC_SEPOLIA = new Token(
  ChainId.SEPOLIA,
  '0x1E271DB8D8B446A0DEe8e9D774f4213e9Bc1C6ba',
  6,
  'Kittycorn Tokenize USDC',
  'tUSDC'
)
export const TUSDT_SEPOLIA = new Token(
  ChainId.SEPOLIA,
  '0x137a906E06EC20808c8F156F9024196427429220',
  6,
  'Kittycorn Tokenize USDT',
  'tUSDT'
)
export const TWETH_SEPOLIA = new Token(
  ChainId.SEPOLIA,
  '0x9fEcb19a660d1d6d3aD7a33A7e9BeB01A9EE24aB',
  18,
  'Kittycorn Tokenize WETH',
  'tWETH'
)
export const TWBTC_SEPOLIA = new Token(
  ChainId.SEPOLIA,
  '0x3dd320984b954453D09F69B95d4c9F5Bc92a9a58',
  8,
  'Kittycorn Tokenize WBTC',
  'tWBTC'
)

export const BASE_TOKENIZE_UNDERLYING: {
  [chainId in ChainId]?: { tokenize: Token; underlying: Token }[]
} = {
  [ChainId.MAINNET]: [
    {
      tokenize: TUSDC_MAINNET,
      underlying: new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C'),
    },
    {
      tokenize: TUSDT_MAINNET,
      underlying: new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD'),
    },
    {
      tokenize: TWETH_MAINNET,
      underlying: new Token(ChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'),
    },
    {
      tokenize: TWBTC_MAINNET,
      underlying: new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC'),
    },
  ],
  [ChainId.SEPOLIA]: [
    {
      tokenize: TUSDC_SEPOLIA,
      underlying: new Token(ChainId.SEPOLIA, '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', 6, 'USDC', 'USDC Token'),
    },
    {
      tokenize: TUSDT_SEPOLIA,
      underlying: new Token(
        ChainId.SEPOLIA,
        '0x137a906E06EC20808c8F156F9024196427429220',
        6,
        'Kittycorn Tokenize USDT',
        'tUSDT'
      ),
    },
    {
      tokenize: TWETH_SEPOLIA,
      underlying: new Token(ChainId.SEPOLIA, '0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c', 18, 'WETH', 'Wrapped Ether'),
    },
    {
      tokenize: TWBTC_SEPOLIA,
      underlying: new Token(ChainId.SEPOLIA, '0x29f2D40B0605204364af54EC677bD022dA425d03', 8, 'WBTC', 'WBTC Token'),
    },
  ],
}

export function getSupportUnderlyingByTokenize(chainId: ChainId, tokenize: Token): Token | undefined {
  const token = BASE_TOKENIZE_UNDERLYING[chainId]?.find(
    (token) =>
      tokenize.address && // Check skip for Ether type is not have address
      token.tokenize.address.toLocaleLowerCase() === tokenize.address.toLocaleLowerCase()
  )
  return token ? token.underlying : undefined
}

export function getSupportTokenizeByUnderlying(chainId: ChainId, underlying: Token): Token | undefined {
  const token = BASE_TOKENIZE_UNDERLYING[chainId]?.find(
    (token) =>
      underlying.address && // Check skip for Ether type is not have address
      token.underlying.address.toLocaleLowerCase() === underlying.address.toLocaleLowerCase()
  )
  return token ? token.tokenize : undefined
}
