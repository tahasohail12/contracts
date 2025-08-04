// MongoDB Metadata Viewer for NFT Platform
const mongoose = require('mongoose');

// Use the same connection as your backend
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nft-content-auth';

// Import the same Media model your backend uses
const Media = require('./models/Media');

async function viewMetadata() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n📊 Database Statistics:');
        const totalFiles = await Media.countDocuments();
        console.log(`Total files uploaded: ${totalFiles}`);

        if (totalFiles === 0) {
            console.log('\n❌ No files found in database.');
            console.log('💡 Upload some content through your web interface first!');
            console.log('   1. Open http://localhost:3001');
            console.log('   2. Click "Upload" and select a file');
            console.log('   3. Fill in metadata and submit');
            console.log('   4. Then run this script again');
            return;
        }

        console.log('\n📁 All Uploaded Files:');
        console.log('='.repeat(80));

        const files = await Media.find().sort({ createdAt: -1 });
        
        files.forEach((file, index) => {
            console.log(`\n🗂️  File #${index + 1}:`);
            console.log(`   📛 Original Name: ${file.originalName}`);
            console.log(`   🔍 Content Hash: ${file.hash}`);
            console.log(`   📄 MIME Type: ${file.mimeType}`);
            console.log(`   📏 File Size: ${(file.size / 1024).toFixed(2)} KB`);
            console.log(`   🌐 IPFS Hash: ${file.ipfsHash || 'Not stored on IPFS'}`);
            console.log(`   👤 Owner: ${file.owner || 'Unknown'}`);
            console.log(`   📅 Created: ${file.createdAt}`);
            
            if (file.metadata) {
                console.log(`   📋 Additional Metadata:`);
                Object.keys(file.metadata).forEach(key => {
                    console.log(`      ${key}: ${file.metadata[key]}`);
                });
            }
            console.log('   ' + '-'.repeat(60));
        });

        console.log(`\n✅ Total: ${totalFiles} file(s) found in database`);

        // Show some statistics
        const mimeTypes = {};
        files.forEach(file => {
            mimeTypes[file.mimeType] = (mimeTypes[file.mimeType] || 0) + 1;
        });

        console.log('\n📈 File Type Distribution:');
        Object.keys(mimeTypes).forEach(type => {
            console.log(`   ${type}: ${mimeTypes[type]} file(s)`);
        });

    } catch (error) {
        console.error('❌ Error connecting to database:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 MongoDB connection failed. Possible solutions:');
            console.log('   1. Make sure MongoDB is installed and running');
            console.log('   2. Check if the connection string is correct');
            console.log('   3. Verify MongoDB is running on port 27017');
        }
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the metadata viewer
viewMetadata();
