import { createContext, useMemo, useEffect, useState, useContext, Fragment, useCallback } from 'react';
import { Snackbar, Button, Link } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

import { useWeb3React } from '@web3-react/core';

import { Box } from '@mui/system';
import { getTransactionLink } from './ChainIds';
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../config';

export const ContractContext = createContext({});

export const TransactionLink = ({ txHash, message, chainId }) => {
  return (
    <Link href={getTransactionLink(txHash, chainId)} target="_blank" rel="noreferrer">
      {message}
    </Link>
  );
};

const parseTxError = (e) => {
  console.error('error', e);
  try {
    return JSON.parse(/\(error=(.+), method.+\)/g.exec(e.message)[1]).message;
  } catch (error) {
    return e?.data?.message || e?.message || e;
  }
};

const INITIAL_CONTRACT_STATE = {
  address: contractAddress,
  owner: undefined,
  publicSaleActive: undefined,
  name: undefined,
  symbol: undefined,
  baseURI: undefined,
  balance: undefined,
  items: undefined,
};

const getContractState = async (contract) => {
  if (!contract.provider) return INITIAL_CONTRACT_STATE;

  console.log('fetching contract state..');

  const owner = await contract.owner();
  const publicSaleActive = await contract.isActive();
  const totalSupply = await contract.totalSupply();
  const items = await Promise.all([...Array(totalSupply.toNumber())].map(async (_, i) => await contract.tokenURI(i)));

  return {
    address: contract.address,
    owner: owner,
    publicSaleActive: publicSaleActive,
    totalSupply: totalSupply,
    items: items,
  };
};

const INITIAL_USER_STATE = {
  balance: undefined,
  items: undefined,
};

const getUserState = async (contract, account) => {
  if (!contract.provider || account) return INITIAL_USER_STATE;
  const balance = await contract.balanceOf(account);
  const items = await Promise.all(
    [...Array(balance.toNumber())].map(async (_, i) => await contract.tokenOfOwnerByIndex(account, i))
  );

  return {
    balance: balance,
    items: items,
  };
};

export function ContractInterfaceProvider({ children }) {
  const [contractState, setContractState] = useState(INITIAL_CONTRACT_STATE);
  const [userState, setUserState] = useState(INITIAL_USER_STATE);
  const [isSendingTx, setIsSendingTx] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: undefined,
  });

  const { account, library, chainId } = useWeb3React();
  window.web3r = useWeb3React();

  const contract = useMemo(() => {
    console.log('acc changed', library);
    return new ethers.Contract(contractAddress, contractABI, library);
  }, [account]);

  const signContract = useMemo(() => {
    return new ethers.Contract(contractAddress, contractABI, library?.getSigner());
  }, [account]);

  const updateContractState = async () => {
    getContractState(contract).then(setContractState);
  };

  const updateUserState = async () => {
    getUserState(contract, account).then(setUserState);
  };

  useEffect(() => {
    if (library?.provider) contract.on(contract.filters.StateUpdate(), updateContractState);
    updateContractState();
  }, [chainId]); // XXX: should find better trigger and clean up event listener

  // console.log('account', account);
  // console.log('STATE', contractState);
  // console.log('contract', contract);
  window.contract = contract;
  window.signContract = signContract;

  const handleError = (e) => {
    setAlertState({
      open: true,
      message: e.message,
      severity: 'error',
    });
  };

  const handleAlertClose = (event, reason) => {
    if (reason !== 'clickaway') setAlertState({ ...alertState, open: false });
  };

  const alert = (msg, severity) => {
    setAlertState({
      open: true,
      message: msg,
      severity: severity || 'error',
    });
  };

  // ------- handle transactions --------

  const handleTxError = useCallback(
    (error) => {
      console.error(error);
      setIsSendingTx(false);
      if (error.reason === 'sending a transaction requires a signer') {
        if (!account) alert('Please connect your wallet');
        else alert('Please switch to a valid network');
      } else {
        alert(parseTxError(error));
      }
    },
    [account]
  );

  const handleTx = useCallback(async (tx) => {
    setIsSendingTx(true);
    alert(<TransactionLink txHash={tx.hash} message="Processing Transaction" chainId={chainId} />, 'info');
    const receipt = await tx.wait();
    alert(
      <TransactionLink txHash={receipt.transactionHash} message="Transaction successful!" chainId={chainId} />,
      'success'
    );
    setIsSendingTx(false);
    return receipt;
  }, []);

  const context = {
    contract: contract,
    signContract: signContract,
    contractState: contractState,
    userState: userState,
    updateUserState: updateUserState,
    updateContractState: updateContractState,
    handleTx: handleTx,
    handleTxError: handleTxError,
    isSendingTx: isSendingTx,
  };

  return (
    <ContractContext.Provider value={context}>
      <Fragment>{children}</Fragment>
      <Snackbar open={alertState.open} autoHideDuration={6000} onClose={handleAlertClose}>
        <MuiAlert onClose={handleAlertClose} severity={alertState.severity}>
          {alertState.message}
        </MuiAlert>
      </Snackbar>
    </ContractContext.Provider>
  );
}

export function useContractContext() {
  return useContext(ContractContext);
}

export function useContractState() {
  const { contractState, updateContractState } = useContractContext();
  return { ...contractState, updateContractState };
}

export function useUserState() {
  const { userState, updateUserState } = useContractContext();
  return { ...userState, updateUserState };
}

export function useTx() {
  const { handleTx, handleTxError, isSendingTx } = useContractContext();
  return { handleTx, handleTxError, isSendingTx };
}

export function useContract() {
  const { contract, signContract, handleTx, handleTxError } = useContractContext();
  return { contract, signContract, handleTx, handleTxError };
}

export function UnsupportedChainIdBanner() {
  const { error, chainId } = useWeb3React();

  // console.log('chainId', chainId);

  if (error?.name === 'UnsupportedChainIdError')
    return (
      <Box className="invalid-network-banner" sx={{ background: 'orange', color: 'black' }}>
        Warning: Unsupported chain id. Please switch to the Polygon network.
      </Box>
    );
  return null;
}
