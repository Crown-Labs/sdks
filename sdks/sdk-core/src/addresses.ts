import { ChainId, SUPPORTED_CHAINS, SupportedChainsType } from './chains'

type AddressMap = { [chainId: number]: string }

type ChainAddresses = {
  v3CoreFactoryAddress: string
  multicallAddress: string
  quoterAddress: string
  v3MigratorAddress?: string
  nonfungiblePositionManagerAddress?: string
  tickLensAddress?: string
  swapRouter02Address?: string
  mixedRouteQuoterV1Address?: string
  mixedRouteQuoterV2Address?: string

  // v4
  v4PoolManagerAddress?: string
  v4PositionManagerAddress?: string
  v4StateView?: string
  v4QuoterAddress?: string
}

const DEFAULT_NETWORKS = [ChainId.MAINNET, ChainId.GOERLI, ChainId.SEPOLIA]

function constructSameAddressMap(address: string, additionalNetworks: ChainId[] = []): AddressMap {
  return DEFAULT_NETWORKS.concat(additionalNetworks).reduce<AddressMap>((memo, chainId) => {
    memo[chainId] = address
    return memo
  }, {})
}

export const UNI_ADDRESSES: AddressMap = constructSameAddressMap('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', [
  ChainId.OPTIMISM,
  ChainId.ARBITRUM_ONE,
  ChainId.POLYGON,
  ChainId.POLYGON_MUMBAI,
  ChainId.SEPOLIA,
])

export const UNISWAP_NFT_AIRDROP_CLAIM_ADDRESS = '0x8B799381ac40b838BBA4131ffB26197C432AFe78'

/**
 * @deprecated use V2_FACTORY_ADDRESSES instead
 */
export const V2_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
export const V2_FACTORY_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  [ChainId.GOERLI]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  [ChainId.SEPOLIA]: '0xF62c03E08ada871A0bEb309762E260a7a6a880E6',
  [ChainId.OPTIMISM]: '0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf',
  [ChainId.ARBITRUM_ONE]: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
  [ChainId.AVALANCHE]: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
  [ChainId.BASE_SEPOLIA]: '0x7Ae58f10f7849cA6F5fB71b7f45CB416c9204b1e',
  [ChainId.BASE]: '0x8909dc15e40173ff4699343b6eb8132c65e18ec6',
  [ChainId.BNB]: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
  [ChainId.POLYGON]: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
  [ChainId.CELO]: '0x79a530c8e2fA8748B7B40dd3629C0520c2cCf03f',
  [ChainId.BLAST]: '0x5C346464d33F90bABaf70dB6388507CC889C1070',
  [ChainId.WORLDCHAIN]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  [ChainId.UNICHAIN_SEPOLIA]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  [ChainId.UNICHAIN]: '0x1f98400000000000000000000000000000000002',
  [ChainId.MONAD_TESTNET]: '0x733e88f248b742db6c14c0b1713af5ad7fdd59d0',
  [ChainId.SONEIUM]: '0x97febbc2adbd5644ba22736e962564b23f5828ce',
}
/**
 * @deprecated use V2_ROUTER_ADDRESSES instead
 */
export const V2_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
export const V2_ROUTER_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  [ChainId.GOERLI]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  [ChainId.SEPOLIA]: '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3',
  [ChainId.ARBITRUM_ONE]: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
  [ChainId.OPTIMISM]: '0x4a7b5da61326a6379179b40d00f57e5bbdc962c2',
  [ChainId.BASE_SEPOLIA]: '0x1689E7B1F10000AE47eBfE339a4f69dECd19F602',
  [ChainId.BASE]: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
  [ChainId.AVALANCHE]: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
  [ChainId.BNB]: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
  [ChainId.POLYGON]: '0xedf6066a2b290c185783862c7f4776a2c8077ad1',
  [ChainId.BLAST]: '0xBB66Eb1c5e875933D44DAe661dbD80e5D9B03035',
  [ChainId.WORLDCHAIN]: '0x541aB7c31A119441eF3575F6973277DE0eF460bd',
  [ChainId.UNICHAIN_SEPOLIA]: '0x920b806E40A00E02E7D2b94fFc89860fDaEd3640',
  [ChainId.UNICHAIN]: '0x284f11109359a7e1306c3e447ef14d38400063ff',
  [ChainId.MONAD_TESTNET]: '0xfb8e1c3b833f9e67a71c859a132cf783b645e436',
  [ChainId.SONEIUM]: '0x273f68c234fa55b550b40e563c4a488e0d334320',
}

