import { useMemo, useState, useContext, useEffect } from 'react';
import Countdown from 'react-countdown';
import Confetti from 'react-confetti';

import LoadingButton from '@mui/lab/LoadingButton';
import MuiAlert from '@mui/material/Alert';
import { Box, Typography } from '@mui/material';
import { Skeleton, Snackbar, Button, ButtonGroup } from '@mui/material';

import { ethers, BigNumber } from 'ethers';

import { SStack, STextField, STextFieldReadOnly, SDateTimePicker } from './defaults';

import { contractConfig } from '../config';
import { useContract, useContractState } from '../lib/ContractConnector';
import { useWeb3React } from '@web3-react/core';
import useWindowSize from 'react-use/lib/useWindowSize';

const BN = BigNumber.from;

const { maxSupply, mintPrice, purchaseLimit } = contractConfig;

export function Mint() {
  const [confetti, setConfetti] = useState(false);
  const [confettiRunning, setConfettiRunning] = useState(false);

  const [mintAmount, setMintAmount] = useState(1);
  const [isMinting, setIsMinting] = useState(false);

  const { account, library } = useWeb3React();
  const { contract, signContract, handleTxError, handleTx } = useContract();
  const { publicSaleActive, totalSupply, updateContractState } = useContractState();

  const { width, height } = useWindowSize();

  // const contractSupplyMintable = contractSupplyReserve != null ? contractSupplyTotal?.sub(contractSupplyReserve) : null;

  const amountLeft = (totalSupply && maxSupply - totalSupply?.toNumber()) || 0;
  const isSoldOut = amountLeft == 0;

  // console.log('publicSaleActive', publicSaleActive);
  // console.log('isSoldOut', isSoldOut);
  // console.log('amountLeft', amountLeft);
  // console.log('totalSupply', totalSupply);

  const signer = library?.getSigner();

  const onMintPressed = () => {
    setIsMinting(true);

    const txValue = mintPrice.mul(mintAmount);
    signContract
      .mint(mintAmount, { value: txValue })
      .then(handleTx)
      .catch(handleTxError)
      .finally(() => {
        setIsMinting(false);
        updateContractState();
        startParty();
      });
  };

  const updateMintAmount = (amount) => {
    if (0 < amount && amount <= purchaseLimit) setMintAmount(amount);
  };

  // const errorMsg =
  //   (!signer && 'connect wallet') || (!publicSaleActive && "sale hasn't started yet") || (isSoldOut && 'sold out');
  // console.log([!signer, isMinting, !publicSaleActive, isSoldOut]);

  const startParty = () => {
    setConfetti(true);
    setConfettiRunning(true);
    setTimeout(() => setConfetti(false), 800);
  };

  return (
    <Box
      className="minter"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      height={150}
      marginBlock={10}
    >
      <Confetti
        width={width}
        height={height}
        numberOfPieces={200}
        run={confettiRunning}
        recycle={confetti}
        gravity={0.1}
      />
      <Box>
        <LoadingButton
          className="mint-button"
          onClick={onMintPressed}
          loading={isMinting}
          disabled={!signer || isMinting || !publicSaleActive || isSoldOut}
          variant="contained"
        >
          {isSoldOut ? 'SOLD OUT!' : <span className="mint-button-text">MINT</span>}
        </LoadingButton>
      </Box>
      <ButtonGroup size="small" variant="outlined" marginInline="auto">
        <Button
          variant="text"
          onClick={() => {
            updateMintAmount(mintAmount - 1);
          }}
        >
          -
        </Button>
        <Button variant="text">{mintAmount}</Button>
        <Button
          variant="text"
          onClick={() => {
            updateMintAmount(mintAmount + 1);
          }}
        >
          +
        </Button>
      </ButtonGroup>
      <Typography>
        Price:{' Ξ '}
        {mintPrice && !isNaN(parseInt(mintAmount)) ? (
          ethers.utils.formatEther(mintPrice.mul(mintAmount)).toString()
        ) : (
          <Skeleton width={40} />
        )}
      </Typography>
      <Box>
        {totalSupply == null ? <Skeleton width={40} /> : <span id="supplyMinted">{totalSupply?.toString()}</span>}
        {' / '}
        {maxSupply} Minted
      </Box>
    </Box>
  );
}
