// import React from "react";
import { forwardRef, useContext, useMemo, useState } from "react";
import { contract } from "./Web3Connector";
import { WalletContext } from "./WalletConnector";
import LoadingButton from "@mui/lab/LoadingButton";

import MuiAlert from "@mui/material/Alert";
import { styled } from "@mui/material/styles";

import { Skeleton, Snackbar } from "@mui/material";

const Alert = forwardRef((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// import styled from "styled-components";
// const SkeletonInline = styled(Skeleton)`
//   display: inline-flex;
// `;
const SkeletonInline = styled(Skeleton)(() => {
  return {
    display: "inline-flex",
  };
});

const { ethers } = require("ethers");

function parseError(e) {
  if (!("message" in e)) console.log("'message' not in err", e);
  return e?.message ?? "Minting failed.";
}

const Minter = () => {
  const [mintAmount, setMintAmount] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: undefined,
  });

  const [contractIsPaused, setContractIsPaused] = useState(true);
  const [contractSupplyMinted, setContractSupplyMinted] = useState(null);
  const [contractSupplyTotal, setContractSupplyTotal] = useState(null);
  const [contractSupplyReserve, setContractSupplyReserve] = useState(null);

  const [contractMintPrice, setContractMintPrice] = useState(null);
  const [contractPurchaseLimit, setContractPurchaseLimit] = useState(null);

  const { signContract, isConnected } = useContext(WalletContext);

  const contractSupplyMintable =
    contractSupplyReserve != null
      ? contractSupplyTotal?.sub(contractSupplyReserve)
      : null;

  const updateContractState = () => {
    contract.paused().then(setContractIsPaused);
    contract.totalSupply().then(setContractSupplyMinted);
  };

  useMemo(() => {
    contract.MAX_SUPPLY().then(setContractSupplyTotal);
    contract.reserveSupply().then(setContractSupplyReserve);

    contract.PRICE().then(setContractMintPrice);
    contract.PURCHASE_LIMIT().then(setContractPurchaseLimit);
    updateContractState();
  }, []);

  const onMintPressed = () => {
    setIsMinting(true);

    const mintPrice = ethers.utils.parseEther("0.03");
    const txValue = mintPrice.mul(mintAmount);
    signContract
      .mintChad(mintAmount, { value: txValue })
      .then(async (tx) => {
        setAlertState({
          open: true,
          message: "Processing Transaction",
          severity: "info",
        });
        await tx.wait();
        // const receipt = await tx.wait();
        // console.log('transaction hash: ', receipt);
        setAlertState({
          open: true,
          message: "Successfully minted!",
          severity: "success",
        });
        setIsMinting(false);
        updateContractState();
      })
      .catch((e) => {
        setAlertState({
          open: true,
          message: parseError(e),
          severity: "error",
        });
        setIsMinting(false);
        updateContractState();
      });
  };

  // const makeSafe = makeSafeWrapper(isValidNetwork, setStatus);

  return (
    <div className="Minter">
      <p>
        {contractSupplyMinted == null ? (
          <SkeletonInline width={40} />
        ) : (
          <span id="supplyMinted">
            {contractSupplyMinted?.toString() ?? "?"}
          </span>
        )}
        {" / "}
        {contractSupplyMintable == null ? (
          <SkeletonInline width={40} />
        ) : (
          <span id="mintableSupplyTotal">
            {" "}
            {contractSupplyMintable?.toString() ?? "?"}
          </span>
        )}
        {" minted"}
      </p>

      <form>
        <h2>Amount of Chads to mint:</h2>
        <input
          type="number"
          name="integer"
          min="1"
          max={contractPurchaseLimit?.toString() ?? "10"}
          placeholder="amount"
          value={mintAmount}
          onChange={(event) => {
            const value = parseInt(event.target.value);
            if (
              !isNaN(value) &&
              0 < value &&
              value <= (parseInt(contractPurchaseLimit?.toString()) ?? 10)
            ) {
              setMintAmount(value);
            }
          }}
        />
      </form>
      {/* <button
        id="mintButton"
        onClick={onMintPressed}
        disabled={
          !isValidNetwork ||
          (contractSupplyMintable != null && contractSupplyMintable === 0)
        }
      >
        Mint NFT
      </button> */}
      <LoadingButton
        onClick={onMintPressed}
        loading={isMinting}
        disabled={!isConnected || isMinting || contractIsPaused}
        variant="contained"
      >
        {contractIsPaused ? "Sale is not Active" : "Mint NFT!"}
      </LoadingButton>

      <Snackbar
        open={alertState.open}
        autoHideDuration={8000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
      <p>
        Price:{" Ξ "}
        {contractMintPrice && !isNaN(parseInt(mintAmount))
          ? ethers.utils
              .formatEther(contractMintPrice.mul(mintAmount))
              .toString()
          : "?"}
      </p>
    </div>
  );
};

export default Minter;