// Networks that share most of the same addresses i.e. Mainnet, Goerli, Optimism, Arbitrum, Polygon
const DEFAULT_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  multicallAddress: '0x1F98415757620B543A52E61c46B32eB19261F984',
  quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
  v3MigratorAddress: '0xA5644E29708357803b5A882D272c41cC0dF92B34',
  nonfungiblePositionManagerAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
}
const MAINNET_ADDRESSES: ChainAddresses = {
  ...DEFAULT_ADDRESSES,
  mixedRouteQuoterV1Address: '0x84E44095eeBfEC7793Cd7d5b57B7e401D7f1cA2E',

  v4PoolManagerAddress: '0x000000000004444c5dc75cB358380D2e3dE08A90',
  v4PositionManagerAddress: '0x390102D1D4cff14a54bBe7219AB22fe583109FFB',
  v4StateView: '0x7ffe42c4a5deea5b0fec41c94c136cf115597227',
  v4QuoterAddress: '0x62E252DDC87948CF12748cec24C096AAFa7052FD',
}
const GOERLI_ADDRESSES: ChainAddresses = {
  ...DEFAULT_ADDRESSES,
  mixedRouteQuoterV1Address: '0xBa60b6e6fF25488308789E6e0A65D838be34194e',
}

const OPTIMISM_ADDRESSES: ChainAddresses = {
  ...DEFAULT_ADDRESSES,

  v4PoolManagerAddress: '0x9a13f98cb987694c9f086b1f5eb990eea8264ec3',
  v4PositionManagerAddress: '0x3c3ea4b57a46241e54610e5f022e5c45859a1017',
  v4StateView: '0xc18a3169788f4f75a170290584eca6395c75ecdb',
  v4QuoterAddress: '0x1f3131a13296fb91c90870043742c3cdbff1a8d7',
}

const ARBITRUM_ONE_ADDRESSES: ChainAddresses = {
  ...DEFAULT_ADDRESSES,
  multicallAddress: '0xadF885960B47eA2CD9B55E6DAc6B42b7Cb2806dB',
  tickLensAddress: '0xbfd8137f7d1516D3ea5cA83523914859ec47F573',

  v4PoolManagerAddress: '0x360e68faccca8ca495c1b759fd9eee466db9fb32',
  v4PositionManagerAddress: '0xd88f38f930b7952f2db2432cb002e7abbf3dd869',
  v4StateView: '0x76fd297e2d437cd7f76d50f01afe6160f86e9990',
  v4QuoterAddress: '0x3972c00f7ed4885e145823eb7c655375d275a1c5',
}
const POLYGON_ADDRESSES: ChainAddresses = {
  ...DEFAULT_ADDRESSES,

  v4PoolManagerAddress: '0x67366782805870060151383f4bbff9dab53e5cd6',
  v4PositionManagerAddress: '0x1ec2ebf4f37e7363fdfe3551602425af0b3ceef9',
  v4StateView: '0x5ea1bd7974c8a611cbab0bdcafcb1d9cc9b3ba5a',
  v4QuoterAddress: '0xb3d5c3dfc3a7aebff71895a7191796bffc2c81b9',
}

// celo v3 addresses
const CELO_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc',
  multicallAddress: '0x633987602DE5C4F337e3DbF265303A1080324204',
  quoterAddress: '0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8',
  v3MigratorAddress: '0x3cFd4d48EDfDCC53D3f173F596f621064614C582',
  nonfungiblePositionManagerAddress: '0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A',
  tickLensAddress: '0x5f115D9113F88e0a0Db1b5033D90D4a9690AcD3D',
}

