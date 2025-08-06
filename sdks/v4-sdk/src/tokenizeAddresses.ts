import { ChainId, Token } from '@kittycorn-labs/sdk-core'

// Kittycorn: Tokenize Token
// This file contains the addresses of the Tokenize tokens on different networks.

// Mainnet
export const TUSDC_MAINNET = new Token(
  ChainId.MAINNET,
  '0xcc331eC1d6CF4542F9eB988B49249cfa163081dc',
  6,
  'Kittycorn Tokenize USDC',
  'tUSDC'
)
export const TUSDT_MAINNET = new Token(
  ChainId.MAINNET,
  '0x561A87303005D9C83FbD94dDEb80D63528fCD448',
  6,
  'Kittycorn Tokenize USDT',
  'tUSDT'
)
export const TWETH_MAINNET = new Token(
  ChainId.MAINNET,
  '0x8a2D75bAadcd2C71b2aCF715fc3Da68964CEA48e',
  18,
  'Kittycorn Tokenize WETH',
  'tWETH'
)
export const TWBTC_MAINNET = new Token(
  ChainId.MAINNET,
  '0x137a906E06EC20808c8F156F9024196427429220',
  8,
  'Kittycorn Tokenize WBTC',
  'tWBTC'
)

// Arbitrum
export const TUSDC_ARBITRUM_ONE = new Token(
  ChainId.ARBITRUM_ONE,
  '0x43297FBD1306f9fcDf96EE3A27e0113E4295D738',
  6,
  'Kittycorn Tokenize USDC',
  'tUSDC'
)
export const TUSDT_ARBITRUM_ONE = new Token(
  ChainId.ARBITRUM_ONE,
  '0x93Ee5B16F4dDE4566b94488B8d929F39df112f60',
  6,
  'Kittycorn Tokenize USDT',
  'tUSDT'
)
export const TWETH_ARBITRUM_ONE = new Token(
  ChainId.ARBITRUM_ONE,
  '0xCfdAb139Da7252EC3D8Df14F03659A46d1d1848C',
  18,
  'Kittycorn Tokenize WETH',
  'tWETH'
)
export const TWBTC_ARBITRUM_ONE = new Token(
  ChainId.ARBITRUM_ONE,
  '0x8fecD0452BBF493C4915834E75310a5e8fe1FdDe',
  8,
  'Kittycorn Tokenize WBTC',
  'tWBTC'
)
export const TLINK_ARBITRUM_ONE = new Token(
  ChainId.ARBITRUM_ONE,
  '0xDd816723CF1B310d1755156c4f37b4c8ed54ED5C',
  18,
  'Kittycorn Tokenize LINK',
  'tLINK'
)
export const TAAVE_ARBITRUM_ONE = new Token(
  ChainId.ARBITRUM_ONE,
  '0x3eD9D2e07d314f2DcA05f920Ed5cbF2DFF60bC9a',
  18,
  'Kittycorn Tokenize AAVE',
  'tAAVE'
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
  '0x54f4d76DaB01190A32FB0a5da441Be85e3Cef937',
  18,
  'Kittycorn Tokenize WETH',
  'tWETH'
)
export const TWBTC_SEPOLIA = new Token(
  ChainId.SEPOLIA,
  '0x67332E6e2fbB793B822f3c2d7ff8BE9F07F1eAd9',
  8,
  'Kittycorn Tokenize WBTC',
  'tWBTC'
)
export const TLINK_SEPOLIA = new Token(
  ChainId.SEPOLIA,
  '0x7ddE6BD33B4E6eB1d6F0519f4CF65deEB162dd86',
  18,
  'Kittycorn Tokenize LINK',
  'tLINK'
)
export const TAAVE_SEPOLIA = new Token(
  ChainId.SEPOLIA,
  '0x1289c2dC45a0eA5E67F6ffa2B601D23d66547d3E',
  18,
  'Kittycorn Tokenize AAVE',
  'tAAVE'
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
  [ChainId.ARBITRUM_ONE]: [
    {
      tokenize: TUSDC_ARBITRUM_ONE,
      underlying: new Token(
        ChainId.ARBITRUM_ONE,
        '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        6,
        'USDC',
        'USDC Token'
      ),
    },
    {
      tokenize: TUSDT_ARBITRUM_ONE,
      underlying: new Token(
        ChainId.ARBITRUM_ONE,
        '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        6,
        'USDT',
        'USDT Token'
      ),
    },
    {
      tokenize: TWETH_ARBITRUM_ONE,
      underlying: new Token(
        ChainId.ARBITRUM_ONE,
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        18,
        'WETH',
        'Wrapped Ether'
      ),
    },
    {
      tokenize: TWBTC_ARBITRUM_ONE,
      underlying: new Token(
        ChainId.ARBITRUM_ONE,
        '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
        8,
        'WBTC',
        'WBTC Token'
      ),
    },
    {
      tokenize: TLINK_ARBITRUM_ONE,
      underlying: new Token(
        ChainId.ARBITRUM_ONE,
        '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
        18,
        'LINK',
        'LINK Token'
      ),
    },
    {
      tokenize: TAAVE_ARBITRUM_ONE,
      underlying: new Token(
        ChainId.ARBITRUM_ONE,
        '0xba5DdD1f9d7F570dc94a51479a000E3BCE967196',
        18,
        'AAVE',
        'AAVE Token'
      ),
    },
  ],
  [ChainId.SEPOLIA]: [
    {
      tokenize: TUSDC_SEPOLIA,
      underlying: new Token(ChainId.SEPOLIA, '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', 6, 'USDC', 'USDC Token'),
    },
    {
      tokenize: TUSDT_SEPOLIA,
      underlying: new Token(ChainId.SEPOLIA, '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', 6, 'USDT', 'USDT Token'),
    },
    {
      tokenize: TWETH_SEPOLIA,
      underlying: new Token(ChainId.SEPOLIA, '0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c', 18, 'WETH', 'Wrapped Ether'),
    },
    {
      tokenize: TWBTC_SEPOLIA,
      underlying: new Token(ChainId.SEPOLIA, '0x29f2D40B0605204364af54EC677bD022dA425d03', 8, 'WBTC', 'WBTC Token'),
    },
    {
      tokenize: TLINK_SEPOLIA,
      underlying: new Token(ChainId.SEPOLIA, '0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5', 18, 'LINK', 'LINK Token'),
    },
    {
      tokenize: TAAVE_SEPOLIA,
      underlying: new Token(ChainId.SEPOLIA, '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a', 18, 'AAVE', 'AAVE Token'),
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
