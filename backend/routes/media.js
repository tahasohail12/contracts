const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { ethers } = require('ethers');
const Media = require('../models/Media');
const { uploadToIPFS } = require('../utils/ipfs');
const { mediaRegistryContract } = require('../utils/contracts');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    }
});

// Utility function to generate file hash
function generateFileHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Upload and register media
router.post('/upload', upload.single('file'), async (req, res) => {
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
            owner: process.env.WALLET_ADDRESS
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
router.post('/verify', upload.single('file'), async (req, res) => {
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
router.get('/:hash', async (req, res) => {
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
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const media = await Media.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Media.countDocuments();

        res.json({
            data: media,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all media error:', error);
        res.status(500).json({ error: 'Failed to fetch media', details: error.message });
    }
});

module.exports = router;
