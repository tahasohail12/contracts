require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const { ethers } = require('ethers');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration for Production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = process.env.NODE_ENV === 'production' 
            ? [
                process.env.FRONTEND_URL,
                ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
              ]
            : ['http://localhost:3001', 'http://localhost:3000'];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nft-content-auth', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Database Models
const MediaSchema = new mongoose.Schema({
    hash: { type: String, required: true, unique: true },
    originalName: String,
    mimeType: String,
    size: Number,
    ipfsHash: String,
    metadata: Object,
    nftTokenId: Number,
    owner: String,
    createdAt: { type: Date, default: Date.now }
});

const Media = mongoose.model('Media', MediaSchema);

// Blockchain configuration
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/f30bff13a25c46cb8ab16fc33df75aa4');
const wallet = new ethers.Wallet('f794863ff16cba3b7d8bc489c5e599547ddd016602ce4db535d961b6ea4282cb', provider);

// Smart contract addresses and ABIs
const MEDIA_REGISTRY_ADDRESS = '0xa623Fd4E5Ac8dBA6bE35AcB83d955996f5Af0ac1';
const NFT_MINTING_ADDRESS = '0x066DCbe3D1925E77899CA8c00075b2ec26A5B55E';
const LICENSE_MANAGER_ADDRESS = '0x2A9296ea885e84AcCD1b3af984C433424Da02FdB';

// Contract ABIs (simplified for demo)
const MEDIA_REGISTRY_ABI = [
    "function registerMedia(string memory _hash, string memory _metadata) public",
    "function mediaRegistry(uint256) public view returns (string memory hash, string memory metadata)",
    "function mediaCount() public view returns (uint256)"
];

const NFT_MINTING_ABI = [
    "function mintNFT(address to) public",
    "function tokenIdCounter() public view returns (uint256)",
    "function ownerOf(uint256 tokenId) public view returns (address)"
];

const LICENSE_MANAGER_ABI = [
    "function buyLicense(uint256 _mediaId) public payable",
    "function transferLicense(uint256 _mediaId, address _to) public",
    "function licenseOwners(uint256) public view returns (address)"
];

// Contract instances
const mediaRegistryContract = new ethers.Contract(MEDIA_REGISTRY_ADDRESS, MEDIA_REGISTRY_ABI, wallet);
const nftMintingContract = new ethers.Contract(NFT_MINTING_ADDRESS, NFT_MINTING_ABI, wallet);
const licenseManagerContract = new ethers.Contract(LICENSE_MANAGER_ADDRESS, LICENSE_MANAGER_ABI, wallet);

// IPFS configuration using dynamic imports
let helia;
let fs;

async function initIPFS() {
    try {
        // Dynamic import for ES modules
        const { createHelia } = await import('helia');
        const { unixfs } = await import('@helia/unixfs');
        
        helia = await createHelia();
        fs = unixfs(helia);
        console.log('IPFS (Helia) initialized successfully');
    } catch (error) {
        console.error('Failed to initialize IPFS:', error);
    }
}

