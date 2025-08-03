const express = require('express');
const Media = require('../models/Media');
const { nftMintingContract } = require('../utils/contracts');

const router = express.Router();

// Mint NFT for media
router.post('/mint/:hash', async (req, res) => {
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

// Get NFT info by token ID
router.get('/token/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;

        // Get owner from blockchain
        const owner = await nftMintingContract.ownerOf(tokenId);
        
        // Find associated media
        const media = await Media.findOne({ nftTokenId: parseInt(tokenId) });

        res.json({
            tokenId: parseInt(tokenId),
            owner: owner,
            media: media
        });

    } catch (error) {
        console.error('Get NFT info error:', error);
        res.status(500).json({ error: 'Failed to fetch NFT info', details: error.message });
    }
});

// Get all NFTs
router.get('/tokens', async (req, res) => {
    try {
        const tokenCount = await nftMintingContract.tokenIdCounter();
        const tokens = [];

        for (let i = 0; i < tokenCount; i++) {
            try {
                const owner = await nftMintingContract.ownerOf(i);
                const media = await Media.findOne({ nftTokenId: i });
                
                tokens.push({
                    tokenId: i,
                    owner: owner,
                    media: media
                });
            } catch (error) {
                // Token might not exist or be burned
                console.warn(`Token ${i} not found:`, error.message);
            }
        }

        res.json(tokens);

    } catch (error) {
        console.error('Get all NFTs error:', error);
        res.status(500).json({ error: 'Failed to fetch NFTs', details: error.message });
    }
});

module.exports = router;
