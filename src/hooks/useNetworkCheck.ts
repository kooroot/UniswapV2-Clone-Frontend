import { useEffect, useState } from 'react'
import { watchChainId } from '@wagmi/core'
import { config } from '../wagmi'
import { useAccount } from 'wagmi'

export const useNetworkCheck = () => {
  const { isConnected, chainId } = useAccount()
  const [showNetworkModal, setShowNetworkModal] = useState(false)

  useEffect(() => {
    setShowNetworkModal(isConnected && chainId !== 31337)

    const unwatch = watchChainId(config, {
      onChange: (newChainId) => {
        setShowNetworkModal(isConnected && newChainId !== 31337)
      },
    })

    return () => unwatch()
  }, [isConnected, chainId])

  return { 
    isConnected, 
    chainId,
    showNetworkModal,
    setShowNetworkModal
  }
} 