import { useState, useEffect } from "react";
import { ethers } from "ethers";
import link_abi from "../link_abi.json";
import bridge_abi from "../bridge_abi.json";
import bnm_abi from "../bnm_abi.json";
import "./main.css";
import chainlink from "./assets/chainlink-link-logo.png";
import bnb from "./assets/bnb-logo.png";
import arrow from "./assets/arrow.png";
import eth from "./assets/eth.png";
import copy from "clipboard-copy";

function App() {
  const bridge_Address = "0xBAf3F6e61E33ca6219A67eE0d2b79C5493BB3442";
  const link_Address = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
  const bnm_Address = "0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05";

  const [addr, setAddr] = useState(""); //destination addr
  const [amount, setAmount] = useState("");
  const [accountAddress, setAccountAddress] = useState(null);
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [link, setlink] = useState(null);
  const [bridge, setbridge] = useState(null);
  const [bnm, setbnm] = useState(null);
  const [linkBalance, setLinkBalance] = useState(null);
  const [ccipBalance, setccipBalance] = useState(null);
  const [hash, setHash] = useState(null);

  const hexToNumber = (hex) =>
    parseInt(hex.startsWith("0x") ? hex.slice(2) : hex, 16);
  const numberToString = (num) => String(num);

  const connect = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();
      setSigner(signer);

      const address = await signer.getAddress();
      setAccountAddress(address);

      setConnected(true); // setting connected state to true

      const link = await new ethers.Contract(
        link_Address,
        link_abi.result,
        signer
      );
      setlink(link);
      const bridge = await new ethers.Contract(
        bridge_Address,
        bridge_abi.result,
        signer
      );
      setbridge(bridge);
      const bnm = await new ethers.Contract(
        bnm_Address,
        bnm_abi.result,
        signer
      );
      setbnm(bnm);
    } catch (error) {
      console.log(error);
    }
  };

  const disconnect = async () => {
    try {
      if (window.ethereum && window.ethereum.isMetaMask) {
        // Reset the provider and signer
        setProvider(null);
        setSigner(null);
        setAccountAddress(null);
        setConnected(false); // setting connected state to false
        // Request eth_accounts permission again
        // await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const balance = async () => {
    let linkBalance = await link.balanceOf(accountAddress);
    linkBalance = ethers.utils.formatUnits(linkBalance, 18);
    setLinkBalance(linkBalance);
    let ccipBalance = await bnm.balanceOf(accountAddress);
    ccipBalance = ethers.utils.formatUnits(ccipBalance, 18);
    setccipBalance(ccipBalance);
  };

  const handleCopy = () => {
    copy(hash);
    alert("Copied to clipboard!");
  };

  const getfees = async (addr, amount) => {
    try {
      let fees = await bridge.getFees(addr, amount);
      fees = fees._hex;
      fees = numberToString(hexToNumber(fees));
      return fees;
    } catch (error) {
      console.log(error);
    }
  };

  const sendLinkTokensToContract = async (tokenAmount, destaddr) => {
    try {
      const fees = await getfees(destaddr, tokenAmount);
      const linkContractWithSigner = link.connect(signer);
      const tx = await linkContractWithSigner.transfer(bridge_Address, fees);
      await tx.wait();
      console.log("LINK sent to contract successfully");
    } catch (error) {
      console.error("Sending LINK tokens to contract failed:", error);
    }
  };

  const sendBnmTokensToContract = async (tokenAmount, destaddr) => {
    try {
      const bnmContractWithSigner = bnm.connect(signer);
      const tx = await bnmContractWithSigner.transfer(
        bridge_Address,
        tokenAmount
      );
      await tx.wait();
      console.log("BNM tokens sent to contract successfully");
    } catch (error) {
      console.error("Sending BNM tokens to contract failed:", error);
    }
  };

  const transferTokensViaBridge = async (tokenAmount, destaddr) => {
    try {
      let response = await bridge.transfer(destaddr, tokenAmount);
      return response.hash;
    } catch (error) {
      console.error("Transferring tokens via bridge contract failed:", error);
    }
  };

  const handleTransact = async (e, tokenAmount, destaddr) => {
    e.preventDefault();
    try {
      let tokenAmountParsed = ethers.utils.parseUnits(
        tokenAmount.toString(),
        18
      );
      tokenAmountParsed = tokenAmountParsed._hex;
      tokenAmountParsed = numberToString(hexToNumber(tokenAmountParsed));

      await sendLinkTokensToContract(tokenAmountParsed, destaddr);
      await sendBnmTokensToContract(tokenAmountParsed, destaddr);
      let hash = await transferTokensViaBridge(tokenAmountParsed, destaddr);
      setHash(hash);
      console.log("Transaction completed successfully");
    } catch (error) {
      console.error("Transacting failed:", error);
    }
  };
  return (
    <div>
      <nav className="bg-white dark:bg-gray-900 fixed w-full top-0 start-0 border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            BrokenBridge
          </span>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={(e) => {
                if (connected === true) {
                  disconnect();
                  setLinkBalance(null);
                  setccipBalance(null);
                } else {
                  connect();
                }
              }}
            >
              {connected ? "Disconnect Wallet" : "Connect Wallet"}
            </button>
          </div>
        </div>
      </nav>
      <div className="space z-0 justify-center items-center h-screen w-screen flex">
        <div className="w-3/5 h-4/6 top-10 align-middle rounded-l span flex flex-row ">
          <div className="bg-blue-300 h-full basis-3/5 flex flex-col rounded-l-lg">
            <h1 className="mt-5 text-2xl text-center mb-5">Enter Details</h1>
            <div className="flex flex-row items-center pl-10">
              <img src={eth} className="h-20 mr-14 basis-1/5" />
              <img src={arrow} className="h-20 mr-10 basis-1/3" />
              <img src={bnb} className="h-20 w-20 basis-1/5" />
            </div>
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 w-1/2 ml-32 mt-7"
              onClick={balance}
            >
              Get Balance
            </button>
            <div className="flex flex-row">
              <h4 className="mt-5 ml-8 basis-1/2">
                Link Balance: {linkBalance}{" "}
              </h4>
              <h4 className="mt-5 ml-4 basis-1/2">
                CCIP-BnM Balance: {ccipBalance}
              </h4>
            </div>

            <form className="mx-5 mt-5">
              <div className="mb-4 flex flex-row">
                <label className=" text-gray-700 font-medium mx-3 mt-2">
                  From
                </label>
                <input
                  type="text"
                  value={accountAddress}
                  className="border border-gray-400 p-2 w-4/5 rounded-lg focus:outline-none focus:border-blue-400"
                  readOnly
                />
              </div>
              <div className="mb-4 flex flex-row">
                <label className=" text-gray-700 font-medium mx-3 mt-2">
                  To
                </label>
                <input
                  type="text"
                  value={addr}
                  onChange={(e) => setAddr(e.target.value)}
                  className="border border-gray-400 p-2 w-4/5 rounded-lg focus:outline-none focus:border-blue-400"
                  required
                />
              </div>
              <div className="mb-4 flex flex-row">
                <label className=" text-gray-700 font-medium mx-3 mt-2">
                  Amount
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border border-gray-400 p-2 w-2/5 rounded-lg focus:outline-none focus:border-blue-400"
                  required
                />
              </div>
              <div className="flex flex-row">
                <button
                  type="submit"
                  className="bg-red-800 text-white px-4 py-2 w-1/4 rounded-lg hover:bg-red-700 mx-5 mt-5"
                  onClick={(e) => {
                    handleTransact(e, amount, addr);
                  }}
                >
                  Transact
                </button>
                <div className="flex items-center mt-5 mx-5">
                  <input
                    className="mr-2 py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    type="text"
                    value={hash}
                    readOnly
                  />
                  <button
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                      !hash && "cursor-not-allowed opacity-50"
                    }`}
                    onClick={handleCopy}
                    disabled={!hash}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="h-full bg-slate-700 basis-2/5 flex flex-col items-center rounded-r-lg">
            <h1 className="text-2xl text-center mt-5 text-white">
              {" "}
              See Progress{" "}
            </h1>
            <img src={chainlink} className="h-2/5 w-3/5 mt-10" />
            <h3 className="text-l text-white text-center mt-5 pl-3 pr-3">
              To track the progress of your transaction, simply copy the
              transaction hash and visit the provided website link. Paste the
              hash into the search bar to locate your transaction details.
            </h3>
            <h4 className="text-blue-500 text-cnter mt-10">
              <span>
                <a href="https://ccip.chain.link/">https://ccip.chain.link/</a>
              </span>
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
