# Enhanced NFT Content Authentication Platform - Smart Contracts

## 🎯 Overview
This repository contains enhanced smart contracts for a comprehensive NFT Content Authentication Platform with advanced marketplace functionality, licensing system, and content verification.

## 📦 Smart Contracts

### 1. MediaNFTMarketplace.sol
**Advanced NFT marketplace with buy, sell, and rental functionality**

#### Key Features:
- ✅ **NFT Minting** with content hash verification
- ✅ **Marketplace** - List, buy, sell NFTs
- ✅ **Rental System** - Time-based content access
- ✅ **Royalty Distribution** - Creator royalties on secondary sales
- ✅ **License Management** - Grant usage licenses
- ✅ **Content Authentication** - Hash-based verification

#### Main Functions:
```solidity
function mintContentNFT(address to, string contentHash, string ipfsHash, string metadata, string uri, uint96 royalty)
function listForSale(uint256 tokenId, uint256 price)
function buyNFT(uint256 tokenId) payable
function grantLicense(uint256 tokenId, address licensee, LicenseType licenseType, uint256 duration, uint256 price) payable
function rentNFT(uint256 tokenId, uint256 duration) payable
```

### 2. AdvancedLicenseManager.sol
**Comprehensive licensing system with multiple license types and payment methods**

#### Key Features:
- ✅ **Multiple License Types** - Personal, Commercial, Exclusive, Educational
- ✅ **Dual Payment Methods** - ETH and ERC20 tokens
- ✅ **Time-based Licensing** - Flexible duration options
- ✅ **Usage Reporting** - Track license usage
- ✅ **Platform Fees** - Configurable fee structure
- ✅ **License Templates** - Pre-defined license structures

#### License Types:
- **Personal Use** - Non-commercial usage
- **Commercial Limited** - Basic commercial rights
- **Commercial Extended** - Full commercial rights
- **Exclusive** - Exclusive usage rights
- **Educational** - Educational institution usage
- **Non-Profit** - Non-profit organization usage

#### Main Functions:
```solidity
function purchaseLicenseETH(uint256 templateId, uint256 contentTokenId, uint256 duration, string termsHash) payable
function purchaseLicenseToken(uint256 templateId, uint256 contentTokenId, uint256 duration, string termsHash)
function extendLicense(uint256 licenseId, uint256 additionalDuration) payable
function reportUsage(uint256 licenseId, string usageDescription, string proofHash)
```

### 3. ContentAuthenticator.sol
**Advanced content authentication and verification system**

#### Key Features:
- ✅ **Content Registration** - Register content with cryptographic proof
- ✅ **Signature Verification** - Verify creator authenticity
- ✅ **Verification Workflow** - Request/approve verification process
- ✅ **Content Search** - Search by creator, type, verification status
- ✅ **Batch Operations** - Bulk verification capabilities
- ✅ **Authorized Verifiers** - Controlled verification process

#### Main Functions:
```solidity
function registerContent(string contentHash, string ipfsHash, string metadata, ContentType contentType, uint256 nftTokenId, bytes signature)
function verifyContent(string contentHash) view returns (bool exists, address creator, uint256 timestamp, bool isVerified, uint256 nftTokenId)
function requestVerification(string contentHash, string verificationData)
function completeVerification(uint256 requestId, VerificationStatus status, string verificationData)
```

### 4. MockERC20.sol
**Test token for development and testing**

#### Features:
- ✅ Standard ERC20 functionality
- ✅ Faucet function for testing
- ✅ Minting capabilities for owner

## 🚀 Deployment

### Prerequisites
```bash
npm install
```

### Compile Contracts
```bash
npx hardhat compile
```

### Run Tests
```bash
npx hardhat test
```

### Deploy to Network
```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

## 📋 Contract Interactions

### Complete Content Lifecycle Example:

1. **Register Content**
   ```javascript
   const signature = await creator.signMessage(ethers.getBytes(contentHash));
   await contentAuthenticator.registerContent(contentHash, ipfsHash, metadata, 0, 0, signature);
   ```

2. **Mint NFT**
   ```javascript
   await mediaMarketplace.mintContentNFT(creator.address, contentHash, ipfsHash, metadata, tokenURI, 500);
   ```

3. **Verify Content**
   ```javascript
   await contentAuthenticator.requestVerification(contentHash, "Verification request");
   await contentAuthenticator.completeVerification(requestId, 1, "Verified");
   ```

4. **List for Sale**
   ```javascript
   await mediaMarketplace.listForSale(tokenId, ethers.parseEther("1"));
   ```

5. **Purchase License**
   ```javascript
   await licenseManager.purchaseLicenseETH(templateId, tokenId, duration, termsHash, { value: price });
   ```

## 🔧 Gas Optimization

### Gas Usage (Approximate):
- **Content Registration**: ~353,500 gas
- **NFT Minting**: ~286,600 gas
- **License Purchase (ETH)**: ~293,900 gas
- **License Purchase (Token)**: ~368,800 gas
- **NFT Sale**: ~75,400 gas

## 🛡️ Security Features

### 1. **Access Control**
- Owner-only functions for administrative tasks
- Authorized verifier system for content verification
- Creator ownership verification

### 2. **Reentrancy Protection**
- All payable functions protected with `nonReentrant` modifier
- Safe transfer patterns

### 3. **Input Validation**
- Comprehensive input validation on all functions
- Signature verification for content registration
- Existence checks for tokens and content

### 4. **Payment Security**
- Proper ETH handling with excess refunds
- Safe ERC20 token transfers
- Platform fee distribution

## 📊 Business Logic

### Revenue Streams:
1. **Primary Sales** - Initial NFT sales
2. **Secondary Sales** - Marketplace transactions with royalties
3. **License Fees** - Content usage licensing
4. **Platform Fees** - Configurable percentage on transactions

### License Economics:
- **Personal Use**: 0.01 ETH base price
- **Commercial License**: 0.1 ETH base price  
- **Extended Commercial**: 0.5 ETH base price
- **Platform Fee**: 2.5% (configurable)

## 🔮 Future Enhancements

### Planned Features:
- **Cross-chain compatibility** with LayerZero or similar
- **Fractional ownership** for expensive content
- **DAO governance** for platform decisions
- **Advanced analytics** and reporting
- **Integration with major marketplaces** (OpenSea, etc.)
- **Mobile SDK** for easy integration

## 📝 License Templates

The system includes pre-configured license templates:

1. **Personal Use License**
   - Non-commercial usage only
   - Attribution required
   - 1-year maximum duration

2. **Commercial License** 
   - Commercial usage with attribution
   - Revenue sharing terms
   - Flexible duration

3. **Extended Commercial License**
   - Full commercial rights
   - Royalty-free usage
   - Exclusive options available

## 🧪 Testing

Comprehensive test suite covers:
- ✅ Content registration and verification
- ✅ NFT minting and marketplace operations
- ✅ License purchasing and management
- ✅ Royalty distribution
- ✅ End-to-end integration workflows

Run tests with:
```bash
npx hardhat test test/enhanced-contracts.test.js
```

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

---

**Built with ❤️ for the decentralized content economy**
