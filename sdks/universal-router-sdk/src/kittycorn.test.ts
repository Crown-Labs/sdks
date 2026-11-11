import { expect, test } from 'bun:test'
import { defaultAbiCoder, Interface } from '@ethersproject/abi'
import { CurrencyAmount, Ether, Percent, TradeType } from '@kittycorn-labs/sdk-core'
import { Pool, Route, KITTYCORN_BASE_SEPOLIA as config } from '@kittycorn-labs/v4-sdk'
import { Trade } from '@kittycorn-labs/router-sdk'
import { buildKittycornUniversalMethodParameters } from './kittycorn'
import { UniswapTrade } from './entities/actions/uniswap'
const [a, b] = config.tokens
const zero = '0x0000000000000000000000000000000000000000'
const pool = (x: typeof a.underlying, y: typeof a.underlying, fee: number) =>
  new Pool(x, y, fee, 1, zero, '79228162514264337593543950336', '1000000000000', 0)
const trade = new Trade({
  v4Routes: [
    {
      routev4: new Route(
        [pool(a.underlying, a.tokenize, 0), pool(a.tokenize, b.tokenize, 100), pool(b.tokenize, b.underlying, 0)],
        a.underlying,
        b.underlying
      ),
      inputAmount: CurrencyAmount.fromRawAmount(a.underlying, 10000),
      outputAmount: CurrencyAmount.fromRawAmount(b.underlying, 9000),
    },
  ],
  tradeType: TradeType.EXACT_OUTPUT,
})
const options = {
  recipient: '0x0000000000000000000000000000000000001234',
  universalRouter: '0x0000000000000000000000000000000000005678',
  deadline: 12345678,
  slippageTolerance: new Percent(1, 100),
}

test('Kittycorn Universal Router carries a deadline, bounded Permit2 funding and the same action plan', () => {
  const result = buildKittycornUniversalMethodParameters(trade, options, 84532)
  expect(result.to).toBe(options.universalRouter)
  const [commands, inputs, deadline] = new Interface(['function execute(bytes,bytes[],uint256)']).decodeFunctionData(
    'execute',
    result.calldata
  )
  expect(commands).toBe('0x41')
  expect(deadline.toNumber()).toBe(options.deadline)
  const [token, maximum, payerIsUser, actions] = defaultAbiCoder.decode(
    ['address', 'uint256', 'bool', 'bytes'],
    inputs[0]
  )
  expect(token).toBe(a.underlying.address)
  expect(maximum.toString()).toBe('10100')
  expect(payerIsUser).toBe(true)
  expect(defaultAbiCoder.decode(['bytes', 'bytes[]'], actions)[0]).toBe('0x090b0e')
})
test('standard Universal Router encoder refuses conversion edges', () => {
  expect(() => new UniswapTrade(trade, options)).toThrow('buildKittycornUniversalMethodParameters')
})
test('rejects absent deadline and invalid router instead of using an obsolete deployment', () => {
  expect(() => buildKittycornUniversalMethodParameters(trade, { ...options, deadline: 0 }, 84532)).toThrow('deadline')
  expect(() => buildKittycornUniversalMethodParameters(trade, { ...options, universalRouter: zero }, 84532)).toThrow(
    'address'
  )
})

for (const nativeIn of [true, false]) {
  for (const tradeType of [TradeType.EXACT_INPUT, TradeType.EXACT_OUTPUT]) {
    test(`native ${nativeIn ? 'input' : 'output'} ${TradeType[tradeType]} wraps, settles and refunds correctly`, () => {
      const weth = config.tokens[2]
      const eth = Ether.onChain(84532)
      const input = nativeIn ? eth : a.underlying
      const output = nativeIn ? a.underlying : eth
      const pools = [
        pool(weth.underlying, weth.tokenize, 0),
        pool(weth.tokenize, a.tokenize, 500),
        pool(a.tokenize, a.underlying, 0),
      ]
      if (!nativeIn) pools.reverse()
      const nativeTrade = new Trade({
        v4Routes: [
          {
            routev4: new Route(pools, input, output),
            inputAmount: CurrencyAmount.fromRawAmount(input, 10000),
            outputAmount: CurrencyAmount.fromRawAmount(output, 9000),
          },
        ],
        tradeType,
      })
      const result = buildKittycornUniversalMethodParameters(nativeTrade, options, 84532)
      const [commands, inputs] = new Interface(['function execute(bytes,bytes[],uint256)']).decodeFunctionData(
        'execute',
        result.calldata
      )
      expect(commands).toBe(nativeIn ? '0x0b410c' : '0x410c')
      expect(BigInt(result.value)).toBe(nativeIn ? (tradeType === TradeType.EXACT_INPUT ? 10000n : 10100n) : 0n)
      const funding = defaultAbiCoder.decode(['address', 'uint256', 'bool', 'bytes'], inputs[nativeIn ? 1 : 0])
      expect(funding[0]).toBe(input.wrapped.address)
      expect(funding[2]).toBe(!nativeIn)
      const [actions, params] = defaultAbiCoder.decode(['bytes', 'bytes[]'], funding[3])
      expect(actions).toBe(tradeType === TradeType.EXACT_INPUT ? '0x070b0e' : '0x090b0e')
      const take = defaultAbiCoder.decode(['address', 'address', 'uint256'], params[2])
      expect(take[1]).toBe(nativeIn ? options.recipient : options.universalRouter)
      const unwrap = defaultAbiCoder.decode(['address', 'uint256'], inputs[inputs.length - 1])
      expect(unwrap[0]).toBe(nativeIn ? '0x0000000000000000000000000000000000000001' : options.recipient)
      expect(unwrap[1].toString()).toBe(
        nativeIn ? '0' : nativeTrade.minimumAmountOut(options.slippageTolerance).quotient.toString()
      )
      expect(() =>
        buildKittycornUniversalMethodParameters(nativeTrade, { ...options, recipient: zero }, 84532)
      ).toThrow('recipient')
    })
  }
}

