import { useState, useEffect } from 'react'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { ethers } from 'ethers'
import { PublicClient } from 'viem'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'

interface PoolInfo {
  token0: string
  token1: string
  fee: number
  tickSpacing: number
  sqrtPriceX96: bigint
  liquidity: bigint
  tick: number
}

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

        // 풀 주소 계산
        const poolAddress = computePoolAddress({
          tokenA: tokenIn,
          tokenB: tokenOut,
          fee: 3000 // 0.3% fee tier
        })

        // 풀 데이터 가져오기
        const [slot0, liquidity] = await Promise.all([
          publicClient.readContract({
            address: poolAddress as `0x${string}`,
            abi: IUniswapV3PoolABI.abi,
            functionName: 'slot0'
          }),
          publicClient.readContract({
            address: poolAddress as `0x${string}`,
            abi: IUniswapV3PoolABI.abi,
            functionName: 'liquidity'
          })
        ])

        const poolInfo: PoolInfo = {
          token0: await publicClient.readContract({
            address: poolAddress as `0x${string}`,
            abi: IUniswapV3PoolABI.abi,
            functionName: 'token0'
          }),
          token1: await publicClient.readContract({
            address: poolAddress as `0x${string}`,
            abi: IUniswapV3PoolABI.abi,
            functionName: 'token1'
          }),
          fee: await publicClient.readContract({
            address: poolAddress as `0x${string}`,
            abi: IUniswapV3PoolABI.abi,
            functionName: 'fee'
          }),
          tickSpacing: await publicClient.readContract({
            address: poolAddress as `0x${string}`,
            abi: IUniswapV3PoolABI.abi,
            functionName: 'tickSpacing'
          }),
          sqrtPriceX96: slot0[0],
          liquidity,
          tick: slot0[1],
        }

        // Pool 인스턴스 생성
        const pool = new Pool(
          tokenIn,
          tokenOut,
          poolInfo.fee,
          poolInfo.sqrtPriceX96.toString(),
          poolInfo.liquidity.toString(),
          poolInfo.tick
        )

        // 입력 금액을 CurrencyAmount로 변환
        const amount = CurrencyAmount.fromRawAmount(
          tokenIn,
          ethers.utils.parseUnits(amountIn, tokenIn.decimals).toString()
        )

        // 가격 계산
        const quote = await pool.getOutputAmount(amount)
        const outputAmount = ethers.utils.formatUnits(
          quote[0].quotient.toString(),
          tokenOut.decimals
        )

        // 가격 영향 계산
        const midPrice = pool.token0Price
        const executionPrice = quote[0].divide(amount)
        const impact = Math.abs(
          ((Number(executionPrice.toSignificant()) - Number(midPrice.toSignificant())) /
            Number(midPrice.toSignificant())) *
            100
        )

        setAmountOut(outputAmount)
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

// 풀 주소 계산 함수
function computePoolAddress({
  tokenA,
  tokenB,
  fee
}: {
  tokenA: Token
  tokenB: Token
  fee: number
}): string {
  // 실제로는 더 복잡한 계산이 필요하지만, 예시를 위해 간단히 구현
  const [token0, token1] = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]
  
  return ethers.utils.getCreate2Address(
    '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Factory address
    ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'uint24'],
        [token0.address, token1.address, fee]
      )
    ),
    ethers.utils.keccak256(IUniswapV3PoolABI.bytecode)
  )
} 