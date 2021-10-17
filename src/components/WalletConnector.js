import './WalletConnector.css';
import { createContext, useMemo, useState, useContext } from 'react';
import { Snackbar, Button } from '@mui/material';

import { ethers } from 'ethers';

import MuiAlert from '@mui/material/Alert';

import { contract } from './Web3Connector';

const validNetwork = 4;

function getProvider() {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
}

export const WalletContext = createContext({
  walletAddress: '',
  requestAccount: undefined,
});

export const WalletConnectButton = () => {
  const { walletAddress, requestAccount } = useContext(WalletContext);

  const addressInfo = walletAddress
    ? walletAddress.substring(0, 6) + '...' + walletAddress.substring(38)
    : 'Connect Wallet';
  return (
    <Button className="wallet-button" variant="outlined" onClick={requestAccount}>
      {addressInfo}
    </Button>
  );
};

export function WalletConnector({ children }) {
  const [network, setNetwork] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [contractOwner, setContractOwner] = useState(null);
  const [signContract, setSignContract] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: undefined,
  });

  const handleError = (e) => {
    setAlertState({
      open: true,
      message: e.message,
      severity: 'error',
    });
  };

  const updateAccounts = (accounts) => {
    if (accounts?.length > 0) setAddress(ethers.utils.getAddress(accounts?.[0]));
  };

  const requestAccount = (ctx) => {
    if (provider) {
      provider.send('eth_requestAccounts').then(updateAccounts).catch(handleError);
    } else {
      setAlertState({
        open: true,
        message: 'Please install Metamask',
        severity: 'error',
      });
    }
  };

  useMemo(() => {
    setProvider(getProvider());
    contract
      .owner()
      .then(setContractOwner)
      .catch(() => {});
  }, []);

  useMemo(() => {
    if (provider) {
      provider.getNetwork().then(setNetwork);
      setSignContract(contract.connect(provider.getSigner()));
      provider.send('eth_accounts').then(updateAccounts).catch(handleError);
    }
  }, [provider]);

  const isContractOwner =
    address && contractOwner && address.toLowerCase() === contractOwner.toLowerCase();

  const isValidNetwork = network?.chainId === validNetwork;

  const isConnected = address && isValidNetwork;

  const context = {
    network: network,
    walletAddress: address,
    isContractOwner: isContractOwner,
    isConnected: isConnected,
    signContract: signContract,
    requestAccount: requestAccount,
  };

  const handleAlertClose = (event, reason) => {
    if (reason !== 'clickaway') setAlertState({ ...alertState, open: false });
  };

  return (
    <WalletContext.Provider value={context}>
      {!isValidNetwork && network != null && (
        <div className="invalid-network-banner">
          Warning: Connected to {' ' + network.name + ' '}
          network. Switch to mainnet in order to mint.
        </div>
      )}
      <Snackbar open={alertState.open} autoHideDuration={6000} onClose={handleAlertClose}>
        <MuiAlert onClose={handleAlertClose} severity={alertState.severity}>
          {alertState.message}
        </MuiAlert>
      </Snackbar>
      {children}
    </WalletContext.Provider>
  );
}
