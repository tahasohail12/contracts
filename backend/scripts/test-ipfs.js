require('dotenv').config();

async function testIPFSConnection() {
    let helia;
    
    try {
        console.log('🌐 Testing IPFS Connection');
        console.log('==========================');
        
        // Dynamic import for ES modules
        const { createHelia } = await import('helia');
        const { unixfs } = await import('@helia/unixfs');
        
        // Initialize Helia
        console.log('📡 Initializing Helia IPFS node...');
        helia = await createHelia();
        
        // Create UnixFS instance
        const fs = unixfs(helia);
        
        // Test data
        const testData = new TextEncoder().encode('Hello IPFS! This is a test from NFT Content Authentication Platform.');
        
        console.log('📤 Uploading test data to IPFS...');
        const cid = await fs.addBytes(testData);
        console.log(`✅ Upload successful! CID: ${cid}`);
        
        console.log('📥 Retrieving data from IPFS...');
        const retrievedData = await fs.cat(cid);
        
        // Convert retrieved data back to string
        let retrievedText = '';
        for await (const chunk of retrievedData) {
            retrievedText += new TextDecoder().decode(chunk);
        }
        
        console.log(`📄 Retrieved data: "${retrievedText}"`);
        
        // Verify data integrity
        const originalText = new TextDecoder().decode(testData);
        if (retrievedText === originalText) {
            console.log('✅ Data integrity verified - upload and retrieval successful!');
        } else {
            console.log('❌ Data integrity check failed');
        }
        
        // Get node info
        const nodeId = await helia.libp2p.peerId;
        console.log(`🆔 Node ID: ${nodeId}`);
        
        // Test file upload simulation
        console.log('\n📁 Testing file upload simulation...');
        const mockFileData = new TextEncoder().encode(JSON.stringify({
            filename: 'test-image.jpg',
            contentType: 'image/jpeg',
            size: 1024000,
            timestamp: new Date().toISOString(),
            hash: 'mock-hash-for-testing'
        }));
        
        const metadataCid = await fs.addBytes(mockFileData);
        console.log(`📋 Metadata uploaded with CID: ${metadataCid}`);
        
        console.log('\n✅ IPFS connection test completed successfully!');
        
    } catch (error) {
        console.error('❌ IPFS connection error:', error);
        throw error;
    } finally {
        if (helia) {
            console.log('🔌 Stopping IPFS node...');
            await helia.stop();
            console.log('✅ IPFS node stopped');
        }
    }
}

// Run the script
if (require.main === module) {
    testIPFSConnection()
        .then(() => {
            console.log('\n🎉 All IPFS tests passed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 IPFS test failed:', error);
            process.exit(1);
        });
}

module.exports = { testIPFSConnection };
