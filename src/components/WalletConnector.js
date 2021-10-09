import React from "react";
import { createContext, useMemo, useState } from "react";

import { ethers } from "ethers";

import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import { contract } from "./Web3Connector";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const validNetwork = 4;

function getProvider() {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
}

export const WalletContext = createContext({
  walletAddress: "",
  requestAccount: undefined,
});

export function WalletConnector({ children }) {
  const [network, setNetwork] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setWalletAddress] = useState(null);
  const [contractOwner, setContractOwner] = useState(null);
  const [signContract, setSignContract] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: undefined,
  });

  useMemo(() => {
    setProvider(getProvider());
    contract.owner().then(setContractOwner);
  }, []);

  useMemo(() => {
    if (provider) {
      provider.getNetwork().then(setNetwork);
      setSignContract(contract.connect(provider.getSigner()));
      provider.send("eth_accounts").then(updateAccounts);
    }
  }, [provider]);

  function requestAccount(ctx) {
    if (provider) {
      provider
        .send("eth_requestAccounts")
        .then(updateAccounts)
        .catch((e) => {
          setAlertState({
            open: true,
            message: e.message,
            severity: "error",
          });
        });
    } else {
      console.log("install mm");
      setAlertState({
        open: true,
        message: "Please install Metamask",
        severity: "error",
      });
    }
  }
  function updateAccounts(accounts) {
    setWalletAddress(accounts?.[0] || "");
  }

  const isContractOwner =
    address &&
    contractOwner &&
    address.toLowerCase() === contractOwner.toLowerCase();

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

  return (
    <WalletContext.Provider value={context}>
      {!isValidNetwork && network != null && (
        <div className="NetworkBanner">
          Warning: Connected to
          {network.name}
          network. Switch to mainnet in order to mint.
        </div>
      )}
      <div className="Wallet">
        <Snackbar
          open={alertState.open}
          autoHideDuration={6000}
          onClose={() => setAlertState({ ...alertState, open: false })}
        >
          <Alert
            onClose={() => setAlertState({ ...alertState, open: false })}
            severity={alertState.severity}
          >
            {alertState.message}
          </Alert>
        </Snackbar>
      </div>
      {children}
    </WalletContext.Provider>
  );
}
