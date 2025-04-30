import React, { useState, useMemo } from 'react'
import { useAccount, useConnect, usePublicClient, useBalance, useContractRead } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Token } from '@uniswap/sdk-core'
import TokenInput from '../components/swap/TokenInput'
import SwapArrow from '../components/swap/SwapArrow'
import { useSwapPrice } from '../hooks/useSwapPrice'
import { FACTORY_ADDRESS, ROUTER_ADDRESS, WETH_ADDRESS, TEST_TOKENS } from '../constants/addresses'
import { FACTORY_ABI } from '../constants/abis/Factory'
import '../styles/swap.css'

const Swap = () => {
  const { isConnected, address } = useAccount()
  const { connect } = useConnect()
  const publicClient = usePublicClient()
  
  const [fromToken, setFromToken] = useState<Token | null>(
    new Token(31337, TEST_TOKENS.TOKENA as `0x${string}`, 18, 'TokenA', 'TokenA')
  )
  const [toToken, setToToken] = useState<Token | null>(
    new Token(31337, TEST_TOKENS.TOKENB as `0x${string}`, 18, 'TokenB', 'TokenB')
  )
  const [amount, setAmount] = useState<string>('')

  // 가격 계산
  const { amountOut: calculatedAmountOut, priceImpact, loading, error } = useSwapPrice(
    fromToken,
    toToken,
    amount,
    publicClient
  )

  // 토큰 잔액 조회
  const { data: fromTokenBalance } = useBalance({
    address: address,
    token: fromToken?.address as `0x${string}`
  })
  const { data: toTokenBalance } = useBalance({
    address: address,
    token: toToken?.address as `0x${string}`
  })

  // 페어 주소 조회
  const { data: pairAddress } = useContractRead({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'getPair',
    args: [fromToken?.address, toToken?.address],
    enabled: !!fromToken && !!toToken
  })

  const handleSwap = () => {
    if (!isConnected) {
      connect({ connector: injected() })
      return
    }
    // 실제 스왑 트랜잭션 로직은 별도 구현 필요
    console.log('Swap:', {
      fromToken: fromToken?.address,
      toToken: toToken?.address,
      amount,
    })
  }

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet'
    if (!fromToken || !toToken) return 'Select Tokens'
    if (!amount) return 'Enter Amount'
    if (loading) return 'Calculating...'
    if (error) return 'Price Unavailable'
    if (priceImpact > 15) return 'Price Impact Too High'
    return 'Swap'
  }

  const isButtonDisabled = 
    (!isConnected && false) || 
    (isConnected && (!fromToken || !toToken || !amount || loading || !!error || priceImpact > 15))

  // 토큰 교환 핸들러
  const handleSwitchTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    // 필요시 입력값도 교환하거나 초기화
    setAmount('')
  }

  return (
    <div className="swap-container">
      <div className="swap-card">
        <h2 className="text-xl font-bold mb-4">스왑</h2>
        {/* From TokenInput */}
        <TokenInput
          token={fromToken}
          amount={amount}
          onTokenChange={setFromToken}
          onAmountChange={setAmount}
          isInput={true}
          otherToken={toToken}
        />
        {/* 화살표(스위치) 버튼 */}
        <div className="swap-arrow-container">
          <button
            className="swap-arrow-button"
            onClick={handleSwitchTokens}
            aria-label="Switch tokens"
          >
            <SwapArrow />
          </button>
        </div>
        {/* To TokenInput (출력값은 읽기 전용) */}
        <TokenInput
          token={toToken}
          amount={calculatedAmountOut || ''}
          onTokenChange={setToToken}
          onAmountChange={() => {}}
          isInput={false}
          otherToken={fromToken}
        />
        {/* Price Impact */}
        {priceImpact > 0 && (
          <div className="mb-4 text-sm text-gray-500">
            <p>Price Impact: {priceImpact.toFixed(2)}%</p>
            {priceImpact > 15 && (
              <p className="text-red-500">Warning: High price impact!</p>
            )}
          </div>
        )}
        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="swap-button"
          disabled={isButtonDisabled}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  )
}

export default Swap 