// Data Migration Script
// This script exports data from your local MongoDB and prepares it for Atlas import

const { MongoClient } = require('mongodb');
const fs = require('fs');

async function exportLocalData() {
    const localUri = 'mongodb://localhost:27017';
    const atlasUri = 'mongodb+srv://tahasohail28:FqxKWf9EDPj9L9zv@cluster0.wg8afro.mongodb.net/nft-content-auth';
    
    console.log('🔄 Starting data migration from localhost to Atlas...');
    
    try {
        // Connect to local MongoDB
        console.log('📂 Connecting to local MongoDB...');
        const localClient = new MongoClient(localUri);
        await localClient.connect();
        
        const localDb = localClient.db('nft-content-auth');
        const localMedia = localDb.collection('media');
        
        // Get all documents from local database
        console.log('📋 Fetching data from local database...');
        const documents = await localMedia.find({}).toArray();
        console.log(`Found ${documents.length} documents in local database`);
        
        if (documents.length === 0) {
            console.log('❌ No data found in local database');
            await localClient.close();
            return;
        }
        
        // Save to JSON file for backup
        fs.writeFileSync('./local-data-backup.json', JSON.stringify(documents, null, 2));
        console.log('💾 Local data backed up to local-data-backup.json');
        
        // Connect to Atlas and import data
        console.log('☁️ Connecting to MongoDB Atlas...');
        const atlasClient = new MongoClient(atlasUri);
        await atlasClient.connect();
        
        const atlasDb = atlasClient.db('nft-content-auth');
        const atlasMedia = atlasDb.collection('media');
        
        // Check if Atlas already has data
        const existingCount = await atlasMedia.countDocuments();
        console.log(`Atlas database currently has ${existingCount} documents`);
        
        if (existingCount > 0) {
            console.log('⚠️  Atlas database already has data. Options:');
            console.log('1. Clear Atlas data and import local data');
            console.log('2. Merge local data with Atlas data');
            console.log('3. Skip import and use existing Atlas data');
            
            // For now, let's merge the data (avoid duplicates by hash)
            console.log('🔄 Merging data (avoiding duplicates by hash)...');
            
            for (const doc of documents) {
                const existing = await atlasMedia.findOne({ hash: doc.hash });
                if (!existing) {
                    await atlasMedia.insertOne(doc);
                    console.log(`✅ Imported: ${doc.originalName || doc.hash}`);
                } else {
                    console.log(`⏭️  Skipped (already exists): ${doc.originalName || doc.hash}`);
                }
            }
        } else {
            // Atlas is empty, import all data
            console.log('📤 Importing all data to Atlas...');
            await atlasMedia.insertMany(documents);
            console.log(`✅ Successfully imported ${documents.length} documents to Atlas!`);
        }
        
        // Verify the import
        const finalCount = await atlasMedia.countDocuments();
        console.log(`🎉 Atlas database now has ${finalCount} documents`);
        
        await localClient.close();
        await atlasClient.close();
        
        console.log('✅ Migration completed successfully!');
        console.log('🚀 Your Vercel deployment will now have access to your data');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('🔧 Solution: Make sure your local MongoDB is running');
            console.log('   Start it with: mongod');
        }
        
        if (error.message.includes('bad auth')) {
            console.log('🔧 Solution: Check your Atlas credentials');
            console.log('   Update the connection string in this script');
        }
    }
}

// Run the migration
exportLocalData();
