import { expect, test } from 'bun:test'
import { defaultAbiCoder, Interface } from '@ethersproject/abi'
import { Ether, Percent } from '@kittycorn-labs/sdk-core'
import { Pool as V3Pool, Position as V3Position, TickMath } from '@kittycorn-labs/v3-sdk'
import { Pool, Position } from './entities'
import { KITTYCORN_BASE_SEPOLIA as registry } from './tokenize'
import { V4PositionManager } from './PositionManager'

// Bank collateral and V3→V4 migration use the same liquidity math across SDKs.
// Check real dependency classes at both range boundaries and above JS integer precision.
const zero = '0x0000000000000000000000000000000000000000'
const recipient = '0x0000000000000000000000000000000000001234'
const deadline = 2000000000
const decode = (data: string) => {
  const call = V4PositionManager.INTERFACE.parseTransaction({ data })
  const calls =
    call.name === 'multicall'
      ? call.args[0].map((data: string) => V4PositionManager.INTERFACE.parseTransaction({ data }))
      : [call]
  const modify = calls.find((c: { name: string }) => c.name === 'modifyLiquidities')
  expect(modify.args[1].toString()).toBe(String(deadline))
  const [actions, params] = defaultAbiCoder.decode(['bytes', 'bytes[]'], modify.args[0])
  return { calls, actions, params }
}

for (const tokenize of [false, true])
  for (const tick of [-120, -60, 0, 60, 120])
    test(`V3/V4 position dependency math: tokenize=${tokenize}, tick=${tick}`, () => {
      const currencies = registry.tokens.slice(0, 2).map((t) => (tokenize ? t.tokenize : t.underlying))
      const price = TickMath.getSqrtRatioAtTick(tick)
      const v3 = new V3Pool(currencies[0], currencies[1], 500, price, '1000000000000000000', tick)
      const v4 = new Pool(currencies[0], currencies[1], 500, 10, zero, price, '1000000000000000000', tick)
      const args = { tickLower: -60, tickUpper: 60, liquidity: '900719925474099312345' }
      const old = new V3Position({ ...args, pool: v3 })
      const current = new Position({ ...args, pool: v4 })
      expect(current.amount0.quotient.toString()).toBe(old.amount0.quotient.toString())
      expect(current.amount1.quotient.toString()).toBe(old.amount1.quotient.toString())
      const oldBurn = old.burnAmountsWithSlippage(new Percent(1, 100))
      const currentBurn = current.burnAmountsWithSlippage(new Percent(1, 100))
      expect(currentBurn.amount0.toString()).toBe(oldBurn.amount0.toString())
      expect(currentBurn.amount1.toString()).toBe(oldBurn.amount1.toString())
      // V4 mint limits are MAXIMA; V3 mint slippage uses minima. Do not conflate them.
      const maximum = current.mintAmountsWithSlippage(new Percent(1, 100))
      expect(BigInt(maximum.amount0.toString()) >= BigInt(current.mintAmounts.amount0.toString())).toBe(true)
      expect(BigInt(maximum.amount1.toString()) >= BigInt(current.mintAmounts.amount1.toString())).toBe(true)
      const rebuild = Position.fromAmounts({
        pool: v4,
        tickLower: -60,
        tickUpper: 60,
        amount0: current.mintAmounts.amount0,
        amount1: current.mintAmounts.amount1,
        useFullPrecision: true,
      })
      expect(BigInt(rebuild.liquidity.toString()) >= BigInt(args.liquidity)).toBe(true)
    })

