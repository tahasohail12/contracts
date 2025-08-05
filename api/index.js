require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const mongoose = require('mongoose');

const app = express();

// CORS Configuration for Production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'https://contracts-red.vercel.app',
            'http://localhost:3001', 
            'http://localhost:3000'
        ];
        
        // Allow all Vercel preview URLs (they contain vercel.app)
        if (origin && origin.includes('vercel.app')) {
            console.log('Allowing Vercel origin:', origin);
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Allow all for now
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

// Database connection with caching for serverless
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://tahasohail28:FqxKWf9EDPj9L9zv@cluster0.wg8afro.mongodb.net/nft-content-auth';
    
    console.log('Environment check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('- Using URI:', mongoUri.replace(/:[^:@]*@/, ':****@'));
    
    try {
        console.log('Connecting to MongoDB Atlas...');
        const connection = await mongoose.connect(mongoUri);
        cachedDb = connection;
        console.log('✅ Connected to database:', mongoose.connection.db.databaseName);
        return connection;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw error;
    }
}

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
    createdAt: { type: Date, default: Date.now },
    // NFT History tracking
    mintedAt: Date,
    currentOwner: String,
    previousOwners: [String],
    transferHistory: [{
        from: String,
        to: String,
        timestamp: Date,
        transactionHash: String,
        blockNumber: Number
    }],
    verificationHistory: [{
        verifiedBy: String,
        timestamp: Date,
        result: String,
        ipAddress: String
    }],
    downloadHistory: [{
        downloadedBy: String,
        timestamp: Date,
        ipAddress: String
    }]
});

const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema);

// NFT Transaction History Schema
const NFTHistorySchema = new mongoose.Schema({
    tokenId: Number,
    contentHash: String,
    eventType: { type: String, enum: ['mint', 'transfer', 'verify', 'download'] },
    from: String,
    to: String,
    timestamp: { type: Date, default: Date.now },
    transactionHash: String,
    blockNumber: Number,
    metadata: Object
});

const NFTHistory = mongoose.models.NFTHistory || mongoose.model('NFTHistory', NFTHistorySchema);

// Simple IPFS hash generator (mock for serverless)
function generateIPFSHash(buffer) {
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return `Qm${hash.substring(0, 44)}`; // Mock IPFS hash format
}

// API Routes

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await connectToDatabase();
        res.json({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Get all media content
app.get('/api/media', async (req, res) => {
    try {
        await connectToDatabase();
        const media = await Media.find().sort({ createdAt: -1 });
        console.log('Found media count:', media.length);
        res.json(media);
    } catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ error: 'Failed to fetch media content', details: error.message });
    }
});