// BNB v3 addresses
const BNB_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
  multicallAddress: '0x963Df249eD09c358A4819E39d9Cd5736c3087184',
  quoterAddress: '0x78D78E420Da98ad378D7799bE8f4AF69033EB077',
  v3MigratorAddress: '0x32681814957e0C13117ddc0c2aba232b5c9e760f',
  nonfungiblePositionManagerAddress: '0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613',
  tickLensAddress: '0xD9270014D396281579760619CCf4c3af0501A47C',
  swapRouter02Address: '0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2',

  v4PoolManagerAddress: '0x28e2ea090877bf75740558f6bfb36a5ffee9e9df',
  v4PositionManagerAddress: '0x7a4a5c919ae2541aed11041a1aeee68f1287f95b',
  v4StateView: '0xd13dd3d6e93f276fafc9db9e6bb47c1180aee0c4',
  v4QuoterAddress: '0x9f75dd27d6664c475b90e105573e550ff69437b0',
}

// optimism goerli addresses
const OPTIMISM_GOERLI_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0xB656dA17129e7EB733A557f4EBc57B76CFbB5d10',
  multicallAddress: '0x07F2D8a2a02251B62af965f22fC4744A5f96BCCd',
  quoterAddress: '0x9569CbA925c8ca2248772A9A4976A516743A246F',
  v3MigratorAddress: '0xf6c55fBe84B1C8c3283533c53F51bC32F5C7Aba8',
  nonfungiblePositionManagerAddress: '0x39Ca85Af2F383190cBf7d7c41ED9202D27426EF6',
  tickLensAddress: '0xe6140Bd164b63E8BfCfc40D5dF952f83e171758e',
}

// optimism sepolia addresses
const OPTIMISM_SEPOLIA_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x8CE191193D15ea94e11d327b4c7ad8bbE520f6aF',
  multicallAddress: '0x80e4e06841bb76AA9735E0448cB8d003C0EF009a',
  quoterAddress: '0x0FBEa6cf957d95ee9313490050F6A0DA68039404',
  v3MigratorAddress: '0xE7EcbAAaA54D007A00dbb6c1d2f150066D69dA07',
  nonfungiblePositionManagerAddress: '0xdA75cEf1C93078e8b736FCA5D5a30adb97C8957d',
  tickLensAddress: '0xCb7f54747F58F8944973cea5b8f4ac2209BadDC5',
  swapRouter02Address: '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4',
}

// arbitrum goerli v3 addresses
const ARBITRUM_GOERLI_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x4893376342d5D7b3e31d4184c08b265e5aB2A3f6',
  multicallAddress: '0x8260CB40247290317a4c062F3542622367F206Ee',
  quoterAddress: '0x1dd92b83591781D0C6d98d07391eea4b9a6008FA',
  v3MigratorAddress: '0xA815919D2584Ac3F76ea9CB62E6Fd40a43BCe0C3',
  nonfungiblePositionManagerAddress: '0x622e4726a167799826d1E1D150b076A7725f5D81',
  tickLensAddress: '0xb52429333da969a0C79a60930a4Bf0020E5D1DE8',
}

// arbitrum sepolia v3 addresses
const ARBITRUM_SEPOLIA_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x248AB79Bbb9bC29bB72f7Cd42F17e054Fc40188e',
  multicallAddress: '0x2B718b475e385eD29F56775a66aAB1F5cC6B2A0A',
  quoterAddress: '0x2779a0CC1c3e0E44D2542EC3e79e3864Ae93Ef0B',
  v3MigratorAddress: '0x398f43ef2c67B941147157DA1c5a868E906E043D',
  nonfungiblePositionManagerAddress: '0x6b2937Bde17889EDCf8fbD8dE31C3C2a70Bc4d65',
  tickLensAddress: '0x0fd18587734e5C2dcE2dccDcC7DD1EC89ba557d9',
  swapRouter02Address: '0x101F443B4d1b059569D643917553c771E1b9663E',

  v4PoolManagerAddress: '0xFB3e0C6F74eB1a21CC1Da29aeC80D2Dfe6C9a317',
  v4PositionManagerAddress: '0xAc631556d3d4019C95769033B5E719dD77124BAc',
  v4StateView: '0x9d467fa9062b6e9b1a46e26007ad82db116c67cb',
  v4QuoterAddress: '0x7de51022d70a725b508085468052e25e22b5c4c9',
}

