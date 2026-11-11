import { defaultAbiCoder, Interface } from '@ethersproject/abi'
import { Currency, TradeType, validateAndParseAddress as getAddress } from '@kittycorn-labs/sdk-core'
import {
  Trade,
  RouteV4,
  buildKittycornMethodParameters,
  KittycornSwapOptions,
  KittycornMethodParameters,
} from '@kittycorn-labs/router-sdk'

import { Route } from '@kittycorn-labs/v4-sdk'

/** Base Sepolia's Kittycorn extension. The Universal Router address is supplied after deployment. */
export type KittycornUniversalSwapOptions = KittycornSwapOptions & {
  universalRouter: string
  deadline: number
}

/** Fund V4 actions with Permit2 or native ETH; unwrap native output and refund unused ETH to the payer. */
export function buildKittycornUniversalMethodParameters(
  trade: Trade<Currency, Currency, TradeType>,
  options: KittycornUniversalSwapOptions,
  chainId: number
): KittycornMethodParameters {
  if (!Number.isSafeInteger(options.deadline) || options.deadline <= 0) throw new Error('Invalid deadline')
  const to = getAddress(options.universalRouter)
  if (/^0x0{39}[012]$/i.test(to)) throw new Error('Invalid Universal Router address')
  const nativeIn = trade.inputAmount.currency.isNative
  const nativeOut = trade.outputAmount.currency.isNative
  const recipient = getAddress(options.recipient)
  if (/^0x0{39}[012]$/i.test(recipient)) throw new Error('Invalid Kittycorn recipient')
  // Native ETH is wrapped outside the action router. Preserve quoted amounts and
  // split allocation; synthetic ERC4626 hops must never be priced as AMM pools.
  const wrappedTrade =
    nativeIn || nativeOut
      ? new Trade({
          v4Routes: trade.swaps.map((swap) => {
            if (!(swap.route instanceof RouteV4)) throw new Error('Kittycorn requires V4 routes')
            if (swap.route.currencyPath.some((currency) => currency.isNative))
              throw new Error('Kittycorn native swaps require WETH pool paths')
            return {
              routev4: new Route(
                swap.route.pools,
                swap.inputAmount.currency.wrapped,
                swap.outputAmount.currency.wrapped
              ),
              inputAmount: swap.inputAmount.wrapped,
              outputAmount: swap.outputAmount.wrapped,
            }
          }),
          tradeType: trade.tradeType,
        })
      : trade
  const direct = buildKittycornMethodParameters(
    wrappedTrade,
    {
      ...options,
      recipient: nativeOut ? to : recipient,
    },
    chainId
  )
  const [actions] = new Interface(['function executeActions(bytes params)']).decodeFunctionData(
    'executeActions',
    direct.calldata
  )
  const maximum = trade.maximumAmountIn(options.slippageTolerance).quotient.toString()
  const input = defaultAbiCoder.encode(
    ['address', 'uint256', 'bool', 'bytes'],
    [trade.inputAmount.currency.wrapped.address, maximum, !nativeIn, actions]
  )
  const router = new Interface(['function execute(bytes commands,bytes[] inputs,uint256 deadline) payable'])
  let commands = '0x41'
  const inputs = [input]
  if (nativeIn) {
    commands = '0x0b410c'
    inputs.unshift(defaultAbiCoder.encode(['address', 'uint256'], [to, maximum]))
    // Wrap into router custody; MSG_SENDER refunds the payer,
    // even when the output recipient differs. The router must not retain WETH dust.
    inputs.push(defaultAbiCoder.encode(['address', 'uint256'], ['0x0000000000000000000000000000000000000001', 0]))
  } else if (nativeOut) {
    commands += '0c'
    inputs.push(
      defaultAbiCoder.encode(
        ['address', 'uint256'],
        [recipient, trade.minimumAmountOut(options.slippageTolerance).quotient.toString()]
      )
    )
  }
  return {
    to,
    value: nativeIn ? '0x' + BigInt(maximum).toString(16) : '0x00',
    calldata: router.encodeFunctionData('execute', [commands, inputs, options.deadline]),
  }
}
