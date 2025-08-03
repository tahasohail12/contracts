require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    }
});

// Simple health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'NFT Content Authentication Backend is running',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Simple blockchain info endpoint
app.get('/api/info', async (req, res) => {
    try {
        // Import blockchain utilities
        const { getNetworkInfo } = require('./utils/contracts');
        const networkInfo = await getNetworkInfo();
        
        res.json({
            blockchain: {
                network: networkInfo.name,
                chainId: networkInfo.chainId,
                walletAddress: networkInfo.walletAddress,
                balance: networkInfo.balance
            },
            contracts: {
                mediaRegistry: process.env.MEDIA_REGISTRY_ADDRESS,
                nftMinting: process.env.NFT_MINTING_ADDRESS,
                licenseManager: process.env.LICENSE_MANAGER_ADDRESS
            }
        });
    } catch (error) {
        console.error('Error getting blockchain info:', error);
        res.status(500).json({ error: 'Failed to get blockchain information' });
    }
});

// Simple file upload endpoint for testing
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Generate file hash
        const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
        
        // For now, just return the hash and file info
        res.json({
            message: 'File processed successfully',
            fileInfo: {
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                hash: fileHash
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// IPFS test endpoint
app.get('/api/test-ipfs', async (req, res) => {
    try {
        // Dynamic import for IPFS
        const { createHelia } = await import('helia');
        const { unixfs } = await import('@helia/unixfs');
        
        const helia = await createHelia();
        const fs = unixfs(helia);
        
        // Test data
        const testData = new TextEncoder().encode('Test from NFT backend API');
        const cid = await fs.addBytes(testData);
        
        await helia.stop();
        
        res.json({
            message: 'IPFS test successful',
            cid: cid.toString()
        });
    } catch (error) {
        console.error('IPFS test error:', error);
        res.status(500).json({ error: 'IPFS test failed' });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 NFT Content Authentication Backend`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Connected to Sepolia testnet`);
    console.log(`📄 Smart contracts:`);
    console.log(`   MediaRegistry: ${process.env.MEDIA_REGISTRY_ADDRESS}`);
    console.log(`   NFTMinting: ${process.env.NFT_MINTING_ADDRESS}`);
    console.log(`   LicenseManager: ${process.env.LICENSE_MANAGER_ADDRESS}`);
    console.log(`\n🧪 Test endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/health`);
    console.log(`   GET  http://localhost:${PORT}/api/info`);
    console.log(`   GET  http://localhost:${PORT}/api/test-ipfs`);
    console.log(`   POST http://localhost:${PORT}/api/upload`);
});
