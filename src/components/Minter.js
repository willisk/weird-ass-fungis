import { useMemo, useState, useContext } from 'react';
import Countdown from 'react-countdown';

import LoadingButton from '@mui/lab/LoadingButton';
import MuiAlert from '@mui/material/Alert';
import { Skeleton, Snackbar, Button, ButtonGroup } from '@mui/material';

import { ethers, BigNumber } from 'ethers';

import { WalletContext } from './WalletConnector';
import { Web3Context } from './Web3Connector';

import { DStack, DTextField, DTextFieldInfo, DDateTimePicker } from './defaults';

const BN = BigNumber.from;

const Minter = ({ startDate, contractDefaults, goLive }) => {
  const [mintAmount, setMintAmount] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: undefined,
  });

  const defaults = {
    supplyMinted: contractDefaults?.supplyMinted != null ? BN(contractDefaults.supplyMinted) : null,
    supplyTotal: contractDefaults?.supplyTotal != null ? BN(contractDefaults.supplyTotal) : null,
    supplyReserve:
      contractDefaults?.supplyReserve != null ? BN(contractDefaults.supplyReserve) : null,
    mintPrice:
      contractDefaults?.mintPrice != null
        ? ethers.utils.parseEther(contractDefaults.mintPrice)
        : null,
    purchaseLimit:
      contractDefaults?.purchaseLimit != null ? BN(contractDefaults.purchaseLimit) : 10,
  };

  const [contractIsActive, setContractIsActive] = useState(false);
  const [contractSupplyMinted, setContractSupplyMinted] = useState(defaults.supplyMinted);
  const [contractSupplyTotal, setContractSupplyTotal] = useState(defaults.supplyTotal);
  const [contractSupplyReserve, setContractSupplyReserve] = useState(defaults.supplyReserve);

  const [contractMintPrice, setContractMintPrice] = useState(defaults.mintPrice);
  const [contractPurchaseLimit, setContractPurchaseLimit] = useState(defaults.purchaseLimit);

  const { signContract, isConnected } = useContext(WalletContext);
  const { contract, web3Provider, handleTxWrapper, handleTxError } = useContext(Web3Context);

  const contractSupplyMintable =
    contractSupplyReserve != null ? contractSupplyTotal?.sub(contractSupplyReserve) : null;

  const isSoldOut = contractSupplyMintable && contractSupplyMintable === 0;

  const handleReadError = (e) => {
    console.error(e);
  };

  const updateContractState = () => {
    contract.isActive().then(setContractIsActive).catch(handleReadError);
    contract.totalSupply().then(setContractSupplyMinted).catch(handleReadError);
  };

  useMemo(() => {
    contract.on(contract.filters.StateUpdate(), updateContractState);
    if (goLive) {
      // only fetch if these haven't been declared beforehand
      if (defaults?.supplyTotal == null)
        contract.MAX_SUPPLY().then(setContractSupplyTotal).catch(handleReadError);
      if (defaults?.supplyReserve == null)
        contract.reserveSupply().then(setContractSupplyReserve).catch(handleReadError);

      if (defaults?.mintPrice == null)
        contract.PRICE().then(setContractMintPrice).catch(handleReadError);
      if (defaults?.purchaseLimit == null)
        contract.PURCHASE_LIMIT().then(setContractPurchaseLimit).catch(handleReadError);

      updateContractState();
    }
  }, []);

  const handleTx = handleTxWrapper(() => {
    setIsMinting(false);
    updateContractState();
  });

  const onMintPressed = () => {
    setIsMinting(true);

    const mintPrice = ethers.utils.parseEther('0.03');
    const txValue = mintPrice.mul(mintAmount);
    signContract
      .mintChad(mintAmount, { value: txValue })
      .then(handleTx)
      .catch((e) => {
        handleTxError(e);
        setIsMinting(false);
        updateContractState();
      });
  };

  const updateMintAmount = (amount) => {
    if (0 < amount && amount <= contractPurchaseLimit?.toString()) setMintAmount(amount);
  };

  console.log(!isConnected, isMinting, !contractIsActive, isSoldOut);

  return (
    <div className="minter">
      <Countdown
        date={startDate}
        // onMount={({ completed }) => completed && setIsActive(true)}
        // onComplete={() => setIsActive(true)}
        renderer={renderCounter}
      />
      <LoadingButton
        className="mint-button"
        onClick={onMintPressed}
        loading={isMinting}
        disabled={!isConnected || isMinting || !contractIsActive || isSoldOut}
        variant="contained"
      >
        {isSoldOut ? 'SOLD OUT!' : <span className="mint-button-text">MINT</span>}
      </LoadingButton>
      <br />
      <ButtonGroup className="mint-dial" size="small" variant="outlined">
        <Button
          variant="text"
          className="mint-dial-increment"
          onClick={() => {
            updateMintAmount(mintAmount - 1);
          }}
        >
          -
        </Button>
        <Button variant="text" className="mint-dial-digit">
          {mintAmount}
        </Button>
        <Button
          variant="text"
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
                  <span id="supplyMinted">{contractSupplyMinted?.toString()}</span>
                )}
                {' / '}
                {contractSupplyMintable == null ? (
                  <Skeleton width={40} />
                ) : (
                  <span id="mintableSupplyTotal">{contractSupplyMintable?.toString()}</span>
                )}
                <strong> NFTs</strong>
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
