# NFT Content Authentication Platform

A blockchain-based platform for content authentication using NFTs, with smart contracts for media registration, NFT minting, and licensing management.

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

## 🎯 Next Steps (Phase 3 & 4)

1. **Backend Development**: Node.js/Express API for blockchain interaction
2. **IPFS Integration**: Decentralized file storage
3. **Frontend dApp**: React.js interface with MetaMask integration
4. **Mainnet Deployment**: Production deployment to Ethereum or Polygon

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
