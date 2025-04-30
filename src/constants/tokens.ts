import { Token } from '@uniswap/sdk-core'
import { TEST_TOKENS, WETH_ADDRESS } from './addresses'

export const NATIVE_TOKEN = {
  chainId: 31337,
  address: 'ETH',
  decimals: 18,
  symbol: 'ETH',
  name: 'Ether',
}

export const POPULAR_TOKENS = [
  NATIVE_TOKEN,
  new Token(31337, TEST_TOKENS.TOKENA, 18, 'TOKENA', 'TokenA'),
  new Token(31337, TEST_TOKENS.TOKENB, 18, 'TOKENB', 'TokenB'),
  new Token(31337, WETH_ADDRESS, 18, 'WETH', 'Wrapped Ether'),
] 