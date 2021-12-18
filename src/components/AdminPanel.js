import './AdminPanel';
import React, { useEffect } from 'react';
import { useMemo, useState, useContext } from 'react';
import { Button, TextField, Stack, Box, Accordion, AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { ethers } from 'ethers';

import { SStack, STextField, STextFieldReadOnly, SDateTimePicker } from './defaults';
import { useWeb3React } from '@web3-react/core';
import { useContract, useContractState, useTx } from '../lib/ContractConnector';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { signGiveaway } from '../lib/utils';
import { contractAddress } from '../config';

const initialContractInfo = {
  name: '',
  symbol: '',
  baseURI: '',
  balance: '0',
};

function AdminPanel() {
  const { account, library } = useWeb3React();
  const { owner, publicSaleActive } = useContractState();
  const { contract, signContract, handleTx, handleTxError } = useContract();

  const [baseURIInput, setBaseURIInput] = useState('');
  const [giveAway, setGiveAway] = useState('');
  const [giveAwaySignature, setGiveAwaySignature] = useState('');

  const [{ name, symbol, baseURI, balance }, setContractInfo] = useState(initialContractInfo);

  const isContractOwner =
    // true || //
    account && owner && account.toLowerCase() === owner.toLowerCase();

  const signer = library?.getSigner();

  const updateContractInfo = async () => {
    const name = await contract.name();
    const symbol = await contract.symbol();
    const baseURI = await contract.baseURI();
    const balance = await contract?.provider.getBalance(contract.address);

    setContractInfo({
      name: name,
      symbol: symbol,
      baseURI: baseURI,
      balance: balance,
    });
  };

  useEffect(() => {
    if (isContractOwner) updateContractInfo();
  }, [isContractOwner]);

  if (!isContractOwner) return null;

  return (
    <Box className="adminPanel">
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography margin="auto">Admin Panel</Typography>
        </AccordionSummary>
        <Typography variant="h4">Contract Details</Typography>
        <Box maxWidth={600} margin="auto" padding={5}>
          <Stack spacing={2}>
            <STextFieldReadOnly label="Address" value={contract?.address} />
            <STextFieldReadOnly label="Owner" value={owner} />
            <Stack direction="row">
              <STextFieldReadOnly sx={{ width: '100%' }} label="Name" value={name} />
              <STextFieldReadOnly sx={{ width: '100%' }} label="Symbol" value={symbol} />
            </Stack>
            <STextFieldReadOnly
              label="Sale State"
              value={publicSaleActive ? 'live' : 'paused'}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => signContract.setSaleState(!publicSaleActive).then(handleTx).catch(handleTxError)}
                    disabled={!signer || publicSaleActive == null}
                    variant="contained"
                  >
                    {publicSaleActive ? 'pause' : 'activate'}
                  </Button>
                ),
              }}
            />
            <STextFieldReadOnly
              label="Balance"
              value={' Ξ ' + parseFloat(formatEther('' + balance)).toFixed(4)}
              InputProps={{
                endAdornment: (
                  <Button
                    variant="contained"
                    onClick={() => signContract.withdraw().then(handleTx).catch(handleTxError)}
                    disabled={!signer}
                  >
                    withdraw
                  </Button>
                ),
              }}
            />
            <TextField
              label="Base URI"
              variant="standard"
              value={baseURIInput || baseURI}
              placeholder={baseURI}
              onChange={(event) => setBaseURIInput(event.target.value)}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => signContract.setBaseURI(baseURIInput).then(handleTx).catch(handleTxError)}
                    disabled={!signer}
                    variant="contained"
                  >
                    set
                  </Button>
                ),
              }}
            />
            <TextField
              label="Give Away"
              variant="standard"
              value={giveAway}
              placeholder={'0x...'}
              onChange={(event) => setGiveAway(event.target.value)}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() =>
                      signGiveaway(signer, contractAddress, giveAway).then(setGiveAwaySignature).catch(handleTxError)
                    }
                    disabled={!signer}
                    variant="contained"
                  >
                    sign
                  </Button>
                ),
              }}
            />
            {giveAwaySignature && <STextFieldReadOnly label="Give Away Signature" value={giveAwaySignature} />}
          </Stack>
        </Box>
      </Accordion>
    </Box>
  );
}
export default AdminPanel;
