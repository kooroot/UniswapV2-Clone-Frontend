import React, { useState } from 'react'
import { Token } from '@uniswap/sdk-core'
import { Connector } from 'wagmi'
import { useSwap } from '../../hooks/useSwap'

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
  const [showWalletModal, setShowWalletModal] = useState(false)

  const {
    swap,
    swapStatus,
    swapModal,
    setSwapModal,
    needsApprove
  } = useSwap({
    isConnected,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    priceImpact,
    slippage,
    address,
    refetchBalances
  })

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

  const handleButtonClick = () => {
    if (!isConnected && connectors.length > 0) {
      setShowWalletModal(true)
    } else if (!isConnected && onConnect && connectors.length === 1) {
      onConnect(connectors[0])
    } else {
      swap()
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