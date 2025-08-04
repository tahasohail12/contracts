# NFT Content Authentication Platform - Complete Setup Guide

## 🚀 Quick Start Overview

This is a complete NFT Content Authentication Platform with:
- **Backend**: Node.js + Express + IPFS + MongoDB
- **Frontend**: React 19.1.1 + TypeScript + Web3 Integration
- **Blockchain**: Smart Contracts on Sepolia Testnet
- **Features**: Content upload, verification, NFT minting, marketplace, licensing

## 📋 Prerequisites

Before starting, ensure you have:

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **MetaMask** browser extension - [Install here](https://metamask.io/)

### Accounts Needed
- **MongoDB Atlas** account (free) - [Sign up here](https://www.mongodb.com/atlas)
- **Infura** account (free) - [Sign up here](https://infura.io/)
- **Sepolia testnet ETH** - Get from [Sepolia Faucet](https://sepoliafaucet.com/)

## 🛠️ Installation Steps

### Step 1: Clone the Repository
```bash
git clone https://github.com/tahasohail12/contracts.git
cd contracts
```

### Step 2: Install Root Dependencies
```bash
npm install
```

### Step 3: Setup Smart Contracts
```bash
# Install Hardhat dependencies
npm install --save-dev @nomicfoundation/hardhat-chai-matchers @nomicfoundation/hardhat-ethers @openzeppelin/contracts chai ethers hardhat hardhat-gas-reporter

# Compile contracts
npx hardhat compile

# Deploy contracts to Sepolia (optional - already deployed)
npx hardhat run scripts/deploy.js --network sepolia
```

### Step 4: Setup Backend
```bash
cd backend

# Install backend dependencies
npm install

# Copy environment template
cp .env.example .env
```

#### Configure Backend Environment (.env file)
Edit `backend/.env` with your details:
```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nft-platform

# Blockchain Configuration
INFURA_PROJECT_ID=your_infura_project_id
PRIVATE_KEY=your_wallet_private_key
WALLET_ADDRESS=your_wallet_address

# Server Configuration
PORT=3000
NODE_ENV=development

# IPFS Configuration (using Helia)
IPFS_GATEWAY=https://ipfs.io/ipfs/

# Smart Contract Addresses (Sepolia Testnet)
MEDIA_REGISTRY_ADDRESS=0xa623Fd4E5Ac8dBA6bE35AcB83d955996f5Af0ac1
NFT_MINTING_ADDRESS=0x066DCbe3D1925E77899CA8c00075b2ec26A5B55E
LICENSE_MANAGER_ADDRESS=0x2A9296ea885e84AcCD1b3af984C433424Da02FdB
```

### Step 5: Setup Frontend
```bash
cd ../frontend

# Install frontend dependencies
npm install

# Start development server
npm start
```

### Step 6: Setup MongoDB Atlas

1. **Create MongoDB Atlas Account**: Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create New Cluster**: Choose the free tier
3. **Create Database User**: 
   - Username/Password authentication
   - Note down credentials
4. **Whitelist IP**: Add `0.0.0.0/0` for development (restrict in production)
5. **Get Connection String**: 
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### Step 7: Get Sepolia Testnet ETH

1. **Add Sepolia to MetaMask**:
   - Network Name: Sepolia Testnet
   - RPC URL: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   - Chain ID: 11155111
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.etherscan.io

2. **Get Test ETH**: Visit [Sepolia Faucet](https://sepoliafaucet.com/) and request test ETH

## 🚀 Running the Platform

### Terminal 1: Start Backend Server
```bash
cd backend
npm start
```
Backend will run on: http://localhost:3000

### Terminal 2: Start Frontend Application
```bash
cd frontend
npm start
```
Frontend will run on: http://localhost:3001

### Terminal 3: Run Integration Tests (Optional)
```bash
# From project root
node integration-test.js
```

## 🧪 Testing the Platform

### 1. Run Integration Tests
```bash
node integration-test.js
```
Should show 100% success rate.

### 2. Test Content Upload
```bash
node test-content-functionality.js
```

### 3. Manual Testing Steps

1. **Open Frontend**: Navigate to http://localhost:3001
2. **Connect Wallet**: Click "Connect Wallet" and connect MetaMask
3. **Upload Content**: 
   - Click "Upload Content"
   - Select a file
   - Add title and description
   - Click "Upload & Register"
4. **Verify Content**:
   - Go to "Content Gallery"
   - Click "Verify File" on any content
   - Upload the same file to verify
5. **View Results**: See verification results and content details

## 📁 Project Structure

```
contracts/
├── backend/                 # Backend API server
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── utils/              # Utilities (IPFS, contracts)
│   ├── server.js           # Main server file
│   └── .env                # Environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── providers/      # Web3 provider
│   │   └── styles/         # CSS styles
│   └── public/             # Static files
├── contracts/              # Smart contracts
│   ├── MediaNFTMarketplace.sol
│   ├── AdvancedLicenseManager.sol
│   ├── ContentAuthenticator.sol
│   └── MockERC20.sol
├── scripts/                # Deployment scripts
├── test/                   # Contract tests
├── integration-test.js     # Full integration tests
└── README.md              # This file
```

## 🔧 Configuration Details

### Smart Contract Addresses (Sepolia Testnet)
- **MediaRegistry**: `0xa623Fd4E5Ac8dBA6bE35AcB83d955996f5Af0ac1`
- **NFTMinting**: `0x066DCbe3D1925E77899CA8c00075b2ec26A5B55E`
- **LicenseManager**: `0x2A9296ea885e84AcCD1b3af984C433424Da02FdB`

### API Endpoints
- **Backend Health**: `GET /health`
- **Upload Content**: `POST /api/media/upload`
- **Verify Content**: `POST /api/media/verify`
- **Get Content List**: `GET /api/media`

## 🎯 Platform Features

### ✅ Core Features
- **Content Upload & Registration**: Upload files with blockchain registration
- **Content Verification**: Verify file authenticity through hash comparison
- **NFT Minting**: Create NFTs for authenticated content
- **Content Gallery**: Browse all uploaded and verified content
- **Web3 Integration**: MetaMask wallet connectivity

### 🚀 Enhanced Features (New Smart Contracts)
- **Advanced Marketplace**: Buy/sell NFTs with royalty support
- **Licensing System**: Multiple license types (Personal, Commercial, etc.)
- **Rental System**: Time-based content access
- **Payment Options**: ETH and token payments
- **Usage Reporting**: Track license usage
- **Content Authentication**: Advanced verification system

## 🔍 Troubleshooting

### Common Issues

1. **"Backend not accessible"**
   - Check if MongoDB connection string is correct
   - Ensure MongoDB Atlas IP whitelist includes your IP
   - Verify all environment variables in `.env`

2. **"Frontend compilation failed"**
   - Delete `node_modules` and run `npm install` again
   - Check Node.js version (needs v18+)

3. **"Web3 connection failed"**
   - Ensure MetaMask is installed and unlocked
   - Check if you're on Sepolia testnet
   - Verify you have test ETH

4. **"Contract interaction failed"**
   - Confirm contract addresses in backend `.env`
   - Check if wallet has enough gas
   - Verify network is Sepolia testnet

### Debug Commands
```bash
# Check backend logs
cd backend && npm start

# Check contract compilation
npx hardhat compile

# Run specific tests
npm test

# Check MongoDB connection
node backend/scripts/test-database.js
```

## 📚 Additional Resources

- **Hardhat Documentation**: https://hardhat.org/docs
- **MongoDB Atlas Guide**: https://docs.atlas.mongodb.com/
- **React Documentation**: https://react.dev/
- **MetaMask Integration**: https://docs.metamask.io/
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/

## 🆘 Support

If you encounter issues:

1. **Check Integration Tests**: Run `node integration-test.js` to verify all systems
2. **Review Logs**: Check terminal output for specific error messages
3. **Verify Configuration**: Ensure all environment variables are set correctly
4. **Test Network**: Confirm Sepolia testnet connectivity

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ Integration tests show 100% success rate
- ✅ Frontend loads without errors at http://localhost:3001
- ✅ Backend health check returns OK at http://localhost:3000/health
- ✅ You can upload files and see them in the gallery
- ✅ File verification works correctly
- ✅ MetaMask connects successfully

---

**🌟 Congratulations! Your NFT Content Authentication Platform is now running!**
