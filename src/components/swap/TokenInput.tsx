import { Token } from '@uniswap/sdk-core'
import { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import TokenSelectModal from './TokenSelectModal'
import '../../styles/swap.css'

interface TokenInputProps {
  token: Token | null
  amount: string
  onTokenChange: (token: Token) => void
  onAmountChange: (amount: string) => void
  isInput: boolean
  otherToken: Token | null
}

const formatNumber = (value: string) => {
  // 빈 문자열이면 그대로 반환
  if (!value) return ''
  
  // 소수점 분리
  const [integer, decimal] = value.split('.')
  
  // 정수 부분에 천단위 콤마 추가
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  // 소수점이 있으면 다시 합치기
  return decimal ? `${formattedInteger}.${decimal}` : formattedInteger
}

const TokenInput = ({
  token,
  amount,
  onTokenChange,
  onAmountChange,
  isInput,
  otherToken
}: TokenInputProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isConnected, address } = useAccount()
  
  const { data: balance } = useBalance({
    address: address, // 현재 연결된 지갑 주소
    token: token && token.address !== 'ETH' ? (token.address as `0x${string}`) : undefined,
    chainId: token?.chainId,
    enabled: !!token && !!isConnected && !!address,
  })

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // 숫자와 소수점만 허용
    if (!/^\d*\.?\d*$/.test(value)) return

    // 소수점 이하 자릿수 제한
    if (token && value.includes('.')) {
      const [, decimal] = value.split('.')
      if (decimal && decimal.length > token.decimals) return
    }

    // 빈 문자열, '.'만 입력된 경우는 허용
    if (value === '' || value === '.') {
      onAmountChange(value)
      return
    }

    // 잔액 초과 제한 (정상적인 숫자일 때만)
    if (balance) {
      const max = Number(balance.value) / (10 ** (token?.decimals || 18))
      const numValue = Number(value)
      if (!isNaN(numValue) && numValue > max) return
    }

    onAmountChange(value)
  }

  const handleMaxClick = () => {
    if (balance) {
      const maxAmount = (Number(balance.value) / (10 ** (token?.decimals || 18))).toString()
      onAmountChange(maxAmount)
    }
  }

  const displayBalance = balance
    ? (Number(balance.value) / (10 ** (token?.decimals || 18))).toFixed(4)
    : '0'

  const handleTokenSelect = () => {
    if (!isConnected) {
      // 지갑이 연결되지 않은 경우 모달을 열지 않음
      return
    }
    setIsModalOpen(true)
  }

  return (
    <div className="token-input-container">
      <div className="token-input-header">
        <span>{isInput ? 'From' : 'To'}</span>
        {token && (
          <span className="token-balance">
            Balance: {displayBalance}
            {isInput && (
              <button className="max-button" onClick={handleMaxClick}>
                MAX
              </button>
            )}
          </span>
        )}
      </div>
      <div className="token-input-content">
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0.0"
          className="amount-input"
          disabled={!isConnected}
        />
        <button
          className={`token-select-button ${!isConnected ? 'disabled' : ''}`}
          onClick={handleTokenSelect}
        >
          {token ? token.symbol : 'Select Token'}
        </button>
      </div>
      {isConnected && (
        <TokenSelectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={onTokenChange}
          otherToken={otherToken}
        />
      )}
    </div>
  )
}

export default TokenInput 