import { describe, expect, test } from 'bun:test'
import { defaultAbiCoder, Interface } from '@ethersproject/abi'
import { CurrencyAmount, Percent, TradeType } from '@kittycorn-labs/sdk-core'
import { encodeSqrtRatioX96, TickMath } from '@kittycorn-labs/v3-sdk'
import {
  Pool,
  Route,
  KITTYCORN_BASE_SEPOLIA as config,
  getTokenizePairs,
  isTokenizeConversion,
  Trade as V4Trade,
} from '@kittycorn-labs/v4-sdk'
import { Trade } from './entities/trade'
import { buildKittycornMethodParameters } from './kittycorn'

const a = config.tokens[0],
  b = config.tokens[1]
const zero = '0x0000000000000000000000000000000000000000'
const options = { recipient: '0x0000000000000000000000000000000000001234', slippageTolerance: new Percent(1, 100) }
const conversions = getTokenizePairs(84532).map(([x, y, fee, tickSpacing, hooks]) => {
  const price = encodeSqrtRatioX96(2, 1)
  return new Pool(x, y, fee, tickSpacing, hooks, price, '1000000000000000000', TickMath.getTickAtSqrtRatio(price))
})
function route(fee = 100) {
  return new Route(
    [
      conversions[0],
      new Pool(a.tokenize, b.tokenize, fee, 1, zero, encodeSqrtRatioX96(1, 1), '1000000000000', 0),
      conversions[1],
    ],
    a.underlying,
    b.underlying
  )
}
function trade(type = TradeType.EXACT_INPUT, split = false) {
  const leg = (fee: number) => ({
    routev4: route(fee),
    inputAmount: CurrencyAmount.fromRawAmount(a.underlying, '1000000'),
    outputAmount: CurrencyAmount.fromRawAmount(b.underlying, '2000000'),
  })
  return new Trade({ v4Routes: split ? [leg(100), leg(500)] : [leg(100)], tradeType: type })
}
function decode(type = TradeType.EXACT_INPUT, split = false) {
  const result = buildKittycornMethodParameters(trade(type, split), options, 84532)
  expect(result.to).toBe(config.router)
  expect(result.value).toBe('0x00')
  const [plan] = new Interface(['function executeActions(bytes)']).decodeFunctionData('executeActions', result.calldata)
  return defaultAbiCoder.decode(['bytes', 'bytes[]'], plan)
}
const swapType =
  'tuple(address currency,tuple(address intermediateCurrency,uint24 fee,int24 tickSpacing,address hooks,bytes hookData)[] path,uint256[] minHopPriceX36,uint128 amount,uint128 limit)'

describe('Kittycorn ERC4626 calldata', () => {
  test('supports only current Base Sepolia conversion pairs', () => {
    expect(getTokenizePairs(1)).toEqual([])
    expect(getTokenizePairs(42161)).toEqual([])
    expect(getTokenizePairs(11155111)).toEqual([])
    expect(conversions.every(isTokenizeConversion)).toBe(true)
    expect(isTokenizeConversion(route().pools[1])).toBe(false)
  })
  test('exact input preserves conversion currencies and settles shares with underlying', () => {
    const [actions, params] = decode()
    expect(actions).toBe('0x070b0e')
    const [swap] = defaultAbiCoder.decode([swapType], params[0])
    expect(swap.currency).toBe(a.underlying.address)
    expect(swap.path.map((p: { intermediateCurrency: string }) => p.intermediateCurrency)).toEqual([
      a.tokenize.address,
      b.tokenize.address,
      b.underlying.address,
    ])
    expect(swap.amount.toString()).toBe('1000000')
    expect(swap.limit.toString()).toBe('1980000')
    expect(swap.minHopPriceX36).toHaveLength(0)
    expect(defaultAbiCoder.decode(['address', 'uint256', 'bool'], params[1])[0]).toBe(a.tokenize.address)
    expect(defaultAbiCoder.decode(['address', 'address', 'uint256'], params[2])[0]).toBe(b.tokenize.address)
  })
  test('exact output reverses the path currencies and caps underlying input', () => {
    const [actions, params] = decode(TradeType.EXACT_OUTPUT)
    expect(actions).toBe('0x090b0e')
    const [swap] = defaultAbiCoder.decode([swapType], params[0])
    expect(swap.currency).toBe(b.underlying.address)
    expect(swap.path.map((p: { intermediateCurrency: string }) => p.intermediateCurrency)).toEqual([
      a.underlying.address,
      a.tokenize.address,
      b.tokenize.address,
    ])
    expect(swap.amount.toString()).toBe('2000000')
    expect(swap.limit.toString()).toBe('1010000')
  })
  test('disjoint pools may share conversions; settlement occurs once', () => {
    const [actions, params] = decode(TradeType.EXACT_INPUT, true)
    expect(actions).toBe('0x07070b0e')
    expect(params).toHaveLength(4)
    const r = route()
    const leg = {
      routev4: r,
      inputAmount: CurrencyAmount.fromRawAmount(a.underlying, 100),
      outputAmount: CurrencyAmount.fromRawAmount(b.underlying, 200),
    }
    expect(() => new Trade({ v4Routes: [leg, leg], tradeType: TradeType.EXACT_INPUT })).toThrow('POOLS_DUPLICATED')
    expect(() =>
      V4Trade.createUncheckedTradeWithMultipleRoutes({
        routes: [route(100), route(500)].map((route) => ({
          route,
          inputAmount: leg.inputAmount,
          outputAmount: leg.outputAmount,
        })),
        tradeType: TradeType.EXACT_INPUT,
      })
    ).not.toThrow()
  })
  test('settles plain and tokenized split routes in their respective pool currencies', () => {
    const plain = new Route(
      [new Pool(a.underlying, b.underlying, 100, 1, zero, encodeSqrtRatioX96(1, 1), '1000000000000', 0)],
      a.underlying,
      b.underlying
    )
    for (const type of [TradeType.EXACT_INPUT, TradeType.EXACT_OUTPUT]) {
      const mixed = new Trade({
        v4Routes: [plain, route()].map((routev4) => ({
          routev4,
          inputAmount: CurrencyAmount.fromRawAmount(a.underlying, 1000),
          outputAmount: CurrencyAmount.fromRawAmount(b.underlying, 1000),
        })),
        tradeType: type,
      })
      const result = buildKittycornMethodParameters(mixed, options, 84532)
      const [plan] = new Interface(['function executeActions(bytes)']).decodeFunctionData(
        'executeActions',
        result.calldata
      )
      const [actions, params] = defaultAbiCoder.decode(['bytes', 'bytes[]'], plan)
      expect(actions).toBe(type === TradeType.EXACT_INPUT ? '0x07070b0b0e0e' : '0x09090b0b0e0e')
      expect(params.slice(2).map((p: string) => defaultAbiCoder.decode(['address'], p)[0])).toEqual([
        a.underlying.address,
        a.tokenize.address,
        b.underlying.address,
        b.tokenize.address,
      ])
    }
  })
  test('rejects wrong chains, sentinel recipients and unbounded slippage', () => {
    expect(() => buildKittycornMethodParameters(trade(), options, 42161)).toThrow('Base Sepolia')
    for (const recipient of [
      zero,
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000002',
    ])
      expect(() => buildKittycornMethodParameters(trade(), { ...options, recipient }, 84532)).toThrow('recipient')
    for (const slippageTolerance of [new Percent(-1, 100), new Percent(100, 100)])
      expect(() => buildKittycornMethodParameters(trade(), { ...options, slippageTolerance }, 84532)).toThrow(
        'Slippage'
      )
  })
})
