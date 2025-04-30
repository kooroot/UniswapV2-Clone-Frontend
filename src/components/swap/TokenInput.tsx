import { Token } from '@uniswap/sdk-core'
import { useState } from 'react'
import { useBalance } from 'wagmi'
import TokenSelectModal from './TokenSelectModal'
import './TokenInput.css'

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
  
  const { data: balance } = useBalance({
    address: undefined, // 현재 연결된 지갑 주소 사용
    token: token?.address as `0x${string}`,
    chainId: token?.chainId,
    enabled: !!token,
  })

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // 숫자와 소수점만 허용
    if (!/^\d*\.?\d*$/.test(value)) return
    
    // 소수점 제한
    if (token && value.includes('.')) {
      const [, decimal] = value.split('.')
      if (decimal && decimal.length > token.decimals) return
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
          value={formatNumber(amount)}
          onChange={handleAmountChange}
          placeholder="0.0"
          className="amount-input"
        />
        <button
          className="token-select-button"
          onClick={() => setIsModalOpen(true)}
        >
          {token ? token.symbol : 'Select Token'}
        </button>
      </div>
      <TokenSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={onTokenChange}
        otherToken={otherToken}
      />
    </div>
  )
}

export default TokenInput 