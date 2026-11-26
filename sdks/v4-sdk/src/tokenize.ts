import { ChainId, Currency, Token } from '@kittycorn-labs/sdk-core'
import { Pool } from './entities/pool'

export interface KittycornTokenizePair {
  underlying: Token
  tokenize: Token
}

export interface KittycornDeployment {
  chainId: ChainId
  bank: string
  router: string
  quoter: string
  tokens: KittycornTokenizePair[]
}

/** Current Kittycorn deployment. Legacy rebasing deployments are intentionally unsupported. */
export const KITTYCORN_BASE_SEPOLIA: KittycornDeployment = {
  chainId: ChainId.BASE_SEPOLIA,
  bank: '0x421Cb4490c79727EC961c8fD214a98474425BDdE',
  router: '0xEd7BE201640f0A06dEfE6f13E6da1905137CC9e1',
  quoter: '0xB6b03E004E784E0DFc0109Dd506eDf81db37a241',
  tokens: [
    {
      underlying: new Token(84532, '0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f', 6, 'USDC'),
      tokenize: new Token(84532, '0x9fFfc7710Fd0Df623A4007904516Db6B323710a7', 6, 'tUSDC'),
    },
    {
      underlying: new Token(84532, '0x0a215D8ba66387DCA84B284D18c3B4ec3de6E54a', 6, 'USDT'),
      tokenize: new Token(84532, '0xAf6adc15309E143De39D3Ae8b9Ed2f829e9B0bf2', 6, 'tUSDT'),
    },
    {
      underlying: new Token(84532, '0x4200000000000000000000000000000000000006', 18, 'WETH'),
      tokenize: new Token(84532, '0x54270025deF2F08333cFBb8a68D9A94b6Ac20f20', 18, 'tWETH'),
    },
  ],
}

/** Adding a chain is one entry here. */
export const KITTYCORN_DEPLOYMENTS: { [chainId: number]: KittycornDeployment } = {
  [KITTYCORN_BASE_SEPOLIA.chainId]: KITTYCORN_BASE_SEPOLIA,
}

export function getKittycornDeployment(chainId: number): KittycornDeployment | undefined {
  return KITTYCORN_DEPLOYMENTS[chainId]
}

function findPair(
  chainId: number,
  token: Pick<Token, 'address'>,
  side: keyof KittycornTokenizePair
): KittycornTokenizePair | undefined {
  if (!token.address) return undefined
  const address = token.address.toLowerCase()
  return getKittycornDeployment(chainId)?.tokens.find((pair) => pair[side].address.toLowerCase() === address)
}

export function getSupportUnderlyingByTokenize(chainId: number, token: Pick<Token, 'address'>): Token | undefined {
  return findPair(chainId, token, 'tokenize')?.underlying
}

export function getSupportTokenizeByUnderlying(chainId: number, token: Pick<Token, 'address'>): Token | undefined {
  return findPair(chainId, token, 'underlying')?.tokenize
}

/** Conversion edges connect actual underlying/share currencies; they are not AMM liquidity. */
export function getTokenizePairs(chainId: number): [Currency, Currency, number, number, string][] {
  const tokens = getKittycornDeployment(chainId)?.tokens ?? []
  return tokens.map((t) => [t.underlying, t.tokenize, 0, 1, '0x0000000000000000000000000000000000000000'])
}

/** Recognize only registered conversion edges, never arbitrary pools containing a tToken. */
export function isTokenizeConversion(pool: Pool): boolean {
  return getTokenizePairs(pool.chainId).some(
    ([a, b, fee, spacing, hooks]) =>
      pool.fee === fee &&
      pool.tickSpacing === spacing &&
      pool.hooks.toLowerCase() === hooks &&
      ((pool.currency0.equals(a) && pool.currency1.equals(b)) || (pool.currency0.equals(b) && pool.currency1.equals(a)))
  )
}
