import './App.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { WalletConnector } from './components/WalletConnector';
import Home from './components/Home';

const theme = createTheme({
  overrides: {
    MuiButton: {
      root: {
        textTransform: 'none',
      },
    },
  },
  palette: {
    type: 'light',
    primary: {
      main: '#3000d0',
    },
    secondary: {
      main: '#f3ad15',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <WalletConnector validChainId={4}>
        <div className="App">
          <Home />
        </div>
      </WalletConnector>
    </ThemeProvider>
  );
}

export default App;
