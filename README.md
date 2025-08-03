# 🎨 NFT Content Authentication Platform

A complete decentralized platform for content authentication, NFT minting, and licensing built with React, Node.js, and Ethereum smart contracts.

## ✨ Features

- **🔐 Content Authentication**: Upload and verify file authenticity using blockchain
- **🎭 NFT Minting**: Create NFTs for authenticated content with royalty support
- **🏪 Marketplace**: Buy, sell, and rent NFTs with advanced licensing
- **📄 Licensing System**: Multiple license types (Personal, Commercial, Exclusive)
- **💰 Payment Options**: Support for ETH and token payments
- **📱 Web3 Integration**: MetaMask wallet connectivity
- **☁️ IPFS Storage**: Decentralized file storage
- **🧪 100% Test Coverage**: Comprehensive integration tests

## 🚀 Quick Start

### Automated Setup (Recommended)

**Windows:**
```cmd
quick-setup.bat
```

**Linux/Mac:**
```bash
chmod +x quick-setup.sh && ./quick-setup.sh
```

### Manual Setup
```bash
# 1. Install dependencies
npm run setup

# 2. Compile contracts
npm run compile

# 3. Configure backend/.env (see SETUP_GUIDE.md)

# 4. Start platform
npm run start:dev
```

**Access at:** http://localhost:3001

## 📚 Documentation

- **📖 [Complete Setup Guide](SETUP_GUIDE.md)** - Detailed installation instructions
- **⚡ [Quick Start Commands](QUICK_START.md)** - Essential commands reference
- **🧪 [Testing Guide](test/README.md)** - How to run and write tests

## 🏗️ Architecture

```
├── 🎨 Frontend (React + TypeScript)
├── 🔧 Backend (Node.js + Express + MongoDB)
├── 🔗 Smart Contracts (Solidity + Hardhat)
├── 📦 IPFS (Decentralized Storage)
└── 🌐 Sepolia Testnet (Ethereum)
```

## 🧪 Testing

```bash
# Integration tests (backend + frontend + blockchain)
npm run test:integration

# Content functionality tests
npm run test:content

# Smart contract tests
npm test

# All verification tests
npm run verify
```

## 🌟 Live Demo

**Deployed Contracts (Sepolia Testnet):**
- MediaRegistry: `0xa623Fd4E5Ac8dBA6bE35AcB83d955996f5Af0ac1`
- NFTMinting: `0x066DCbe3D1925E77899CA8c00075b2ec26A5B55E`
- LicenseManager: `0x2A9296ea885e84AcCD1b3af984C433424Da02FdB`

## 🛠️ Tech Stack

**Frontend:**
- React 19.1.1 + TypeScript
- Custom CSS (no frameworks)
- Web3 Integration (ethers.js)
- MetaMask Connectivity

**Backend:**
- Node.js + Express.js
- MongoDB Atlas
- IPFS (Helia)
- Blockchain Integration

**Smart Contracts:**
- Solidity ^0.8.20
- OpenZeppelin Libraries
- Hardhat Framework
- ERC721 NFT Standard

## 📊 Project Status

- ✅ **Backend API**: Fully operational
- ✅ **Frontend UI**: Complete with file upload/verification
- ✅ **Smart Contracts**: Deployed and tested
- ✅ **IPFS Integration**: Working file storage
- ✅ **Web3 Integration**: MetaMask connectivity
- ✅ **Testing Suite**: 100% pass rate
- ✅ **Documentation**: Complete setup guides

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