for (const native of [false, true]) {
  const pool = new Pool(
    native ? Ether.onChain(84532) : registry.tokens[0].tokenize,
    registry.tokens[1].tokenize,
    100,
    1,
    zero,
    TickMath.getSqrtRatioAtTick(0),
    '1000000000000000000',
    0
  )
  const position = new Position({ pool, tickLower: -60, tickUpper: 60, liquidity: '10000000000000001' })
  const options = {
    recipient,
    deadline,
    slippageTolerance: new Percent(1, 100),
    ...(native ? { useNative: Ether.onChain(84532) } : {}),
  }
  test(`migration custody: native=${native} settles from manager and sweeps leftovers`, () => {
    const result = V4PositionManager.addCallParameters(position, { ...options, migrate: true })
    expect(BigInt(result.value)).toBe(0n)
    const { actions, params } = decode(result.calldata)
    expect(actions).toBe(native ? '0x02160b0b1414' : '0x020b0b1414')
    const settle = params.slice(native ? 2 : 1, native ? 4 : 3)
    for (const data of settle) expect(defaultAbiCoder.decode(['address', 'uint256', 'bool'], data)[2]).toBe(false)
    const sweep = params.slice(-2).map((p: string) => defaultAbiCoder.decode(['address', 'address'], p))
    expect(sweep.map((p: string[]) => p[1])).toEqual([recipient, recipient])
    expect(sweep[0][0]).toBe(pool.currency0.wrapped.address)
    expect(sweep[1][0]).toBe(pool.currency1.wrapped.address)
  })
  test(`burn/collect preserve large token ids: native=${native}`, () => {
    const tokenId = '9007199254740993'
    const removed = V4PositionManager.removeCallParameters(position, {
      ...options,
      tokenId,
      burnToken: true,
      liquidityPercentage: new Percent(1),
    })
    const { actions, params } = decode(removed.calldata)
    expect(actions).toBe('0x0311')
    expect(defaultAbiCoder.decode(['uint256', 'uint128', 'uint128', 'bytes'], params[0])[0].toString()).toBe(tokenId)
    expect(() =>
      V4PositionManager.removeCallParameters(position, {
        ...options,
        tokenId,
        burnToken: true,
        liquidityPercentage: new Percent(1, 2),
      })
    ).toThrow()
    const collected = decode(V4PositionManager.collectCallParameters(position, { ...options, tokenId }).calldata)
    expect(collected.actions).toBe('0x0111')
    expect(
      defaultAbiCoder.decode(['uint256', 'uint256', 'uint128', 'uint128', 'bytes'], collected.params[0])[1].toString()
    ).toBe('0')
  })
}

test('batch Permit2 ABI remains compatible with the position-manager contract before mint', () => {
  const pool = new Pool(
    registry.tokens[0].tokenize,
    registry.tokens[1].tokenize,
    100,
    1,
    zero,
    TickMath.getSqrtRatioAtTick(0),
    '1000000',
    0
  )
  const position = new Position({ pool, tickLower: -60, tickUpper: 60, liquidity: '1000000' })
  const details = [pool.currency0, pool.currency1].map((c) => ({
    token: c.wrapped.address,
    amount: '9007199254740993',
    expiration: deadline,
    nonce: 1,
  }))
  const result = V4PositionManager.addCallParameters(position, {
    recipient,
    deadline,
    slippageTolerance: new Percent(1, 100),
    batchPermit: {
      owner: recipient,
      permitBatch: { details, spender: recipient, sigDeadline: deadline },
      signature: '0x1234',
    },
  })
  const { calls } = decode(result.calldata)
  expect(calls.map((c: { name: string }) => c.name)).toEqual(['permitBatch', 'modifyLiquidities'])
  // Decode independently of the SDK ABI so a struct-layout regression cannot pass itself.
  const permit = new Interface([
    'function permitBatch(address,((address,uint160,uint48,uint48)[],address,uint256),bytes)',
  ]).decodeFunctionData('permitBatch', V4PositionManager.INTERFACE.encodeFunctionData(calls[0].name, calls[0].args))
  expect(permit[0]).toBe(recipient)
  expect(permit[1][0].map((d: { toString(): string }[]) => d[1].toString())).toEqual(details.map((d) => d.amount))
})
