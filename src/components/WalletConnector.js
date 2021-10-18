import './WalletConnector.css';
import { createContext, useMemo, useState, useContext } from 'react';
import { Link, Snackbar, Button } from '@mui/material';

import { ethers } from 'ethers';

import MuiAlert from '@mui/material/Alert';

import { contract } from './Web3Connector';

function getProvider() {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
}

export const WalletContext = createContext({
  network: undefined,
  walletAddress: '',
  isConnected: undefined,
  signContract: undefined,
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

export const TransactionLink = ({ txHash, message }) => {
  const { network } = useContext(WalletContext);
  return (
    <Link
      href={
        (network?.chainId !== 1 ? 'https://rinkeby.etherscan.io/tx/' : 'https://etherscan.io/tx/') +
        txHash
      }
      target="_blank"
      rel="noreferrer"
    >
      {message}
    </Link>
  );
};

export function WalletConnector({ validChainId, children }) {
  const [network, setNetwork] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
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

  const addAccountListener = () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        updateAccounts(accounts);
      });
    }
  };

  const addNetworkListener = () => {
    if (window.ethereum) {
      window.ethereum.on('networkChanged', (networkId) => {
        setProvider(getProvider());
      });
    }
  };

  useMemo(() => {
    setProvider(getProvider());
    addAccountListener();
    addNetworkListener();
  }, []);

  useMemo(() => {
    if (provider) {
      setSignContract(contract.connect(provider.getSigner()));
      provider.getNetwork().then(setNetwork).catch(handleError);
      provider.send('eth_accounts').then(updateAccounts).catch(handleError);
    }
  }, [provider]);

  const isValidNetwork = network?.chainId === validChainId;

  const isConnected = address && isValidNetwork;

  const context = {
    network: network,
    walletAddress: address,
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