// sepolia v3 addresses
const SEPOLIA_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
  multicallAddress: '0xD7F33bCdb21b359c8ee6F0251d30E94832baAd07',
  quoterAddress: '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3',
  v3MigratorAddress: '0x729004182cF005CEC8Bd85df140094b6aCbe8b15',
  nonfungiblePositionManagerAddress: '0x1238536071E1c677A632429e3655c799b22cDA52',
  tickLensAddress: '0xd7f33bcdb21b359c8ee6f0251d30e94832baad07',
  swapRouter02Address: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',

  // TODO: update mixedRouteQuoterV2Address once v4 on sepolia redeployed
  mixedRouteQuoterV2Address: '0x4745f77b56a0e2294426e3936dc4fab68d9543cd',

  // TODO: update all below once v4 on sepolia redeployed
  v4PoolManagerAddress: '0xE03A1074c86CFeDd5C142C4F04F1a1536e203543',
  v4PositionManagerAddress: '0x9217f722bcd5812FA14538BFDc5f2c4D0546594e',
  v4StateView: '0xE1Dd9c3fA50EDB962E442f60DfBc432e24537E4C',
  v4QuoterAddress: '0xF6d15Ac305168d5d6A3246eF0013519eF82019C6',
}

// Avalanche v3 addresses
const AVALANCHE_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD',
  multicallAddress: '0x0139141Cd4Ee88dF3Cdb65881D411bAE271Ef0C2',
  quoterAddress: '0xbe0F5544EC67e9B3b2D979aaA43f18Fd87E6257F',
  v3MigratorAddress: '0x44f5f1f5E452ea8d29C890E8F6e893fC0f1f0f97',
  nonfungiblePositionManagerAddress: '0x655C406EBFa14EE2006250925e54ec43AD184f8B',
  tickLensAddress: '0xEB9fFC8bf81b4fFd11fb6A63a6B0f098c6e21950',
  swapRouter02Address: '0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE',

  v4PoolManagerAddress: '0x06380c0e0912312b5150364b9dc4542ba0dbbc85',
  v4PositionManagerAddress: '0xb74b1f14d2754acfcbbe1a221023a5cf50ab8acd',
  v4StateView: '0xc3c9e198c735a4b97e3e683f391ccbdd60b69286',
  v4QuoterAddress: '0xbe40675bb704506a3c2ccfb762dcfd1e979845c2',
}

const BASE_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
  multicallAddress: '0x091e99cb1C49331a94dD62755D168E941AbD0693',
  quoterAddress: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
  v3MigratorAddress: '0x23cF10b1ee3AdfCA73B0eF17C07F7577e7ACd2d7',
  nonfungiblePositionManagerAddress: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
  tickLensAddress: '0x0CdeE061c75D43c82520eD998C23ac2991c9ac6d',
  swapRouter02Address: '0x2626664c2603336E57B271c5C0b26F421741e481',
  mixedRouteQuoterV1Address: '0xe544efae946f0008ae9a8d64493efa7886b73776',

  v4PoolManagerAddress: '0x498581ff718922c3f8e6a244956af099b2652b2b',
  v4PositionManagerAddress: '0x7c5f5a4bbd8fd63184577525326123b519429bdc',
  v4StateView: '0xa3c0c9b65bad0b08107aa264b0f3db444b867a71',
  v4QuoterAddress: '0x0d5e0f971ed27fbff6c2837bf31316121532048d',
}

// Base Goerli v3 addresses
const BASE_GOERLI_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x9323c1d6D800ed51Bd7C6B216cfBec678B7d0BC2',
  multicallAddress: '0xB206027a9E0E13F05eBEFa5D2402Bab3eA716439',
  quoterAddress: '0xedf539058e28E5937dAef3f69cEd0b25fbE66Ae9',
  v3MigratorAddress: '0x3efe5d02a04b7351D671Db7008ec6eBA9AD9e3aE',
  nonfungiblePositionManagerAddress: '0x3c61369ef0D1D2AFa70d8feC2F31C5D6Ce134F30',
  tickLensAddress: '0x1acB873Ee909D0c98adB18e4474943249F931b92',
  swapRouter02Address: '0x8357227D4eDc78991Db6FDB9bD6ADE250536dE1d',
}

