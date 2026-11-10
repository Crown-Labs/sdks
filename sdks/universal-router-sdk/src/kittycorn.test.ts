import { expect, test } from 'bun:test'
import { defaultAbiCoder, Interface } from '@ethersproject/abi'
import { CurrencyAmount, Percent, TradeType } from '@kittycorn-labs/sdk-core'
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
