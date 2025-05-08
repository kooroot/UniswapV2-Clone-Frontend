import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, anvil} from 'wagmi/chains'
import { coinbaseWallet, metaMask, injected, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mainnet, sepolia, anvil],
  connectors: [
    injected({ shimDisconnect: true }),
    metaMask(),
    coinbaseWallet(),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [anvil.id]: http('http://127.0.0.1:8545'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
