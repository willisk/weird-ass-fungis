const chains = {
  1: 'ETH Mainnet',
  3: 'Ropsten Testnet',
  4: 'Rinkeby Testnet',
  42: 'Kovan Testnet',
  56: 'Binance Smartchain',
  137: 'Polygon Network',
  43114: 'AVAX Network',
  80001: '',
};

export const getNetworkName = (chain) => chains[chain];

const blockExplorerURLs = {
  1: 'https://etherscan.io/tx/',
  3: 'https://ropsten.etherscan.io/tx/',
  4: 'https://rinkeby.etherscan.io/tx/',
  42: 'https://kovan.etherscan.io/tx/',
  137: 'https://polygonscan.com/tx/',
  43113: 'https://testnet.snowtrace.io/tx/',
};

export const getTransactionLink = (txHash, chainId) => {
  if (Object.keys(blockExplorerURLs).includes(chainId)) return blockExplorerURLs[chainId] + txHash;
  return 'https://etherscan.io/tx/' + txHash;
};
