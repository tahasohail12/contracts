# 🔄 NFT Content Authentication Platform - Data Flow Diagram

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [User Journey Flows](#user-journey-flows)
3. [Data Processing Flows](#data-processing-flows)
4. [Integration Flows](#integration-flows)
5. [Error Handling Flows](#error-handling-flows)
6. [Security Flows](#security-flows)
7. [Business Process Flows](#business-process-flows)

---

## 🎯 System Overview

The NFT Content Authentication Platform processes data through multiple interconnected flows involving frontend, backend, blockchain, and storage systems.

### High-Level Data Flow Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    Data Flow Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    HTTP/REST    ┌─────────────┐               │
│  │   React     │◄──────────────►│   Node.js   │               │
│  │   Frontend  │    JSON Data    │   Backend   │               │
│  │             │                 │             │               │
│  │ ┌─────────┐ │                 │ ┌─────────┐ │               │
│  │ │ Web3    │ │                 │ │ Express │ │               │
│  │ │ Provider│ │                 │ │ Routes  │ │               │
│  │ └─────────┘ │                 │ └─────────┘ │               │
│  └─────────────┘                 └─────────────┘               │
│         ▲                                ▲                     │
│         │ Web3/RPC                      │ MongoDB               │
│         │ Calls                         │ Operations            │
│         ▼                                ▼                     │
│  ┌─────────────┐                 ┌─────────────┐               │
│  │  MetaMask   │                 │   MongoDB   │               │
│  │  Wallet     │                 │   Atlas     │               │
│  │             │                 │             │               │
│  │ ┌─────────┐ │                 │ ┌─────────┐ │               │
│  │ │ Private │ │                 │ │ Media   │ │               │
│  │ │ Keys    │ │                 │ │ Docs    │ │               │
│  │ └─────────┘ │                 │ └─────────┘ │               │
│  └─────────────┘                 └─────────────┘               │
│         ▲                                ▲                     │
│         │ Transactions                  │ File Storage          │
│         │ & Signatures                  │ Operations            │
│         ▼                                ▼                     │
│  ┌─────────────┐                 ┌─────────────┐               │
│  │  Ethereum   │                 │    IPFS     │               │
│  │  Blockchain │                 │   Network   │               │
│  │  (Sepolia)  │                 │             │               │
│  │ ┌─────────┐ │                 │ ┌─────────┐ │               │
│  │ │ Smart   │ │                 │ │ Content │ │               │
│  │ │Contract │ │                 │ │ Files   │ │               │
│  │ └─────────┘ │                 │ └─────────┘ │               │
│  └─────────────┘                 └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👤 User Journey Flows

### 1. Content Upload & Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                Content Upload & Authentication                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ User Action          │ System Process        │ Data Flow        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. Select File       │                      │                  │
│    ┌─────────────┐   │ File Validation      │ File Data →      │
│    │ Browse &    │   │ • Size Check (50MB)  │ Frontend         │
│    │ Select File │   │ • Type Validation    │                  │
│    └─────────────┘   │ • Malware Scan       │                  │
│                      │                      │                  │
│ 2. Upload Request    │                      │                  │
│    ┌─────────────┐   │ File Processing      │ FormData →       │
│    │ Click       │   │ • Generate SHA256    │ Backend API      │
│    │ Upload      │   │ • Extract Metadata   │ /api/media/upload│
│    └─────────────┘   │ • Duplicate Check    │                  │
│                      │                      │                  │
│ 3. IPFS Storage      │                      │                  │
│    ┌─────────────┐   │ Decentralized Store  │ Buffer Data →    │
│    │ Progress    │   │ • Upload to IPFS     │ IPFS Network     │
│    │ Indicator   │   │ • Get IPFS Hash      │ ← IPFS Hash     │
│    └─────────────┘   │ • Pin Content        │                  │
│                      │                      │                  │
│ 4. Database Save     │                      │                  │
│    ┌─────────────┐   │ Metadata Storage     │ Document →       │
│    │ Success     │   │ • Create Media Doc   │ MongoDB          │
│    │ Message     │   │ • Save Metadata      │ Collection       │
│    └─────────────┘   │ • Index for Search   │                  │
│                      │                      │                  │
│ 5. Blockchain Reg    │                      │                  │
│    ┌─────────────┐   │ Smart Contract       │ Transaction →    │
│    │ Connect     │   │ • Call registerMedia │ Ethereum         │
│    │ Wallet      │   │ • Store Hash + Meta  │ Blockchain       │
│    └─────────────┘   │ • Emit Event         │                  │
│                      │                      │                  │
│ 6. Confirmation      │                      │                  │
│    ┌─────────────┐   │ Success Response     │ JSON Response →  │
│    │ Upload      │   │ • File Hash          │ Frontend         │
│    │ Complete    │   │ • IPFS Hash          │                  │
│    └─────────────┘   │ • Transaction Hash   │                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Content Verification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Content Verification Flow                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Step │ Action               │ Data Processing    │ Result        │
├─────────────────────────────────────────────────────────────────┤
│  1   │ Upload File          │ Generate SHA256    │ File Hash     │
│      │ for Verification     │ Hash               │               │
│      │                      │                    │               │
│  2   │ Database Lookup      │ Query MongoDB:     │ Match Status  │
│      │                      │ db.media.findOne   │ • Found       │
│      │                      │ ({hash: fileHash}) │ • Not Found   │
│      │                      │                    │               │
│  3   │ Blockchain Check     │ Call Smart Contract│ Verification  │
│      │                      │ MediaRegistry:     │ Result        │
│      │                      │ verifyMedia(hash)  │               │
│      │                      │                    │               │
│  4   │ IPFS Verification    │ Retrieve from IPFS │ Content Match │
│      │                      │ Compare Hashes     │ • Authentic   │
│      │                      │                    │ • Modified    │
│      │                      │                    │               │
│  5   │ Generate Report      │ Compile Results:   │ Verification  │
│      │                      │ • DB Status        │ Certificate   │
│      │                      │ • Blockchain Status│               │
│      │                      │ • IPFS Status      │               │
│      │                      │ • Metadata         │               │
└─────────────────────────────────────────────────────────────────┘
```

### 3. NFT Minting Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        NFT Minting Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Frontend            │ Backend              │ Blockchain          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. Mint Request     │                     │                     │
│ ┌─────────────────┐ │ Validation          │                     │
│ │ Click "Mint     │ │ • User Auth         │                     │
│ │ NFT" Button     │ │ • Content Exists    │                     │
│ └─────────────────┘ │ • Not Already Minted│                     │
│         │           │                     │                     │
│         ▼           │                     │                     │
│ 2. MetaMask Popup   │                     │                     │
│ ┌─────────────────┐ │ Smart Contract Call │ Contract Execution  │
│ │ Confirm         │ │ mintContentNFT()    │ • Verify Content    │
│ │ Transaction     │ │                     │ • Mint ERC721       │
│ └─────────────────┘ │                     │ • Set Royalties     │
│         │           │                     │ • Emit Event        │
│         ▼           │                     │                     │
│ 3. Transaction      │                     │                     │
│ ┌─────────────────┐ │ Update Database     │ Event Listening     │
│ │ Pending...      │ │ • Set nftTokenId    │ • ContentNFTMinted  │
│ │ Mining          │ │ • Update Status     │ • Update Frontend   │
│ └─────────────────┘ │                     │                     │
│         │           │                     │                     │
│         ▼           │                     │                     │
│ 4. Success          │                     │                     │
│ ┌─────────────────┐ │ Response            │ Transaction Receipt │
│ │ NFT Minted      │ │ • Token ID          │ • Gas Used          │
│ │ Successfully    │ │ • Transaction Hash  │ • Block Number      │
│ └─────────────────┘ │ • NFT URL           │ • Event Logs        │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Marketplace Transaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  Marketplace Transaction Flow                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Seller Actions      │ System Processing   │ Buyer Actions       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. List NFT         │                    │                     │
│ ┌─────────────────┐ │ Validation         │                     │
│ │ Set Price &     │ │ • Owner Check      │                     │
│ │ List for Sale   │ │ • Not Listed       │                     │
│ └─────────────────┘ │ • Price > 0        │                     │
│         │           │                    │                     │
│         ▼           │                    │                     │
│ 2. Marketplace      │ Database Update    │ 3. Browse Market    │
│ ┌─────────────────┐ │ • listings table   │ ┌─────────────────┐ │
│ │ NFT Listed      │ │ • status: active   │ │ View Available  │ │
│ │ Publicly        │ │ • indexed search   │ │ NFTs            │ │
│ └─────────────────┘ │                    │ └─────────────────┘ │
│                     │                    │         │           │
│                     │                    │         ▼           │
│                     │ Smart Contract     │ 4. Purchase NFT     │
│                     │ • Transfer NFT     │ ┌─────────────────┐ │
│                     │ • Process Payment  │ │ Connect Wallet  │ │
│                     │ • Calculate Fees   │ │ & Buy NFT       │ │
│                     │ • Distribute Funds │ └─────────────────┘ │
│                     │                    │         │           │
│                     │                    │         ▼           │
│ 5. Payment Received │ Payment Distribution│ 5. NFT Received    │
│ ┌─────────────────┐ │ • Seller: 95%      │ ┌─────────────────┐ │
│ │ Funds in        │ │ • Creator: 2.5%    │ │ NFT in Wallet   │ │
│ │ Wallet          │ │ • Platform: 2.5%   │ │ Ownership       │ │
│ └─────────────────┘ │                    │ └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Processing Flows

### 1. File Processing Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                     File Processing Pipeline                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Input: File Upload                                              │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 1. File         │ • Validate file size (< 50MB)              │
│ │    Validation   │ • Check MIME type                           │
│ │                 │ • Scan for malware                          │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 2. Hash         │ • Generate SHA256 hash                      │
│ │    Generation   │ • Create unique identifier                  │
│ │                 │ • Check for duplicates                      │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 3. Metadata     │ • Extract file properties                   │
│ │    Extraction   │ • Generate thumbnails (images)              │
│ │                 │ • Extract EXIF data                         │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 4. IPFS         │ • Upload to IPFS network                    │
│ │    Storage      │ • Pin content for permanence                │
│ │                 │ • Get IPFS hash (CID)                       │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 5. Database     │ • Create Media document                     │
│ │    Storage      │ • Store metadata                            │
│ │                 │ • Create search indexes                     │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 6. Blockchain   │ • Call registerMedia()                      │
│ │    Registration │ • Store hash & metadata                     │
│ │                 │ • Emit ContentRegistered event              │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ Output: Registered Content                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 2. License Management Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 License Management Data Flow                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ License Purchase Request                                        │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 1. Template     │ Input: templateId, duration, terms         │
│ │    Validation   │ • Check template exists & active            │
│ │                 │ • Validate duration limits                  │
│ │                 │ • Calculate price                           │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 2. Payment      │ Payment Method: ETH or Token               │
│ │    Processing   │ • Validate payment amount                   │
│ │                 │ • Process payment                           │
│ │                 │ • Calculate fees                            │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 3. License      │ • Generate unique license ID                │
│ │    Creation     │ • Set start/end times                       │
│ │                 │ • Store license terms                       │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 4. Database     │ • Save license record                       │
│ │    Update       │ • Update user licenses                      │
│ │                 │ • Update token licenses                     │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 5. Event        │ • Emit LicensePurchased event               │
│ │    Emission     │ • Update frontend                           │
│ │                 │ • Send notifications                        │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ Output: Active License                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Search & Discovery Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   Search & Discovery Flow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ User Search Query                                               │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 1. Query        │ • Parse search terms                        │
│ │    Processing   │ • Apply filters                             │
│ │                 │ • Validate parameters                       │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 2. Database     │ MongoDB Aggregation Pipeline:               │
│ │    Search       │ • Text search on indexed fields             │
│ │                 │ • Filter by category/type                   │
│ │                 │ • Sort by relevance/date                    │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 3. Result       │ • Apply pagination                          │
│ │    Processing   │ • Enrich with metadata                      │
│ │                 │ • Calculate relevance scores                │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 4. Response     │ • Format results                            │
│ │    Formatting   │ • Include pagination info                   │
│ │                 │ • Add metadata                              │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ ┌─────────────────┐                                             │
│ │ 5. Frontend     │ • Render search results                     │
│ │    Display      │ • Show thumbnails                           │
│ │                 │ • Enable further filtering                  │
│ └─────────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│ Output: Search Results                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Integration Flows

### 1. Frontend-Backend Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                Frontend-Backend Integration                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ React Frontend     │ HTTP/REST API      │ Node.js Backend       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. User Action     │                   │                       │
│ ┌─────────────────┐│ POST /api/media/  │ ┌─────────────────┐   │
│ │ Upload File     │├──upload──────────►│ │ Receive Request │   │
│ │ Form Submit     ││ FormData          │ │ Validate Input  │   │
│ └─────────────────┘│                   │ └─────────────────┘   │
│                    │                   │         │             │
│ 2. Request Process │                   │         ▼             │
│ ┌─────────────────┐│                   │ ┌─────────────────┐   │
│ │ Loading State   ││                   │ │ Process File    │   │
│ │ Progress Bar    ││                   │ │ Generate Hash   │   │
│ └─────────────────┘│                   │ │ Upload to IPFS  │   │
│                    │                   │ └─────────────────┘   │
│                    │                   │         │             │
│ 3. Response        │ HTTP 200          │         ▼             │
│ ┌─────────────────┐│ JSON Response     │ ┌─────────────────┐   │
│ │ Success Message │◄──────────────────├ │ Return Results  │   │
│ │ Update UI       ││ {hash, ipfsHash,  │ │ Success/Error   │   │
│ └─────────────────┘│  txHash}          │ └─────────────────┘   │
│                                                                 │
│ Error Handling:                                                 │
│ ┌─────────────────┐│ HTTP 4xx/5xx     │ ┌─────────────────┐   │
│ │ Error Display   │◄──────────────────├ │ Error Response  │   │
│ │ Retry Option    ││ {error, details}  │ │ Log Error       │   │
│ └─────────────────┘│                   │ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Backend-Blockchain Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                Backend-Blockchain Integration                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Node.js Backend    │ Web3/ethers.js     │ Ethereum Blockchain   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. Contract Setup  │                   │                       │
│ ┌─────────────────┐│ Provider Setup    │ ┌─────────────────┐   │
│ │ Load Contract   │├──Infura RPC─────►│ │ Sepolia Network │   │
│ │ ABI & Address   ││ Connection        │ │ Smart Contracts │   │
│ └─────────────────┘│                   │ └─────────────────┘   │
│                    │                   │                       │
│ 2. Transaction     │                   │                       │
│ ┌─────────────────┐│ Contract Call     │ ┌─────────────────┐   │
│ │ Call Smart      │├──Function────────►│ │ Execute Function│   │
│ │ Contract Method ││ registerMedia()   │ │ State Change    │   │
│ └─────────────────┘│                   │ └─────────────────┘   │
│                    │                   │         │             │
│ 3. Event Handling  │                   │         ▼             │
│ ┌─────────────────┐│ Event Logs        │ ┌─────────────────┐   │
│ │ Listen for      │◄──Events──────────├ │ Emit Events     │   │
│ │ Contract Events ││ ContentRegistered │ │ Update State    │   │
│ └─────────────────┘│                   │ └─────────────────┘   │
│         │          │                   │                       │
│         ▼          │                   │                       │
│ 4. Database Update │                   │                       │
│ ┌─────────────────┐│                   │                       │
│ │ Update MongoDB  │                   │                       │
│ │ with TX Hash    │                   │                       │
│ └─────────────────┘│                   │                       │
└─────────────────────────────────────────────────────────────────┘
```

### 3. IPFS Storage Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                   IPFS Storage Integration                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Backend API        │ IPFS Client        │ IPFS Network          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. File Upload     │                   │                       │
│ ┌─────────────────┐│ Buffer Data       │ ┌─────────────────┐   │
│ │ Receive File    │├──add()───────────►│ │ Store Content   │   │
│ │ Buffer          ││ Upload Request    │ │ Generate CID    │   │
│ └─────────────────┘│                   │ └─────────────────┘   │
│                    │                   │         │             │
│ 2. Hash Return     │                   │         ▼             │
│ ┌─────────────────┐│ IPFS Hash (CID)   │ ┌─────────────────┐   │
│ │ Store IPFS      │◄──Response────────├ │ Return Hash     │   │
│ │ Hash in DB      ││                   │ │ Pin Content     │   │
│ └─────────────────┘│                   │ └─────────────────┘   │
│                    │                   │                       │
│ 3. Content Access │                   │                       │
│ ┌─────────────────┐│ Get Request       │ ┌─────────────────┐   │
│ │ Retrieve File   │├──cat()───────────►│ │ Serve Content   │   │
│ │ by Hash         ││ Download          │ │ From Network    │   │
│ └─────────────────┘│                   │ └─────────────────┘   │
│         │          │                   │         │             │
│         ▼          │                   │         ▼             │
│ 4. Content Serve  │ File Stream       │                       │
│ ┌─────────────────┐│                   │                       │
│ │ Stream to       │                   │                       │
│ │ Frontend        │                   │                       │
│ └─────────────────┘│                   │                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## ❌ Error Handling Flows

### 1. Upload Error Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                    Upload Error Handling                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Error Type         │ Detection           │ Recovery Action      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ File Too Large     │ Frontend/Backend    │ ┌─────────────────┐  │
│ (> 50MB)          │ Size Check          │ │ Show Error Msg  │  │
│                   │                     │ │ Suggest Compress│  │
│                   │                     │ └─────────────────┘  │
│                                                                 │
│ Invalid File Type  │ MIME Type           │ ┌─────────────────┐  │
│                   │ Validation          │ │ List Valid Types│  │
│                   │                     │ │ Allow Retry     │  │
│                   │                     │ └─────────────────┘  │
│                                                                 │
│ IPFS Upload Fail   │ Network Timeout     │ ┌─────────────────┐  │
│                   │ Connection Error    │ │ Retry with      │  │
│                   │                     │ │ Different Node  │  │
│                   │                     │ └─────────────────┘  │
│                                                                 │
│ Database Error     │ MongoDB Exception   │ ┌─────────────────┐  │
│                   │ Connection Lost     │ │ Rollback Changes│  │
│                   │                     │ │ Retry Operation │  │
│                   │                     │ └─────────────────┘  │
│                                                                 │
│ Blockchain Error   │ Transaction Fail    │ ┌─────────────────┐  │
│                   │ Gas Estimation      │ │ Adjust Gas      │  │
│                   │                     │ │ Retry TX        │  │
│                   │                     │ └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Transaction Error Recovery

```
┌─────────────────────────────────────────────────────────────────┐
│                Transaction Error Recovery                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Error Scenario            │ Recovery Strategy                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. Insufficient Gas       │ ┌─────────────────────────────────┐ │
│    ┌─────────────────┐    │ │ • Estimate gas properly         │ │
│    │ Transaction     │    │ │ • Add 20% buffer               │ │
│    │ Reverted        │    │ │ • Suggest gas price increase   │ │
│    └─────────────────┘    │ └─────────────────────────────────┘ │
│                                                                 │
│ 2. Nonce Too Low         │ ┌─────────────────────────────────┐ │
│    ┌─────────────────┐    │ │ • Get latest nonce              │ │
│    │ Nonce Error     │    │ │ • Increment and retry           │ │
│    └─────────────────┘    │ │ • Clear pending transactions    │ │
│                           │ └─────────────────────────────────┘ │
│                                                                 │
│ 3. Network Congestion    │ ┌─────────────────────────────────┐ │
│    ┌─────────────────┐    │ │ • Increase gas price           │ │
│    │ Timeout Error   │    │ │ • Retry with higher priority   │ │
│    └─────────────────┘    │ │ • Queue for later processing   │ │
│                           │ └─────────────────────────────────┘ │
│                                                                 │
│ 4. Contract Revert       │ ┌─────────────────────────────────┐ │
│    ┌─────────────────┐    │ │ • Parse revert reason          │ │
│    │ Smart Contract  │    │ │ • Show user-friendly message   │ │
│    │ Error           │    │ │ • Suggest corrective action    │ │
│    └─────────────────┘    │ └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Flows

### 1. Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Authentication Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. Wallet Connection                                            │
│    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│    │ User Clicks │ →  │ MetaMask    │ →  │ Address     │       │
│    │ "Connect"   │    │ Permission  │    │ Retrieved   │       │
│    └─────────────┘    └─────────────┘    └─────────────┘       │
│                                                                 │
│ 2. Message Signing                                              │
│    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│    │ Generate    │ →  │ User Signs  │ →  │ Signature   │       │
│    │ Challenge   │    │ Message     │    │ Verified    │       │
│    └─────────────┘    └─────────────┘    └─────────────┘       │
│                                                                 │
│ 3. Session Creation                                             │
│    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│    │ Create JWT  │ →  │ Store in    │ →  │ Authorized  │       │
│    │ Token       │    │ Local Store │    │ Requests    │       │
│    └─────────────┘    └─────────────┘    └─────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Authorization Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Request → Middleware → Validation → Action                      │
│                                                                 │
│ 1. API Request                                                  │
│    ┌─────────────────┐                                          │
│    │ HTTP Request    │ Headers: Authorization: Bearer <token>   │
│    │ with JWT Token  │                                          │
│    └─────────────────┘                                          │
│            │                                                    │
│            ▼                                                    │
│ 2. Token Validation                                             │
│    ┌─────────────────┐                                          │
│    │ Verify JWT      │ • Check signature                        │
│    │ Signature       │ • Validate expiry                        │
│    │                 │ • Extract wallet address                 │
│    └─────────────────┘                                          │
│            │                                                    │
│            ▼                                                    │
│ 3. Permission Check                                             │
│    ┌─────────────────┐                                          │
│    │ Verify User     │ • Check ownership                        │
│    │ Permissions     │ • Validate action rights                 │
│    │                 │ • Apply role restrictions                │
│    └─────────────────┘                                          │
│            │                                                    │
│            ▼                                                    │
│ 4. Execute Action                                               │
│    ┌─────────────────┐                                          │
│    │ Process Request │ • Perform operation                      │
│    │ Return Response │ • Log action                             │
│    └─────────────────┘                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💼 Business Process Flows

### 1. Creator Revenue Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Creator Revenue Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Revenue Source    │ Distribution        │ Payment Process       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. NFT Sale       │ Sale Price: 1 ETH   │ ┌─────────────────┐   │
│ ┌─────────────┐   │ ├─Creator: 0.95 ETH │ │ Smart Contract  │   │
│ │ Marketplace │   │ ├─Platform: 0.05ETH │ │ Automatic Split │   │
│ │ Transaction │   │ └─Gas: ~0.01 ETH    │ └─────────────────┘   │
│ └─────────────┘   │                     │                       │
│                                                                 │
│ 2. Royalty Sale   │ Secondary Sale      │ ┌─────────────────┐   │
│ ┌─────────────┐   │ ├─Seller: 0.925 ETH │ │ ERC2981 Standard│   │
│ │ Secondary   │   │ ├─Creator: 0.025ETH │ │ Royalty Payment │   │
│ │ Market Sale │   │ ├─Platform: 0.05ETH │ └─────────────────┘   │
│ └─────────────┘   │ └─Gas: ~0.01 ETH    │                       │
│                                                                 │
│ 3. License Sale   │ License Fee         │ ┌─────────────────┐   │
│ ┌─────────────┐   │ ├─Creator: 0.80 ETH │ │ License Manager │   │
│ │ Commercial  │   │ ├─Platform: 0.20ETH │ │ Revenue Split   │   │
│ │ License     │   │ └─Gas: ~0.005 ETH   │ └─────────────────┘   │
│ └─────────────┘   │                     │                       │
│                                                                 │
│ 4. Rental Income  │ Rental Fee          │ ┌─────────────────┐   │
│ ┌─────────────┐   │ ├─Creator: 0.85 ETH │ │ Time-based      │   │
│ │ Content     │   │ ├─Platform: 0.15ETH │ │ Access Control  │   │
│ │ Rental      │   │ └─Gas: ~0.003 ETH   │ └─────────────────┘   │
│ └─────────────┘   │                     │                       │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Platform Growth Metrics Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                Platform Growth Metrics Flow                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Data Collection → Processing → Analysis → Insights              │
│                                                                 │
│ 1. User Actions                                                 │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│ │ • Upload File   │ │ • Page Views    │ │ • Wallet        │    │
│ │ • Mint NFT      │ │ • Time on Site  │ │   Connections   │    │
│ │ • Buy/Sell      │ │ • Click Events  │ │ • Transaction   │    │
│ │ • License       │ │ • Search Terms  │ │   Signatures    │    │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                 │
│ 2. Data Aggregation                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│ │ MongoDB         │ │ Blockchain      │ │ Application     │    │
│ │ Analytics       │ │ Events          │ │ Insights        │    │
│ │ • User behavior │ │ • Transactions  │ │ • Performance   │    │
│ │ • Content stats │ │ • Contract calls│ │ • Error rates   │    │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                 │
│ 3. Key Metrics                                                  │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│ │ Growth Metrics  │ │ Revenue Metrics │ │ Usage Metrics   │    │
│ │ • DAU/MAU       │ │ • Total Volume  │ │ • Upload Rate   │    │
│ │ • User Retention│ │ • Platform Fees │ │ • Verification  │    │
│ │ • Creator Count │ │ • Creator Earn  │ │ • License Sales │    │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                 │
│ 4. Business Intelligence                                        │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│ │ Dashboards      │ │ Alerts          │ │ Optimization    │    │
│ │ • Real-time     │ │ • Anomaly       │ │ • A/B Testing   │    │
│ │ • Historical    │ │   Detection     │ │ • Feature Flags │    │
│ │ • Predictive    │ │ • Threshold     │ │ • Performance   │    │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

This comprehensive data flow diagram provides detailed visibility into how information moves through the NFT Content Authentication Platform, from user interactions to blockchain transactions, enabling better understanding of system behavior and optimization opportunities.
