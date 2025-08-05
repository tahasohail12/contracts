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
    
    const connection = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    cachedDb = connection;
    return connection;
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
    createdAt: { type: Date, default: Date.now }
});

const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema);

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
