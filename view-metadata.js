// MongoDB Metadata Viewer
// Run with: node view-metadata.js

require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nft-content-auth';

// Define the Media schema (matching your backend)
const mediaSchema = new mongoose.Schema({
    hash: { type: String, required: true, unique: true },
    originalName: String,
    mimeType: String,
    size: Number,
    ipfsHash: String,
    metadata: Object,
    owner: String,
    createdAt: { type: Date, default: Date.now }
});

const Media = mongoose.model('Media', mediaSchema);

async function viewMetadata() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n📊 Database Statistics:');
        const totalFiles = await Media.countDocuments();
        console.log(`Total files uploaded: ${totalFiles}`);

        if (totalFiles === 0) {
            console.log('❌ No files found. Upload some content first!');
            return;
        }

        console.log('\n📁 All Uploaded Files:');
        console.log('='.repeat(80));

        const files = await Media.find().sort({ createdAt: -1 });
        
        files.forEach((file, index) => {
            console.log(`\n🗂️  File #${index + 1}:`);
            console.log(`   📛 Name: ${file.originalName}`);
            console.log(`   🔍 Hash: ${file.hash}`);
            console.log(`   📄 Type: ${file.mimeType}`);
            console.log(`   📏 Size: ${(file.size / 1024).toFixed(2)} KB`);
            console.log(`   🌐 IPFS: ${file.ipfsHash || 'Not stored'}`);
            console.log(`   👤 Owner: ${file.owner}`);
            console.log(`   📅 Uploaded: ${file.createdAt}`);
            
            if (file.metadata) {
                console.log(`   📋 Metadata:`);
                console.log(`      Description: ${file.metadata.description || 'None'}`);
                console.log(`      IPFS Hash: ${file.metadata.ipfsHash || 'None'}`);
                console.log(`      Upload Date: ${file.metadata.uploadedAt || 'Unknown'}`);
            }
            console.log('   ' + '-'.repeat(60));
        });

        console.log(`\n✅ Found ${totalFiles} file(s) in database`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the script
viewMetadata();
