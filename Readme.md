# Broken Bridge

Broken Bridge is a decentralized application (DApp) that facilitates the transfer of CCIP-BnM tokens from the Sepolia Ethereum testnet to the BNB Smart Chain testnet. The project aims to create a decentralized bridge between these two blockchain networks, leveraging the Cross-Chain Interoperability Protocol (CCIP) offered by Chainlink.

## Project Overview

The Broken Bridge project is divided into two main folders: `Backend` and `Frontend`. The `Cliet` folder is just devlopment folder and kept for reference while revisiting the porject 

### Backend

The `Backend` folder contains the following components:

1. **contracts**: This folder houses the smart contract responsible for facilitating the cross-chain token transfer.
2. **Ignition**: This folder includes the scripts and configurations required for deploying and verifying the smart contract on the respective blockchain networks.
3. **hardhat.config.js**: The file contains the configuration related to the Hardhat development environment, which is used for compiling, testing, and deploying the smart contract.

### Frontend

The `Frontend` folder contains the user interface (UI) of the DApp, built using React and styled with Tailwind CSS. It includes the following components:

1. **src**: This folder contains the different pages of the DApp.
2. **Ethers.js Integration**: The project utilizes the Ethers.js library to interact with the smart contract and facilitate on-chain transactions.
3. **Vite**: The frontend is initialized using Vite, a fast and modern build tool for modern web applications.

## How It Works

The Broken Bridge DApp allows users to transfer CCIP-BnM tokens from the Sepolia Ethereum testnet to the BNB Smart Chain testnet in a decentralized manner. Here's a high-level overview of how the application works:

1. The user connects their Ethereum wallet (e.g., MetaMask) to the DApp's frontend.
2. The user selects the amount of CCIP-BnM tokens and address they wish to transfer and initiates the transaction.
3. The frontend communicates with the smart contract deployed on the Sepolia Ethereum testnet using the Ethers.js library.
4. The smart contract leverages the CCIP protocol offered by Chainlink to initiate the cross-chain token transfer.
5. Once the transfer is completed, the user's CCIP-BnM tokens are credited to their BNB Smart Chain wallet address.

## Getting Started

To run the Broken Bridge DApp locally, follow these steps:

1. Clone the repository: `git clone https://github.com/kathan07/BrokenBridge.git`
2. Navigate to the project directory: `cd BrokenBridge`
3. Install the required dependencies for the backend to play with contract: `cd backend && yarn install`
4. Install the required dependencies for the frontend: `cd ../frontend && npm install`
5. Start the frontend development server: `cd ../frontend && npm run dev`
6. Access the DApp by navigating to `http://localhost:5173` in your web browser.

## Contributing

Contributions to the Broken Bridge project are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the GitHub repository.

## License

The Broken Bridge project is licensed under the [MIT License](LICENSE).
