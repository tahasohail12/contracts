// IPFS utilities using Helia with dynamic imports
let helia;
let fs;

async function initIPFS() {
    try {
        // Dynamic import for ES modules
        const { createHelia } = await import('helia');
        const { unixfs } = await import('@helia/unixfs');
        
        helia = await createHelia();
        fs = unixfs(helia);
        console.log('✅ IPFS (Helia) initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize IPFS:', error);
        return false;
    }
}

async function uploadToIPFS(buffer) {
    try {
        if (!fs) {
            throw new Error('IPFS not initialized');
        }
        const cid = await fs.addBytes(buffer);
        console.log(`📁 File uploaded to IPFS: ${cid.toString()}`);
        return cid.toString();
    } catch (error) {
        console.error('IPFS upload error:', error);
        throw error;
    }
}

async function retrieveFromIPFS(cid) {
    try {
        if (!fs) {
            throw new Error('IPFS not initialized');
        }
        
        const chunks = [];
        for await (const chunk of fs.cat(cid)) {
            chunks.push(chunk);
        }
        
        return Buffer.concat(chunks);
    } catch (error) {
        console.error('IPFS retrieval error:', error);
        throw error;
    }
}

async function closeIPFS() {
    try {
        if (helia) {
            await helia.stop();
            console.log('IPFS connection closed');
        }
    } catch (error) {
        console.error('Error closing IPFS:', error);
    }
}

module.exports = {
    initIPFS,
    uploadToIPFS,
    retrieveFromIPFS,
    closeIPFS
};
