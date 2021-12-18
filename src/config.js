import { ethers } from 'ethers';
const { abi } = require('./abi/WeirdAssFungis.json');

export const contractConfig = {
  maxSupply: 100,
  mintPrice: ethers.utils.parseEther('0.01'),
  purchaseLimit: 10,
};

export const config = {
  abi: abi,
  address: '0x83DB0478eCFd19713521DBB589227cb1E7F00699',
  supportedChainIds: [80001],
};

export const contractABI = config.abi;
export const contractAddress = config.address;
export const supportedChainIds = config.supportedChainIds;
