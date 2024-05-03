const { ethers } = require('ethers');
const fs = require('fs');

// Replace these with your actual values
const RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/-uIPjPyVbiGJ0XjP12fRXlwyZFAZdWOF';
const PRIVATE_KEY = 'ffb279b205f995df7ab75df37673280648c1df4bc3b96567dcc250da7dfb37fc';
const CONTRACT_ADDRESS = '0x8F6dc900E4D0fB87B9AA631A09007Be64885438C';
const CONTRACT_NAME = 'Bridge';  // replace with your contract's name

// Read the contract ABI from the Hardhat artifact
const artifact = JSON.parse(fs.readFileSync(`./Backend/artifacts/contracts/${CONTRACT_NAME}.sol/${CONTRACT_NAME}.json`, 'utf8'));
const CONTRACT_ABI = artifact.abi;

async function main() {
  // Connect to the network
  let provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  // Create a wallet instance
  let wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Create a contract instance
  let contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

  // Interact with the contract
  let fees = await contract.getFees("0x3C3E8AD71D3aE39c0acbB8b8D6AeC24aEb94A447","100000000000000000");

  console.log(fees);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
