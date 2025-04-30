import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { FACTORY_ADDRESS } from '../constants/addresses'
import { FACTORY_ABI } from '../constants/abis/Factory'

export const useSwapPrice = (
  tokenIn,
  tokenOut,
  amountIn,
  publicClient
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

        // 1. 페어 주소 조회
        const pairAddress = await publicClient.readContract({
          address: FACTORY_ADDRESS,
          abi: FACTORY_ABI,
          functionName: 'getPair',
          args: [tokenIn.address, tokenOut.address],
        })

        if (!pairAddress || pairAddress === '0x0000000000000000000000000000000000000000') {
          setError('No liquidity pool found')
          setAmountOut('')
          setPriceImpact(0)
          return
        }

        // 2. 리저브 조회
        const [reserve0, reserve1] = await publicClient.readContract({
          address: pairAddress,
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
        })

        // 3. 토큰 순서에 따라 reserveIn, reserveOut 결정
        const token0 = await publicClient.readContract({
          address: pairAddress,
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

        let reserveIn, reserveOut
        if (token0.toLowerCase() === tokenIn.address.toLowerCase()) {
          reserveIn = reserve0
          reserveOut = reserve1
        } else {
          reserveIn = reserve1
          reserveOut = reserve0
        }

        // 4. X*Y=K 공식으로 amountOut 계산 (수수료 0.3% 반영)
        const amountInWithFee = ethers.utils.parseUnits(amountIn, tokenIn.decimals).mul(997)
        const reserveInBN = ethers.BigNumber.from(reserveIn.toString())
        const reserveOutBN = ethers.BigNumber.from(reserveOut.toString())
        const numerator = amountInWithFee.mul(reserveOutBN)
        const denominator = reserveInBN.mul(1000).add(amountInWithFee)
        const amountOutBN = numerator.div(denominator)
        const formattedAmount = ethers.utils.formatUnits(amountOutBN, tokenOut.decimals)

        setAmountOut(formattedAmount)
        setPriceImpact(0) // (간단화, 필요시 추가 계산)
      } catch (err) {
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