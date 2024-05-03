import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import linktoken_abi from "../linktoken_abi.json";
import contract_abi from "../contract_abi.json";

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

  const connect = async () => {
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      // MetaMask requires requesting permission to connect users accounts
      await provider.send("eth_requestAccounts", []);
      // console.log(provider);
      signer = provider.getSigner();
      // console.log(signer);
      const accAddr = await signer.getAddress();
      setAccountAddr(accAddr);
      setConnected(true);
      await checkbalance(signer);
      // await sendTransaction("0.02");
      await approveSpending("10");
      await sendTokensToContract("10");
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

  const approveSpending = async (tokenAmount) => {
    try {
      const approvedAmount = ethers.utils.parseUnits(
        tokenAmount.toString(),
        18
      ); // Convert token amount to Wei
      const tokenContractWithSigner = tokenContract.connect(signer);
      const tx = await tokenContractWithSigner.approve(
        contractAddress,
        approvedAmount
      );
      await tx.wait();
      console.log("Approval successful");
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  // const sendTransaction = async (amount) => {
  //   const tx = await signer.sendTransaction({
  //     to: contractAddress,
  //     value: ethers.utils.parseUnits(amount, "ether"),
  //   });
  //   console.log(tx);
  // };

  const sendTokensToContract = async (tokenAmount) => {
    try {
      const amountToSend = ethers.utils.parseUnits(tokenAmount.toString(), 18); // Convert token amount to Wei
      const tokenContractWithSigner = tokenContract.connect(signer);
      const tx = await tokenContractWithSigner.transfer(
        contractAddress,
        amountToSend
      );
      await tx.wait();
      console.log("Tokens sent to contract successfully");
    } catch (error) {
      console.error("Sending tokens to contract failed:", error);
    }
  };

  useEffect(() => {
    // console.log("Balance: ", ethers.utils.formatEther(balance));
  }, [balance]);

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
                connect(e);
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
                  type="email"
                  className="form-control"
                  id="exampleInputEmail1"
                  aria-describedby="emailHelp"
                  value={addr}
                  onChange={(e) => setAddr(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">
                  Password
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
                console.log(addr);
                console.log(amount);
                setAddr("");
                setAmount("");
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
        </div>
      </div>
    </div>
  );
}

export default App;
