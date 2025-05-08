import React, { useState, useMemo } from 'react'
import { useAccount, useConnect, usePublicClient, useBalance, useContractRead, useWriteContract } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Token } from '@uniswap/sdk-core'
import TokenInput from '../components/swap/TokenInput'
import SwapArrow from '../components/swap/SwapArrow'
import SwapButton from '../components/swap/SwapButton'
import { useSwapPrice } from '../hooks/useSwapPrice'
import { FACTORY_ADDRESS, ROUTER_ADDRESS, WETH_ADDRESS, TEST_TOKENS } from '../constants/addresses'
import { FACTORY_ABI } from '../constants/abis/Factory'
import { ROUTER_ABI } from '../constants/abis/Router'
import { ERC20_ABI } from '../constants/abis/ERC20'
import '../styles/swap.css'
import { ethers } from 'ethers'

const Swap = () => {
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
  const publicClient = usePublicClient()
  const { writeAsync, isPending } = useWriteContract()
  
  const [fromToken, setFromToken] = useState<Token | null>(
    new Token(31337, TEST_TOKENS.TOKENA as `0x${string}`, 18, 'TokenA', 'TokenA')
  )
  const [toToken, setToToken] = useState<Token | null>(
    new Token(31337, TEST_TOKENS.TOKENB as `0x${string}`, 18, 'TokenB', 'TokenB')
  )
  const [amount, setAmount] = useState<string>('')
  const [slippage, setSlippage] = useState<number>(0.5) // 기본 슬리피지 0.5%

  // 가격 계산
  const { amountOut: calculatedAmountOut, priceImpact, loading, error } = useSwapPrice(
    fromToken,
    toToken,
    amount,
    publicClient
  )

  // 토큰 잔액 조회
  const { data: fromTokenBalance, refetch: refetchFromBalance } = useBalance({
    address: address,
    token: fromToken?.address as `0x${string}`
  })
  const { data: toTokenBalance, refetch: refetchToBalance } = useBalance({
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

  // approve 트랜잭션 실행
  const handleApprove = async () => {
    if (!isConnected || !fromToken || !amount || fromToken.address === 'ETH') return

    const amountIn = ethers.utils.parseUnits(amount, fromToken.decimals)
    
    try {
      await writeAsync({
        address: fromToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ROUTER_ADDRESS, amountIn],
      })
    } catch (err) {
      console.error('Approve error:', err)
    }
  }

  // 스왑 트랜잭션 실행
  const handleSwap = async () => {
    if (!isConnected || !fromToken || !toToken || !amount) return

    const path = [fromToken.address, toToken.address]
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20분
    const amountIn = ethers.utils.parseUnits(amount, fromToken.decimals)
    
    // 슬리피지 적용
    const amountOutMin = ethers.utils.parseUnits(
      (Number(calculatedAmountOut) * (100 - slippage) / 100).toString(),
      toToken.decimals
    )

    try {
      if (fromToken.address === 'ETH') {
        // ETH → 토큰
        await writeAsync({
          address: ROUTER_ADDRESS,
          abi: ROUTER_ABI,
          functionName: 'swapExactETHForTokens',
          args: [amountOutMin, path, address, deadline],
          value: amountIn,
        })
      } else if (toToken.address === 'ETH') {
        // 토큰 → ETH
        await writeAsync({
          address: ROUTER_ADDRESS,
          abi: ROUTER_ABI,
          functionName: 'swapExactTokensForETH',
          args: [amountIn, amountOutMin, path, address, deadline],
        })
      } else {
        // 토큰 → 토큰
        await writeAsync({
          address: ROUTER_ADDRESS,
          abi: ROUTER_ABI,
          functionName: 'swapExactTokensForTokens',
          args: [amountIn, amountOutMin, path, address, deadline],
        })
      }
    } catch (err) {
      console.error('Swap error:', err)
    }
  }

  // approve 여부 확인
  const { data: allowance } = useContractRead({
    address: fromToken?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address, ROUTER_ADDRESS],
    enabled: !!fromToken && fromToken.address !== 'ETH' && !!amount,
    watch: true
  })

  const needsApprove = fromToken?.address !== 'ETH' && 
    allowance && 
    ethers.utils.parseUnits(amount || '0', fromToken?.decimals || 18).gt(allowance)

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet'
    if (!fromToken || !toToken) return 'Select Tokens'
    if (!amount) return 'Enter Amount'
    if (loading) return 'Calculating...'
    if (error) return 'Price Unavailable'
    if (priceImpact > 15) return 'Price Impact Too High'
    if (needsApprove) return 'Approve'
    return 'Swap'
  }

  const isButtonDisabled = 
    (!isConnected && false) || 
    (isConnected && (!fromToken || !toToken || !amount || loading || !!error || priceImpact > 15))

  // 토큰 교환 핸들러
  const handleSwitchTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
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
        {/* Price Impact & Slippage */}
        <div className="swap-info">
          {priceImpact > 0 && (
            <div className="price-impact">
              <span>Price Impact</span>
              <span>{priceImpact.toFixed(2)}%</span>
            </div>
          )}
          <div className="slippage">
            <span>Slippage Tolerance </span>
            <span>{slippage}%</span>
          </div>
        </div>
        {/* Swap Button */}
        <SwapButton
          isConnected={isConnected}
          tokenIn={fromToken}
          tokenOut={toToken}
          amountIn={amount}
          amountOut={calculatedAmountOut || ''}
          priceImpact={priceImpact}
          loading={loading}
          error={error}
          slippage={slippage}
          address={address}
          connectors={connectors}
          onConnect={(connector) => connect({ connector })}
          refetchBalances={async () => {
            await refetchFromBalance()
            await refetchToBalance()
          }}
        />
      </div>
    </div>
  )
}

export default Swap 