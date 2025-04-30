export enum SupportedChainId {
  MAINNET = 1,
  SEPOLIA = 11155111
}

export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (id): id is SupportedChainId => typeof id === 'number'
) 