// Base Sepolia v3 addresses
const BASE_SEPOLIA_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
  multicallAddress: '0xd867e273eAbD6c853fCd0Ca0bFB6a3aE6491d2C1',
  quoterAddress: '0xC5290058841028F1614F3A6F0F5816cAd0df5E27',
  v3MigratorAddress: '0xCbf8b7f80800bd4888Fbc7bf1713B80FE4E23E10',
  nonfungiblePositionManagerAddress: '0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2',
  tickLensAddress: '0xedf6066a2b290C185783862C7F4776A2C8077AD1',
  swapRouter02Address: '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4',

  // v4
  v4PoolManagerAddress: '0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408',
  v4PositionManagerAddress: '0x4b2c77d209d3405f41a037ec6c77f7f5b8e2ca80',
  v4StateView: '0x571291b572ed32ce6751a2cb2486ebee8defb9b4',
  v4QuoterAddress: '0x4a6513c898fe1b2d0e78d3b0e0a4a151589b1cba',
}

const ZORA_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x7145F8aeef1f6510E92164038E1B6F8cB2c42Cbb',
  multicallAddress: '0xA51c76bEE6746cB487a7e9312E43e2b8f4A37C15',
  quoterAddress: '0x11867e1b3348F3ce4FcC170BC5af3d23E07E64Df',
  v3MigratorAddress: '0x048352d8dCF13686982C799da63fA6426a9D0b60',
  nonfungiblePositionManagerAddress: '0xbC91e8DfA3fF18De43853372A3d7dfe585137D78',
  tickLensAddress: '0x209AAda09D74Ad3B8D0E92910Eaf85D2357e3044',
  swapRouter02Address: '0x7De04c96BE5159c3b5CeffC82aa176dc81281557',

  v4PoolManagerAddress: '0x0575338e4c17006ae181b47900a84404247ca30f',
  v4PositionManagerAddress: '0xf66c7b99e2040f0d9b326b3b7c152e9663543d63',
  v4StateView: '0x385785af07d63b50d0a0ea57c4ff89d06adf7328',
  v4QuoterAddress: '0x5edaccc0660e0a2c44b06e07ce8b915e625dc2c6',
}

const ZORA_SEPOLIA_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x4324A677D74764f46f33ED447964252441aA8Db6',
  multicallAddress: '0xA1E7e3A69671C4494EC59Dbd442de930a93F911A',
  quoterAddress: '0xC195976fEF0985886E37036E2DF62bF371E12Df0',
  v3MigratorAddress: '0x65ef259b31bf1d977c37e9434658694267674897',
  nonfungiblePositionManagerAddress: '0xB8458EaAe43292e3c1F7994EFd016bd653d23c20',
  tickLensAddress: '0x23C0F71877a1Fc4e20A78018f9831365c85f3064',
}

const ROOTSTOCK_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0xaF37EC98A00FD63689CF3060BF3B6784E00caD82',
  multicallAddress: '0x996a9858cDfa45Ad68E47c9A30a7201E29c6a386',
  quoterAddress: '0xb51727c996C68E60F598A923a5006853cd2fEB31',
  v3MigratorAddress: '0x16678977CA4ec3DAD5efc7b15780295FE5f56162',
  nonfungiblePositionManagerAddress: '0x9d9386c042F194B460Ec424a1e57ACDE25f5C4b1',
  tickLensAddress: '0x55B9dF5bF68ADe972191a91980459f48ecA16afC',
  swapRouter02Address: '0x0B14ff67f0014046b4b99057Aec4509640b3947A',
}

const BLAST_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x792edAdE80af5fC680d96a2eD80A44247D2Cf6Fd',
  multicallAddress: '0xdC7f370de7631cE9e2c2e1DCDA6B3B5744Cf4705',
  quoterAddress: '0x6Cdcd65e03c1CEc3730AeeCd45bc140D57A25C77',
  v3MigratorAddress: '0x15CA7043CD84C5D21Ae76Ba0A1A967d42c40ecE0',
  nonfungiblePositionManagerAddress: '0xB218e4f7cF0533d4696fDfC419A0023D33345F28',
  tickLensAddress: '0x2E95185bCdD928a3e984B7e2D6560Ab1b17d7274',
  swapRouter02Address: '0x549FEB8c9bd4c12Ad2AB27022dA12492aC452B66',

  v4PoolManagerAddress: '0x1631559198a9e474033433b2958dabc135ab6446',
  v4PositionManagerAddress: '0x4ad2f4cca2682cbb5b950d660dd458a1d3f1baad',
  v4StateView: '0x12a88ae16f46dce4e8b15368008ab3380885df30',
  v4QuoterAddress: '0x6f71cdcb0d119ff72c6eb501abceb576fbf62bcf',
}

