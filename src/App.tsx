import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'viem/chains'
import { createPublicClient, http as viemHttp } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/Header'
import Swap from './pages/Swap'
import './styles/global.css'

// Anvil 체인 설정
const anvil = {
  id: 31337,
  name: 'Anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
    public: { http: ['http://localhost:8545'] },
  }
}

const config = createConfig({
  chains: [anvil],
  transports: {
    [anvil.id]: http(),
  },
})

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="app">
          <Header />
          <Swap />
      </div>
      </ThemeProvider>
    </QueryClientProvider>
  </WagmiProvider>
  )
}

export default App
