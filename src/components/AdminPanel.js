import React from "react";
import { useEffect, useState } from "react";
import {
  web3Provider,
  contract,
  signContract,
  contractAddress,
} from "./utils/interact.js";

const { ethers } = require("ethers");

const AdminPanel = ({ isValidNetwork }) => {
  const [status, setStatus] = useState("");

  const [saleIsActive, setSaleIsActive] = useState(false);
  const [contractBalance, setContractBalance] = useState(0);
  const [contractSymbol, setContractSymbol] = useState("");
  const [contractName, setContractName] = useState("");
  const [readContractBaseURI, setReadContractBaseURI] = useState("");
  const [contractBaseURI, setContractBaseURI] = useState("");

  useEffect(() => {
    contract.paused().then((isPaused) => setSaleIsActive(!isPaused));
    contract.name().then(setContractName);
    contract.symbol().then(setContractSymbol);
    contract.baseURI().then(setReadContractBaseURI);
    web3Provider.getBalance(contractAddress).then(setContractBalance);
  }, []);

  // const makeSafe = makeSafeWrapper(isValidNetwork, setStatus);

  return (
    <div className="adminPanel">
      <details>
        <summary>Admin Panel</summary>

        <h2>Contract Details</h2>
        <p>Address: {contractAddress}</p>
        <p>
          Name: {contractName}, Symbol: {contractSymbol}
        </p>

        <span>BaseURI:</span>
        <input
          type="text"
          placeholder={readContractBaseURI}
          onChange={(event) => setContractBaseURI(event.target.value)}
        />
        <br></br>
        <br></br>
        <button
          id="setContractBaseURIButton"
          onClick={() =>
            signContract
              .setBaseURI(contractBaseURI)
              .catch((e) => setStatus(e.message))
          }
          disabled={!isValidNetwork}
        >
          set base URI
        </button>

        <p>Sale State: {saleIsActive ? "live" : "paused"} </p>
        {saleIsActive ? (
          <button
            id="pauseSaleButton"
            onClick={() =>
              signContract.pauseSale().catch((e) => setStatus(e.message))
            }
            disabled={!isValidNetwork}
          >
            pause sale
          </button>
        ) : (
          <button
            id="startSaleButton"
            onClick={() =>
              signContract.startSale().catch((e) => setStatus(e.message))
            }
            disabled={!isValidNetwork}
          >
            start sale
          </button>
        )}

        <p>
          Balance:{" Ξ "}
          {parseFloat(ethers.utils.formatEther(contractBalance)).toFixed(4)}
        </p>
        <button
          id="withdrawButton"
          onClick={() =>
            signContract
              .withdrawContractBalance()
              .catch((e) => setStatus(e.message))
          }
          disabled={!isValidNetwork}
        >
          withdraw
        </button>

        <p className="status"> {status} </p>
        <br></br>
      </details>
    </div>
  );
};
export default AdminPanel;
