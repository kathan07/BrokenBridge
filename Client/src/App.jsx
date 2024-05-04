import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { ethers } from "ethers";
import link_abi from "../link_abi.json";
import bridge_abi from "../bridge_abi.json";
import bnm_abi from "../bnm_abi.json";

function App() {
  const bridge_Address = "0xE5303408f154c00907F7AEbdBe492198694f7411";
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
      let response = await bridge.transferTokensPayLINK(destaddr, tokenAmount);
      console.log(response);
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
      await transferTokensViaBridge(tokenAmountParsed, destaddr);

      console.log("Transaction completed successfully");
    } catch (error) {
      console.error("Transacting failed:", error);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center vh-100">
        <div className="col-md-4">
          <div className="text-center border rounded p-4">
            <button
              type="submit"
              id="c1"
              className="btn btn-primary mb-3"
              onClick={(e) => {
                if (connected == true) {
                  disconnect();
                } else {
                  connect();
                }
              }}
            >
              {connected == true ? "Connected" : "Connect to metamask"}
            </button>
            <form>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">
                  Destination Address
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={addr}
                  onChange={(e) => setAddr(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">
                  Amount (max 10 tokens)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="exampleInputPassword1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </form>
            <button
              type="submit"
              className="btn btn-danger mb-3"
              onClick={(e) => {
                handleTransact(e, amount, addr);
              }}
            >
              Transact
            </button>
            <div id="liveAlertPlaceholder"></div>
            <button
              type="button"
              className="btn btn-primary mb-3"
              id="liveAlertBtn"
            >
              Status
            </button>
          </div>
          <div>
            <Button type="submit" variant="contained" className="mb-3">
              Balance: {ethers.utils.formatUnits(balance, 18)}
            </Button>
          </div>
        </div>

        <div className="text-center border rounded p-4">
          <form>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">
                Destination Address
              </label>
              <input
                type="text"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputPassword1" className="form-label">
                Amount
              </label>
              <input
                type="text"
                className="form-control"
                id="exampleInputPassword1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </form>
          <Button
            type="submit"
            className="btn btn-danger mb-3"
            variant="contained"
            color="error"
            onClick={(e) => {
              sendTokensToContract(e, amount);
              setAddr("");
              setAmount("");
              setTxStatus("initialized");
            }}
          >
            Transact
          </Button>
          <div id="liveAlertPlaceholder"></div>
          <button
            type="button"
            className="btn btn-primary mb-3"
            id="liveAlertBtn"
          >
            status: {getStatus(txStatus)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
