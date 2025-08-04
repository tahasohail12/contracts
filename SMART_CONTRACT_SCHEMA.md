# 📋 NFT Content Authentication Platform - Smart Contract Schema

## 📖 Table of Contents
1. [Contract Overview](#contract-overview)
2. [Data Structures](#data-structures)
3. [Contract Relationships](#contract-relationships)
4. [Function Interfaces](#function-interfaces)
5. [Event Schemas](#event-schemas)
6. [Access Control Schema](#access-control-schema)
7. [State Management](#state-management)

---

## 🎯 Contract Overview

The platform consists of 7 smart contracts working together to provide comprehensive NFT marketplace and content authentication functionality:

```
┌─────────────────────────────────────────────────────────────┐
│                    Smart Contract Ecosystem                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │ Enhanced        │    │ Legacy          │                │
│  │ Contracts       │    │ Contracts       │                │
│  │                 │    │                 │                │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │                │
│  │ │MediaNFT     │ │    │ │MediaRegistry│ │                │
│  │ │Marketplace  │ │    │ │             │ │                │
│  │ └─────────────┘ │    │ └─────────────┘ │                │
│  │                 │    │                 │                │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │                │
│  │ │Advanced     │ │    │ │NFTMinting   │ │                │
│  │ │LicenseManager│ │    │ │             │ │                │
│  │ └─────────────┘ │    │ └─────────────┘ │                │
│  │                 │    │                 │                │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │                │
│  │ │Content      │ │    │ │License      │ │                │
│  │ │Authenticator│ │    │ │Manager      │ │                │
│  │ └─────────────┘ │    │ └─────────────┘ │                │
│  │                 │    │                 │                │
│  │ ┌─────────────┐ │    │                 │                │
│  │ │MockERC20    │ │    │                 │                │
│  │ │             │ │    │                 │                │
│  │ └─────────────┘ │    │                 │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Structures

### 1. MediaNFTMarketplace.sol

#### Core Structures
```solidity
struct ContentInfo {
    string contentHash;      // SHA256 hash of content
    string ipfsHash;        // IPFS storage hash  
    string metadata;        // JSON metadata
    address creator;        // Original creator
    uint256 createdAt;      // Creation timestamp
    bool isVerified;        // Verification status
}

struct ListingInfo {
    uint256 tokenId;        // NFT token ID
    address seller;         // Current seller
    uint256 price;          // Sale price in Wei
    bool isActive;          // Listing status
    uint256 listedAt;       // Listing timestamp
}

struct RentalInfo {
    uint256 tokenId;        // NFT token ID
    address renter;         // Current renter
    uint256 rentedAt;       // Rental start time
    uint256 expiresAt;      // Rental expiry time
    uint256 pricePerDay;    // Daily rental price
}

struct LicenseGrant {
    uint256 tokenId;        // NFT token ID
    address licensee;       // License holder
    LicenseType licenseType; // Type of license
    uint256 grantedAt;      // Grant timestamp
    uint256 expiresAt;      // Expiry timestamp
    uint256 price;          // License price paid
}

enum LicenseType {
    PERSONAL,              // Personal use only
    COMMERCIAL,            // Commercial use allowed
    EXCLUSIVE,             // Exclusive rights
    EDUCATIONAL,           // Educational use only
    EDITORIAL              // Editorial/news use
}
```

#### Storage Mappings
```solidity
// Core NFT data
mapping(uint256 => ContentInfo) public contentInfo;
mapping(string => uint256) public contentHashToTokenId;
mapping(uint256 => address) public tokenCreators;

// Marketplace data  
mapping(uint256 => ListingInfo) public listings;
mapping(uint256 => RentalInfo) public rentals;
mapping(uint256 => LicenseGrant[]) public licenseGrants;

// Access control
mapping(address => bool) public authorizedMinters;
mapping(uint256 => bool) public pausedTokens;

// Financial tracking
mapping(address => uint256) public creatorEarnings;
mapping(address => uint256) public platformEarnings;
```

### 2. AdvancedLicenseManager.sol

#### License Templates
```solidity
struct LicenseTemplate {
    string name;                    // Template name
    string description;             // Description
    uint256 basePriceETH;          // Base price in ETH
    uint256 basePriceToken;        // Base price in tokens
    uint256 maxDuration;           // Maximum duration (seconds)
    bool isActive;                 // Template status
    LicenseScope scope;            // Usage scope
    CommercialRights commercialRights; // Commercial permissions
}

struct License {
    uint256 licenseId;             // Unique license ID
    uint256 templateId;            // Template used
    uint256 contentTokenId;        // Associated NFT
    address licensee;              // License holder
    address licensor;              // License grantor
    uint256 startTime;             // License start
    uint256 endTime;               // License end
    uint256 pricePaid;             // Amount paid
    PaymentMethod paymentMethod;   // Payment type
    LicenseStatus status;          // Current status
    string termsHash;              // IPFS hash of terms
}

struct UsageReport {
    uint256 licenseId;             // License being reported
    address reporter;              // Who reported usage
    string usageDescription;       // Description of use
    string evidenceHash;           // IPFS hash of evidence
    uint256 reportedAt;            // Report timestamp
    bool isVerified;               // Verification status
}

enum LicenseScope {
    GLOBAL,        // Worldwide usage
    REGIONAL,      // Specific region
    LOCAL,         // Local usage only
    ONLINE,        // Online only
    PRINT,         // Print media only
    BROADCAST      // Broadcast media
}

enum CommercialRights {
    NON_COMMERCIAL,     // No commercial use
    LIMITED_COMMERCIAL, // Limited commercial use
    FULL_COMMERCIAL,    // Full commercial rights
    RESALE_RIGHTS,      // Can resell content
    DERIVATIVE_RIGHTS   // Can create derivatives
}

enum PaymentMethod {
    ETH,    // Ethereum payment
    TOKEN   // ERC20 token payment
}

enum LicenseStatus {
    ACTIVE,     // Currently active
    EXPIRED,    // Has expired
    REVOKED,    // Was revoked
    SUSPENDED   // Temporarily suspended
}
```

#### Storage Schema
```solidity
// Template management
mapping(uint256 => LicenseTemplate) public licenseTemplates;
mapping(string => uint256) public templateNameToId;
uint256 public templateCount;

// License tracking
mapping(uint256 => License) public licenses;
mapping(address => uint256[]) public userLicenses;
mapping(uint256 => uint256[]) public tokenLicenses;
uint256 public licenseCount;

// Usage reporting
mapping(uint256 => UsageReport[]) public licenseUsageReports;
mapping(address => uint256) public reporterReputationScore;

// Financial tracking
mapping(address => uint256) public licensorEarnings;
mapping(address => uint256) public platformFees;
```

### 3. ContentAuthenticator.sol

#### Content Verification
```solidity
struct ContentRegistration {
    string contentHash;         // SHA256 of content
    string ipfsHash;           // IPFS storage hash
    string metadata;           // Content metadata
    address creator;           // Original creator
    uint256 registeredAt;      // Registration time
    ContentType contentType;   // Type of content
    uint256 nftTokenId;        // Associated NFT (if any)
    bool isVerified;           // Manual verification status
    uint256 verificationCount; // Number of verifications
}

struct VerificationRequest {
    uint256 requestId;         // Unique request ID
    string contentHash;        // Content being verified
    address requester;         // Who requested verification
    string requestMessage;     // Verification request details
    uint256 requestedAt;       // Request timestamp
    VerificationStatus status; // Current status
    address assignedVerifier;  // Assigned verifier
    string verifierNotes;      // Verifier's notes
    uint256 completedAt;       // Completion timestamp
}

enum ContentType {
    IMAGE,      // Image files
    VIDEO,      // Video files  
    AUDIO,      // Audio files
    DOCUMENT,   // Document files
    CODE,       // Source code
    OTHER       // Other content types
}

enum VerificationStatus {
    PENDING,    // Awaiting verification
    VERIFIED,   // Successfully verified
    REJECTED,   // Verification failed
    DISPUTED    // Under dispute
}
```

#### Authentication Storage
```solidity
// Content registry
mapping(string => ContentRegistration) public contentRegistry;
mapping(address => string[]) public creatorContent;
mapping(uint256 => string) public nftToContentHash;

// Verification system
mapping(uint256 => VerificationRequest) public verificationRequests;
mapping(string => uint256[]) public contentVerificationRequests;
mapping(address => bool) public authorizedVerifiers;
uint256 public requestCount;

// Reputation system
mapping(address => uint256) public creatorReputation;
mapping(address => uint256) public verifierReputation;
mapping(string => address[]) public contentDisputes;
```

### 4. Legacy Contracts (Backward Compatibility)

#### MediaRegistry.sol
```solidity
struct Media {
    string hash;        // Content hash
    string metadata;    // Metadata JSON
}

mapping(uint256 => Media) public mediaRegistry;
uint256 public mediaCount;
```

#### NFTMinting.sol
```solidity
// Inherits from ERC721
mapping(uint256 => string) public tokenHashes;
mapping(string => uint256) public hashToTokenId;
uint256 public tokenCounter;
```

#### LicenseManager.sol
```solidity
mapping(uint256 => address) public licenseOwners;
mapping(uint256 => uint256) public licensePrices;
```

---

## 🔗 Contract Relationships

### Inheritance Hierarchy
```
OpenZeppelin Contracts
├── ERC721
│   ├── ERC721URIStorage
│   │   └── MediaNFTMarketplace
│   └── NFTMinting
├── ERC20
│   └── MockERC20
├── Ownable
│   ├── MediaNFTMarketplace
│   ├── AdvancedLicenseManager
│   ├── ContentAuthenticator
│   └── LicenseManager
├── ReentrancyGuard
│   ├── MediaNFTMarketplace
│   └── AdvancedLicenseManager
└── ERC2981 (Royalty Standard)
    └── MediaNFTMarketplace
```

### Inter-Contract Communication
```
┌─────────────────────────────────────────────────────────────┐
│                Contract Interaction Flow                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ContentAuthenticator ──────► MediaNFTMarketplace            │
│       │                            │                       │
│       │ (content verification)     │ (NFT minting)         │
│       │                            │                       │
│       ▼                            ▼                       │
│ AdvancedLicenseManager ◄──── MockERC20                     │
│       │                            │                       │
│       │ (token payments)           │ (payment processing)  │
│       │                            │                       │
│       ▼                            ▼                       │
│ Legacy Contracts ◄────────── Platform Treasury             │
│   • MediaRegistry                                          │
│   • NFTMinting                                             │  
│   • LicenseManager                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Function Interfaces

### MediaNFTMarketplace.sol

#### Public Functions
```solidity
// NFT Minting
function mintContentNFT(
    address to,
    string memory contentHash,
    string memory ipfsHash, 
    string memory metadata,
    string memory uri,
    uint96 royaltyFee
) external returns (uint256)

// Marketplace Operations
function listForSale(uint256 tokenId, uint256 price) external
function buyNFT(uint256 tokenId) external payable
function cancelListing(uint256 tokenId) external

// Rental System
function rentNFT(uint256 tokenId, uint256 duration) external payable
function setRentalPrice(uint256 tokenId, uint256 pricePerDay) external

// License Management
function grantLicense(
    uint256 tokenId,
    address licensee,
    LicenseType licenseType,
    uint256 duration,
    uint256 price
) external payable

// Administrative
function setRoyaltyInfo(uint256 tokenId, address receiver, uint96 feeNumerator) external
function setPlatformFee(uint256 _platformFee) external onlyOwner
function pause() external onlyOwner
function unpause() external onlyOwner
```

#### View Functions
```solidity
function getContentInfo(uint256 tokenId) external view returns (ContentInfo memory)
function getListingInfo(uint256 tokenId) external view returns (ListingInfo memory)
function getRentalInfo(uint256 tokenId) external view returns (RentalInfo memory)
function getLicenseGrants(uint256 tokenId) external view returns (LicenseGrant[] memory)
function isContentVerified(string memory contentHash) external view returns (bool)
function getCreatorEarnings(address creator) external view returns (uint256)
```

### AdvancedLicenseManager.sol

#### Template Management
```solidity
function createLicenseTemplate(
    string memory name,
    string memory description,
    uint256 basePriceETH,
    uint256 basePriceToken,
    uint256 maxDuration,
    LicenseScope scope,
    CommercialRights rights
) external onlyOwner returns (uint256)

function updateLicenseTemplate(uint256 templateId, /* template params */) external onlyOwner
function deactivateLicenseTemplate(uint256 templateId) external onlyOwner
```

#### License Operations
```solidity
function purchaseLicenseETH(
    uint256 templateId,
    uint256 contentTokenId,
    uint256 duration,
    string memory termsHash
) external payable returns (uint256)

function purchaseLicenseToken(
    uint256 templateId,
    uint256 contentTokenId, 
    uint256 duration,
    uint256 tokenAmount,
    string memory termsHash
) external returns (uint256)

function revokeLicense(uint256 licenseId, string memory reason) external
function renewLicense(uint256 licenseId, uint256 extensionDuration) external payable
```

#### Usage Reporting
```solidity
function reportUsage(
    uint256 licenseId,
    string memory usageDescription,
    string memory evidenceHash
) external

function verifyUsageReport(uint256 licenseId, uint256 reportIndex, bool isValid) external
```

### ContentAuthenticator.sol

#### Content Registration
```solidity
function registerContent(
    string memory contentHash,
    string memory ipfsHash,
    string memory metadata,
    ContentType contentType,
    uint256 nftTokenId,
    bytes memory signature
) external

function updateContentMetadata(string memory contentHash, string memory newMetadata) external
function linkContentToNFT(string memory contentHash, uint256 nftTokenId) external
```

#### Verification System
```solidity
function requestVerification(string memory contentHash, string memory message) external returns (uint256)
function assignVerifier(uint256 requestId, address verifier) external
function completeVerification(
    uint256 requestId,
    VerificationStatus status,
    string memory notes
) external

function disputeVerification(uint256 requestId, string memory reason) external
function resolveDispute(uint256 requestId, VerificationStatus finalStatus) external
```

#### Query Functions
```solidity
function verifyContent(string memory contentHash) external view returns (bool exists, address creator)
function getContentRegistration(string memory contentHash) external view returns (ContentRegistration memory)
function getVerificationRequest(uint256 requestId) external view returns (VerificationRequest memory)
function getCreatorReputation(address creator) external view returns (uint256)
```

---

## 📡 Event Schemas

### MediaNFTMarketplace Events
```solidity
event ContentNFTMinted(
    uint256 indexed tokenId,
    address indexed creator,
    string contentHash,
    string ipfsHash,
    uint256 timestamp
);

event NFTListed(
    uint256 indexed tokenId,
    address indexed seller,
    uint256 price,
    uint256 timestamp
);

event NFTSold(
    uint256 indexed tokenId,
    address indexed seller,
    address indexed buyer,
    uint256 price,
    uint256 royalty,
    uint256 timestamp
);

event NFTRented(
    uint256 indexed tokenId,
    address indexed renter,
    uint256 duration,
    uint256 price,
    uint256 timestamp
);

event LicenseGranted(
    uint256 indexed tokenId,
    address indexed licensee,
    LicenseType licenseType,
    uint256 duration,
    uint256 price,
    uint256 timestamp
);
```

### AdvancedLicenseManager Events
```solidity
event LicenseTemplateCreated(
    uint256 indexed templateId,
    string name,
    uint256 basePriceETH,
    uint256 basePriceToken,
    uint256 timestamp
);

event LicensePurchased(
    uint256 indexed licenseId,
    uint256 indexed templateId,
    uint256 indexed contentTokenId,
    address licensee,
    address licensor,
    uint256 price,
    PaymentMethod paymentMethod,
    uint256 timestamp
);

event LicenseRevoked(
    uint256 indexed licenseId,
    address revokedBy,
    string reason,
    uint256 timestamp
);

event UsageReported(
    uint256 indexed licenseId,
    address indexed reporter,
    string usageDescription,
    uint256 timestamp
);
```

### ContentAuthenticator Events
```solidity
event ContentRegistered(
    string indexed contentHash,
    address indexed creator,
    ContentType contentType,
    uint256 timestamp
);

event VerificationRequested(
    uint256 indexed requestId,
    string indexed contentHash,
    address indexed requester,
    uint256 timestamp
);

event VerificationCompleted(
    uint256 indexed requestId,
    string indexed contentHash,
    VerificationStatus status,
    address verifier,
    uint256 timestamp
);

event VerificationDisputed(
    uint256 indexed requestId,
    string indexed contentHash,
    address disputer,
    string reason,
    uint256 timestamp
);
```

---

## 🔐 Access Control Schema

### Role-Based Access Control

#### MediaNFTMarketplace.sol
```solidity
// Owner privileges
modifier onlyOwner() 
// Function examples: setPlatformFee, pause, unpause, setRoyaltyInfo

// Creator privileges  
modifier onlyCreator(uint256 tokenId)
// Function examples: setRentalPrice, updateMetadata

// Token owner privileges
modifier onlyTokenOwner(uint256 tokenId) 
// Function examples: listForSale, grantLicense

// Authorized minter privileges
modifier onlyAuthorizedMinter()
// Function examples: mintContentNFT
```

#### AdvancedLicenseManager.sol
```solidity
// Owner privileges
modifier onlyOwner()
// Function examples: createLicenseTemplate, setTreasuryWallet

// Licensor privileges
modifier onlyLicensor(uint256 licenseId)
// Function examples: revokeLicense

// License holder privileges  
modifier onlyLicensee(uint256 licenseId)
// Function examples: reportUsage, renewLicense

// Active license check
modifier onlyActiveLicense(uint256 licenseId)
// Function examples: usage reporting functions
```

#### ContentAuthenticator.sol
```solidity
// Owner privileges
modifier onlyOwner()
// Function examples: authorizeVerifier, resolveDispute

// Content creator privileges
modifier onlyContentCreator(string memory contentHash)
// Function examples: updateContentMetadata, linkContentToNFT

// Authorized verifier privileges
modifier onlyAuthorizedVerifier()
// Function examples: completeVerification

// Request owner privileges
modifier onlyRequestOwner(uint256 requestId)
// Function examples: disputeVerification
```

### Permission Matrix
```
┌─────────────────────────────────────────────────────────────┐
│                    Permission Matrix                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Role              │ Permissions                             │
├─────────────────────────────────────────────────────────────┤
│ Contract Owner    │ • Admin functions                       │
│                   │ • Emergency controls                    │
│                   │ • Fee settings                          │
│                   │ • Pause/unpause                         │
├─────────────────────────────────────────────────────────────┤
│ Content Creator   │ • Register content                      │
│                   │ • Mint NFTs                             │
│                   │ • Update metadata                       │
│                   │ • Set rental prices                     │
├─────────────────────────────────────────────────────────────┤
│ NFT Owner         │ • List for sale                         │
│                   │ • Grant licenses                        │
│                   │ • Set royalties                         │
│                   │ • Transfer tokens                       │
├─────────────────────────────────────────────────────────────┤
│ License Holder    │ • Use content per terms                 │
│                   │ • Report usage                          │
│                   │ • Renew licenses                        │
│                   │ • Dispute violations                    │
├─────────────────────────────────────────────────────────────┤
│ Verifier          │ • Verify content                        │
│                   │ • Complete verification                 │
│                   │ • Validate usage reports                │
│                   │ • Assign reputation scores              │
├─────────────────────────────────────────────────────────────┤
│ General User      │ • View public content                   │
│                   │ • Purchase NFTs                         │
│                   │ • Buy licenses                          │
│                   │ • Rent content                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏛️ State Management

### Contract State Variables

#### Global State
```solidity
// Platform configuration
uint256 public platformFee;           // Platform fee percentage (basis points)
address public treasuryWallet;        // Platform treasury address  
bool public paused;                   // Emergency pause state
uint256 public totalVolume;           // Total trading volume
uint256 public totalTransactions;     // Total transaction count

// Counters
uint256 public tokenCounter;          // NFT token counter
uint256 public licenseCounter;        // License counter  
uint256 public templateCounter;       // Template counter
uint256 public requestCounter;        // Verification request counter
```

#### Financial State
```solidity
// Revenue tracking
mapping(address => uint256) public creatorEarnings;    // Creator earnings
mapping(address => uint256) public platformEarnings;   // Platform earnings
mapping(address => uint256) public referralEarnings;   // Referral earnings

// Payment processing
mapping(uint256 => uint256) public tokenPrices;       // NFT prices
mapping(uint256 => uint256) public licenseFees;       // License fees
mapping(address => uint256) public pendingWithdrawals; // Pending withdrawals
```

#### Operational State
```solidity
// Content tracking
mapping(string => bool) public registeredContent;     // Content registration status
mapping(string => uint256) public contentToToken;     // Content to NFT mapping
mapping(uint256 => string) public tokenToContent;     // NFT to content mapping

// License tracking  
mapping(uint256 => bool) public activeLicenses;       // License status
mapping(address => uint256[]) public userLicenses;    // User's licenses
mapping(uint256 => uint256[]) public tokenLicenses;   // Token's licenses

// Verification state
mapping(string => bool) public verifiedContent;       // Verification status
mapping(address => bool) public authorizedVerifiers;  // Verifier authorization
mapping(uint256 => bool) public completedRequests;    // Request completion status
```

### State Transitions

#### NFT Lifecycle
```
1. Content Registration → 2. NFT Minting → 3. Marketplace Listing → 4. Sale/Transfer
                                    ↓
                              5. License Granting ← 6. Rental
                                    ↓
                              7. Usage Reporting → 8. Renewal/Expiry
```

#### License Lifecycle
```
1. Template Creation → 2. License Purchase → 3. Active Usage → 4. Reporting
                                     ↓
                               5. Renewal/Expiry ← 6. Revocation
```

#### Verification Lifecycle
```
1. Content Registration → 2. Verification Request → 3. Verifier Assignment
                                    ↓
                              4. Verification Process → 5. Completion/Dispute
```

---

This smart contract schema provides a comprehensive overview of the data structures, relationships, and interfaces that power the NFT Content Authentication Platform. The modular design ensures scalability and maintainability while providing robust functionality for content authentication, NFT trading, and license management.
