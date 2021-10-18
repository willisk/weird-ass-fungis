import { ethers } from 'ethers';

const contractAddress = '0x3b4EF43502C1856C72409bF13aE2c2aC562698B9';
const contractABI = require('../ChadFrogs.json').abi;

export const web3Provider = new ethers.providers.AlchemyWebSocketProvider(
  'rinkeby',
  process.env.REACT_APP_ALCHEMY_KEY
);

export const contract = new ethers.Contract(contractAddress, contractABI, web3Provider);