// Utility functions
function generateFileHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function uploadToIPFS(buffer) {
    try {
        if (!fs) {
            throw new Error('IPFS not initialized');
        }
        const cid = await fs.addBytes(buffer);
        return cid.toString();
    } catch (error) {
        console.error('IPFS upload error:', error);
        throw error;
    }
}

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Upload and register media
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { buffer, originalname, mimetype, size } = req.file;
        const fileHash = generateFileHash(buffer);

        // Check if file already exists
        const existingMedia = await Media.findOne({ hash: fileHash });
        if (existingMedia) {
            return res.status(409).json({ 
                error: 'File already exists',
                data: existingMedia 
            });
        }

        // Upload to IPFS
        let ipfsHash;
        try {
            ipfsHash = await uploadToIPFS(buffer);
        } catch (ipfsError) {
            console.warn('IPFS upload failed, proceeding without IPFS:', ipfsError);
            ipfsHash = null;
        }

        // Create metadata
        const metadata = {
            name: originalname,
            description: req.body.description || '',
            mimeType: mimetype,
            size: size,
            uploadedAt: new Date().toISOString(),
            ipfsHash: ipfsHash
        };

        // Register on blockchain
        const tx = await mediaRegistryContract.registerMedia(fileHash, JSON.stringify(metadata));
        await tx.wait();

        // Save to database
        const mediaRecord = new Media({
            hash: fileHash,
            originalName: originalname,
            mimeType: mimetype,
            size: size,
            ipfsHash: ipfsHash,
            metadata: metadata,
            owner: wallet.address
        });

        await mediaRecord.save();

        res.json({
            success: true,
            data: {
                hash: fileHash,
                ipfsHash: ipfsHash,
                txHash: tx.hash,
                metadata: metadata
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

// Verify media authenticity
app.post('/api/verify', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded for verification' });
        }

        const fileHash = generateFileHash(req.file.buffer);
        
        // Check in database
        const mediaRecord = await Media.findOne({ hash: fileHash });
        
        if (!mediaRecord) {
            return res.json({
                verified: false,
                message: 'File not found in registry'
            });
        }

        // Verify on blockchain
        try {
            const mediaCount = await mediaRegistryContract.mediaCount();
            let found = false;
            
            for (let i = 0; i < mediaCount; i++) {
                const media = await mediaRegistryContract.mediaRegistry(i);
                if (media.hash === fileHash) {
                    found = true;
                    break;
                }
            }

            res.json({
                verified: found,
                data: found ? mediaRecord : null,
                blockchain_verified: found
            });

        } catch (blockchainError) {
            res.json({
                verified: true,
                data: mediaRecord,
                blockchain_verified: false,
                note: 'Database verified, blockchain verification failed'
            });
        }

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Verification failed', details: error.message });
    }
});

// Get media info by hash
app.get('/api/media/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const media = await Media.findOne({ hash });
        
        if (!media) {
            return res.status(404).json({ error: 'Media not found' });
        }

        res.json(media);
    } catch (error) {
        console.error('Get media error:', error);
        res.status(500).json({ error: 'Failed to fetch media', details: error.message });
    }
});

// Get all registered media
app.get('/api/media', async (req, res) => {
    try {
        const media = await Media.find().sort({ createdAt: -1 });
        res.json(media);
    } catch (error) {
        console.error('Get all media error:', error);
        res.status(500).json({ error: 'Failed to fetch media', details: error.message });
    }
});

// Mint NFT for media
app.post('/api/mint/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const { recipient } = req.body;

        if (!recipient) {
            return res.status(400).json({ error: 'Recipient address required' });
        }

        const media = await Media.findOne({ hash });
        if (!media) {
            return res.status(404).json({ error: 'Media not found' });
        }

        if (media.nftTokenId) {
            return res.status(409).json({ error: 'NFT already minted for this media' });
        }

        // Mint NFT
        const tx = await nftMintingContract.mintNFT(recipient);
        await tx.wait();

        // Get token ID
        const tokenId = await nftMintingContract.tokenIdCounter() - 1n;

        // Update database
        media.nftTokenId = Number(tokenId);
        await media.save();

        res.json({
            success: true,
            tokenId: Number(tokenId),
            txHash: tx.hash,
            recipient: recipient
        });

    } catch (error) {
        console.error('Mint error:', error);
        res.status(500).json({ error: 'Minting failed', details: error.message });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
    try {
        await initIPFS();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Connected to Sepolia testnet`);
            console.log(`📄 Smart contracts:`);
            console.log(`   MediaRegistry: ${MEDIA_REGISTRY_ADDRESS}`);
            console.log(`   NFTMinting: ${NFT_MINTING_ADDRESS}`);
            console.log(`   LicenseManager: ${LICENSE_MANAGER_ADDRESS}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
