import { useState, useEffect } from 'react'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { ethers } from 'ethers'
import { PublicClient } from 'viem'
import { FACTORY_ADDRESS } from '../constants/addresses'
import { FACTORY_ABI } from '../constants/abis/Factory'

export const useSwapPrice = (
  tokenIn: Token | null,
  tokenOut: Token | null,
  amountIn: string,
  publicClient: PublicClient | null
) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amountOut, setAmountOut] = useState<string>('')
  const [priceImpact, setPriceImpact] = useState<number>(0)

  useEffect(() => {
    const fetchPrice = async () => {
      if (!tokenIn || !tokenOut || !amountIn || !publicClient) {
        setAmountOut('')
        setPriceImpact(0)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // 페어 주소 조회
        const pairAddress = await publicClient.readContract({
          address: FACTORY_ADDRESS as `0x${string}`,
          abi: FACTORY_ABI,
          functionName: 'getPair',
          args: [tokenIn.address, tokenOut.address],
        })

        if (pairAddress === '0x0000000000000000000000000000000000000000') {
          setError('No liquidity pool found')
          return
        }

        // 페어 컨트랙트에서 리저브 조회
        const [reserve0, reserve1] = await Promise.all([
          publicClient.readContract({
            address: pairAddress as `0x${string}`,
            abi: [
              {
                inputs: [],
                name: 'getReserves',
                outputs: [
                  { internalType: 'uint112', name: '_reserve0', type: 'uint112' },
                  { internalType: 'uint112', name: '_reserve1', type: 'uint112' },
                  { internalType: 'uint32', name: '_blockTimestampLast', type: 'uint32' },
                ],
                stateMutability: 'view',
                type: 'function',
              },
            ],
            functionName: 'getReserves',
          }),
        ])

        // 토큰 순서 확인
        const token0 = await publicClient.readContract({
          address: pairAddress as `0x${string}`,
          abi: [
            {
              inputs: [],
              name: 'token0',
              outputs: [{ internalType: 'address', name: '', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'token0',
        })

        const [reserveIn, reserveOut] = token0.toLowerCase() === tokenIn.address.toLowerCase()
          ? [reserve0, reserve1]
          : [reserve1, reserve0]

        // Pair 인스턴스 생성
        const pair = new Pair(
          CurrencyAmount.fromRawAmount(tokenIn, reserveIn),
          CurrencyAmount.fromRawAmount(tokenOut, reserveOut)
        )

        // 입력 금액을 CurrencyAmount로 변환
        const amount = CurrencyAmount.fromRawAmount(
          tokenIn,
          ethers.utils.parseUnits(amountIn, tokenIn.decimals).toString()
        )

        // 가격 계산
        const [outputAmount] = pair.getOutputAmount(amount)
        const formattedAmount = ethers.utils.formatUnits(
          outputAmount.quotient.toString(),
          tokenOut.decimals
        )

        // 가격 영향 계산
        const midPrice = pair.priceOf(tokenIn)
        const executionPrice = outputAmount.divide(amount)
        const impact = Math.abs(
          ((Number(executionPrice.toSignificant()) - Number(midPrice.toSignificant())) /
            Number(midPrice.toSignificant())) *
            100
        )

        setAmountOut(formattedAmount)
        setPriceImpact(impact)
      } catch (err) {
        console.error('Error fetching price:', err)
        setError('Failed to fetch price')
        setAmountOut('')
        setPriceImpact(0)
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
  }, [tokenIn, tokenOut, amountIn, publicClient])

  return { amountOut, priceImpact, loading, error }
} 