const ZKSYNC_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x8FdA5a7a8dCA67BBcDd10F02Fa0649A937215422',
  multicallAddress: '0x0c68a7C72f074d1c45C16d41fa74eEbC6D16a65C',
  quoterAddress: '0x8Cb537fc92E26d8EBBb760E632c95484b6Ea3e28',
  v3MigratorAddress: '0x611841b24E43C4ACfd290B427a3D6cf1A59dac8E',
  nonfungiblePositionManagerAddress: '0x0616e5762c1E7Dc3723c50663dF10a162D690a86',
  tickLensAddress: '0xe10FF11b809f8EE07b056B452c3B2caa7FE24f89',
  swapRouter02Address: '0x99c56385daBCE3E81d8499d0b8d0257aBC07E8A3',
}

const WORLDCHAIN_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x7a5028BDa40e7B173C278C5342087826455ea25a',
  multicallAddress: '0x0a22c04215c97E3F532F4eF30e0aD9458792dAB9',
  quoterAddress: '0x10158D43e6cc414deE1Bd1eB0EfC6a5cBCfF244c',
  v3MigratorAddress: '0x9EBDdCBa71C9027E1eB45135672a30bcFEec9de3',
  nonfungiblePositionManagerAddress: '0xec12a9F9a09f50550686363766Cc153D03c27b5e',
  tickLensAddress: '0xE61df0CaC9d85876aCE5E3037005D80943570623',
  swapRouter02Address: '0x091AD9e2e6e5eD44c1c66dB50e49A601F9f36cF6',

  v4PoolManagerAddress: '0xb1860d529182ac3bc1f51fa2abd56662b7d13f33',
  v4PositionManagerAddress: '0xc585e0f504613b5fbf874f21af14c65260fb41fa',
  v4StateView: '0x51d394718bc09297262e368c1a481217fdeb71eb',
  v4QuoterAddress: '0x55d235b3ff2daf7c3ede0defc9521f1d6fe6c5c0',
}

const UNICHAIN_SEPOLIA_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  multicallAddress: '0x9D0F15f2cf58655fDDcD1EE6129C547fDaeD01b1',
  quoterAddress: '0x6Dd37329A1A225a6Fca658265D460423DCafBF89',
  v3MigratorAddress: '0xb5FA244C9d6D04B2FBac84418b3c4910ED1Ae5f2',
  nonfungiblePositionManagerAddress: '0xB7F724d6dDDFd008eFf5cc2834edDE5F9eF0d075',
  tickLensAddress: '0x5f739c790a48E97eec0efb81bab5D152c0A0ecA0',
  swapRouter02Address: '0xd1AAE39293221B77B0C71fBD6dCb7Ea29Bb5B166',

  v4PoolManagerAddress: '0x00b036b58a818b1bc34d502d3fe730db729e62ac',
  v4PositionManagerAddress: '0xf969aee60879c54baaed9f3ed26147db216fd664',
  v4StateView: '0xc199f1072a74d4e905aba1a84d9a45e2546b6222',
  v4QuoterAddress: '0x56dcd40a3f2d466f48e7f48bdbe5cc9b92ae4472',
}

const UNICHAIN_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x1f98400000000000000000000000000000000003',
  multicallAddress: '0xb7610f9b733e7d45184be3a1bc966960ccc54f0b',
  quoterAddress: '0x565ac8c7863d9bb16d07e809ff49fe5cd467634c',
  v3MigratorAddress: '0xb9d0c246f306b1aaf02ae6ba112d5ef25e5b60dc',
  nonfungiblePositionManagerAddress: '0x943e6e07a7e8e791dafc44083e54041d743c46e9',
  tickLensAddress: '0xd5d76fa166ab8d8ad4c9f61aaa81457b66cbe443',
  swapRouter02Address: '0x73855d06de49d0fe4a9c42636ba96c62da12ff9c',

  v4PoolManagerAddress: '0x1f98400000000000000000000000000000000004',
  v4PositionManagerAddress: '0x4529a01c7a0410167c5740c487a8de60232617bf',
  v4StateView: '0x86e8631a016f9068c3f085faf484ee3f5fdee8f2',
  v4QuoterAddress: '0x333e3c607b141b18ff6de9f258db6e77fe7491e0',
}

