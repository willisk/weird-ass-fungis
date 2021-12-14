import { ethers } from 'ethers';
import { useState, createContext, useContext } from 'react';
import { Snackbar, Link } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

import { WalletContext } from './WalletConnector';
import { getTransactionLink } from '../utils/ChainIds';

const contractABI = require('../ChadFrogs.json').abi;
const validChainIds = JSON.parse(process.env.REACT_APP_VALID_CHAIN_IDS);

const contractAddressRinkeby = process.env.REACT_APP_CONTRACT_ADDRESS_RINKEBY;
const web3ProviderRinkeby = new ethers.providers.AlchemyWebSocketProvider(
  'rinkeby',
  process.env.REACT_APP_ALCHEMY_KEY_RINKEBY
);

export const TransactionLink = ({ txHash, message }) => {
  const { network } = useContext(WalletContext);
  return (
    <Link href={getTransactionLink(txHash, network?.chainId)} target="_blank" rel="noreferrer">
      {message}
    </Link>
  );
};

const parseError = (e) => {
  // console.error(e);
  try {
    return JSON.parse(/\(error\=(.+), method.+\)/g.exec(e.message)[1]).message;
  } catch (error) {
    return e?.message;
  }
};

export const Web3Context = createContext({
  contract: undefined,
  web3Provider: undefined,
  isValidChainId: undefined,
  setChainId: undefined,
  handleTxWrapper: undefined,
  handleTxError: undefined,
});

export const Web3Provider = ({ children }) => {
  const [chainId, setChainId] = useState(validChainIds[0]);
  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: undefined,
  });

  const network = ethers.providers.getNetwork(chainId);
  const validNetwork = ethers.providers.getNetwork(validChainIds[0]);

  const isValidChainId = validChainIds.includes(chainId);

  // if (chainId == '4')
  const contractAddress = contractAddressRinkeby;
  const web3Provider = web3ProviderRinkeby;

  const contract = new ethers.Contract(contractAddress, contractABI, web3Provider);

  window.contract = contract; // XXX: REMOVE THIS!!!!

  const handleAlertClose = (event, reason) => {
    if (reason !== 'clickaway') setAlertState({ ...alertState, open: false });
  };

  const handleTxError = (e) => {
    setAlertState({
      open: true,
      message: parseError(e),
      severity: 'error',
    });
  };

  const handleTxWrapper = (callback) => {
    return async (tx) => {
      setAlertState({
        open: true,
        message: <TransactionLink txHash={tx.hash} message="Processing Transaction" />,
        severity: 'info',
      });
      const { transactionHash } = await tx.wait();
      setAlertState({
        open: true,
        message: <TransactionLink txHash={transactionHash} message="Transaction successful!" />,
        severity: 'success',
      });
      callback();
    };
  };

  const context = {
    contract: contract,
    web3Provider: web3Provider,
    isValidChainId: isValidChainId,
    setChainId: setChainId,
    handleTxWrapper: handleTxWrapper,
    handleTxError: handleTxError,
  };

  return (
    <Web3Context.Provider value={context}>
      {!isValidChainId && (
        <div className="invalid-network-banner">
          Warning: connected to {network?.name} network. Please switch to {validNetwork?.name}{' '}
          network.
        </div>
      )}
      {children}
      <Snackbar open={alertState.open} autoHideDuration={6000} onClose={handleAlertClose}>
        <MuiAlert onClose={handleAlertClose} severity={alertState.severity}>
          {alertState.message}
        </MuiAlert>
      </Snackbar>
    </Web3Context.Provider>
  );
};
