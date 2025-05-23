import { Ether, Token, WETH9, CurrencyAmount, Currency } from '@kittycorn-labs/sdk-core'
import { Route as V3RouteSDK, Pool as V3Pool, FeeAmount, TickMath, encodeSqrtRatioX96 } from '@kittycorn-labs/v3-sdk'
import { Pool as V4Pool } from '@kittycorn-labs/v4-sdk'
import { MixedRoute, RouteV3 } from '../route'
import { Protocol } from '../protocol'
import { Route as V2RouteSDK, Pair } from '@kittycorn-labs/v2-sdk'
import { MixedRouteSDK } from './route'
import { partitionMixedRouteByProtocol } from '../../utils'
import { ADDRESS_ZERO } from '../../constants'

describe('MixedRoute', () => {
  const SQRT_RATIO_ONE = encodeSqrtRatioX96(1, 1)
  const ETHER = Ether.onChain(1)
  const token0 = new Token(1, '0x0000000000000000000000000000000000000001', 18, 't0')
  const token1 = new Token(1, '0x0000000000000000000000000000000000000002', 18, 't1')
  const token2 = new Token(1, '0x0000000000000000000000000000000000000003', 18, 't2')
  const token3 = new Token(1, '0x0000000000000000000000000000000000000004', 18, 't3')
  const weth = WETH9[1]

  const pool_v4_0_weth = new V4Pool(token0, weth, FeeAmount.MEDIUM, 60, ADDRESS_ZERO, SQRT_RATIO_ONE, 0, 0, [])
  const pool_v4_1_eth = new V4Pool(token1, ETHER, FeeAmount.MEDIUM, 60, ADDRESS_ZERO, SQRT_RATIO_ONE, 0, 0, [])
  const pool_v4_0_1 = new V4Pool(token0, token1, FeeAmount.MEDIUM, 60, ADDRESS_ZERO, SQRT_RATIO_ONE, 0, 0, [])
  const pool_v4_weth_eth = new V4Pool(weth, ETHER, 0, 0, ADDRESS_ZERO, SQRT_RATIO_ONE, 0, 0)

  const pool_v3_0_1 = new V3Pool(token0, token1, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
  const pool_v3_0_weth = new V3Pool(token0, weth, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
  const pool_v3_1_weth = new V3Pool(token1, weth, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
  const pool_v3_2_weth = new V3Pool(token2, weth, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
  const pool_v3_2_3 = new V3Pool(token2, token3, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
  /// @dev copied from v2-sdk route.test.ts
  const pair_0_1 = new Pair(CurrencyAmount.fromRawAmount(token0, '100'), CurrencyAmount.fromRawAmount(token1, '200'))
  const pair_0_weth = new Pair(CurrencyAmount.fromRawAmount(token0, '100'), CurrencyAmount.fromRawAmount(weth, '100'))
  const pair_1_weth = new Pair(CurrencyAmount.fromRawAmount(token1, '175'), CurrencyAmount.fromRawAmount(weth, '100'))
  const pair_weth_2 = new Pair(CurrencyAmount.fromRawAmount(weth, '200'), CurrencyAmount.fromRawAmount(token2, '150'))
  const pair_2_3 = new Pair(CurrencyAmount.fromRawAmount(token2, '100'), CurrencyAmount.fromRawAmount(token3, '200'))

  describe('path', () => {
    it('real v3 weth pool and fake v4 eth/weth pool', () => {
      const route = new MixedRouteSDK([pool_v3_0_weth, pool_v4_weth_eth], token0, ETHER)
      expect(route.path).toEqual([token0, weth])
      expect(route.pools).toEqual([pool_v3_0_weth])
    })

    it('real v3 weth pool and real v4 eth pool', () => {
      const route = new MixedRouteSDK([pool_v3_0_weth, pool_v4_weth_eth, pool_v4_1_eth], token0, token1)
      expect(route.path).toEqual([token0, weth, token1])
      expect(route.pools).toEqual([pool_v3_0_weth, pool_v4_1_eth])
    })

    it('wraps pure v3 route object and successfully constructs a path from the tokens', () => {
      /// @dev since the MixedRoute sdk object lives here in router-sdk we don't need to wrap it
      const routeOriginal = new MixedRouteSDK([pool_v3_0_1], token0, token1)
      const route = new MixedRoute(routeOriginal)
      expect(route.pools).toEqual([pool_v3_0_1])
      expect(route.path).toEqual([token0, token1])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(token1)
      expect(route.chainId).toEqual(1)
    })

    it('wraps pure v2 route object and successfully constructs a path from the tokens', () => {
      const route = new MixedRouteSDK([pair_0_1], token0, token1)
      expect(route.pools).toEqual([pair_0_1])
      expect(route.path).toEqual([token0, token1])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(token1)
      expect(route.chainId).toEqual(1)
    })

    it('wraps a pure v4 route object and successfully constructs a path from the tokens including ETHER', () => {
      const route = new MixedRouteSDK([pool_v4_0_1, pool_v4_1_eth], token0, ETHER)
      expect(route.pools).toEqual([pool_v4_0_1, pool_v4_1_eth])
      expect(route.path).toEqual([token0, token1, ETHER])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(ETHER)
      expect(route.chainId).toEqual(1)
    })

    it('wraps mixed route object and successfully constructs a path from the tokens', () => {
      const route = new MixedRouteSDK([pool_v3_0_1, pair_1_weth], token0, weth)
      expect(route.pools).toEqual([pool_v3_0_1, pair_1_weth])
      expect(route.path).toEqual([token0, token1, weth])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(weth)
      expect(route.chainId).toEqual(1)
    })

    it('wraps mixed route object with v4 route successfully constructs a path from the tokens', () => {
      const route = new MixedRouteSDK([pool_v3_0_1, pool_v4_0_weth], token1, weth)
      expect(route.pools).toEqual([pool_v3_0_1, pool_v4_0_weth])
      expect(route.path).toEqual([token1, token0, weth])
      expect(route.input).toEqual(token1)
      expect(route.output).toEqual(weth)
      expect(route.pathInput).toEqual(token1)
      expect(route.pathOutput).toEqual(weth)
      expect(route.chainId).toEqual(1)
    })

    it('wraps mixed route object with mixed v4 route that converts WETH -> ETH ', () => {
      const route = new MixedRouteSDK([pool_v3_0_weth, pool_v4_weth_eth, pool_v4_1_eth], token0, token1, true)
      expect(route.pools).toEqual([pool_v3_0_weth, pool_v4_weth_eth, pool_v4_1_eth])
      expect(route.path).toEqual([token0, weth, ETHER, token1])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(token1)
      expect(route.pathInput).toEqual(token0)
      expect(route.pathOutput).toEqual(token1)
      expect(route.chainId).toEqual(1)
    })

    it('wraps mixed route object with mixed v4 route that converts ETH -> WETH ', () => {
      const route = new MixedRouteSDK([pool_v4_1_eth, pool_v3_0_weth], token1, token0)
      expect(route.pools).toEqual([pool_v4_1_eth, pool_v3_0_weth])
      expect(route.path).toEqual([token1, ETHER, token0])
      expect(route.input).toEqual(token1)
      expect(route.output).toEqual(token0)
      expect(route.chainId).toEqual(1)
    })

    it('cannot wrap mixed route object with pure v4 route that converts ETH -> WETH ', () => {
      const route = new MixedRouteSDK([pool_v4_1_eth, pool_v4_0_weth], token1, token0)
      expect(route.pools).toEqual([pool_v4_1_eth, pool_v4_0_weth])
      expect(route.path).toEqual([token1, ETHER, token0])
      expect(route.input).toEqual(token1)
      expect(route.output).toEqual(token0)
      expect(route.chainId).toEqual(1)
    })

    it('cannot wrap mixed route object with pure v4 route that converts WETH -> ETH ', () => {
      const route = new MixedRouteSDK([pool_v4_0_weth, pool_v4_1_eth], token0, token1)
      expect(route.pools).toEqual([pool_v4_0_weth, pool_v4_1_eth])
      expect(route.path).toEqual([token0, weth, token1])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(token1)
      expect(route.chainId).toEqual(1)
    })

    it('wraps complex mixed route object and successfully constructs a path from the tokens', () => {
      const route = new MixedRouteSDK([pool_v3_0_1, pair_1_weth, pair_weth_2], token0, token2)
      expect(route.pools).toEqual([pool_v3_0_1, pair_1_weth, pair_weth_2])
      expect(route.path).toEqual([token0, token1, weth, token2])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(token2)
      expect(route.chainId).toEqual(1)
    })

    it('wraps complex mixed route object with multihop V3 in the beginning and constructs a path', () => {
      const route = new MixedRouteSDK([pool_v3_0_1, pool_v3_1_weth, pair_weth_2], token0, token2)
      expect(route.pools).toEqual([pool_v3_0_1, pool_v3_1_weth, pair_weth_2])
      expect(route.path).toEqual([token0, token1, weth, token2])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(token2)
      expect(route.chainId).toEqual(1)
    })

    it('wraps complex mixed route object that unwraps WETH to ETH at the end', () => {
      const route = new MixedRouteSDK([pool_v3_0_1, pool_v3_1_weth], token0, ETHER)
      expect(route.pools).toEqual([pool_v3_0_1, pool_v3_1_weth])
      expect(route.path).toEqual([token0, token1, weth])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(ETHER)
      expect(route.pathInput).toEqual(token0)
      expect(route.pathOutput).toEqual(weth)
      expect(route.chainId).toEqual(1)
    })

    it('wraps complex mixed route object with multihop V2 in the beginning and constructs a path', () => {
      const route = new MixedRouteSDK([pair_0_1, pair_1_weth, pool_v3_2_weth], token0, token2)
      expect(route.pools).toEqual([pair_0_1, pair_1_weth, pool_v3_2_weth])
      expect(route.path).toEqual([token0, token1, weth, token2])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(token2)
      expect(route.chainId).toEqual(1)
    })

    it('wraps complex mixed route object with consecutive V3 in the middle and constructs a path', () => {
      const route = new MixedRouteSDK([pair_0_1, pool_v3_1_weth, pool_v3_2_weth, pair_2_3], token0, token3)
      expect(route.pools).toEqual([pair_0_1, pool_v3_1_weth, pool_v3_2_weth, pair_2_3])
      expect(route.path).toEqual([token0, token1, weth, token2, token3])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(token3)
      expect(route.chainId).toEqual(1)
    })

    it('wraps complex mixed route object with consecutive V2 in the middle and constructs a path', () => {
      const route = new MixedRouteSDK([pool_v3_0_1, pair_1_weth, pair_weth_2, pool_v3_2_3], token0, token3)
      expect(route.pools).toEqual([pool_v3_0_1, pair_1_weth, pair_weth_2, pool_v3_2_3])
      expect(route.path).toEqual([token0, token1, weth, token2, token3])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(token3)
      expect(route.chainId).toEqual(1)
    })
  })

  it('can have a token as both input and output', () => {
    const route = new MixedRouteSDK([pair_0_weth, pair_0_1, pair_1_weth], weth, weth)
    expect(route.pools).toEqual([pair_0_weth, pair_0_1, pair_1_weth])
    expect(route.input).toEqual(weth)
    expect(route.output).toEqual(weth)
  })

  describe('is backwards compatible with a 100% V3 route', () => {
    it('successfully assigns the protocol', () => {
      const routeOriginal = new V3RouteSDK([pool_v3_0_1], token0, token1)
      const route = new RouteV3(routeOriginal)
      expect(route.protocol).toEqual(Protocol.V3)
    })

    it('inherits parameters from extended route class', () => {
      const routeOriginal = new V3RouteSDK([pool_v3_0_1], token0, token1)
      const route = new RouteV3(routeOriginal)
      expect(route.pools).toEqual(routeOriginal.pools)
      expect(route.path).toEqual(routeOriginal.tokenPath)
      expect(route.input).toEqual(routeOriginal.input)
      expect(route.output).toEqual(routeOriginal.output)
      expect(route.midPrice).toEqual(routeOriginal.midPrice)
      expect(route.chainId).toEqual(routeOriginal.chainId)
    })

    it('can have a token as both input and output', () => {
      const routeOriginal = new V3RouteSDK([pool_v3_0_weth, pool_v3_0_1, pool_v3_1_weth], weth, weth)
      const route = new RouteV3(routeOriginal)
      expect(route.pools).toEqual([pool_v3_0_weth, pool_v3_0_1, pool_v3_1_weth])
      expect(route.input).toEqual(weth)
      expect(route.output).toEqual(weth)
    })

    it('supports ether input', () => {
      const routeOriginal = new V3RouteSDK([pool_v3_0_weth], ETHER, token0)
      const route = new RouteV3(routeOriginal)
      expect(route.pools).toEqual([pool_v3_0_weth])
      expect(route.input).toEqual(ETHER)
      expect(route.output).toEqual(token0)
    })

    it('supports ether output', () => {
      const routeOriginal = new V3RouteSDK([pool_v3_0_weth], token0, ETHER)
      const route = new RouteV3(routeOriginal)
      expect(route.pools).toEqual([pool_v3_0_weth])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(ETHER)
    })
  })

  describe('#midPrice', () => {
    /// @dev creating new local variables so we can easily test different pool ratios independent of other tests
    const pool_v3_0_1 = new V3Pool(
      token0,
      token1,
      FeeAmount.MEDIUM,
      encodeSqrtRatioX96(1, 5),
      0,
      TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(1, 5)),
      []
    )
    const pool_v3_1_2 = new V3Pool(
      token1,
      token2,
      FeeAmount.MEDIUM,
      encodeSqrtRatioX96(15, 30),
      0,
      TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(15, 30)),
      []
    )
    const pool_v3_0_weth = new V3Pool(
      token0,
      weth,
      FeeAmount.MEDIUM,
      encodeSqrtRatioX96(3, 1),
      0,
      TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(3, 1)),
      []
    )
    const pool_v3_1_weth = new V3Pool(
      token1,
      weth,
      FeeAmount.MEDIUM,
      encodeSqrtRatioX96(1, 7),
      0,
      TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(1, 7)),
      []
    )

    const pool_v3_2_weth = new V3Pool(
      token2,
      weth,
      FeeAmount.MEDIUM,
      encodeSqrtRatioX96(1, 8),
      0,
      TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(1, 8)),
      []
    )

    const pair_0_1 = new Pair(CurrencyAmount.fromRawAmount(token0, '100'), CurrencyAmount.fromRawAmount(token1, '200'))
    const pair_1_2 = new Pair(CurrencyAmount.fromRawAmount(token1, '200'), CurrencyAmount.fromRawAmount(token2, '150'))
    const pair_0_2 = new Pair(CurrencyAmount.fromRawAmount(token0, '200'), CurrencyAmount.fromRawAmount(token2, '150'))
    const pair_0_weth = new Pair(CurrencyAmount.fromRawAmount(token0, '100'), CurrencyAmount.fromRawAmount(weth, '100'))
    const pair_1_weth = new Pair(CurrencyAmount.fromRawAmount(token1, '175'), CurrencyAmount.fromRawAmount(weth, '100'))

    describe('100% V3 pool route', () => {
      it('correct for 0 -> 1', () => {
        const routeV3SDK = new V3RouteSDK([pool_v3_0_1], token0, token1)
        const route = new MixedRouteSDK([pool_v3_0_1], token0, token1)
        expect(route.midPrice.toFixed(4)).toEqual(routeV3SDK.midPrice.toFixed(4))
        expect(route.midPrice.toFixed(4)).toEqual('0.2000')
        expect(route.midPrice.baseCurrency.equals(token0)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(token1)).toEqual(true)
      })

      it('is cached', () => {
        const routeOriginal = new MixedRouteSDK([pool_v3_0_1], token0, token1)
        const route = new MixedRoute(routeOriginal)
        expect(route.midPrice).toStrictEqual(route.midPrice)
      })

      it('correct for 1 -> 0', () => {
        const routeV3SDK = new V3RouteSDK([pool_v3_0_1], token1, token0)
        const route = new MixedRouteSDK([pool_v3_0_1], token1, token0)
        expect(route.midPrice.toFixed(4)).toEqual(routeV3SDK.midPrice.toFixed(4))
        expect(route.midPrice.toFixed(4)).toEqual('5.0000')
        expect(route.midPrice.baseCurrency.equals(token1)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(token0)).toEqual(true)
      })

      it('correct for 0 -> 1 -> 2', () => {
        /**
         * pool_v3_0_1 mid price = 1/5 = 0.2
         * pool_v3_1_2 mid price = 15/30 = 0.5
         */
        const routeV3SDK = new V3RouteSDK([pool_v3_0_1, pool_v3_1_2], token0, token2)
        const route = new MixedRouteSDK([pool_v3_0_1, pool_v3_1_2], token0, token2)
        expect(route.midPrice.toFixed(4)).toEqual(routeV3SDK.midPrice.toFixed(4))
        expect(route.midPrice.toFixed(4)).toEqual('0.1000')
        expect(route.midPrice.baseCurrency.equals(token0)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(token2)).toEqual(true)
      })

      it('correct for 2 -> 1 -> 0', () => {
        const routeV3SDK = new V3RouteSDK([pool_v3_1_2, pool_v3_0_1], token2, token0)
        const route = new MixedRouteSDK([pool_v3_1_2, pool_v3_0_1], token2, token0)
        expect(route.midPrice.toFixed(4)).toEqual(routeV3SDK.midPrice.toFixed(4))
        expect(route.midPrice.toFixed(4)).toEqual('10.0000')
        expect(route.midPrice.baseCurrency.equals(token2)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(token0)).toEqual(true)
      })

      it('correct for ether -> 0', () => {
        const routeV3SDK = new V3RouteSDK([pool_v3_0_weth], ETHER, token0)
        const route = new MixedRouteSDK([pool_v3_0_weth], ETHER, token0)
        expect(route.midPrice.toFixed(4)).toEqual(routeV3SDK.midPrice.toFixed(4))
        expect(route.midPrice.toFixed(4)).toEqual('0.3333')
        expect(route.midPrice.baseCurrency.equals(ETHER)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(token0)).toEqual(true)
      })

      it('correct for 1 -> weth', () => {
        const routeV3SDK = new V3RouteSDK([pool_v3_1_weth], token1, weth)
        const route = new MixedRouteSDK([pool_v3_1_weth], token1, weth)
        expect(route.midPrice.toFixed(4)).toEqual(routeV3SDK.midPrice.toFixed(4))
        expect(route.midPrice.toFixed(4)).toEqual('0.1429')
        expect(route.midPrice.baseCurrency.equals(token1)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(weth)).toEqual(true)
      })

      it('correct for ether -> 0 -> 1 -> weth', () => {
        const routeV3SDK = new V3RouteSDK([pool_v3_0_weth, pool_v3_0_1, pool_v3_1_weth], ETHER, weth)
        const route = new MixedRouteSDK([pool_v3_0_weth, pool_v3_0_1, pool_v3_1_weth], ETHER, weth)
        expect(route.midPrice.toFixed(4)).toEqual(routeV3SDK.midPrice.toFixed(4))
        expect(route.midPrice.toSignificant(4)).toEqual('0.009524')
        expect(route.midPrice.baseCurrency.equals(ETHER)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(weth)).toEqual(true)
      })

      it('correct for weth -> 0 -> 1 -> ether', () => {
        const routeV3SDK = new V3RouteSDK([pool_v3_0_weth, pool_v3_0_1, pool_v3_1_weth], weth, ETHER)
        const route = new MixedRouteSDK([pool_v3_0_weth, pool_v3_0_1, pool_v3_1_weth], weth, ETHER)
        expect(route.midPrice.toFixed(4)).toEqual(routeV3SDK.midPrice.toFixed(4))
        expect(route.midPrice.toSignificant(4)).toEqual('0.009524')
        expect(route.midPrice.baseCurrency.equals(weth)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(ETHER)).toEqual(true)
      })
    })

    describe('100% V2 pair route', () => {
      it('correct for 0 -> 1', () => {
        const routeV2SDK = new V2RouteSDK([pair_0_1], token0, token1)
        const route = new MixedRouteSDK([pair_0_1], token0, token1)
        expect(routeV2SDK.midPrice.toFixed(4)).toEqual(route.midPrice.toFixed(4))
        expect(route.midPrice.toFixed(4)).toEqual('2.0000')
      })

      it('is cached', () => {
        const route = new MixedRouteSDK([pair_0_1], token0, token1)
        expect(route.midPrice).toStrictEqual(route.midPrice)
      })

      it('correct for 1 -> 0', () => {
        const routeV2SDK = new V2RouteSDK([pair_0_1], token1, token0)
        const route = new MixedRouteSDK([pair_0_1], token1, token0)
        expect(routeV2SDK.midPrice.toFixed(4)).toEqual(route.midPrice.toFixed(4))
        expect(route.midPrice.toFixed(4)).toEqual('0.5000')
        expect(route.midPrice.baseCurrency.equals(token1)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(token0)).toEqual(true)
      })

      it('correct for 0 -> 1 -> 2', () => {
        /**
         *  pair_0_1 mid price = 200 / 100 = 2
         *  pair_1_2 mid price = 150 / 200 = 0.75
         *
         *  2 * 0.75 = 1.5
         */
        const routeV2SDK = new V2RouteSDK([pair_0_1, pair_1_2], token0, token2)
        const route = new MixedRouteSDK([pair_0_1, pair_1_2], token0, token2)
        expect(routeV2SDK.midPrice).toEqual(route.midPrice)
        expect(route.midPrice.toFixed(4)).toEqual('1.5000')
        expect(route.midPrice.baseCurrency.equals(token0)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(token2)).toEqual(true)
      })

      it('correct for 2 -> 1 -> 0', () => {
        const routeV2SDK = new V2RouteSDK([pair_1_2, pair_0_1], token2, token0)
        const route = new MixedRouteSDK([pair_1_2, pair_0_1], token2, token0)
        expect(routeV2SDK.midPrice.toFixed(4)).toEqual(route.midPrice.toFixed(4))
        expect(route.midPrice.toFixed(4)).toEqual('0.6667')
        expect(route.midPrice.baseCurrency.equals(token2)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(token0)).toEqual(true)
      })

      it('correct for ether -> 0', () => {
        const routeV2SDK = new V2RouteSDK([pair_0_weth], ETHER, token0)
        const route = new MixedRouteSDK([pair_0_weth], ETHER, token0)
        expect(routeV2SDK.midPrice.toFixed(4)).toEqual(route.midPrice.toFixed(4))
        expect(route.midPrice.toFixed(4)).toEqual('1.0000')
        expect(route.midPrice.baseCurrency.equals(ETHER)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(token0)).toEqual(true)
      })

      it('correct for 1 -> weth', () => {
        const routeV2SDK = new V2RouteSDK([pair_1_weth], token1, weth)
        const route = new MixedRouteSDK([pair_1_weth], token1, weth)
        expect(routeV2SDK.midPrice.toFixed(4)).toEqual(route.midPrice.toFixed(4))
        expect(route.midPrice.toFixed(4)).toEqual('0.5714')
        expect(route.midPrice.baseCurrency.equals(token1)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(weth)).toEqual(true)
      })

      it('correct for ether -> 0 -> 1 -> weth', () => {
        const routeV2SDK = new V2RouteSDK([pair_0_weth, pair_0_1, pair_1_weth], ETHER, weth)
        const route = new MixedRouteSDK([pair_0_weth, pair_0_1, pair_1_weth], ETHER, weth)
        expect(routeV2SDK.midPrice.toFixed(4)).toEqual(route.midPrice.toFixed(4))
        expect(route.midPrice.toSignificant(4)).toEqual('1.143')
        expect(route.midPrice.baseCurrency.equals(ETHER)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(weth)).toEqual(true)
      })

      it('correct for weth -> 0 -> 1 -> ether', () => {
        const routeV2SDK = new V2RouteSDK([pair_0_weth, pair_0_1, pair_1_weth], weth, ETHER)
        const route = new MixedRouteSDK([pair_0_weth, pair_0_1, pair_1_weth], weth, ETHER)
        expect(routeV2SDK.midPrice.toFixed(4)).toEqual(route.midPrice.toFixed(4))
        expect(route.midPrice.toSignificant(4)).toEqual('1.143')
        expect(route.midPrice.baseCurrency.equals(weth)).toEqual(true)
        expect(route.midPrice.quoteCurrency.equals(ETHER)).toEqual(true)
      })
    })

    describe('mixed route', () => {
      it('correct for 0 -[V3]-> 1 -[V2]-> 2', () => {
        // pool_v3_0_1 midPrice = 0.2
        // pair_1_2 1 < 2, so token0 = t1, token1 = 2, so 150/200 = 0.75
        // so midPoint = 0.2 * 0.75

        const route = new MixedRouteSDK([pool_v3_0_1, pair_1_2], token0, token2)
        expect(route.midPrice.toFixed(4)).toEqual('0.1500')
      })

      it('correct for 0 -[V3]-> 1 -[V2]-> 2, 1 for 2', () => {
        // nextInput != token0, so 0/1 pool so 5
        // nextInput == token0, pair so 1/0 so 150/200
        // = 5 * 0.75 = 3.75

        const route = new MixedRouteSDK([pool_v3_0_1, pair_0_2], token1, token2)
        expect(route.midPrice.toFixed(4)).toEqual('3.7500')
      })

      it('correct for 0 -[V2]-> 1 -[V2]-> weth -[V3]-> 2', () => {
        const route = new MixedRouteSDK([pair_0_1, pair_1_weth, pool_v3_2_weth], token0, token2)
        /**
         * pair_0_1 midPrice = 200 / 100 = 2
         * nextInput = 1 -> pair_1_weth midPrice = 100 / 175 = 0.5714
         * nextInput = weth -> pool_v3_2_weth midPrice = is 1 -> 0 so 8/1 = 8
         * so midPoint = 2 * 0.5714 * 8 = 9.1429
         */

        expect(route.midPrice.toFixed(4)).toEqual('9.1429')
      })
    })
  })

  describe('partitionMixedRouteByProtocol', () => {
    it('returns correct for single pool', () => {
      const route = new MixedRouteSDK([pool_v3_0_1], token0, token1)
      expect(partitionMixedRouteByProtocol(route)).toStrictEqual([[pool_v3_0_1]])
    })

    it('returns correct for single pool', () => {
      const route = new MixedRouteSDK([pair_0_1], token0, token1)
      expect(partitionMixedRouteByProtocol(route)).toStrictEqual([[pair_0_1]])
    })

    it('returns correct for route of all the v3 pools', () => {
      const route = new MixedRouteSDK([pool_v3_0_1, pool_v3_1_weth, pool_v3_2_weth], token0, token2)
      const result = partitionMixedRouteByProtocol(route)
      expect(result.length).toEqual(1)
      expect(result[0].length).toEqual(3)
      expect(result).toStrictEqual([[pool_v3_0_1, pool_v3_1_weth, pool_v3_2_weth]])
    })

    it('consecutive pair in middle of two pools', () => {
      const route: MixedRouteSDK<Currency, Currency> = new MixedRouteSDK(
        [pool_v3_0_1, pair_1_weth, pair_weth_2, pool_v3_2_3],
        token0,
        token3
      )
      const result = partitionMixedRouteByProtocol(route)
      expect(result.length).toEqual(3)
      expect(result[0][0]).toStrictEqual(pool_v3_0_1)
      expect(result[1].length).toEqual(2)
      const referenceSecondPart = [pair_1_weth, pair_weth_2]
      result[1].forEach((pair, index) => {
        expect(pair).toStrictEqual(referenceSecondPart[index])
      })
      expect(result[2][0]).toStrictEqual(pool_v3_2_3)
    })

    it('consecutive pair at the end', () => {
      const route: MixedRouteSDK<Currency, Currency> = new MixedRouteSDK(
        [pool_v3_0_1, pair_1_weth, pair_weth_2, pair_2_3],
        token0,
        token3
      )
      const result = partitionMixedRouteByProtocol(route)
      expect(result.length).toEqual(2)
      expect(result[0][0]).toStrictEqual(pool_v3_0_1)
      const referenceSecondPart = [pair_1_weth, pair_weth_2, pair_2_3]
      result[1].forEach((pair, i) => {
        expect(pair).toStrictEqual(referenceSecondPart[i])
      })
    })

    it('consecutive pair at the beginning', () => {
      const route: MixedRouteSDK<Currency, Currency> = new MixedRouteSDK(
        [pair_0_1, pair_1_weth, pair_weth_2, pool_v3_2_3],
        token0,
        token3
      )
      const result = partitionMixedRouteByProtocol(route)
      expect(result.length).toEqual(2)
      const referenceFirstPart = [pair_0_1, pair_1_weth, pair_weth_2]
      result[0].forEach((pair, i) => {
        expect(pair).toStrictEqual(referenceFirstPart[i])
      })
      expect(result[1][0]).toStrictEqual(pool_v3_2_3)
    })

    it('returns correct for route with V4Pool', () => {
      const route: MixedRouteSDK<Currency, Currency> = new MixedRouteSDK(
        [pool_v4_0_1, pool_v4_1_eth, pair_weth_2, pool_v3_2_3],
        token0,
        token3
      )

      const result = partitionMixedRouteByProtocol(route)
      expect(result.length).toEqual(3)
      expect(result[0].length).toEqual(2)
      expect(result[1].length).toEqual(1)
      expect(result[2].length).toEqual(1)
      expect(result[0][0]).toStrictEqual(pool_v4_0_1)
      expect(result[0][1]).toStrictEqual(pool_v4_1_eth)
      expect(result[1][0]).toStrictEqual(pair_weth_2)
      expect(result[2][0]).toStrictEqual(pool_v3_2_3)
    })
  })
})
