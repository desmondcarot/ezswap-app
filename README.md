# EZSwap App
This is only a test project!
EZSwap is a decentralized application (dApp) that enables users to seamlessly swap digital assets on the blockchain. Built on Ethereum, EZSwap leverages smart contracts to facilitate secure, transparent, and fast transactions without the need for intermediaries.
## Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** (with npm)
- **Yarn** (optional but recommended)
- **MetaMask** browser extension
- **Ganache** (for local blockchain testing)
- **Visual Studio Code** (or any code editor)

## Setup Instructions

### Step 1: Install Dependencies

Open **Windows PowerShell** and run the following commands to install necessary packages:

```bash
yarn add eslint-config-react-app -D
yarn add eslint-config-react -D
yarn add --dev eslint-config-react-app
npm install react
npm install --save-dev @types/react
npm install bootstrap
npm install --save-dev chai
npm install chai-as-promised
npm install --global mocha
npm install eslint
npm install --save-dev @babel/register
npm install --save-dev @babel/core
npm install babel-preset-es2015 --save-dev
npm install c3
npm install identicon
npm install --save-dev react-app-rewired crypto-browserify stream-browserify assert stream-http https-browserify os-browserify url buffer process
npm install @openzeppelin/contracts
npm install ethers
```

### Step 2: MetaMask

- Install the MetaMask plugin in your browser.
- Log in to MetaMask.

### Step 3: Start Ganache
Open Ganache and click the QuickStart button to start a local blockchain testnet.
Import the second dummy account into MetaMask:
Copy the private key from Ganache's 2nd account.
In MetaMask, go to Import Account and paste the private key.

### Step 3: Compile and Deploy Smart contract

```bash
truffle compile
truffle migrate --reset
```

### Step 4: Run the webapp

```bash
npm start
```

```
File Structure
ezswap-app/
│
├── contracts/            # Solidity smart contracts
├── migrations/           # Deployment scripts
├── src/
│   ├── components/       # React components
│   ├── pages/            # React pages
│   ├── App.js            # Main React component
│   └── index.js          # Entry point for React
├── test/                 # Tests for smart contracts
├── truffle-config.js     # Truffle configuration file
└── package.json          # Project dependencies and scripts
```