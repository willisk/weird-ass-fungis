import { forwardRef, useMemo, useEffect, useState, useContext } from 'react';
import Countdown from 'react-countdown';

import LoadingButton from '@mui/lab/LoadingButton';
import MuiAlert from '@mui/material/Alert';
import { Skeleton, Snackbar, Button, ButtonGroup } from '@mui/material';

import { ethers } from 'ethers';

import { WalletContext } from './WalletConnector';
import { contract } from './Web3Connector';

const Minter = ({ startDate }) => {
  const [isActive, setIsActive] = useState(false);
  const [mintAmount, setMintAmount] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
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
    contractSupplyReserve != null ? contractSupplyTotal?.sub(contractSupplyReserve) : null;

  const isSoldOut = contractSupplyMintable && contractSupplyMintable === 0;

  const handleError = (e) => {
    // setAlertState({
    //   open: true,
    //   message: e.message,
    //   severity: 'error',
    // });
  };

  const updateContractState = () => {
    contract.paused().then(setContractIsPaused).catch(handleError);
    contract.totalSupply().then(setContractSupplyMinted).catch(handleError);
  };

  useMemo(() => {
    contract.MAX_SUPPLY().then(setContractSupplyTotal).catch(handleError);
    contract.reserveSupply().then(setContractSupplyReserve).catch(handleError);

    contract.PRICE().then(setContractMintPrice).catch(handleError);
    contract.PURCHASE_LIMIT().then(setContractPurchaseLimit).catch(handleError);
    updateContractState();
  }, []);

  const onMintPressed = () => {
    setIsMinting(true);

    const mintPrice = ethers.utils.parseEther('0.03');
    const txValue = mintPrice.mul(mintAmount);
    signContract
      .mintChad(mintAmount, { value: txValue })
      .then(async (tx) => {
        setAlertState({
          open: true,
          message: 'Processing Transaction',
          severity: 'info',
        });
        await tx.wait();
        // const receipt = await tx.wait();
        // console.log('transaction hash: ', receipt);
        setAlertState({
          open: true,
          message: 'Successfully minted!',
          severity: 'success',
        });
        setIsMinting(false);
        updateContractState();
      })
      .catch((e) => {
        setAlertState({
          open: true,
          message: e?.message ?? 'Minting failed',
          severity: 'error',
        });
        setIsMinting(false);
        updateContractState();
      });
  };

  const alertHandleClose = (event, reason) => {
    if (reason !== 'clickaway') setAlertState({ ...alertState, open: false });
  };

  const updateMintAmount = (amount) => {
    if (0 < amount && amount <= (contractPurchaseLimit?.toString() ?? 10)) setMintAmount(amount);
  };

  return (
    <div className="minter">
      <Countdown
        date={startDate}
        onMount={({ completed }) => completed && setIsActive(true)}
        onComplete={() => setIsActive(true)}
        renderer={renderCounter}
      />
      <LoadingButton
        className="mint-button"
        onClick={onMintPressed}
        loading={isMinting}
        disabled={!isConnected || isMinting || contractIsPaused || isSoldOut}
        variant="contained"
      >
        {isSoldOut ? 'SOLD OUT!' : <span className="mint-button-text">MINT</span>}
        {/* {contractIsPaused ? "Sale is not Active" : "Mint NFT!"} */}
      </LoadingButton>
      <br />
      <ButtonGroup className="mint-dial" size="small" variant="outlined">
        <Button
          className="mint-dial-increment"
          onClick={() => {
            updateMintAmount(mintAmount - 1);
          }}
        >
          -
        </Button>
        <Button className="mint-dial-digit">{mintAmount}</Button>
        <Button
          className="mint-dial-increment"
          onClick={() => {
            updateMintAmount(mintAmount + 1);
          }}
        >
          +
        </Button>
      </ButtonGroup>
      <p className="price-tag">
        Price:{' Ξ '}
        {contractMintPrice && !isNaN(parseInt(mintAmount)) ? (
          ethers.utils.formatEther(contractMintPrice.mul(mintAmount)).toString()
        ) : (
          <Skeleton width={40} />
        )}
      </p>
      <div className="chadsminted">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h4>
                {contractSupplyMinted == null ? (
                  <Skeleton width={40} />
                ) : (
                  <span id="supplyMinted">{contractSupplyMinted?.toString() ?? '?'}</span>
                )}
                {'/'}
                {contractSupplyMintable == null ? (
                  <Skeleton width={40} />
                ) : (
                  <span id="mintableSupplyTotal"> {contractSupplyMintable?.toString() ?? '?'}</span>
                )}
                <strong> CHADS</strong>
              </h4>
              <div className="progressbar">
                <div
                  className="progressInner"
                  style={{
                    width:
                      ((contractSupplyMinted == null ? 0 : contractSupplyMinted) /
                        (contractSupplyMintable == null ? 10000 : contractSupplyMintable)) *
                        100 +
                      '%',
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Snackbar open={alertState.open} autoHideDuration={6000} onClose={alertHandleClose}>
        <MuiAlert onClose={alertHandleClose} severity={alertState.severity}>
          {alertState.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

const renderCounter = ({ days, hours, minutes, seconds, completed }) => {
  return (
    <div>
      <p className="counter-text">
        {hours + (days || 0) * 24} hours {minutes} minutes {seconds} seconds
      </p>
      <p className="counter-text">until</p>
    </div>
  );
};

export default Minter;
