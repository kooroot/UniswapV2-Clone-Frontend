import { useState } from 'react'
import { Token } from '@uniswap/sdk-core'
import { POPULAR_TOKENS } from '../../constants/tokens'
import { useTokenValues, getTokenValue } from '../../hooks/useTokenValues'
import './TokenSelectModal.css'

interface TokenSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (token: Token) => void
  otherToken: Token | null  // 다른 입력창에서 선택된 토큰
}

const TokenSelectModal = ({ isOpen, onClose, onSelect, otherToken }: TokenSelectModalProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const tokenValues = useTokenValues(POPULAR_TOKENS)

  const filteredTokens = POPULAR_TOKENS.filter(token =>
    (token.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const sortedTokens = filteredTokens
    .sort((a, b) => getTokenValue(b, tokenValues) - getTokenValue(a, tokenValues))

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select a token</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search name or paste address"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="token-list">
          {sortedTokens.map(token => {
            const isDisabled = otherToken?.address === token.address
            const value = tokenValues.find(v => v.token.address === token.address)
            return (
              <div
                key={token.address}
                className={`token-item ${isDisabled ? 'disabled' : ''}`}
                onClick={() => {
                  if (!isDisabled) {
                    onSelect(token)
                    onClose()
                  }
                }}
              >
                <div className="token-info">
                  <span className="token-symbol">{token.symbol}</span>
                  <span className="token-name">{token.name}</span>
                  {value && (
                    <span className="token-balance">
                      Balance: {Number(value.balance) / (10 ** token.decimals)} (${value.usdValue.toFixed(2)})
                    </span>
                  )}
                </div>
                {isDisabled && <span className="token-disabled-text">Already selected</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TokenSelectModal 