const MONAD_TESTNET_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x961235a9020b05c44df1026d956d1f4d78014276',
  multicallAddress: '0xa707ceb989cc3728551ed0e6e44b718dd114cf44',
  quoterAddress: '0x1ba215c17565de7b0cb7ecab971bcf540c24a862',
  v3MigratorAddress: '0x0a78348b71f8ae8caff2f8f9d4d74a2f36516661',
  nonfungiblePositionManagerAddress: '0x3dcc735c74f10fe2b9db2bb55c40fbbbf24490f7',
  tickLensAddress: '0x337478eb6058455ecb3696184b30dd6a29e3a893',
  swapRouter02Address: '0x4c4eabd5fb1d1a7234a48692551eaecff8194ca7',
}

const SONEIUM_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: '0x42ae7ec7ff020412639d443e245d936429fbe717',
  multicallAddress: '0x8ad5ef2f2508288d2de66f04dd883ad5f4ef62b2',
  quoterAddress: '0x3e6c707d0125226ff60f291b6bd1404634f00aba',
  v3MigratorAddress: '0xa107580f73bd797bd8b87ff24e98346d99f93ddb',
  nonfungiblePositionManagerAddress: '0x56c1205b0244332011c1e866f4ea5384eb6bfa2c',
  tickLensAddress: '0xcd08eefb928c86499e6235ac155906bb7c4dc41a',
  swapRouter02Address: '0x7e40db01736f88464e5f4e42394f3d5bbb6705b9',

  v4PoolManagerAddress: '0x360e68faccca8ca495c1b759fd9eee466db9fb32',
  v4PositionManagerAddress: '0x1b35d13a2e2528f192637f14b05f0dc0e7deb566',
  v4StateView: '0x76fd297e2d437cd7f76d50f01afe6160f86e9990',
  v4QuoterAddress: '0x3972c00f7ed4885e145823eb7c655375d275a1c5',
}

export const CHAIN_TO_ADDRESSES_MAP: Record<SupportedChainsType, ChainAddresses> = {
  [ChainId.MAINNET]: MAINNET_ADDRESSES,
  [ChainId.OPTIMISM]: OPTIMISM_ADDRESSES,
  [ChainId.ARBITRUM_ONE]: ARBITRUM_ONE_ADDRESSES,
  [ChainId.POLYGON]: POLYGON_ADDRESSES,
  [ChainId.POLYGON_MUMBAI]: POLYGON_ADDRESSES,
  [ChainId.GOERLI]: GOERLI_ADDRESSES,
  [ChainId.CELO]: CELO_ADDRESSES,
  [ChainId.CELO_ALFAJORES]: CELO_ADDRESSES,
  [ChainId.BNB]: BNB_ADDRESSES,
  [ChainId.OPTIMISM_GOERLI]: OPTIMISM_GOERLI_ADDRESSES,
  [ChainId.OPTIMISM_SEPOLIA]: OPTIMISM_SEPOLIA_ADDRESSES,
  [ChainId.ARBITRUM_GOERLI]: ARBITRUM_GOERLI_ADDRESSES,
  [ChainId.ARBITRUM_SEPOLIA]: ARBITRUM_SEPOLIA_ADDRESSES,
  [ChainId.SEPOLIA]: SEPOLIA_ADDRESSES,
  [ChainId.AVALANCHE]: AVALANCHE_ADDRESSES,
  [ChainId.BASE]: BASE_ADDRESSES,
  [ChainId.BASE_GOERLI]: BASE_GOERLI_ADDRESSES,
  [ChainId.BASE_SEPOLIA]: BASE_SEPOLIA_ADDRESSES,
  [ChainId.ZORA]: ZORA_ADDRESSES,
  [ChainId.ZORA_SEPOLIA]: ZORA_SEPOLIA_ADDRESSES,
  [ChainId.ROOTSTOCK]: ROOTSTOCK_ADDRESSES,
  [ChainId.BLAST]: BLAST_ADDRESSES,
  [ChainId.ZKSYNC]: ZKSYNC_ADDRESSES,
  [ChainId.WORLDCHAIN]: WORLDCHAIN_ADDRESSES,
  [ChainId.UNICHAIN_SEPOLIA]: UNICHAIN_SEPOLIA_ADDRESSES,
  [ChainId.UNICHAIN]: UNICHAIN_ADDRESSES,
  [ChainId.MONAD_TESTNET]: MONAD_TESTNET_ADDRESSES,
  [ChainId.SONEIUM]: SONEIUM_ADDRESSES,
}

