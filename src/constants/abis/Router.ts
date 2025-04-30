export const ROUTER_ABI = [
  {
    inputs: [
      { name: "_factory", type: "address", internalType: "address" },
      { name: "_WETH", type: "address", internalType: "address" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [],
    name: "FailedCall",
    type: "error"
  },
  {
    inputs: [
      { name: "balance", type: "uint256", internalType: "uint256" },
      { name: "needed", type: "uint256", internalType: "uint256" }
    ],
    name: "InsufficientBalance",
    type: "error"
  },
  {
    inputs: [
      { name: "token", type: "address", internalType: "address" }
    ],
    name: "SafeERC20FailedOperation",
    type: "error"
  },
  {
    inputs: [],
    name: "WETH",
    outputs: [
      { name: "", type: "address", internalType: "address" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenA", type: "address", internalType: "address" },
      { name: "tokenB", type: "address", internalType: "address" },
      { name: "amountADesired", type: "uint256", internalType: "uint256" },
      { name: "amountBDesired", type: "uint256", internalType: "uint256" },
      { name: "amountAMin", type: "uint256", internalType: "uint256" },
      { name: "amountBMin", type: "uint256", internalType: "uint256" },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" }
    ],
    name: "addLiquidity",
    outputs: [
      { name: "amountA", type: "uint256", internalType: "uint256" },
      { name: "amountB", type: "uint256", internalType: "uint256" },
      { name: "liquidity", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "amountTokenDesired", type: "uint256", internalType: "uint256" },
      { name: "amountTokenMin", type: "uint256", internalType: "uint256" },
      { name: "amountETHMin", type: "uint256", internalType: "uint256" },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" }
    ],
    name: "addLiquidityETH",
    outputs: [
      { name: "amountToken", type: "uint256", internalType: "uint256" },
      { name: "amountETH", type: "uint256", internalType: "uint256" },
      { name: "liquidity", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "factory",
    outputs: [
      { name: "", type: "address", internalType: "address" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "amountOut", type: "uint256", internalType: "uint256" },
      { name: "reserveIn", type: "uint256", internalType: "uint256" },
      { name: "reserveOut", type: "uint256", internalType: "uint256" }
    ],
    name: "getAmountIn",
    outputs: [
      { name: "amountIn", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "pure",
    type: "function"
  },
  {
    inputs: [
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      { name: "reserveIn", type: "uint256", internalType: "uint256" },
      { name: "reserveOut", type: "uint256", internalType: "uint256" }
    ],
    name: "getAmountOut",
    outputs: [
      { name: "amountOut", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "pure",
    type: "function"
  },
  {
    inputs: [
      { name: "amountOut", type: "uint256", internalType: "uint256" },
      { name: "path", type: "address[]", internalType: "address[]" }
    ],
    name: "getAmountsIn",
    outputs: [
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      { name: "path", type: "address[]", internalType: "address[]" }
    ],
    name: "getAmountsOut",
    outputs: [
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "amountA", type: "uint256", internalType: "uint256" },
      { name: "reserveA", type: "uint256", internalType: "uint256" },
      { name: "reserveB", type: "uint256", internalType: "uint256" }
    ],
    name: "quote",
    outputs: [
      { name: "amountB", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "pure",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenA", type: "address", internalType: "address" },
      { name: "tokenB", type: "address", internalType: "address" },
      { name: "liquidity", type: "uint256", internalType: "uint256" },
      { name: "amountAMin", type: "uint256", internalType: "uint256" },
      { name: "amountBMin", type: "uint256", internalType: "uint256" },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" }
    ],
    name: "removeLiquidity",
    outputs: [
      { name: "amountA", type: "uint256", internalType: "uint256" },
      { name: "amountB", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "liquidity", type: "uint256", internalType: "uint256" },
      { name: "amountTokenMin", type: "uint256", internalType: "uint256" },
      { name: "amountETHMin", type: "uint256", internalType: "uint256" },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" }
    ],
    name: "removeLiquidityETH",
    outputs: [
      { name: "amountToken", type: "uint256", internalType: "uint256" },
      { name: "amountETH", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "amountOut", type: "uint256", internalType: "uint256" },
      { name: "path", type: "address[]", internalType: "address[]" },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" }
    ],
    name: "swapETHForExactTokens",
    outputs: [
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "amountOutMin", type: "uint256", internalType: "uint256" },
      { name: "path", type: "address[]", internalType: "address[]" },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" }
    ],
    name: "swapExactETHForTokens",
    outputs: [
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      { name: "amountOutMin", type: "uint256", internalType: "uint256" },
      { name: "path", type: "address[]", internalType: "address[]" },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" }
    ],
    name: "swapExactTokensForETH",
    outputs: [
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      { name: "amountOutMin", type: "uint256", internalType: "uint256" },
      { name: "path", type: "address[]", internalType: "address[]" },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" }
    ],
    name: "swapExactTokensForTokens",
    outputs: [
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "amountOut", type: "uint256", internalType: "uint256" },
      { name: "amountInMax", type: "uint256", internalType: "uint256" },
      { name: "path", type: "address[]", internalType: "address[]" },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" }
    ],
    name: "swapTokensForExactETH",
    outputs: [
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "amountOut", type: "uint256", internalType: "uint256" },
      { name: "amountInMax", type: "uint256", internalType: "uint256" },
      { name: "path", type: "address[]", internalType: "address[]" },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" }
    ],
    name: "swapTokensForExactTokens",
    outputs: [
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    stateMutability: "payable",
    type: "receive"
  }
] as const; 