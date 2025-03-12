import { Pool as V4Pool } from '@kittycorn-labs/v4-sdk'
import { Pair } from '@kittycorn-labs/v2-sdk'
import { Pool as V3Pool } from '@kittycorn-labs/v3-sdk'

export type TPool = Pair | V3Pool | V4Pool
