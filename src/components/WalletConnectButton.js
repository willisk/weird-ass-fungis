import { Button } from '@mui/material';

import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

// import useWeb3Modal from './hooks/useWeb3Modal';

import { supportedChainIds } from '../config';

export const injected = new InjectedConnector({
  // supportedChainIds: [1, 3, 4, 5, 42],
  supportedChainIds: supportedChainIds,
});

const shortenAddress = (address) => {
  return address.substring(0, 6) + '...' + address.substring(38);
};

export const WalletConnectButton = () => {
  const { account, activate, deactivate } = useWeb3React();

  const addressInfo = account ? shortenAddress(account) : 'Connect Wallet';

  async function connect() {
    if (account) return;
    try {
      await activate(injected);
    } catch (ex) {
      console.error(ex);
    }
  }

  return (
    <Button className="wallet-button" variant="contained" onClick={connect}>
      {addressInfo}
    </Button>
  );
};
