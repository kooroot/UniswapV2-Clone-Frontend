import { Button } from '@chakra-ui/react'
import { Token } from '@uniswap/sdk-core'

interface SwapButtonProps {
  isConnected: boolean
  tokenIn: Token | null
  tokenOut: Token | null
  amountIn: string
}

const SwapButton = ({
  isConnected,
  tokenIn,
  tokenOut,
  amountIn,
}: SwapButtonProps) => {
  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet'
    if (!tokenIn || !tokenOut) return 'Select Tokens'
    if (!amountIn) return 'Enter Amount'
    return 'Swap'
  }

  const isDisabled = !isConnected || !tokenIn || !tokenOut || !amountIn

  return (
    <Button
      w="full"
      size="lg"
      colorScheme="blue"
      isDisabled={isDisabled}
      onClick={() => {
        // TODO: Implement swap logic
      }}
    >
      {getButtonText()}
    </Button>
  )
}

export default SwapButton 