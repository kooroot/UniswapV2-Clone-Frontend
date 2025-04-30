import React, { useState } from 'react'
import { Token } from '@uniswap/sdk-core'
import { useWriteContract, useContractRead, usePublicClient, Connector } from 'wagmi'
import { ROUTER_ADDRESS } from '../../constants/addresses'
import { ROUTER_ABI } from '../../constants/abis/Router'
import { ERC20_ABI } from '../../constants/abis/ERC20'
import { ethers } from 'ethers'

interface SwapButtonProps {
  isConnected: boolean
  tokenIn: Token | null
  tokenOut: Token | null
  amountIn: string
  amountOut: string
  priceImpact: number
  loading: boolean
  error: string | null
  slippage: number
  address: `0x${string}` | undefined
  onConnect?: (connector: Connector) => void
  connectors?: Connector[]
  refetchBalances?: () => Promise<void>
}

const SwapButton = ({
  isConnected,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  priceImpact,
  loading,
  error,
  slippage,
  address,
  onConnect,
  connectors = [],
  refetchBalances,
}: SwapButtonProps) => {
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()
  const [swapStatus, setSwapStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [toast, setToast] = useState<{ message: string, type: 'pending' | 'success' | 'error' } | null>(null)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [swapModal, setSwapModal] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

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
      console.error('Approve error:', err)
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
    try {
      let tx
      if (tokenIn.address === 'ETH') {
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
    } catch (err) {
      console.error('Swap error:', err)
      throw err
    }
  }

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

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet'
    if (!tokenIn || !tokenOut) return 'Select Tokens'
    if (!amountIn) return 'Enter Amount'
    if (loading) return 'Calculating...'
    if (error) return 'Price Unavailable'
    if (priceImpact > 15) return 'Price Impact Too High'
    if (needsApprove) return 'Approve'
    return 'Swap'
  }

  const isDisabled = 
    (!isConnected && false) || 
    (isConnected && (!tokenIn || !tokenOut || !amountIn || loading || !!error || priceImpact > 15))

  // approve → swap 순차 실행 핸들러 (트랜잭션 mining까지 대기)
  const handleSwapClick = async () => {
    setSwapStatus('pending')
    setToast(null)
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

  const handleButtonClick = () => {
    if (!isConnected && connectors.length > 0) {
      setShowWalletModal(true)
    } else if (!isConnected && onConnect && connectors.length === 1) {
      onConnect(connectors[0])
    } else {
      handleSwapClick()
    }
  }

  return (
    <>
      {/* 스왑 결과 모달 */}
      {swapModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: swapModal.type === 'success' ? '#222' : '#3b1a1a', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center' }}>
            <h3 style={{ color: swapModal.type === 'success' ? '#22c55e' : '#ef4444', marginBottom: 16 }}>
              {swapModal.type === 'success' ? '스왑 성공' : '스왑 실패'}
            </h3>
            <p style={{ color: 'white', marginBottom: 24 }}>{swapModal.message}</p>
            <button
              style={{ width: '100%', padding: 12, borderRadius: 8, background: '#2563eb', color: 'white', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
              onClick={() => setSwapModal(null)}
            >
              확인
            </button>
          </div>
        </div>
      )}
      <button
        style={{ width: '100%', height: '48px', fontSize: '1.1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: isDisabled || swapStatus === 'pending' ? 'not-allowed' : 'pointer', opacity: isDisabled || swapStatus === 'pending' ? 0.6 : 1 }}
        disabled={isDisabled || swapStatus === 'pending'}
        onClick={handleButtonClick}
      >
        {getButtonText()}
      </button>
      {showWalletModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowWalletModal(false)}>
          <div style={{ background: '#222', padding: 32, borderRadius: 12, minWidth: 320 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'white', marginBottom: 16 }}>지갑 선택</h3>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                style={{ width: '100%', marginBottom: 12, padding: 12, borderRadius: 8, background: '#2563eb', color: 'white', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                onClick={() => {
                  onConnect && onConnect(connector)
                  setShowWalletModal(false)
                }}
              >
                {connector.name}
              </button>
            ))}
            <button style={{ width: '100%', marginTop: 8, padding: 10, borderRadius: 8, background: '#444', color: 'white', border: 'none', fontWeight: 500, fontSize: 15, cursor: 'pointer' }} onClick={() => setShowWalletModal(false)}>취소</button>
          </div>
        </div>
      )}
    </>
  )
}

export default SwapButton 