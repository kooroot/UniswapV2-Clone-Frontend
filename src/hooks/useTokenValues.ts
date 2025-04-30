import { useAccount, useBalance } from 'wagmi'
import { Token } from '@uniswap/sdk-core'
import { useState, useEffect } from 'react'

interface TokenValue {
  token: any // Token | NATIVE_TOKEN
  balance: bigint
  usdValue: number
}

export const useTokenValues = (tokens: any[]) => {
  const { address: account } = useAccount()
  const [tokenValues, setTokenValues] = useState<TokenValue[]>([])

  // 각 토큰의 잔액 조회 (ETH와 ERC20 분기)
  const balances = tokens.map(token => {
    if (token.address === 'ETH') {
      return useBalance({
        address: account,
        enabled: !!account,
      })
    } else {
      return useBalance({
        address: account,
        token: token.address as `0x${string}`,
        chainId: token.chainId,
        enabled: !!account,
      })
    }
  })

  // Coingecko API로 토큰 가격 조회
  const fetchTokenPrices = async (tokens: any[]) => {
    try {
      const addresses = tokens.filter(t => t.address !== 'ETH').map(token => token.address).join(',')
      if (!addresses) return {}
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${addresses}&vs_currencies=usd`
      )
      const prices = await response.json()
      return prices
    } catch (error) {
      console.error('Failed to fetch token prices:', error)
      return {}
    }
  }

  useEffect(() => {
    const updateTokenValues = async () => {
      if (!account) return

      const prices = await fetchTokenPrices(tokens)
      const values = tokens.map((token, i) => {
        const balance = balances[i].data?.value || 0n
        const price = token.address !== 'ETH' ? (prices[token.address.toLowerCase()]?.usd || 0) : 0
        const usdValue = Number(balance) * price / (10 ** token.decimals)
        return {
          token,
          balance,
          usdValue
        }
      })
      setTokenValues(values)
    }
    updateTokenValues()
  }, [account, tokens, ...balances.map(b => b.data)])

  return tokenValues
}

export const getTokenValue = (token: any, tokenValues: TokenValue[]) => {
  const value = tokenValues.find(v => v.token.address === token.address)
  return value?.usdValue || 0
} 