require('dotenv').config();
const mongoose = require('mongoose');

async function testDatabaseConnection() {
    try {
        console.log('🗄️ Testing Database Connection');
        console.log('==============================');
        
        // Check if MongoDB URI is configured
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }
        
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('✅ Connected to MongoDB successfully!');
        
        // Test database operations
        console.log('🧪 Testing database operations...');
        
        // Get database info
        const db = mongoose.connection.db;
        const admin = db.admin();
        const serverStatus = await admin.serverStatus();
        
        console.log(`📊 MongoDB Version: ${serverStatus.version}`);
        console.log(`💽 Database Name: ${db.databaseName}`);
        console.log(`🔌 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
        
        // List collections
        const collections = await db.listCollections().toArray();
        console.log(`📂 Collections: ${collections.length > 0 ? collections.map(c => c.name).join(', ') : 'None yet'}`);
        
        // Test creating a document (without saving)
        const Media = require('../models/Media');
        const testMedia = new Media({
            hash: 'test-hash-' + Date.now(),
            originalName: 'test-file.jpg',
            mimeType: 'image/jpeg',
            size: 1024000,
            owner: '0x742d35Cc6639C0532fEb09567e1B4769f1990A4d',
            ipfsHash: 'test-ipfs-hash',
            verified: false
        });
        
        // Validate the model without saving
        const validationError = testMedia.validateSync();
        if (validationError) {
            throw new Error(`Model validation failed: ${validationError.message}`);
        }
        
        console.log('✅ Media model validation passed');
        
        // Test connection properties
        console.log('\n📋 Connection Details:');
        console.log(`   Host: ${mongoose.connection.host}`);
        console.log(`   Port: ${mongoose.connection.port}`);
        console.log(`   Database: ${mongoose.connection.name}`);
        
        console.log('\n✅ Database connection test completed successfully!');
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        throw error;
    } finally {
        if (mongoose.connection.readyState === 1) {
            console.log('🔌 Closing database connection...');
            await mongoose.connection.close();
            console.log('✅ Database connection closed');
        }
    }
}

// Run the script
if (require.main === module) {
    testDatabaseConnection()
        .then(() => {
            console.log('\n🎉 All database tests passed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Database test failed:', error);
            process.exit(1);
        });
}

module.exports = { testDatabaseConnection };
