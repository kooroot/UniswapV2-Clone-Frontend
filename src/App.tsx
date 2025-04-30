import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'viem/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/Header'
import Swap from './pages/Swap'
import './styles/global.css'

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
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
