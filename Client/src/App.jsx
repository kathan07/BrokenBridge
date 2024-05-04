import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import linktoken_abi from "../linktoken_abi.json";
import Button from "@mui/material/Button";

function App() {
  let signer;
  let provider;
  const contractAddress = "0xE5303408f154c00907F7AEbdBe492198694f7411";
  const link_tokenAddress = "0x779877A7B0D9E8603169DdbD7836e478b4624789";

  const [addr, setAddr] = useState(""); //destination addr
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [accountAddr, setAccountAddr] = useState("");
  const [connected, setConnected] = useState(false);
  const [signerAddr, setSignerAddr] = useState(null);
  const [txStatus, setTxStatus] = useState("not-initialized");

  const connect = async () => {
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      // MetaMask requires requesting permission to connect users accounts
      await provider.send("eth_requestAccounts", []);
      // console.log(provider);
      signer = provider.getSigner();
      // console.log(signer);
      setSignerAddr(signer);

      const accAddr = await signer.getAddress();
      setAccountAddr(accAddr);
      setConnected(true);
      await checkbalance(signer);
      // await sendTransaction("0.02");
    } catch (error) {
      console.log(error);
    }
  };

  const tokenContract = new ethers.Contract(
    link_tokenAddress,
    linktoken_abi.result,
    signer
  );

  const checkbalance = async (signer) => {
    const balance = await signer.getBalance();
    setBalance(balance);
  };

  const sendTokensToContract = async (e, tokenAmount) => {
    e.preventDefault();
    try {
      const amountToSend = ethers.utils.parseUnits(tokenAmount.toString(), 18); // Convert token amount to Wei
      const tokenContractWithSigner = tokenContract.connect(signerAddr);
      const tx = await tokenContractWithSigner.transfer(
        contractAddress,
        amountToSend
      );
      await tx.wait();
      setTxStatus("completed");
      console.log("Tokens sent to contract successfully");
    } catch (error) {
      console.error("Sending tokens to contract failed:", error);
    }
  };

  const getStatus = (txStatus) => {
    switch (txStatus) {
      case "initialized":
        return "Pending";
      case "completed":
        return "Successfull";
      default:
        return "Not initialized";
        break;
    }
  };

  useEffect(() => {
    // console.log("Balance: ", ethers.utils.formatEther(balance));
    console.log(accountAddr);
    console.log(txStatus);
  }, [balance, accountAddr, txStatus]);

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <div className="col-md-6">
        <div className="text-center mb-">
          <Button
            type="submit"
            variant="contained"
            className="mb-3"
            color="error"
            onClick={(e) => {
              connect(e);
            }}
          >
            {connected ? "Connected" : "Connect to Metamask"}
          </Button>
        </div>

        <div className="text-center mb-4">
          <div className="mb-3">
            <label htmlFor="accountAddr" className="form-label">
              Connected Account
            </label>
            <input
              id="accountAddr"
              className="form-control"
              type="text"
              value={accountAddr}
              aria-label="Account address"
              disabled
              readOnly
            />
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
