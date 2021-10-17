import Minter from './Minter';
import { WalletConnectButton, WalletConnector, WalletContext } from './WalletConnector';
// import AdminPanel from "./AdminPanel";
// import { createContext, useContext } from "react";

// import TwitterIcon from "@mui/icons-material/Twitter";
import { SvgIcon, Icon } from '@mui/material';

import { ReactComponent as TwitterLogo } from '../images/twitter.svg';
import { ReactComponent as DiscordLogo } from '../images/discord.svg';
import { ReactComponent as OpenseaLogo } from '../images/opensea.svg';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useContext } from 'react';

// const TwitterSvg = require("../images/twitter.svg");
const startDate = new Date(
  'Sat Oct 16 2021 23:19:39 GMT+0200 (Central European Summer Time)'
).getTime();

const Socials = () => {
  return (
    <div className="socials">
      <Button variant="outlined" href="" target="_blank" rel="noreferrer">
        <SvgIcon>
          <TwitterLogo />
        </SvgIcon>
      </Button>
      <Button variant="outlined" href="" target="_blank" rel="noreferrer">
        <SvgIcon>
          <DiscordLogo />
        </SvgIcon>
      </Button>
      <Button variant="outlined" href="" target="_blank" rel="noreferrer">
        <SvgIcon>
          <OpenseaLogo />
        </SvgIcon>
      </Button>
    </div>
  );
  // <div className="socials">
  //   <a href="https://discord.gg/BZEHymUKzB" target="_blank" rel="noreferrer">
  //     <div className="coming-soon__icon coming-soon__icon--discord">
  //       <i className="fab fa-discord"></i>
  //     </div>
  //   </a>
  //   <a href="https://twitter.com/chadfrogs" target="_blank" rel="noreferrer">
  //     <div className="coming-soon__icon coming-soon__icon--twitter">
  //       <i className="fab fa-twitter"></i>
  //     </div>
  //   </a>
  // </div>
};

function Home() {
  return (
    <div className="Home">
      <div className="header">
        <Socials />
        <WalletConnectButton />
      </div>
      <div className="container">
        {/* <AdminPanel /> */}

        <h1 id="title">ChadFrogsNFT</h1>

        <Minter startDate={startDate} />
      </div>
      <div className="footer"></div>
    </div>
  );
}

export default Home;