/* V3 Contract Addresses */
export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  ...SUPPORTED_CHAINS.reduce<AddressMap>((memo, chainId) => {
    memo[chainId] = CHAIN_TO_ADDRESSES_MAP[chainId].v3CoreFactoryAddress
    return memo
  }, {}),
}

export const V3_MIGRATOR_ADDRESSES: AddressMap = {
  ...SUPPORTED_CHAINS.reduce<AddressMap>((memo, chainId) => {
    const v3MigratorAddress = CHAIN_TO_ADDRESSES_MAP[chainId].v3MigratorAddress
    if (v3MigratorAddress) {
      memo[chainId] = v3MigratorAddress
    }
    return memo
  }, {}),
}

export const MULTICALL_ADDRESSES: AddressMap = {
  ...SUPPORTED_CHAINS.reduce<AddressMap>((memo, chainId) => {
    memo[chainId] = CHAIN_TO_ADDRESSES_MAP[chainId].multicallAddress
    return memo
  }, {}),
}

/**
 * The oldest V0 governance address
 */
export const GOVERNANCE_ALPHA_V0_ADDRESSES: AddressMap = constructSameAddressMap(
  '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F'
)
/**
 * The older V1 governance address
 */
export const GOVERNANCE_ALPHA_V1_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0xC4e172459f1E7939D522503B81AFAaC1014CE6F6',
}
/**
 * The latest governor bravo that is currently admin of timelock
 */
export const GOVERNANCE_BRAVO_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x408ED6354d4973f66138C91495F2f2FCbd8724C3',
}

export const TIMELOCK_ADDRESSES: AddressMap = constructSameAddressMap('0x1a9C8182C09F50C8318d769245beA52c32BE35BC')

export const MERKLE_DISTRIBUTOR_ADDRESS: AddressMap = {
  [ChainId.MAINNET]: '0x090D4613473dEE047c3f2706764f49E0821D256e',
}

export const ARGENT_WALLET_DETECTOR_ADDRESS: AddressMap = {
  [ChainId.MAINNET]: '0xeca4B0bDBf7c55E9b7925919d03CbF8Dc82537E8',
}

export const QUOTER_ADDRESSES: AddressMap = {
  ...SUPPORTED_CHAINS.reduce<AddressMap>((memo, chainId) => {
    memo[chainId] = CHAIN_TO_ADDRESSES_MAP[chainId].quoterAddress
    return memo
  }, {}),
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  ...SUPPORTED_CHAINS.reduce<AddressMap>((memo, chainId) => {
    const nonfungiblePositionManagerAddress = CHAIN_TO_ADDRESSES_MAP[chainId].nonfungiblePositionManagerAddress
    if (nonfungiblePositionManagerAddress) {
      memo[chainId] = nonfungiblePositionManagerAddress
    }
    return memo
  }, {}),
}

export const ENS_REGISTRAR_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'),
}

export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x65770b5283117639760beA3F867b69b3697a91dd',
}

export const TICK_LENS_ADDRESSES: AddressMap = {
  ...SUPPORTED_CHAINS.reduce<AddressMap>((memo, chainId) => {
    const tickLensAddress = CHAIN_TO_ADDRESSES_MAP[chainId].tickLensAddress
    if (tickLensAddress) {
      memo[chainId] = tickLensAddress
    }
    return memo
  }, {}),
}

export const MIXED_ROUTE_QUOTER_V1_ADDRESSES: AddressMap = SUPPORTED_CHAINS.reduce<AddressMap>((memo, chainId) => {
  const mixedRouteQuoterV1Address = CHAIN_TO_ADDRESSES_MAP[chainId].mixedRouteQuoterV1Address
  if (mixedRouteQuoterV1Address) {
    memo[chainId] = mixedRouteQuoterV1Address
  }
  return memo
}, {})

export const SWAP_ROUTER_02_ADDRESSES = (chainId: number) => {
  if (SUPPORTED_CHAINS.includes(chainId)) {
    const id = chainId as SupportedChainsType
    return CHAIN_TO_ADDRESSES_MAP[id].swapRouter02Address ?? '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
  }
  return ''
}
