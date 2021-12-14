import Minter from './Minter';
import { WalletConnectButton } from './WalletConnector';
import AdminPanel from './AdminPanel';
// import { createContext, useContext } from "react";

// import TwitterIcon from "@mui/icons-material/Twitter";
import { SvgIcon } from '@mui/material';

import { ReactComponent as TwitterLogo } from '../images/twitter.svg';
import { ReactComponent as DiscordLogo } from '../images/discord.svg';
import { ReactComponent as OpenseaLogo } from '../images/opensea.svg';

import Button from '@mui/material/Button';
// import Stack from '@mui/material/Stack';
// import { useContext } from 'react';

// const TwitterSvg = require("../images/twitter.svg");
const startDate = new Date(
  'Tue Nov 2 2021 23:19:39 GMT+0200 (Central European Summer Time)'
).getTime();
const contractSupplyTotal = 5000;
const contractSupplyReserve = 100;
const contractMintPrice = '0.03';
const contractPurchaseLimit = 10;
const goLive = true;

const Socials = () => (
  <div className="socials">
    <Button variant="text" href="" target="_blank" rel="noreferrer" style={{ minWidth: 45 }}>
      <TwitterLogo style={{ height: 24, width: 20 }} />
    </Button>
    <Button variant="text" href="" target="_blank" rel="noreferrer" style={{ minWidth: 45 }}>
      <DiscordLogo style={{ height: 24, width: 20 }} />
    </Button>
    <Button variant="text" href="" target="_blank" rel="noreferrer" style={{ minWidth: 45 }}>
      <OpenseaLogo />
    </Button>
  </div>
);

function Home() {
  return (
    <div className="Home">
      <div className="header">
        <Socials />
        <WalletConnectButton />
      </div>
      <div className="container">
        <AdminPanel />

        <h1 id="title">NFT</h1>

        <Minter
          startDate={startDate}
          contractDefaults={{
            supplyMinted: 0,
            supplyTotal: contractSupplyTotal,
            supplyReserve: contractSupplyReserve,
            mintPrice: contractMintPrice,
            purchaseLimit: contractPurchaseLimit,
          }}
          goLive={goLive}
        />
      </div>
      {/* <div className="footer"></div> */}
    </div>
  );
}

export default Home;