test('native output splits keep both plain and Tokenize pool settlements and one aggregate unwrap minimum', () => {
  const weth = config.tokens[2]
  const eth = Ether.onChain(84532)
  const split = new Trade({
    v4Routes: [
      [
        pool(a.underlying, a.tokenize, 0),
        pool(a.tokenize, weth.tokenize, 500),
        pool(weth.tokenize, weth.underlying, 0),
      ],
      [pool(a.underlying, weth.underlying, 500)],
    ].map((pools) => ({
      routev4: new Route(pools, a.underlying, eth),
      inputAmount: CurrencyAmount.fromRawAmount(a.underlying, 5000),
      outputAmount: CurrencyAmount.fromRawAmount(eth, 4501),
    })),
    tradeType: TradeType.EXACT_INPUT,
  })
  const result = buildKittycornUniversalMethodParameters(split, options, 84532)
  const [commands, inputs] = new Interface(['function execute(bytes,bytes[],uint256)']).decodeFunctionData(
    'execute',
    result.calldata
  )
  expect(commands).toBe('0x410c')
  const funding = defaultAbiCoder.decode(['address', 'uint256', 'bool', 'bytes'], inputs[0])
  const [actions, params] = defaultAbiCoder.decode(['bytes', 'bytes[]'], funding[3])
  expect(actions).toBe('0x07070b0b0e0e')
  for (const take of params.slice(-2))
    expect(defaultAbiCoder.decode(['address', 'address', 'uint256'], take)[1]).toBe(options.universalRouter)
  expect(defaultAbiCoder.decode(['address', 'uint256'], inputs[1])[1].toString()).toBe(
    split.minimumAmountOut(options.slippageTolerance).quotient.toString()
  )
})

test('wrapping preserves fractional split totals until aggregate slippage rounding', () => {
  const eth = Ether.onChain(84532)
  const weth = config.tokens[2]
  const fractional = new Trade({
    v4Routes: [500, 3000].map((fee) => ({
      routev4: new Route([pool(a.underlying, weth.underlying, fee)], a.underlying, eth),
      inputAmount: CurrencyAmount.fromRawAmount(a.underlying, 10000),
      outputAmount: CurrencyAmount.fromFractionalAmount(eth, 100019, 10),
    })),
    tradeType: TradeType.EXACT_INPUT,
  })
  const result = buildKittycornUniversalMethodParameters(fractional, options, 84532)
  const [, inputs] = new Interface(['function execute(bytes,bytes[],uint256)']).decodeFunctionData(
    'execute',
    result.calldata
  )
  const funding = defaultAbiCoder.decode(['address', 'uint256', 'bool', 'bytes'], inputs[0])
  const [, params] = defaultAbiCoder.decode(['bytes', 'bytes[]'], funding[3])
  const minimum = params.slice(0, 2).reduce((sum: bigint, param: string) => {
    const [swap] = defaultAbiCoder.decode(
      [
        'tuple(address currency,tuple(address intermediateCurrency,uint24 fee,int24 tickSpacing,address hooks,bytes hookData)[] path,uint256[] minHopPriceX36,uint128 amount,uint128 limit)',
      ],
      param
    )
    return sum + BigInt(swap.limit.toString())
  }, 0n)
  expect(minimum).toBe(19802n)
  expect(minimum.toString()).toBe(fractional.minimumAmountOut(options.slippageTolerance).quotient.toString())
})
