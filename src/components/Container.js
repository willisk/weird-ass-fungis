import { Fragment, useContext, useState } from 'react';
import { Box, Button, Typography, Tabs, Tab, Divider } from '@mui/material';
import { ContractInterfaceProvider, UnsupportedChainIdBanner, useContractState } from '../lib/ContractConnector';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import { TwitterLogo, DiscordLogo, GithubLogo, SolanaLogo } from '../images/logos';
import { WalletConnectButton } from './WalletConnectButton';
import AdminPanel from './AdminPanel';
import { Mint } from './Mint';
import { Home } from './Home';
// import Mint from './Mint';
// import { WalletDialogButton } from '@solana/wallet-adapter-material-ui';
// import { useAnchorWallet } from '@solana/wallet-adapter-react';

function SocialsButton(props) {
  const Logo = props.logo;
  return (
    <Button variant="text" target="_blank" rel="noreferrer" style={{ minWidth: 20, marginInline: 10 }} {...props}>
      <Logo style={{ height: 18, width: 'auto' }} />
    </Button>
  );
}

const Socials = () => (
  <Fragment>
    <Box marginBlock="auto">
      <SocialsButton href="https://solana.com/" logo={SolanaLogo} />
    </Box>
    <Box marginBlock="auto">
      <SocialsButton href="" logo={GithubLogo} />
      <SocialsButton href="" logo={TwitterLogo} />
      <SocialsButton href="" logo={DiscordLogo} />
    </Box>
  </Fragment>
);

const ALL_ROUTES = ['/', '/my-nfts', '/mint'];

function Container() {
  // console.log('running render Container');
  const [activeTab, setActiveTab] = useState(window.location?.pathname || '/');

  const highlightedTab = ALL_ROUTES.includes(activeTab) ? activeTab : '/';

  return (
    <Fragment>
      <UnsupportedChainIdBanner />
      <BrowserRouter>
        <Box className="App" height="100vh" textAlign="center">
          <Box
            className="App-container"
            height="100%"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Box>
              <Box className="header" display="flex" justifyContent="space-between" sx={{ boxShadow: 3 }}>
                <Box marginBlock="auto" marginInline="1em">
                  <Typography variant="h4">Weird Ass Fungi</Typography>
                </Box>
                <Box marginBlock="auto">
                  <Tabs value={highlightedTab} indicatorColor="primary" onChange={(event, tab) => setActiveTab(tab)}>
                    <Tab label="Home" component={Link} value={'/'} to={'/'} />
                    <Tab label="" icon={<Divider orientation="vertical" />} disabled />
                    <Tab label="My NFTs" component={Link} value={'/my-nfts'} to={'/my-nfts'} />
                    <Tab label="" icon={<Divider orientation="vertical" />} disabled />
                    <Tab label="Mint" component={Link} value={'/mint'} to={'/mint'} />
                  </Tabs>
                </Box>
                <WalletConnectButton />
                {/* {wallet ? <p>Balance: {(balance || 0).toLocaleString()} SOL</p> : <WalletDialogButton />} */}
              </Box>
              <Divider />
            </Box>

            <AdminPanel />
            <Box className="container" margin="auto" minHeight={400}>
              {/* <Box justifyItems="center" sx={{ p: 5 }}> */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/mint" element={<Mint />} />
                {/* <Route path="/my-nfts" element={<OpenTasks />} />
                <Route path="/task/:id" element={<DisplayTask />} />
                <Route path="/" exactly element={<renderFor404Routes />} /> */}
              </Routes>
              {/* </Box> */}
            </Box>

            <Box>
              <Divider />
              <Box className="footer" display="flex" justifyContent="space-between" height={32}>
                <Socials />
              </Box>
            </Box>
          </Box>
        </Box>
      </BrowserRouter>
    </Fragment>
  );
}

export default Container;
