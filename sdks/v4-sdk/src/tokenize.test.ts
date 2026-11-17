import { describe, expect, test } from 'bun:test'
import { TickMath } from '@kittycorn-labs/v3-sdk'
import { Pool } from './entities'
import {
  getKittycornDeployment,
  getSupportTokenizeByUnderlying,
  getSupportUnderlyingByTokenize,
  getTokenizePairs,
  isTokenizeConversion,
  KITTYCORN_BASE_SEPOLIA as registry,
} from './tokenize'

const BASE_SEPOLIA = 84532
const zero = '0x0000000000000000000000000000000000000000'
const upperHex = (address: string) => `0x${address.slice(2).toUpperCase()}`
const unknown = '0x1111111111111111111111111111111111111111'

describe('tokenize lookups on a registered chain', () => {
  for (const pair of registry.tokens) {
    test(`${pair.tokenize.symbol} and ${pair.underlying.symbol} resolve to each other`, () => {
      expect(getSupportUnderlyingByTokenize(BASE_SEPOLIA, pair.tokenize)?.equals(pair.underlying)).toBe(true)
      expect(getSupportTokenizeByUnderlying(BASE_SEPOLIA, pair.underlying)?.equals(pair.tokenize)).toBe(true)
    })

    test(`${pair.tokenize.symbol} lookup ignores address case`, () => {
      for (const address of [pair.tokenize.address.toLowerCase(), upperHex(pair.tokenize.address)]) {
        expect(getSupportUnderlyingByTokenize(BASE_SEPOLIA, { address })?.equals(pair.underlying)).toBe(true)
      }
      for (const address of [pair.underlying.address.toLowerCase(), upperHex(pair.underlying.address)]) {
        expect(getSupportTokenizeByUnderlying(BASE_SEPOLIA, { address })?.equals(pair.tokenize)).toBe(true)
      }
    })

    test(`${pair.tokenize.symbol} does not resolve in the opposite direction`, () => {
      expect(getSupportUnderlyingByTokenize(BASE_SEPOLIA, pair.underlying)).toBeUndefined()
      expect(getSupportTokenizeByUnderlying(BASE_SEPOLIA, pair.tokenize)).toBeUndefined()
    })
  }

  test('an unknown address resolves to nothing', () => {
    expect(getSupportUnderlyingByTokenize(BASE_SEPOLIA, { address: unknown })).toBeUndefined()
    expect(getSupportTokenizeByUnderlying(BASE_SEPOLIA, { address: unknown })).toBeUndefined()
  })

  test('a missing or empty address resolves to nothing without throwing', () => {
    for (const token of [{ address: undefined as unknown as string }, { address: '' }]) {
      expect(getSupportUnderlyingByTokenize(BASE_SEPOLIA, token)).toBeUndefined()
      expect(getSupportTokenizeByUnderlying(BASE_SEPOLIA, token)).toBeUndefined()
    }
  })
})

describe('an unregistered chain', () => {
  for (const chainId of [42161, 1]) {
    test(`chain ${chainId} has no deployment, pairs or lookups`, () => {
      const { tokenize, underlying } = registry.tokens[0]
      expect(getKittycornDeployment(chainId)).toBeUndefined()
      expect(getTokenizePairs(chainId)).toEqual([])
      expect(getSupportUnderlyingByTokenize(chainId, tokenize)).toBeUndefined()
      expect(getSupportTokenizeByUnderlying(chainId, underlying)).toBeUndefined()
    })
  }

  test('Base Sepolia resolves to the registered deployment', () => {
    expect(getKittycornDeployment(BASE_SEPOLIA)).toBe(registry)
  })
})

describe('tokenize conversion pairs', () => {
  test('every registered pair is a zero fee, tick spacing 1, no hooks edge', () => {
    const pairs = getTokenizePairs(BASE_SEPOLIA)
    expect(pairs).toHaveLength(3)
    for (const [, , fee, tickSpacing, hooks] of pairs) {
      expect(fee).toBe(0)
      expect(tickSpacing).toBe(1)
      expect(hooks).toBe(zero)
    }
  })

  const buildPool = (fee: number, tickSpacing: number) => {
    const { underlying, tokenize } = registry.tokens[0]
    return new Pool(underlying, tokenize, fee, tickSpacing, zero, TickMath.getSqrtRatioAtTick(0), '0', 0)
  }

  test('a registered pair at fee 0 is a conversion', () => {
    expect(isTokenizeConversion(buildPool(0, 1))).toBe(true)
  })

  test('the same pair at fee 500 is not a conversion', () => {
    expect(isTokenizeConversion(buildPool(500, 10))).toBe(false)
  })
})
