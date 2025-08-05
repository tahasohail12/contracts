require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const { ethers } = require('ethers');
const mongoose = require('mongoose');

const app = express();

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

// IPFS Integration using Helia (lightweight IPFS implementation)
const { createHelia } = require('helia');
const { unixfs } = require('@helia/unixfs');

let heliaNode;
let fs;

async function initializeIPFS() {
    try {
        if (!heliaNode) {
            heliaNode = await createHelia();
            fs = unixfs(heliaNode);
            console.log('Helia IPFS node initialized successfully');
        }
        return { heliaNode, fs };
    } catch (error) {
        console.error('Failed to initialize IPFS:', error);
        return null;
    }
}

async function uploadToIPFS(buffer) {
    try {
        const ipfs = await initializeIPFS();
        if (!ipfs) {
            throw new Error('IPFS initialization failed');
        }
        
        const cid = await ipfs.fs.addBytes(buffer);
        return cid.toString();
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw error;
    }
}

// Initialize IPFS on startup (don't await to avoid blocking)
initializeIPFS().catch(console.error);

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        ipfs: heliaNode ? 'connected' : 'disconnected',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Get all media content
app.get('/api/media', async (req, res) => {
    try {
        const media = await Media.find().sort({ createdAt: -1 });
        res.json(media);
    } catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ error: 'Failed to fetch media content' });
    }
});

// Upload new media content
app.post('/api/media/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title, description } = req.body;
        
        // Generate content hash
        const contentHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
        
        // Upload to IPFS
        let ipfsHash = null;
        try {
            ipfsHash = await uploadToIPFS(req.file.buffer);
            console.log('File uploaded to IPFS:', ipfsHash);
        } catch (ipfsError) {
            console.error('IPFS upload failed:', ipfsError);
            // Continue without IPFS hash - don't fail the entire upload
        }

        // Create metadata
        const metadata = {
            title: title || req.file.originalname,
            description: description || '',
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploadedAt: new Date().toISOString()
        };

        // Save to database
        const mediaRecord = new Media({
            hash: contentHash,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            ipfsHash: ipfsHash,
            metadata: metadata
        });

        await mediaRecord.save();

        // Register on blockchain (optional - for demo purposes)
        try {
            const tx = await mediaRegistryContract.registerMedia(contentHash, JSON.stringify(metadata));
            await tx.wait();
            console.log('Media registered on blockchain:', tx.hash);
        } catch (blockchainError) {
            console.error('Blockchain registration failed:', blockchainError);
            // Continue without blockchain registration
        }

        res.json({
            success: true,
            contentHash,
            ipfsHash,
            metadata,
            message: 'Content uploaded and authenticated successfully'
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Upload failed',
            details: error.message 
        });
    }
});

// Verify content authenticity
app.post('/api/media/verify', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided for verification' });
        }

        // Generate hash of uploaded file
        const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
        
        // Check if hash exists in database
        const mediaRecord = await Media.findOne({ hash: fileHash });
        
        if (mediaRecord) {
            res.json({
                verified: true,
                originalUpload: mediaRecord.createdAt,
                metadata: mediaRecord.metadata,
                ipfsHash: mediaRecord.ipfsHash,
                message: 'Content authenticity verified - this file was previously uploaded and registered'
            });
        } else {
            res.json({
                verified: false,
                message: 'Content not found in our authentication database'
            });
        }

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ 
            verified: false, 
            error: 'Verification failed',
            details: error.message 
        });
    }
});

// Get content by hash
app.get('/api/media/:hash', async (req, res) => {
    try {
        const media = await Media.findOne({ hash: req.params.hash });
        if (media) {
            res.json(media);
        } else {
            res.status(404).json({ error: 'Content not found' });
        }
    } catch (error) {
        console.error('Error fetching media by hash:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

// Blockchain interaction endpoints

// Get media count from blockchain
app.get('/api/blockchain/media-count', async (req, res) => {
    try {
        const count = await mediaRegistryContract.mediaCount();
        res.json({ count: count.toString() });
    } catch (error) {
        console.error('Error getting media count:', error);
        res.status(500).json({ error: 'Failed to get media count from blockchain' });
    }
});

// Get media info from blockchain by index
app.get('/api/blockchain/media/:index', async (req, res) => {
    try {
        const mediaInfo = await mediaRegistryContract.mediaRegistry(req.params.index);
        res.json({
            hash: mediaInfo.hash,
            metadata: JSON.parse(mediaInfo.metadata)
        });
    } catch (error) {
        console.error('Error getting media from blockchain:', error);
        res.status(500).json({ error: 'Failed to get media from blockchain' });
    }
});

// IPFS endpoints

// Get IPFS node status
app.get('/api/ipfs/status', async (req, res) => {
    try {
        if (heliaNode) {
            res.json({
                status: 'connected',
                peerId: heliaNode.libp2p.peerId.toString()
            });
        } else {
            res.json({
                status: 'disconnected'
            });
        }
    } catch (error) {
        console.error('Error getting IPFS status:', error);
        res.status(500).json({ error: 'Failed to get IPFS status' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Export for Vercel
module.exports = app;
