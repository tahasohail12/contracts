require('dotenv').config();
const { displayBlockchainInfo } = require('./blockchain-info');
const { testIPFSConnection } = require('./test-ipfs');
const { testDatabaseConnection } = require('./test-database');

async function runAllTests() {
    console.log('🚀 NFT Content Authentication Platform - System Tests');
    console.log('=====================================================\n');
    
    let testResults = {
        blockchain: false,
        ipfs: false,
        database: false
    };
    
    // Test 1: Blockchain Connection
    try {
        console.log('TEST 1: Blockchain Connection');
        console.log('-----------------------------');
        await displayBlockchainInfo();
        testResults.blockchain = true;
        console.log('✅ Blockchain test PASSED\n');
    } catch (error) {
        console.error('❌ Blockchain test FAILED:', error.message);
        console.log('');
    }
    
    // Test 2: IPFS Connection
    try {
        console.log('TEST 2: IPFS Connection');
        console.log('-----------------------');
        await testIPFSConnection();
        testResults.ipfs = true;
        console.log('✅ IPFS test PASSED\n');
    } catch (error) {
        console.error('❌ IPFS test FAILED:', error.message);
        console.log('');
    }
    
    // Test 3: Database Connection
    try {
        console.log('TEST 3: Database Connection');
        console.log('---------------------------');
        await testDatabaseConnection();
        testResults.database = true;
        console.log('✅ Database test PASSED\n');
    } catch (error) {
        console.error('❌ Database test FAILED:', error.message);
        console.log('');
    }
    
    // Summary
    console.log('📊 TEST SUMMARY');
    console.log('===============');
    console.log(`🔗 Blockchain: ${testResults.blockchain ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🌐 IPFS:       ${testResults.ipfs ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🗄️ Database:   ${testResults.database ? '✅ PASS' : '❌ FAIL'}`);
    
    const passedTests = Object.values(testResults).filter(result => result).length;
    const totalTests = Object.keys(testResults).length;
    
    console.log(`\n📈 Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ALL SYSTEMS GO! Backend is ready to start.');
        return true;
    } else {
        console.log('⚠️ Some systems need attention before starting the server.');
        return false;
    }
}

// Environment check
function checkEnvironment() {
    console.log('🔍 Environment Configuration Check');
    console.log('==================================');
    
    const requiredVars = [
        'MONGODB_URI',
        'SEPOLIA_PRIVATE_KEY',
        'SEPOLIA_RPC_URL',
        'MEDIA_REGISTRY_ADDRESS',
        'NFT_MINTING_ADDRESS',
        'LICENSE_MANAGER_ADDRESS'
    ];
    
    const missing = [];
    
    requiredVars.forEach(varName => {
        if (process.env[varName]) {
            console.log(`✅ ${varName}: Configured`);
        } else {
            console.log(`❌ ${varName}: Missing`);
            missing.push(varName);
        }
    });
    
    if (missing.length > 0) {
        console.log(`\n⚠️ Missing ${missing.length} required environment variables:`);
        missing.forEach(varName => console.log(`   - ${varName}`));
        console.log('\nPlease update your .env file before running tests.\n');
        return false;
    }
    
    console.log('\n✅ All environment variables configured!\n');
    return true;
}

// Run the complete test suite
if (require.main === module) {
    async function main() {
        try {
            // Check environment first
            if (!checkEnvironment()) {
                process.exit(1);
            }
            
            // Run all tests
            const allPassed = await runAllTests();
            
            if (allPassed) {
                console.log('\n🚀 System ready! You can now start the backend server with:');
                console.log('   npm run dev');
                process.exit(0);
            } else {
                console.log('\n🔧 Please fix the failing tests and try again.');
                process.exit(1);
            }
            
        } catch (error) {
            console.error('💥 Test suite error:', error);
            process.exit(1);
        }
    }
    
    main();
}

module.exports = { runAllTests, checkEnvironment };
