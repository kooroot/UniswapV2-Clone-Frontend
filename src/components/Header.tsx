import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useTheme } from '../context/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'
import { GiUnicorn } from 'react-icons/gi'
import './Header.css'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const Header = () => {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { theme, toggleTheme } = useTheme()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const queryClient = useQueryClient()

  const handleConnect = () => {
    if (isConnected) {
      setShowDisconnectModal(true)
    } else {
      setShowWalletModal(true)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await disconnect()
      await queryClient.clear()
      setTimeout(() => {
        setShowDisconnectModal(false)
        setDisconnecting(false)
      }, 400)
    } catch (e) {
      setDisconnecting(false)
      setShowDisconnectModal(false)
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <GiUnicorn size={32} />Uniswap
        </div>
        <nav className="nav">
          <button className="nav-button">Swap</button>
          <button className="nav-button">Pool</button>
          <button className="nav-button">Vote</button>
          <button className="nav-button">Charts</button>
        </nav>
        <div className="wallet-section">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>
          <button className="connect-button" onClick={handleConnect}>
            {isConnected ? formatAddress(address!) : 'Connect Wallet'}
          </button>
        </div>
      </div>
      {showWalletModal && !isConnected && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowWalletModal(false)}>
          <div style={{ background: '#222', padding: 32, borderRadius: 12, minWidth: 320 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'white', marginBottom: 16 }}>지갑 선택</h3>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                style={{ width: '100%', marginBottom: 12, padding: 12, borderRadius: 8, background: '#2563eb', color: 'white', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                onClick={() => {
                  connect({ connector })
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
      {showDisconnectModal && isConnected && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDisconnectModal(false)}>
          <div style={{ background: '#222', padding: 32, borderRadius: 12, minWidth: 320 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'white', marginBottom: 16 }}>지갑 연결 해제</h3>
            <p style={{ color: 'white', marginBottom: 24 }}>{formatAddress(address!)}</p>
            <button
              style={{ width: '100%', marginBottom: 12, padding: 12, borderRadius: 8, background: '#ef4444', color: 'white', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer', opacity: disconnecting ? 0.6 : 1 }}
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
            <button style={{ width: '100%', marginTop: 8, padding: 10, borderRadius: 8, background: '#444', color: 'white', border: 'none', fontWeight: 500, fontSize: 15, cursor: 'pointer' }} onClick={() => setShowDisconnectModal(false)} disabled={disconnecting}>취소</button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header 