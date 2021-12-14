import './AdminPanel';
import React from 'react';
import { useMemo, useState, useContext } from 'react';
import { Button, TextField, Stack } from '@mui/material';

import { ethers } from 'ethers';

import { WalletContext } from './WalletConnector';
import { Web3Context } from './Web3Connector';

import { DStack, DTextField, DTextFieldInfo, DDateTimePicker } from './defaults';

const AdminPanel = () => {
  const [contractOwner, setContractOwner] = useState('?');

  const [saleIsActive, setSaleIsActive] = useState(false);
  const [contractBalance, setContractBalance] = useState(0);
  const [contractSymbol, setContractSymbol] = useState('');
  const [contractName, setContractName] = useState('');
  const [contractBaseURI, setContractBaseURI] = useState('');

  const { walletAddress, signContract, isConnected, network } = useContext(WalletContext);
  const { contract, web3Provider, handleTxWrapper, handleTxError } = useContext(Web3Context);

  const isContractOwner =
    // true ||
    walletAddress && contractOwner && walletAddress.toLowerCase() === contractOwner.toLowerCase();

  const updateContractState = () => {
    contract.isActive().then(setSaleIsActive);
    contract.name().then(setContractName);
    contract.symbol().then(setContractSymbol);
    contract.baseURI().then(setContractBaseURI);
    web3Provider.getBalance(contract.address).then(setContractBalance);
  };

  const handleTx = handleTxWrapper(updateContractState);

  useMemo(() => {
    contract.on(contract.filters.StateUpdate(), updateContractState);
    contract.owner().then(setContractOwner).catch(console.log);
    updateContractState();
  }, []);

  return isContractOwner ? (
    <div className="adminPanel">
      <details>
        <summary>Admin Panel</summary>
        <h2>Contract Details</h2>
        <DStack>
          <DTextFieldInfo label="Address" value={contract.address} />
          <DTextFieldInfo label="Owner" value={contractOwner} />
          <DTextFieldInfo label="Name" value={contractName} />
          <DTextFieldInfo label="Symbol" value={contractSymbol} />
          <DTextFieldInfo
            label="Sale State"
            value={saleIsActive ? 'live' : 'paused'}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() =>
                    signContract.setSaleState(!saleIsActive).then(handleTx).catch(handleTxError)
                  }
                  disabled={!isConnected}
                  variant="contained"
                >
                  {saleIsActive ? 'pause' : 'activate'}
                </Button>
              ),
            }}
          />
          <DTextFieldInfo
            label="Balance"
            value={' Ξ ' + parseFloat(ethers.utils.formatEther(contractBalance)).toFixed(4)}
            InputProps={{
              endAdornment: (
                <Button
                  variant="contained"
                  onClick={() => signContract.withdraw().then(handleTx).catch(handleTxError)}
                  disabled={!isConnected}
                >
                  withdraw
                </Button>
              ),
            }}
          />
          <DTextField
            label="Base URI"
            variant="standard"
            value={contractBaseURI}
            onChange={(event) => setContractBaseURI(event.target.value)}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() =>
                    signContract.setBaseURI(contractBaseURI).then(handleTx).catch(handleTxError)
                  }
                  disabled={!isConnected}
                  variant="contained"
                >
                  set
                </Button>
              ),
            }}
          />
        </DStack>
      </details>
    </div>
  ) : (
    <div />
  );
};
export default AdminPanel;
