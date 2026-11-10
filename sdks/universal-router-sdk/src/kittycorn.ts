import { defaultAbiCoder, Interface } from '@ethersproject/abi'
import { validateAndParseAddress as getAddress } from '@kittycorn-labs/sdk-core'
import { Currency, TradeType } from '@kittycorn-labs/sdk-core'
import {
  Trade,
  buildKittycornMethodParameters,
  KittycornSwapOptions,
  KittycornMethodParameters,
} from '@kittycorn-labs/router-sdk'

/** Base Sepolia's Kittycorn extension. The Universal Router address is supplied after deployment. */
export type KittycornUniversalSwapOptions = KittycornSwapOptions & {
  universalRouter: string
  deadline: number
}

/** Wrap the same V4 action plan in Permit2 funding and an on-chain deadline. */
export function buildKittycornUniversalMethodParameters(
  trade: Trade<Currency, Currency, TradeType>,
  options: KittycornUniversalSwapOptions,
  chainId: number
): KittycornMethodParameters {
  if (!Number.isSafeInteger(options.deadline) || options.deadline <= 0) throw new Error('Invalid deadline')
  const to = getAddress(options.universalRouter)
  if (/^0x0{39}[012]$/i.test(to)) throw new Error('Invalid Universal Router address')
  const direct = buildKittycornMethodParameters(trade, options, chainId)
  const [actions] = new Interface(['function executeActions(bytes params)']).decodeFunctionData(
    'executeActions',
    direct.calldata
  )
  const input = defaultAbiCoder.encode(
    ['address', 'uint256', 'bool', 'bytes'],
    [
      trade.inputAmount.currency.wrapped.address,
      trade.maximumAmountIn(options.slippageTolerance).quotient.toString(),
      true,
      actions,
    ]
  )
  const router = new Interface(['function execute(bytes commands,bytes[] inputs,uint256 deadline) payable'])
  return { to, value: '0x00', calldata: router.encodeFunctionData('execute', ['0x41', [input], options.deadline]) }
}