Having issues? Check the troubleshooting sections in:
- [Setup Guide](SETUP_GUIDE.md#-troubleshooting)
- [Quick Start](QUICK_START.md#-quick-troubleshooting)

Or run the integration tests: `npm run test:integration`

---

**🌟 Star this repository if you find it helpful!**

## 🚀 Features

- **Media Registration**: Register content with cryptographic hashes and metadata
- **NFT Minting**: Create ERC-721 NFTs for content ownership tracking
- **License Management**: Buy, transfer, and manage content licenses
- **Testnet Deployment**: Deployed on Ethereum Sepolia testnet

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet with Sepolia ETH
- Infura project ID for Sepolia network access

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd contracts
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
   - Update `hardhat.config.js` with your Infura project ID
   - Add your private key to the configuration

## 📝 Smart Contracts

### MediaRegistry.sol
- **Purpose**: Stores content hashes and metadata
- **Functions**:
  - `registerMedia(hash, metadata)`: Register new content
- **Deployed**: `0xa623Fd4E5Ac8dBA6bE35AcB83d955996f5Af0ac1`

### NFTMinting.sol
- **Purpose**: ERC-721 NFT creation for content ownership
- **Functions**:
  - `mintNFT(address)`: Mint NFT to specified address
- **Deployed**: `0x066DCbe3D1925E77899CA8c00075b2ec26A5B55E`

### LicenseManager.sol
- **Purpose**: Manage content licensing and transfers
- **Functions**:
  - `buyLicense(mediaId)`: Purchase license for content
  - `transferLicense(mediaId, address)`: Transfer license ownership
- **Deployed**: `0x2A9296ea885e84AcCD1b3af984C433424Da02FdB`

## 🧪 Testing

Run the test suite:
```bash
npx hardhat test
```

Current test coverage: **7 tests passing** with comprehensive coverage of all contract functions.

## 📊 Gas Optimization Report

| Contract | Method | Gas Usage | Optimization |
|----------|--------|-----------|--------------|
| MediaRegistry | registerMedia | 90,487 | ✅ Optimized |
| NFTMinting | mintNFT | 95,851 | ✅ Optimized |
| LicenseManager | buyLicense | 43,812 | ✅ Optimized |
| LicenseManager | transferLicense | 27,227 | ✅ Optimized |

## 🚀 Deployment

Deploy to Sepolia testnet:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## 🔧 Development

### Compile contracts:
```bash
npx hardhat compile
```

### Run tests with gas reporting:
```bash
npx hardhat test
```

### Clean build artifacts:
```bash
npx hardhat clean
```

## 🌐 Network Configuration

### Sepolia Testnet
- **RPC URL**: `https://sepolia.infura.io/v3/f30bff13a25c46cb8ab16fc33df75aa4`
- **Chain ID**: 11155111
- **Currency**: SepoliaETH (testnet)

## 📖 Usage Examples

### Register Content
```javascript
const mediaRegistry = await ethers.getContractAt("MediaRegistry", "0xa623Fd4E5Ac8dBA6bE35AcB83d955996f5Af0ac1");
await mediaRegistry.registerMedia("0x123...", "metadata-json");
```

### Mint NFT
```javascript
const nftMinting = await ethers.getContractAt("NFTMinting", "0x066DCbe3D1925E77899CA8c00075b2ec26A5B55E");
await nftMinting.mintNFT("0x742d35Cc6639C0532fEb09567e1B4769f1990A4d");
```

### Buy License
```javascript
const licenseManager = await ethers.getContractAt("LicenseManager", "0x2A9296ea885e84AcCD1b3af984C433424Da02FdB");
await licenseManager.buyLicense(1, { value: ethers.parseEther("0.1") });
```

## 🔒 Security

- All contracts use OpenZeppelin's battle-tested implementations
- Access control implemented with Ownable pattern
- Comprehensive test coverage for security-critical functions

## 🎯 Project Status

### ✅ **Phase 1: Planning & Architecture** - COMPLETE
- Project requirements and technical specifications defined
- Smart contract architecture designed
- Development roadmap established

### ✅ **Phase 2: Blockchain & Smart Contract Development (3-4 weeks)** - COMPLETE
- 3 Smart contracts deployed on Sepolia testnet
- Comprehensive testing suite (7 tests passing)
- Gas optimization completed
- All contracts verified and accessible

### ✅ **Phase 3: Backend & Storage Integration (3 weeks)** - COMPLETE
- Node.js/Express API server operational
- MongoDB database configured and connected
- IPFS integration with Helia client
- Comprehensive testing suite (3/3 systems operational)
- All API endpoints ready for frontend integration

### 🚧 **Phase 4: Frontend Development (3-4 weeks)** - IN PROGRESS
- React.js application with modern UI/UX
- MetaMask wallet integration
- File upload and content management interface
- NFT minting and verification workflows
- Content gallery and license management

### 📋 **Phase 5: Deployment & Production (1-2 weeks)** - PENDING
- Production deployment to Ethereum or Polygon
- Frontend hosting and optimization
- Final testing and security audits

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For questions and support, please open an issue in the repository.
