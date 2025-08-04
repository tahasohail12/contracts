// Simple MongoDB Metadata Viewer
// Run with: node simple-metadata-viewer.js

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/nft-content-auth';

// Media schema
const mediaSchema = new mongoose.Schema({
    hash: String,
    originalName: String,
    mimeType: String,
    size: Number,
    ipfsHash: String,
    metadata: Object,
    owner: String,
    createdAt: { type: Date, default: Date.now }
});

const Media = mongoose.model('Media', mediaSchema);

async function checkMetadata() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected successfully');

        const files = await Media.find();
        console.log(`\n📊 Total files in database: ${files.length}`);

        if (files.length === 0) {
            console.log('❌ No files found. Upload some content to your platform first!');
        } else {
            console.log('\n📁 Files and Metadata:');
            console.log('='.repeat(60));
            
            files.forEach((file, i) => {
                console.log(`\n${i + 1}. ${file.originalName}`);
                console.log(`   Hash: ${file.hash}`);
                console.log(`   Type: ${file.mimeType}`);
                console.log(`   Size: ${(file.size / 1024).toFixed(2)} KB`);
                console.log(`   IPFS: ${file.ipfsHash || 'None'}`);
                console.log(`   Date: ${file.createdAt}`);
                
                if (file.metadata) {
                    console.log(`   Metadata: ${JSON.stringify(file.metadata, null, 2)}`);
                }
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Make sure MongoDB is running on your system!');
        }
    } finally {
        await mongoose.disconnect();
    }
}

checkMetadata();