// Upload new media content
app.post('/api/media/upload', upload.single('file'), async (req, res) => {
    try {
        await connectToDatabase();
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title, description } = req.body;
        
        // Generate content hash
        const contentHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
        
        // Generate IPFS hash (mock)
        const ipfsHash = generateIPFSHash(req.file.buffer);

        // Create metadata
        const metadata = {
            title: title || req.file.originalname,
            description: description || '',
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploadedAt: new Date().toISOString()
        };

        // Save to database with enhanced history tracking
        const mediaRecord = new Media({
            hash: contentHash,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            ipfsHash: ipfsHash,
            metadata: metadata,
            mintedAt: new Date(),
            currentOwner: 'anonymous', // Will be updated when wallet is connected
            previousOwners: [],
            transferHistory: [],
            verificationHistory: [],
            downloadHistory: []
        });

        await mediaRecord.save();

        // Create initial NFT history entry
        const historyEntry = new NFTHistory({
            tokenId: null, // Will be updated when minted on blockchain
            contentHash: contentHash,
            eventType: 'mint',
            from: null,
            to: 'anonymous',
            timestamp: new Date(),
            metadata: {
                action: 'content_uploaded',
                fileName: req.file.originalname,
                fileSize: req.file.size
            }
        });

        await historyEntry.save();
        console.log('Media saved:', contentHash);

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
        await connectToDatabase();
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided for verification' });
        }

        // Generate hash of uploaded file
        const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
        
        // Check if hash exists in database
        const mediaRecord = await Media.findOne({ hash: fileHash });
        
        if (mediaRecord) {
            // Record verification in history
            const verificationEntry = {
                verifiedBy: 'anonymous',
                timestamp: new Date(),
                result: 'verified',
                ipAddress: req.ip || 'unknown'
            };

            mediaRecord.verificationHistory.push(verificationEntry);
            await mediaRecord.save();

            // Create history entry
            const historyEntry = new NFTHistory({
                tokenId: mediaRecord.nftTokenId,
                contentHash: fileHash,
                eventType: 'verify',
                to: 'anonymous',
                timestamp: new Date(),
                metadata: {
                    action: 'content_verified',
                    fileName: req.file.originalname
                }
            });

            await historyEntry.save();

            res.json({
                verified: true,
                originalUpload: mediaRecord.createdAt,
                metadata: mediaRecord.metadata,
                ipfsHash: mediaRecord.ipfsHash,
                verificationHistory: mediaRecord.verificationHistory,
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

// Get NFT history for a specific content hash
app.get('/api/nft/history/:hash', async (req, res) => {
    try {
        await connectToDatabase();
        
        const contentHash = req.params.hash;
        
        // Get media record
        const mediaRecord = await Media.findOne({ hash: contentHash });
        if (!mediaRecord) {
            return res.status(404).json({ error: 'Content not found' });
        }

        // Get full history from NFTHistory collection
        const history = await NFTHistory.find({ contentHash }).sort({ timestamp: -1 });

        res.json({
            contentInfo: {
                hash: mediaRecord.hash,
                originalName: mediaRecord.originalName,
                ipfsHash: mediaRecord.ipfsHash,
                mintedAt: mediaRecord.mintedAt,
                currentOwner: mediaRecord.currentOwner,
                totalVerifications: mediaRecord.verificationHistory.length,
                totalDownloads: mediaRecord.downloadHistory.length
            },
            transferHistory: mediaRecord.transferHistory,
            verificationHistory: mediaRecord.verificationHistory,
            downloadHistory: mediaRecord.downloadHistory,
            fullHistory: history
        });

    } catch (error) {
        console.error('Error fetching NFT history:', error);
        res.status(500).json({ 
            error: 'Failed to fetch NFT history',
            details: error.message 
        });
    }
});

// Get all NFT activities (recent history across all NFTs)
app.get('/api/nft/activities', async (req, res) => {
    try {
        await connectToDatabase();
        
        const limit = parseInt(req.query.limit) || 50;
        const activities = await NFTHistory.find().sort({ timestamp: -1 }).limit(limit);

        res.json({
            activities,
            total: activities.length
        });

    } catch (error) {
        console.error('Error fetching NFT activities:', error);
        res.status(500).json({ 
            error: 'Failed to fetch NFT activities',
            details: error.message 
        });
    }
});

// Record NFT transfer (for when wallet integration is added)
app.post('/api/nft/transfer', async (req, res) => {
    try {
        await connectToDatabase();
        
        const { contentHash, fromAddress, toAddress, transactionHash, blockNumber } = req.body;

        const mediaRecord = await Media.findOne({ hash: contentHash });
        if (!mediaRecord) {
            return res.status(404).json({ error: 'Content not found' });
        }

        // Update ownership
        if (mediaRecord.currentOwner !== fromAddress) {
            mediaRecord.previousOwners.push(mediaRecord.currentOwner);
        }
        mediaRecord.currentOwner = toAddress;

        // Add to transfer history
        const transferEntry = {
            from: fromAddress,
            to: toAddress,
            timestamp: new Date(),
            transactionHash,
            blockNumber
        };
        mediaRecord.transferHistory.push(transferEntry);

        await mediaRecord.save();

        // Create history entry
        const historyEntry = new NFTHistory({
            tokenId: mediaRecord.nftTokenId,
            contentHash,
            eventType: 'transfer',
            from: fromAddress,
            to: toAddress,
            timestamp: new Date(),
            transactionHash,
            blockNumber,
            metadata: {
                action: 'ownership_transferred'
            }
        });

        await historyEntry.save();

        res.json({
            success: true,
            message: 'Transfer recorded successfully',
            newOwner: toAddress
        });

    } catch (error) {
        console.error('Error recording transfer:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to record transfer',
            details: error.message 
        });
    }
});

// Get ownership statistics
app.get('/api/nft/stats', async (req, res) => {
    try {
        await connectToDatabase();
        
        const totalContent = await Media.countDocuments();
        const totalVerifications = await NFTHistory.countDocuments({ eventType: 'verify' });
        const totalTransfers = await NFTHistory.countDocuments({ eventType: 'transfer' });
        const totalDownloads = await NFTHistory.countDocuments({ eventType: 'download' });

        res.json({
            overview: {
                totalContent,
                totalVerifications,
                totalTransfers,
                totalDownloads,
                totalActivities: totalVerifications + totalTransfers + totalDownloads
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ 
            error: 'Failed to fetch statistics',
            details: error.message 
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message
    });
});

// Export for Vercel serverless
module.exports = app;
