import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './wagmi'
import Header from './components/Header'
import Swap from './pages/Swap'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="app">
          <Header />
          <Swap />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
