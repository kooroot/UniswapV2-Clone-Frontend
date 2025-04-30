import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useTheme } from '../context/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'
import './Header.css'

const Header = () => {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { theme, toggleTheme } = useTheme()

  const handleConnect = () => {
    if (isConnected) {
      disconnect()
    } else {
      connect({ connector: injected() })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <img src="/logo.svg" alt="Uniswap" />
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
    </header>
  )
}

export default Header 