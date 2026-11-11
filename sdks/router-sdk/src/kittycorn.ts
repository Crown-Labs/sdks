import { defaultAbiCoder, Interface } from '@ethersproject/abi'
import { Currency, Percent, TradeType, validateAndParseAddress as getAddress } from '@kittycorn-labs/sdk-core'
import { encodeRouteToPath, isTokenizeConversion, KITTYCORN_BASE_SEPOLIA as config } from '@kittycorn-labs/v4-sdk'
import { Protocol } from './entities/protocol'
import { Trade } from './entities/trade'
import { RouteV4 } from './entities/route'
export type KittycornSwapOptions = { recipient: string; slippageTolerance: Percent }
export type KittycornMethodParameters = { to: string; calldata: string; value: string }

const ROUTER = new Interface(['function executeActions(bytes params) payable'])
const SWAP_PARAMS =
  'tuple(address currency,tuple(address intermediateCurrency,uint24 fee,int24 tickSpacing,address hooks,bytes hookData)[] path,uint256[] minHopPriceX36,uint128 amount,uint128 limit)'

/** Encode underlying-token swaps for the current Kittycorn router, including ERC4626 conversion hops. */
export function buildKittycornMethodParameters(
  trade: Trade<Currency, Currency, TradeType>,
  options: KittycornSwapOptions,
  chainId: number
): KittycornMethodParameters {
  if (chainId !== config.chainId || trade.inputAmount.currency.chainId !== chainId)
    throw new Error('Kittycorn supports only Base Sepolia')
  const recipient = getAddress(options.recipient)
  // 0, 1 and 2 have special meaning to the V4 action router; never silently remap a recipient.
  if (/^0x0{39}[012]$/i.test(recipient)) throw new Error('Invalid Kittycorn recipient')
  if (options.slippageTolerance.lessThan(0) || !options.slippageTolerance.lessThan(1))
    throw new Error('Slippage must be between zero (inclusive) and 100% (exclusive)')
  if (trade.inputAmount.currency.isNative || trade.outputAmount.currency.isNative)
    throw new Error('Native ETH requires buildKittycornUniversalMethodParameters')
  const input = config.tokens.find((t) => t.underlying.equals(trade.inputAmount.currency))
  const output = config.tokens.find((t) => t.underlying.equals(trade.outputAmount.currency))
  if (!input || !output || input === output)
    throw new Error('Kittycorn swaps require distinct supported underlying ERC20 tokens')

  const exactOutput = trade.tradeType === TradeType.EXACT_OUTPUT
  const params: string[] = []
  let actions = '0x'
  const settle = new Set<string>()
  const take = new Set<string>()
  let quotedOutput = trade.outputAmount.multiply(0)
  let minimumOutput = quotedOutput
  for (const swap of trade.swaps) {
    if (swap.route.protocol !== Protocol.V4 || !(swap.route instanceof RouteV4))
      throw new Error('Kittycorn requires V4 routes')
    const route = swap.route
    const pools = route.pools
    const convertIn = isTokenizeConversion(pools[0]!)
    const convertOut = isTokenizeConversion(pools[pools.length - 1]!)
    if (
      pools.length === 0 ||
      pools.slice(convertIn ? 1 : 0, convertOut ? -1 : undefined).some(isTokenizeConversion) ||
      (convertIn && !route.currencyPath[1]!.equals(input.tokenize)) ||
      (convertOut && !route.currencyPath[route.currencyPath.length - 2]!.equals(output.tokenize))
    )
      throw new Error('Kittycorn conversions must be at route endpoints')
    settle.add(convertIn ? input.tokenize.address : input.underlying.address)
    take.add(convertOut ? output.tokenize.address : output.underlying.address)
    const amount = exactOutput ? swap.outputAmount : swap.inputAmount
    // Allocate rounding across split legs so their limits sum to the trade's
    // aggregate minimum. Independently rounding each leg loses up to n - 1 units.
    const previousMinimum = minimumOutput
    quotedOutput = quotedOutput.add(swap.outputAmount)
    minimumOutput = trade.minimumAmountOut(options.slippageTolerance, quotedOutput)
    const limit = exactOutput
      ? trade.maximumAmountIn(options.slippageTolerance, swap.inputAmount)
      : minimumOutput.subtract(previousMinimum)
    if (amount.quotient.toString() === '0' || limit.quotient.toString() === '0')
      throw new Error('Kittycorn amount and limit must be positive')
    params.push(
      defaultAbiCoder.encode(
        [SWAP_PARAMS],
        [
          [
            exactOutput ? output.underlying.address : input.underlying.address,
            encodeRouteToPath(route, exactOutput),
            [],
            amount.quotient.toString(),
            limit.quotient.toString(),
          ],
        ]
      )
    )
    actions += exactOutput ? '09' : '07'
  }
  // Settle each distinct pool currency once, including splits mixing plain ERC20 and Tokenize pools.
  // KittycornRouter converts Tokenize deltas through ERC4626; plain ERC20 deltas transfer directly.
  for (const currency of settle) {
    params.push(defaultAbiCoder.encode(['address', 'uint256', 'bool'], [currency, 0, true]))
    actions += '0b'
  }
  for (const currency of take) {
    params.push(defaultAbiCoder.encode(['address', 'address', 'uint256'], [currency, recipient, 0]))
    actions += '0e'
  }
  return {
    to: config.router,
    value: '0x00',
    calldata: ROUTER.encodeFunctionData('executeActions', [
      defaultAbiCoder.encode(['bytes', 'bytes[]'], [actions, params]),
    ]),
  }
}
