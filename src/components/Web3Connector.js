import { ethers } from "ethers";

const contractAddress = "0x3E7FA8456156cCE0A090722425aE922BB570594C";
const contractABI = require("../ChadFrogs.json").abi;

export const web3Provider = new ethers.providers.AlchemyWebSocketProvider(
  "rinkeby",
  process.env.REACT_APP_ALCHEMY_KEY
);

export const contract = new ethers.Contract(
  contractAddress,
  contractABI,
  web3Provider
);
