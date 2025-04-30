import { useState, useMemo } from 'react'
import { useAccount, useConnect, usePublicClient } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Token } from '@uniswap/sdk-core'
import TokenInput from '../components/swap/TokenInput'
import SwapArrow from '../components/swap/SwapArrow'
import { useSwapPrice } from '../hooks/useSwapPrice'
import './Swap.css'

const Swap = () => {
  const { isConnected } = useAccount()
  const { connect } = useConnect()
  const publicClient = usePublicClient()
  
  const [tokenIn, setTokenIn] = useState<Token | null>(null)
  const [tokenOut, setTokenOut] = useState<Token | null>(null)
  const [amountIn, setAmountIn] = useState<string>('')
  const [amountOut, setAmountOut] = useState<string>('')

  // 가격 계산
  const { amountOut: calculatedAmountOut, priceImpact, loading, error } = useSwapPrice(
    tokenIn,
    tokenOut,
    amountIn,
    publicClient
  )

  // 계산된 금액으로 amountOut 업데이트
  useMemo(() => {
    if (calculatedAmountOut) {
      setAmountOut(calculatedAmountOut)
    }
  }, [calculatedAmountOut])

  const handleSwap = () => {
    if (!isConnected) {
      connect({ connector: injected() })
      return
    }
    // TODO: Implement swap logic
    console.log('Swap', { tokenIn, tokenOut, amountIn, amountOut, priceImpact })
  }

  const handleSwitchTokens = () => {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setAmountIn(amountOut)
    setAmountOut(amountIn)
  }

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet'
    if (!tokenIn || !tokenOut) return 'Select Tokens'
    if (!amountIn) return 'Enter Amount'
    if (loading) return 'Calculating...'
    if (error) return 'Price Unavailable'
    if (priceImpact > 15) return 'Price Impact Too High'
    return 'Swap'
  }

  const isButtonDisabled = 
    (!isConnected && false) || 
    (isConnected && (!tokenIn || !tokenOut || !amountIn || loading || !!error || priceImpact > 15))

  return (
    <div className="swap-container">
      <div className="swap-card">
        <TokenInput
          token={tokenIn}
          amount={amountIn}
          onTokenChange={setTokenIn}
          onAmountChange={setAmountIn}
          isInput={true}
          otherToken={tokenOut}
        />
        <div className="swap-arrow-container">
          <button className="swap-arrow-button" onClick={handleSwitchTokens}>
            <SwapArrow />
          </button>
        </div>
        <TokenInput
          token={tokenOut}
          amount={amountOut}
          onTokenChange={setTokenOut}
          onAmountChange={setAmountOut}
          isInput={false}
          otherToken={tokenIn}
        />
        {tokenIn && tokenOut && amountIn && !error && (
          <div className="swap-info">
            <div className="price-impact">
              Price Impact: {priceImpact.toFixed(2)}%
            </div>
            {priceImpact > 15 && (
              <div className="warning">
                Warning: High price impact!
              </div>
            )}
          </div>
        )}
        <button
          className={`swap-button ${isButtonDisabled ? 'disabled' : ''}`}
          onClick={handleSwap}
          disabled={isButtonDisabled}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  )
}

export default Swap 