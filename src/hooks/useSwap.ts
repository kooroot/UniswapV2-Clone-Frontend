import { useState } from 'react'
import { ethers } from 'ethers'
import { WETH_ADDRESS, ROUTER_ADDRESS } from '../constants/addresses'
import { WETH_ABI } from '../constants/abis/WETH'
import { ROUTER_ABI } from '../constants/abis/Router'
import { ERC20_ABI } from '../constants/abis/ERC20'
import { useWriteContract, usePublicClient, useContractRead } from 'wagmi'

interface UseSwapProps {
  isConnected: boolean
  tokenIn: any
  tokenOut: any
  amountIn: string
  amountOut: string
  priceImpact: number
  slippage: number
  address: `0x${string}` | undefined
  refetchBalances?: () => Promise<void>
}

export function useSwap({
  isConnected,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  priceImpact,
  slippage,
  address,
  refetchBalances
}: UseSwapProps) {
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()
  const [swapStatus, setSwapStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [swapModal, setSwapModal] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  // approve 여부 확인
  const { data: allowance } = useContractRead({
    address: tokenIn?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, ROUTER_ADDRESS],
    query: {
      enabled: !!tokenIn && tokenIn.address !== 'ETH' && !!amountIn && !!address,
      refetchInterval: 2000
    }
  })

  const needsApprove = tokenIn?.address !== 'ETH' && 
    allowance && 
    BigInt(ethers.utils.parseUnits(amountIn || '0', tokenIn?.decimals || 18).toString()) > allowance

  // approve 트랜잭션 실행 (해시 반환)
  const handleApprove = async () => {
    if (!isConnected || !tokenIn || !amountIn || tokenIn.address === 'ETH') return undefined
    const amountInBN = BigInt(ethers.utils.parseUnits(amountIn, tokenIn.decimals).toString())
    try {
      const tx = await writeContractAsync({
        address: tokenIn.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ROUTER_ADDRESS, amountInBN],
      })
      if (!tx) return undefined
      const hash = (typeof tx === 'object' && 'hash' in tx) ? (tx as any).hash : (typeof tx === 'string' ? tx : undefined)
      return hash
    } catch (err) {
      throw err
    }
  }

  // 스왑 트랜잭션 실행 (해시 반환)
  const handleSwap = async () => {
    if (!isConnected || !tokenIn || !tokenOut || !amountIn || !address) return undefined
    const path = [tokenIn.address, tokenOut.address] as readonly `0x${string}`[]
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20)
    const amountInBN = BigInt(ethers.utils.parseUnits(amountIn, tokenIn.decimals).toString())
    const amountOutMin = BigInt(ethers.utils.parseUnits(
      (Number(amountOut) * (100 - slippage) / 100).toString(),
      tokenOut.decimals
    ).toString())
    let tx
    if (tokenIn.isNative && tokenOut.address === WETH_ADDRESS) {
      // WETH.deposit()
      tx = await writeContractAsync({
        address: WETH_ADDRESS,
        abi: WETH_ABI,
        functionName: 'deposit',
        account: address,
        value: amountInBN,
      })
    } else if (tokenOut.isNative && tokenIn.address === WETH_ADDRESS) {
      // WETH.withdraw()
      tx = await writeContractAsync({
        address: WETH_ADDRESS,
        abi: WETH_ABI,
        functionName: 'withdraw',
        args: [amountInBN],
        account: address,
      })
    } else if (tokenIn.address === 'ETH') {
      tx = await writeContractAsync({
        address: ROUTER_ADDRESS,
        abi: ROUTER_ABI,
        functionName: 'swapExactETHForTokens',
        args: [amountOutMin, path, address as `0x${string}`, deadline],
        value: amountInBN,
      })
    } else if (tokenOut.address === 'ETH') {
      tx = await writeContractAsync({
        address: ROUTER_ADDRESS,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForETH',
        args: [amountInBN, amountOutMin, path, address as `0x${string}`, deadline],
      })
    } else {
      tx = await writeContractAsync({
        address: ROUTER_ADDRESS,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForTokens',
        args: [amountInBN, amountOutMin, path, address as `0x${string}`, deadline],
      })
    }
    if (!tx) return undefined
    const hash = (typeof tx === 'object' && 'hash' in tx) ? (tx as any).hash : (typeof tx === 'string' ? tx : undefined)
    return hash
  }

  // approve → swap 순차 실행 핸들러 (트랜잭션 mining까지 대기)
  const swap = async () => {
    setSwapStatus('pending')
    setSwapModal(null)
    try {
      if (needsApprove) {
        const approveHash = await handleApprove()
        if (typeof approveHash === 'string') await publicClient.waitForTransactionReceipt({ hash: approveHash as `0x${string}` })
        const swapHash = await handleSwap()
        if (typeof swapHash === 'string') await publicClient.waitForTransactionReceipt({ hash: swapHash as `0x${string}` })
      } else {
        const swapHash = await handleSwap()
        if (typeof swapHash === 'string') await publicClient.waitForTransactionReceipt({ hash: swapHash as `0x${string}` })
      }
      if (refetchBalances) await refetchBalances()
      setSwapStatus('success')
      setSwapModal({ message: '스왑이 성공적으로 완료되었습니다.', type: 'success' })
    } catch (err) {
      setSwapStatus('error')
      setSwapModal({ message: '스왑에 실패했습니다. 다시 시도해 주세요.', type: 'error' })
    } finally {
      setTimeout(() => setSwapStatus('idle'), 2500)
    }
  }

  return { swap, swapStatus, swapModal, setSwapModal, needsApprove }
} 